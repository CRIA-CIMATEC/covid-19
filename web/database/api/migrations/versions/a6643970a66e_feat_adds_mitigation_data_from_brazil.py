"""feat: adds mitigation data from brazil

Revision ID: a6643970a66e
Revises: 17edc656a549
Create Date: 2020-06-16 16:26:35.465993

"""
from sqlalchemy.engine.result import ResultProxy
from flask import current_app as app
from alembic import op
import sqlalchemy as sa
import pandas as pd
from datetime import datetime


# revision identifiers, used by Alembic. e sqlalchemy
revision = 'a6643970a66e'
down_revision = '17edc656a549'
branch_labels = None
depends_on = None


def upgrade():

    def _search(lst: ResultProxy, reg: {str: str}):
        """search reg: {'key': str, 'value': str}"""
        for r in lst:
            if reg['value'] == r[reg['key']]:
                return r.id
        return None

    bind = op.get_bind()
    meta = sa.MetaData(bind)

    # Get tables
    Country = sa.Table('countries', meta, autoload=True)
    State = sa.Table('states', meta, autoload=True)
    Locale = sa.Table('locales', meta, autoload=True)
    MitigationMeasure = sa.Table('mitigation_measures', meta, autoload=True)
    CovidPolicy = sa.Table('covid_policies', meta, autoload=True)
    DensityMitigation = sa.Table('densities_mitigation', meta, autoload=True)

    # Get 'brazil' item from table Country
    brazil = bind.execute(Country.select(Country.c.name == 'Brazil')).first()

    # Get 'states' itens from table State
    states = bind.execute(State.select()).fetchall()

    # Get 'locales' itens from table Locale selecting by (brazil.id) and (states.id != None)
    locales = bind.execute(Locale.select(
            sa.and_(Locale.c.country_id == brazil.id, Locale.c.state_id.isnot(None)))
        ).fetchall()

    # measure: ID
    eight_measures = {
        "C1": None, "C2": None,
        "C3": None, "C4": None,
        "C5": None, "C6": None,
        "C7": None, "C8": None,
    }

    # Get 'measures.id' from table MitigationMeasure by (MitigationMeasure.name)
    for measure in list(eight_measures.keys()):
        eight_measures[measure] = bind.execute(MitigationMeasure.select().where(
            MitigationMeasure.c.code == measure
        )).first().id

    # Start: populate 'CovidPolicy' with the CSV
    df_mitig = pd.read_csv(
        'https://gist.githubusercontent.com/patricksferraz/'
        '93d1a98c12c46d3828f477e6142a898c/raw/mitigation_brazil.csv',
        sep=';'
    )

    df_mitig = df_mitig.rename(columns={'Classificacao': 'classificacao', 'StateCode': 'state_code'})

    dates = df_mitig.columns[2:]
    df_melted = df_mitig.melt(
            id_vars=['classificacao', 'state_code'],
            value_vars=dates,
            var_name='Date',
            value_name='Mitigacao',
        )

    df_melted["Date"] = pd.to_datetime(df_melted["Date"])

    states_alias = {'RN': 'Rio Grande do Norte', 'SE': 'Sergipe', 'ES': 'Espirito Santo',
                'RJ': 'Rio de Janeiro', 'RO': 'Rondonia', 'AL': 'Alagoas', 'RR': 'Roraima',
                'BA': 'Bahia', 'RS': 'Rio Grande do Sul', 'AC': 'Acre', 'PI': 'Piaui', 'PB': 'Paraiba'}

    date = datetime.now()
    covid_policies = []
    for _, row in df_melted.iterrows():
        state_name = states_alias.get(str(row['state_code']))
        state_id = _search(states, {'key': 'name', 'value': state_name})

        if state_id is None:
            app.logger.warning(f'{state_name} not found in database')
            continue

        locale_id = _search(
            locales, {'key': 'state_id', 'value': state_id}
        )

        try:
            mm_id = eight_measures.get(row['classificacao'])
        except ValueError:
            app.logger.error(f'Mitigation_measure_id not found: {row["classificacao"]}')
            exit()

        # Flags defined only in state scope
        flag_m_id = None

        # Returns float or None
        density_m_id = row.get('Mitigacao')

        covid_policies.append(
                {
                    '_created': date,
                    '_updated': date,
                    'id': row['Date'],
                    'locale_id': locale_id,
                    'flag_mitigation_id': flag_m_id,
                    'mitigation_measure_id': mm_id,
                    'density_mitigation_id': density_m_id,
                }
            )

    op.bulk_insert(CovidPolicy, covid_policies)
    # end populate CovidPolicy


def downgrade():
    bind = op.get_bind()
    meta = sa.MetaData(bind)

    # Get tables
    Country = sa.Table('countries', meta, autoload=True)
    State = sa.Table('states', meta, autoload=True)
    Locale = sa.Table('locales', meta, autoload=True)
    CovidPolicy = sa.Table('covid_policies', meta, autoload=True)

    # Get 'brazil' item from table Country
    brazil = bind.execute(Country.select(Country.c.name == 'Brazil')).first()

    # Get 'states' itens from table State
    states = bind.execute(State.select()).fetchall()

    # Get 'locales' itens from table Locale selecting by (brazil.id) and (states.id)
    locales = bind.execute(Locale.select(
            sa.and_(Locale.c.country_id == brazil.id, Locale.c.state_id.isnot(None)))
        ).fetchall()

    for bl in locales:
        bind.execute(CovidPolicy.delete(CovidPolicy.c.locale_id == bl.id))
