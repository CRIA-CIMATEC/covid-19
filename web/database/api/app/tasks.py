from flask import current_app as app
from . import celery, db
from .models import (
    Country,
    CovidCase,
    CovidPolicy,
    Locale,
    State,
    MitigationMeasure,
    DocumentExpedition,
    DocumentModel,
    MobilityMeasure,
    MobilityReport,
)
import pandas as pd
import numpy as np
import requests


def _search_name(lst, name: str):
    for r in lst:
        if name.lower() == r.name.lower():
            return r.id
    return None


def _search_code(lst, code: str):
    for r in lst:
        if code == r.code:
            return r.id
    return None


def _search_clocale(lst, country_id: str):
    for r in lst:
        if country_id == r.country_id:
            return r.id
    return None


def _search_slocale(lst, state_id: str):
    for r in lst:
        if state_id == r.state_id:
            return r.id
    return None


def _int(value: str):
    return None if np.isnan(value) else int(value)


@celery.task
def sync_John_Hopkins():
    """synchronize with John Hopkins database"""
    # Populate CovidCase
    jh_url = (
        'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/'
        'csse_covid_19_data/csse_covid_19_time_series/{}'
    )
    datasets = dict(
        Confirmed='time_series_covid19_confirmed_global.csv',
        Recovered='time_series_covid19_recovered_global.csv',
        Deaths='time_series_covid19_deaths_global.csv',
    )
    df = {d: pd.read_csv(jh_url.format(datasets[d])) for d in datasets.keys()}

    # Update Hubei inconsistencies in confirmed
    hubei = {'2/12/20': 34874, '2/13/20': 51986, '2/14/20': 54406}
    for date, value in hubei.items():
        _filter = df['Confirmed']['Province/State'] == 'Hubei'
        df['Confirmed'].loc[_filter, date] = value

    def _diff_serie(dataframe: pd.DataFrame) -> pd.DataFrame:
        aux = dataframe.copy()
        df_diff = aux.iloc[:, 4:]
        df_diff = df_diff.T.diff().T
        df_diff.mask(df_diff < 0, 0, inplace=True)
        df_diff = pd.concat([aux.iloc[:, 0:4], df_diff.iloc[:, 1:]], axis=1)

        return df_diff

    df = {d: _diff_serie(df[d]) for d in df.keys()}

    dates = df['Confirmed'].columns[4:]
    df = {
        d: df[d].melt(
            id_vars=['Country/Region', 'Province/State', 'Lat', 'Long'],
            value_vars=dates,
            var_name='Date',
            value_name=d,
        )
        for d in df.keys()
    }

    aux = pd.merge(
        df['Confirmed'],
        df['Deaths'],
        on=['Country/Region', 'Province/State', 'Date', 'Lat', 'Long'],
        how='left',
    )
    df = pd.merge(
        aux,
        df['Recovered'],
        on=['Country/Region', 'Province/State', 'Date', 'Lat', 'Long'],
        how='left',
    )
    df['Date'] = pd.to_datetime(df['Date'])

    # TODO: Adds checkpoint for each locale
    locales = db.session.query(Locale).filter(Locale.state_id.is_(None)).all()
    checkpoint = (
        db.session.query(db.func.max(CovidCase.id))
        .filter(CovidCase.locale_id.in_([l.id for l in locales]))
        .scalar()
    )
    df = df[df['Date'] > checkpoint]

    if not df.empty:
        # correcting the nomenclature of some countries
        df['Country/Region'].replace(
            'Korea, South', 'South Korea', inplace=True
        )
        df['Country/Region'].replace('Taiwan*', 'Taiwan', inplace=True)
        df['Country/Region'].replace('US', 'United States', inplace=True)

        df = df.groupby(['Date', 'Country/Region'], as_index=False).sum()
        df.drop(['Lat', 'Long'], inplace=True, axis=1)

        countries = db.session.query(Country).all()

        covid_cases = []
        for _, row in df.iterrows():
            country_name = str(row['Country/Region'])
            country_id = _search_name(countries, country_name)

            if country_id is None:
                app.logger.warning(f'{country_name} not found in database')
                continue

            locale_id = _search_clocale(locales, country_id)

            covid_cases.append(
                CovidCase(
                    id=row['Date'],
                    locale_id=locale_id,
                    confirmed=int(row['Confirmed']),
                    recovered=int(row['Recovered']),
                    deaths=int(row['Deaths']),
                )
            )

        db.session.add_all(covid_cases)
        db.session.commit()
    # end populate CovidCase


@celery.task
def sync_Oxford():
    """synchronize with Oxford database"""
    # Populate CovidPolicy
    oxford_url = (
        'https://raw.githubusercontent.com/OxCGRT/covid-policy-tracker/master/'
        'data/timeseries/{}'
    )
    datasets = dict(
        C1='c1_schoolclosing.csv',
        C2='c2_workplaceclosing.csv',
        C3='c3_cancelpublicevents.csv',
        C4='c4_restrictionsongatherings.csv',
        C5='c5_closepublictransport.csv',
        C6='c6_stayathomerequirements.csv',
        C7='c7_domestictravel.csv',
        C8='c8_internationaltravel.csv',
        H1='h1_publicinfocampaign.csv',
        H2='h2_testingpolicy.csv',
        H3='h3_contacttracing.csv',
        C1_flag='c1_flag.csv',
        C2_flag='c2_flag.csv',
        C3_flag='c3_flag.csv',
        C4_flag='c4_flag.csv',
        C5_flag='c5_flag.csv',
        C6_flag='c6_flag.csv',
        C7_flag='c7_flag.csv',
        H1_flag='h1_flag.csv',
    )
    df = {
        d: pd.read_csv(
            oxford_url.format(datasets[d]),
            sep=",",
            encoding="latin",
            skipfooter=3,
            na_values=['.'],
            engine='python',
        )
        for d in datasets.keys()
    }

    dates = df['C1'].columns[2:]
    df = {
        d: df[d].melt(
            id_vars=['Unnamed: 0', 'Unnamed: 1'],
            value_vars=dates,
            var_name='Date',
            value_name=d,
        )
        for d in df.keys()
    }

    df = pd.concat([d for d in df.values()], axis=1)
    df = df.loc[:, ~df.columns.duplicated()]
    df["Date"] = pd.to_datetime(df["Date"])

    # TODO: Adds checkpoint for each locale
    checkpoint = db.session.query(db.func.max(CovidPolicy.id)).scalar()
    df = df[df['Date'] > checkpoint]

    if not df.empty:
        df.rename(
            columns={'Unnamed: 0': 'Country/Region', "Unnamed: 1": 'COD'},
            inplace=True,
        )
        df['Country/Region'].replace('Cape Verde', 'Cabo Verde', inplace=True)
        df['Country/Region'].replace(
            'Democratic Republic of Congo', 'Congo (Kinshasa)', inplace=True
        )
        df['Country/Region'].replace(
            'Congo', 'Congo (Brazzaville)', inplace=True
        )
        df['Country/Region'].replace('Czech Republic', 'Czechia', inplace=True)
        df['Country/Region'].replace(
            'Kyrgyz Republic', 'Kyrgyzstan', inplace=True
        )
        df['Country/Region'].replace(
            'Slovak Republic', 'Slovakia', inplace=True
        )

        countries = db.session.query(Country).all()
        locales = (
            db.session.query(Locale).filter(Locale.state_id.is_(None)).all()
        )
        mitigation_measures = db.session.query(MitigationMeasure).all()
        mitigation_measures = [(mm.id, mm.code) for mm in mitigation_measures]

        covid_policies = []
        for _, row in df.iterrows():
            country_name = str(row['Country/Region'])
            country_id = _search_name(countries, country_name)

            if country_id is None:
                app.logger.warning(f'{country_name} not found in database')
                continue

            locale_id = _search_clocale(locales, country_id)

            for code in mitigation_measures:
                mm_id, mm_code = code

                try:
                    flag_m_id = int(row[f'{mm_code}_flag'])
                except (ValueError, KeyError):
                    flag_m_id = None

                try:
                    density_m_id = int(row[mm_code])
                except ValueError:
                    density_m_id = None

                covid_policies.append(
                    CovidPolicy(
                        id=row['Date'],
                        locale_id=locale_id,
                        flag_mitigation_id=flag_m_id,
                        mitigation_measure_id=mm_id,
                        density_mitigation_id=density_m_id,
                    )
                )

        db.session.add_all(covid_policies)
        db.session.commit()
    # end populate CovidPolicy


@celery.task
def sync_Sefaz():
    """synchronize with Sefaz database"""
    # Populate DocumentExpedition
    sefaz_url = (
        'http://receitadados.fazenda.rs.gov.br/Documentos%20Compartilhados/'
        'Valor%20e%20quantidade%20de%20DFe%20por%20dia.csv'
    )

    cols = ['Modelo', 'Data', 'UF', 'Qtde Autorizados', 'Valor Autorizados']
    df = pd.read_csv(
        sefaz_url,
        sep=';',
        encoding='latin-1',
        usecols=cols,
        decimal=',',
        parse_dates=['Data'],
    )

    # TODO: Adds checkpoint for each locale
    checkpoint = db.session.query(db.func.max(DocumentExpedition.id)).scalar()
    df = df[df['Data'] > checkpoint]

    if not df.empty:
        brazil = (
            db.session.query(Country).filter(Country.name == 'Brazil').first()
        )
        states = db.session.query(State).all()
        document_models = db.session.query(DocumentModel).all()
        brazil_locales = (
            db.session.query(Locale)
            .filter(
                db.and_(
                    Locale.country_id == brazil.id, Locale.state_id.isnot(None)
                )
            )
            .all()
        )

        document_expeditions = []
        for _, row in df.iterrows():
            state_name = str(row['UF'])
            state_id = _search_name(states, state_name)
            locale_id = _search_slocale(brazil_locales, state_id)

            if locale_id is None:
                app.logger.warning(f'{state_name} not found in database')
                continue

            document_model_code = str(row['Modelo'])
            document_model_id = _search_code(
                document_models, document_model_code
            )

            if document_model_id is None:
                app.logger.warning(
                    f'{document_model_code} not found in database'
                )
                continue

            document_expeditions.append(
                DocumentExpedition(
                    id=row['Data'],
                    locale_id=locale_id,
                    document_model_id=document_model_id,
                    count=int(row['Qtde Autorizados']),
                    amount=float(row['Valor Autorizados']),
                )
            )

        db.session.add_all(document_expeditions)
        db.session.commit()
    # end populate DocumentExpedition


@celery.task
def sync_Mobility():
    """synchronize with Mobility database"""
    # Populate MobilityReport
    df_mobility = pd.read_csv(
        'https://www.gstatic.com/covid19/mobility/Global_Mobility_Report.csv',
        low_memory=False,
        parse_dates=['date'],
    )
    # Unused cols
    df_mobility.drop(
        columns=[
            'country_region_code',
            'iso_3166_2_code',
            'census_fips_code',
        ],
        inplace=True,
    )
    # Renames cols
    df_mobility.rename(
        columns={
            'country_region': 'Country/Region',
            'sub_region_1': 'State',
            'date': 'Date',
            'retail_and_recreation_percent_change_from_baseline': 'retail and recreation',
            'grocery_and_pharmacy_percent_change_from_baseline': 'grocery and pharmacy',
            'parks_percent_change_from_baseline': 'parks',
            'transit_stations_percent_change_from_baseline': 'transit stations',
            'workplaces_percent_change_from_baseline': 'workplaces',
            'residential_percent_change_from_baseline': 'residential',
        },
        inplace=True,
    )

    # TODO: Adds checkpoint for each locale
    checkpoint = db.session.query(db.func.max(MobilityReport.id)).scalar()
    if checkpoint:
        df_mobility = df_mobility[df_mobility['Date'] > checkpoint]

    if not df_mobility.empty:
        countries = db.session.query(Country).all()
        locales = (
            db.session.query(Locale).filter(Locale.state_id.is_(None)).all()
        )
        mobility_measures = db.session.query(MobilityMeasure).all()
        mobility_measures = [(mm.id, mm.name) for mm in mobility_measures]
        states = db.session.query(State).all()
        brazil = (
            db.session.query(Country).filter(Country.name == 'Brazil').first()
        )
        brazil_locales = (
            db.session.query(Locale)
            .filter(
                db.and_(
                    Locale.country_id == brazil.id, Locale.state_id.isnot(None)
                )
            )
            .all()
        )

        mobility_reports = []
        df_mobility = df_mobility.loc[df_mobility['metro_area'].isna()]
        df_mobility = df_mobility.loc[df_mobility['sub_region_2'].isna()]
        df_mobility.drop(columns=['metro_area', 'sub_region_2'], inplace=True)

        # [COUNTRIES]
        # considering only countries
        df = df_mobility[df_mobility['State'].isna()].copy()
        df.drop(columns=['State'], inplace=True)

        # Renames countries
        df['Country/Region'].replace('The Bahamas', 'Bahamas', inplace=True)
        df['Country/Region'].replace(
            "Côte d'Ivoire", "Cote d'Ivoire", inplace=True
        )
        df['Country/Region'].replace('Cape Verde', 'Cabo Verde', inplace=True)
        df['Country/Region'].replace('Hong Kong', 'China', inplace=True)
        df['Country/Region'].replace('Myanmar (Burma)', 'Burma', inplace=True)

        for _, row in df.iterrows():
            country_name = str(row['Country/Region'])
            country_id = _search_name(countries, country_name)

            if country_id is None:
                app.logger.warning(f'{country_name} not found in database')
                continue

            locale_id = _search_clocale(locales, country_id)

            for mm in mobility_measures:
                mm_id, mm_name = mm

                mobility_reports.append(
                    MobilityReport(
                        id=row['Date'],
                        locale_id=locale_id,
                        mobility_measure_id=mm_id,
                        percent=float(row[mm_name]),
                    )
                )

        # [BRAZIL]
        f1 = ~df_mobility['State'].isna()
        f2 = df_mobility['Country/Region'] == 'Brazil'
        df = df_mobility[f1 & f2].copy()

        df['State'].replace('State of Rondônia', 'Rondonia', inplace=True)
        df['State'].replace('State of Acre', 'Acre', inplace=True)
        df['State'].replace(
            'State of Rio Grande do Norte', 'Rio Grande do Norte', inplace=True
        )
        df['State'].replace('State of Amazonas', 'Amazonas', inplace=True)
        df['State'].replace('State of Roraima', 'Roraima', inplace=True)
        df['State'].replace('State of Pará', 'Para', inplace=True)
        df['State'].replace('State of Amapá', 'Amapa', inplace=True)
        df['State'].replace('State of Tocantins', 'Tocantins', inplace=True)
        df['State'].replace('State of Maranhão', 'Maranhao', inplace=True)
        df['State'].replace('State of Ceará', 'Ceara', inplace=True)
        df['State'].replace('State of Piauí', 'Piaui', inplace=True)
        df['State'].replace('State of Paraíba', 'Paraiba', inplace=True)
        df['State'].replace('State of Pernambuco', 'Pernambuco', inplace=True)
        df['State'].replace('State of Alagoas', 'Alagoas', inplace=True)
        df['State'].replace('State of Sergipe', 'Sergipe', inplace=True)
        df['State'].replace('State of Bahia', 'Bahia', inplace=True)
        df['State'].replace(
            'State of Minas Gerais', 'Minas Gerais', inplace=True
        )
        df['State'].replace(
            'State of Espírito Santo', 'Espirito Santo', inplace=True
        )
        df['State'].replace(
            'State of Rio de Janeiro', 'Rio de Janeiro', inplace=True
        )
        df['State'].replace('State of São Paulo', 'Sao Paulo', inplace=True)
        df['State'].replace('State of Paraná', 'Parana', inplace=True)
        df['State'].replace(
            'State of Santa Catarina', 'Santa Catarina', inplace=True
        )
        df['State'].replace(
            'State of Rio Grande do Sul', 'Rio Grande do Sul', inplace=True
        )
        df['State'].replace(
            'State of Mato Grosso do Sul', 'Mato Grosso do Sul', inplace=True
        )
        df['State'].replace(
            'State of Mato Grosso', 'Mato Grosso', inplace=True
        )
        df['State'].replace('State of Goiás', 'Goias', inplace=True)
        df['State'].replace(
            'Federal District', 'Distrito Federal', inplace=True
        )

        for _, row in df.iterrows():
            state_name = str(row['State'])
            state_id = _search_name(states, state_name)
            locale_id = _search_slocale(brazil_locales, state_id)

            if locale_id is None:
                app.logger.warning(f'{state_name} not found in database')
                continue

            for mm in mobility_measures:
                mm_id, mm_name = mm

                mobility_reports.append(
                    MobilityReport(
                        id=row['Date'],
                        locale_id=locale_id,
                        mobility_measure_id=mm_id,
                        percent=float(row[mm_name]),
                    )
                )

        db.session.add_all(mobility_reports)
        db.session.commit()
    # end populate MobilityReport


@celery.task
def sync_Painel_Covid():
    """synchronize with Painel Coronavírus database"""
    # Populate CovidCase
    headers = {
        'Host': 'xx9p7hp1p7.execute-api.us-east-1.amazonaws.com',
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'X-Parse-Application-Id': 'unAFkcaNDeXajurGB7LChj8SgQYS2ptm',
        'Origin': 'https://covid.saude.gov.br',
        'Connection': 'keep-alive',
        'Referer': 'https://covid.saude.gov.br/',
        'TE': 'Trailers',
    }
    json_with_url = requests.get(
        'https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalGeral',
        headers=headers,
    )
    daily_covid_url = (
        json_with_url.json().get('results')[0].get('arquivo').get('url')
    )

    df = pd.read_excel(daily_covid_url, parse_dates=['data'])

    # TODO: Adds checkpoint for each locale
    locales = (
        db.session.query(Locale).filter(Locale.state_id.isnot(None)).all()
    )
    checkpoint = (
        db.session.query(db.func.max(CovidCase.id))
        .filter(CovidCase.locale_id.in_([l.id for l in locales]))
        .scalar()
    )
    df = df[df['data'] > checkpoint]

    if not df.empty:
        # Removes where is city and where not is State
        df = df[df['codmun'].isna()]
        df = df[~df['estado'].isna()]
        # Unused cols
        df.drop(
            columns=[
                'regiao',
                'municipio',
                'coduf',
                'codmun',
                'codRegiaoSaude',
                'nomeRegiaoSaude',
                'semanaEpi',
                'populacaoTCU2019',
                'casosAcumulado',
                'obitosAcumulado',
                'emAcompanhamentoNovos',
                'interior/metropolitana',
            ],
            inplace=True,
        )
        # Renames cols
        df.rename(
            columns={
                'estado': 'State',
                'data': 'Date',
                'casosNovos': 'Confirmed',
                'obitosNovos': 'Deaths',
                'Recuperadosnovos': 'Recovered',
            },
            inplace=True,
        )

        df['State'].replace('RO', 'Rondonia', inplace=True)
        df['State'].replace('AC', 'Acre', inplace=True)
        df['State'].replace('AM', 'Amazonas', inplace=True)
        df['State'].replace('RR', 'Roraima', inplace=True)
        df['State'].replace('PA', 'Para', inplace=True)
        df['State'].replace('AP', 'Amapa', inplace=True)
        df['State'].replace('TO', 'Tocantins', inplace=True)
        df['State'].replace('MA', 'Maranhao', inplace=True)
        df['State'].replace('CE', 'Ceara', inplace=True)
        df['State'].replace('PI', 'Piaui', inplace=True)
        df['State'].replace('PB', 'Paraiba', inplace=True)
        df['State'].replace('PE', 'Pernambuco', inplace=True)
        df['State'].replace('AL', 'Alagoas', inplace=True)
        df['State'].replace('SE', 'Sergipe', inplace=True)
        df['State'].replace('BA', 'Bahia', inplace=True)
        df['State'].replace('RN', 'Rio Grande do Norte', inplace=True)
        df['State'].replace('MG', 'Minas Gerais', inplace=True)
        df['State'].replace('ES', 'Espirito Santo', inplace=True)
        df['State'].replace('RJ', 'Rio de Janeiro', inplace=True)
        df['State'].replace('SP', 'Sao Paulo', inplace=True)
        df['State'].replace('PR', 'Parana', inplace=True)
        df['State'].replace('SC', 'Santa Catarina', inplace=True)
        df['State'].replace('RS', 'Rio Grande do Sul', inplace=True)
        df['State'].replace('MS', 'Mato Grosso do Sul', inplace=True)
        df['State'].replace('MT', 'Mato Grosso', inplace=True)
        df['State'].replace('GO', 'Goias', inplace=True)
        df['State'].replace('DF', 'Distrito Federal', inplace=True)

        states = db.session.query(State).all()
        brazil = (
            db.session.query(Country).filter(Country.name == 'Brazil').first()
        )
        brazil_locales = (
            db.session.query(Locale)
            .filter(
                db.and_(
                    Locale.country_id == brazil.id, Locale.state_id.isnot(None)
                )
            )
            .all()
        )

        covid_cases = []
        for _, row in df.iterrows():
            state_name = str(row['State'])
            state_id = _search_name(states, state_name)
            locale_id = _search_slocale(brazil_locales, state_id)

            if locale_id is None:
                app.logger.warning(f'{state_name} not found in database')
                continue

            covid_cases.append(
                CovidCase(
                    id=row['Date'],
                    locale_id=locale_id,
                    confirmed=_int(row['Confirmed']),
                    recovered=_int(row['Recovered']),
                    deaths=_int(row['Deaths']),
                )
            )

        db.session.add_all(covid_cases)
        db.session.commit()
    # end populate CovidCase


@celery.task
def sync_Brazil_Mitigation():
    """synchronize with Brazil manual mitigation database"""
    # Populate CovidPolicy
    df_mitig = pd.read_csv(
        'https://gist.githubusercontent.com/patricksferraz/'
        '93d1a98c12c46d3828f477e6142a898c/raw/mitigation_brazil.csv',
        sep=';',
    )

    df_mitig = df_mitig.rename(
        columns={'Classificacao': 'classificacao', 'StateCode': 'state_code'}
    )

    dates = df_mitig.columns[2:]
    df_melted = df_mitig.melt(
        id_vars=['classificacao', 'state_code'],
        value_vars=dates,
        var_name='Date',
        value_name='Mitigacao',
    )

    df_melted["Date"] = pd.to_datetime(df_melted["Date"], format='%d/%m/%Y')

    states_alias = {
        'RN': 'Rio Grande do Norte',
        'SE': 'Sergipe',
        'ES': 'Espirito Santo',
        'RJ': 'Rio de Janeiro',
        'RO': 'Rondonia',
        'AL': 'Alagoas',
        'RR': 'Roraima',
        'BA': 'Bahia',
        'RS': 'Rio Grande do Sul',
        'AC': 'Acre',
        'PI': 'Piaui',
        'PB': 'Paraiba',
    }

    # TODO: Adds checkpoint for each locale
    brazil = db.session.query(Country).filter(Country.name == 'Brazil').first()
    brazil_locales = (
        db.session.query(Locale)
        .filter(
            db.and_(
                Locale.country_id == brazil.id, Locale.state_id.isnot(None)
            )
        )
        .all()
    )
    checkpoint = (
        db.session.query(db.func.max(CovidPolicy.id))
        .filter(CovidPolicy.locale_id.in_([l.id for l in brazil_locales]))
        .scalar()
    )
    if checkpoint:
        df_melted = df_melted[df_melted['Date'] > checkpoint]

    if not df_melted.empty:
        states = db.session.query(State).all()

        # countries = db.session.query(Country).all()
        mitigation_measures = db.session.query(MitigationMeasure).all()
        mitigation_measures = {mm.code: mm.id for mm in mitigation_measures}

        covid_policies = []
        for _, row in df_melted.iterrows():
            state_name = states_alias.get(str(row['state_code']))
            state_id = _search_name(states, state_name)

            if state_id is None:
                app.logger.warning(f'{state_name} not found in database')
                continue

            locale_id = _search_slocale(brazil_locales, state_id)

            mm_id = mitigation_measures.get(row['classificacao'])
            density_m_id = row.get('Mitigacao')

            covid_policies.append(
                CovidPolicy(
                    id=row['Date'],
                    locale_id=locale_id,
                    flag_mitigation_id=None,
                    mitigation_measure_id=mm_id,
                    density_mitigation_id=density_m_id,
                )
            )

        db.session.add_all(covid_policies)
        db.session.commit()
    # end populate CovidPolicy
