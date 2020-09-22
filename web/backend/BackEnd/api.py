from flask import Flask, request, Response,jsonify, session
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from flask_cors import CORS,cross_origin
import jsonpickle
import os
import json
import io
import os
import urllib.request
import numpy as np

import sqlalchemy
from sqlalchemy import Table, Column, Integer, String, ForeignKey
from sqlalchemy import create_engine

import pandas as pd
import requests
from io import StringIO

from datetime import datetime
from datetime import timedelta

# Initialize the Flask application
app = Flask(__name__)
app.config.from_object("config") 
app.secret_key = app.config['SECRET_KEY']
app.config['CORS_RESOURCES'] = {r"/*": {"origins": "https://site:443/"}}
cors = CORS(app)


############################################################
####                   Configuration                    ####
############################################################ 
db_string = "postgres://user:password@serverDB:5432/database"
addr = 'http://infer_server:9000'
addr_teste = 'http://infer_server:9050'
addr_clara = 'http://clara_server:9000'

############################################################
####             Error NF/Deaths and Cases              ####
############################################################ 

erro_nf_qtd = 173152
erro_nf_valor = 1.87924e+07
erro_obitos = [0,77.19,80.16,82.33,76.20,76.82,77.82,80.41,91.24,94.44,99.25,98.47,95.16,95.39,99.45,104.62,115.68,119.84,112.72,110.46,116.84,120.26,124.35,131.01,136.79,130.67,131.07,130.38,132.68,138.08,141.68]
erro_confirmados = [0,659.225755,688.5714825,754.9359124,817.1581071,835.9833072,815.4402951,811.1398001,887.9579042,932.16596,972.8526578,967.7120452,990.7859951,1012.889295,1015.174982,1041.379849,1094.75588,1174.828555,1188.711455,1219.465949,1264.790754,1315.435776,1328.483421,1381.529189,1394.999708,1454.04605,1443.969834,1466.886278,1500.655651,1520.935663,1568.235086]

erro_nf_qtd_list = []
erro_nf_valor_list = []
erro_nf_qtd_list.append(0)
erro_nf_valor_list.append(0)

for i in range(1,len(erro_obitos)):
    erro_nf_qtd_list.append(erro_nf_qtd)
    erro_nf_valor_list.append(erro_nf_valor)

############################################################
####                     Functions                      ####
############################################################   

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def sqlNotas(state,code):
    db = create_engine(db_string)

    #result_set = db.execute("WITH datas AS(select generate_series(now()::date - interval '1 year'::interval,now()::date - interval '1 day'::interval,'1 day'::interval) as dates),selecao AS(SELECT document_expeditions.id,count,amount FROM document_expeditions INNER JOIN document_models ON document_expeditions.document_model_id = document_models.id INNER JOIN locales ON document_expeditions.locale_id = locales.id INNER JOIN states ON states.id = locales.state_id WHERE states.name = '{}' AND document_models.code = '{}' AND document_expeditions.id > now() - interval '2 year' ORDER BY document_expeditions.id,document_models.name  ) select datas.dates,coalesce(count,0) as count,coalesce(amount,0) as amount from datas left join selecao on datas.dates = selecao.id;".format(state,code))
    if state == "Brazil":
        result_set = db.execute("WITH datas AS(select generate_series(now()::date - interval '6 month'::interval,now()::date - interval '1 day'::interval,'1 day'::interval) as dates),selecao AS(SELECT document_expeditions.id,sum(count) as count,sum(amount) as amount  FROM document_expeditions   INNER JOIN document_models ON document_expeditions.document_model_id = document_models.id   INNER JOIN locales ON document_expeditions.locale_id = locales.id   INNER JOIN states ON states.id = locales.state_id WHERE document_models.code = '{}' AND document_expeditions.id > now() - interval '2 year' GROUP BY document_expeditions.id ORDER BY document_expeditions.id) select datas.dates,coalesce(count,0) as count,coalesce(amount,0) as amount from datas left join selecao on datas.dates = selecao.id;;".format(code))
    else:
        result_set = db.execute("WITH datas AS(select generate_series(now()::date - interval '6 month'::interval,now()::date - interval '1 day'::interval,'1 day'::interval) as dates),selecao AS(SELECT document_expeditions.id,count,amount FROM document_expeditions INNER JOIN document_models ON document_expeditions.document_model_id = document_models.id INNER JOIN locales ON document_expeditions.locale_id = locales.id INNER JOIN states ON states.id = locales.state_id WHERE states.name = '{}' AND document_models.code = '{}' AND document_expeditions.id > now() - interval '2 year' ORDER BY document_expeditions.id,document_models.name  ) select datas.dates,coalesce(count,0) as count,coalesce(amount,0) as amount from datas left join selecao on datas.dates = selecao.id;".format(state,code))
    data = []
    quantidade = []
    valor = []
    for row in result_set:
        data.append(str(row[0].strftime("%d/%m/%Y")))
        quantidade.append(int(float(row[1])))
        valor.append(float(row[2]))
    return data,quantidade,valor

def sqlNotasFuturas(nome, country = False):
    db = create_engine(db_string)

    if country == False:
        result_set = db.execute("select id,quantity,value from document_expeditions_predict_ia where name = '{}' order by 1;".format(nome))
    else:
        result_set = db.execute("select id, sum(quantity) as quantity, sum(value) as value from document_expeditions_predict_ia group by id order by 1;")
    data = []
    quantidade = []
    valor = []
    for row in result_set:
        data.append(str(row[0].strftime("%d/%m/%Y")))
        quantidade.append(int(float(row[1])))
        valor.append(float(row[2]))
    return data,quantidade,valor

def sqlNotasCalculate(nome):
    db = create_engine(db_string)

    day_ia = []
    casos_novos = []
    obitos_novos = []
    populacao_list = []

    valor_invoices_2019_list = []
    quantidade_invoices_2019_list = []

    soma_valor_invoices_2019_list = []
    soma_quantidade_invoices_2019_list = []
    week = []
    c10valor = []
    c20valor = []
    c30valor = []
    c40valor = []
    c50valor = []
    c60valor = []
    c70valor = []
    c80valor = []
    c11valor = []
    c21valor = []
    c31valor = []
    c41valor = []
    c51valor = []
    c61valor = []
    c71valor = []
    c81valor = []
    uf = []
    erro = ''

    result_set_invoices = db.execute("select data, casosnovos, obitosnovos, week, populacao, valor, quantidade, soma_valor, soma_quantidade, c10valor, c11valor, c20valor, c21valor, c30valor, c31valor, c40valor, c41valor, c50valor, c51valor, c60valor, c61valor, c70valor, c71valor, c80valor, c81valor from func_calculate_invoices_states('{0}');".format(str(nome)))   

    try:
        for row in result_set_invoices:
            uf.append(nome)
            day_ia.append(row[0].strftime('%d/%m/%Y'))
            casos_novos.append(int(row[1]))
            obitos_novos.append(int(row[2]))
            week.append(int(row[3]))
            populacao_list.append(int(row[4]))
            valor_invoices_2019_list.append(float(round(row[5],2)))
            quantidade_invoices_2019_list.append(float(round(row[6],2)))
            soma_quantidade_invoices_2019_list.append(float(round(row[8],2)))
            soma_valor_invoices_2019_list.append(float(round(row[7],2)))
            c10valor.append(row[9])
            c11valor.append(row[10])
            c20valor.append(row[11])
            c21valor.append(row[12])
            c30valor.append(row[13])
            c31valor.append(row[14])
            c40valor.append(row[15])
            c41valor.append(row[16])
            c50valor.append(row[17])
            c51valor.append(row[18])
            c60valor.append(row[19])
            c61valor.append(row[20])
            c70valor.append(row[21])
            c71valor.append(row[22])
            c80valor.append(row[23])
            c81valor.append(row[24])
    except Exception as ex:
        erro = str(ex)

    return day_ia,casos_novos ,obitos_novos ,populacao_list ,valor_invoices_2019_list,quantidade_invoices_2019_list ,soma_quantidade_invoices_2019_list,soma_valor_invoices_2019_list ,week ,c10valor ,c20valor ,c30valor ,c40valor ,c50valor ,c60valor ,c70valor ,c80valor ,c11valor ,c21valor ,c31valor ,c41valor ,c51valor ,c61valor ,c71valor ,c81valor ,uf,erro

def sqlNotasCalculate_old(nome):
    db = create_engine(db_string)

    day_ia = []
    casos_novos = []
    obitos_novos = []
    populacao_list = []
    amount_invoices_2019_list = []
    value_invoices_2019_list = []
    week = []
    c10valor = []
    c20valor = []
    c30valor = []
    c40valor = []
    c50valor = []
    c60valor = []
    c70valor = []
    c80valor = []
    c11valor = []
    c21valor = []
    c31valor = []
    c41valor = []
    c51valor = []
    c61valor = []
    c71valor = []
    c81valor = []
    uf = []

    try:
        if nome == "Brazil":
            result_set_invoices = db.execute("select * from func_invoices_brazil();")
        else:
            result_set_invoices = db.execute("select * from func_invoices_states('{0}');".format(str(nome)))   
    except Exception as ex:
        return day_ia,casos_novos ,obitos_novos ,populacao_list ,amount_invoices_2019_list ,value_invoices_2019_list ,week ,c10valor ,c20valor ,c30valor ,c40valor ,c50valor ,c60valor ,c70valor ,c80valor ,c11valor ,c21valor ,c31valor ,c41valor ,c51valor ,c61valor ,c71valor ,c81valor ,uf,ex

    #return Response(response="teste1", status=200)
    try:
        for row in result_set_invoices:
            uf.append(nome)
            day_ia.append(row[0].strftime("%d/%m/%Y"))
            casos_novos.append(int(row[1]))
            obitos_novos.append(int(row[2]))
            week.append(int(row[3]))
            populacao_list.append(int(row[4]))
            amount_invoices_2019_list.append(float(round(row[6],2)))
            value_invoices_2019_list.append(float(round(row[5],2)))
            c10valor.append(row[7])
            c11valor.append(row[8])
            c20valor.append(row[9])
            c21valor.append(row[10])
            c30valor.append(row[11])
            c31valor.append(row[12])
            c40valor.append(row[13])
            c41valor.append(row[14])
            c50valor.append(row[15])
            c51valor.append(row[16])
            c60valor.append(row[17])
            c61valor.append(row[18])
            c70valor.append(row[19])
            c71valor.append(row[20])
            c80valor.append(row[21])
            c81valor.append(row[22])
        #return Response(response="testejiegjoei", status=200)
    except Exception as ex:
        return day_ia,casos_novos ,obitos_novos ,populacao_list ,amount_invoices_2019_list ,value_invoices_2019_list ,week ,c10valor ,c20valor ,c30valor ,c40valor ,c50valor ,c60valor ,c70valor ,c80valor ,c11valor ,c21valor ,c31valor ,c41valor ,c51valor ,c61valor ,c71valor ,c81valor ,uf,ex

    return day_ia,casos_novos ,obitos_novos ,populacao_list ,amount_invoices_2019_list ,value_invoices_2019_list ,week ,c10valor ,c20valor ,c30valor ,c40valor ,c50valor ,c60valor ,c70valor ,c80valor ,c11valor ,c21valor ,c31valor ,c41valor ,c51valor ,c61valor ,c71valor ,c81valor ,uf,""

def calculate_cases_func(country,state):
    nome = ""
    db = create_engine(db_string)

    if state != "null":
        result_set_names2 = db.execute("select name,population from states inner join population_state on population_state.state_id = states.id where states.name = '{}';".format(state))
    else:
        result_set_names2 = db.execute("select name,population from countries inner join population_country on population_country.country_id = countries.id where countries.name = '{}';".format(country))
    
    for rows2 in result_set_names2:
        population = rows2[1]

    populacao = population
    #return Response(response="Ok2", status=200)

    if state == "null":
        #result_set = db.execute("select id,name,coalesce(confirmed,0) as confirmed,coalesce(recovered,0) as recovered,coalesce(deaths,0) as deaths from covid_case_view where name = '{}' and id >= '2020-02-25'::date order by id asc;".format(country))
        try:
            result_set = db.execute("WITH C1 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C1'),C2 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C2'),C3 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C3'),C4 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C4'),C5 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C5'),C6 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C6'),C7 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C7'),C8 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C8'),Datas as (select id,name,confirmed,recovered,deaths from covid_case_view where name = '{0}') SELECT Datas.id, Datas.name as name,coalesce(Datas.confirmed, 0) as confirmed,coalesce(Datas.recovered, 0)as recovered,coalesce(Datas.deaths, 0)as deaths,coalesce(c1.valor, 0) as c10valor,case when coalesce(c1.valor, 0) = 0 then 1 else 0 end as c11valor,coalesce(c2.valor, 0) as c20valor,case when coalesce(c2.valor, 0) = 0 then 1 else 0 end as c21valor,coalesce(c3.valor, 0) as c30valor,case when coalesce(c3.valor, 0) = 0 then 1 else 0 end as c31valor,coalesce(c4.valor, 0) as c40valor,case when coalesce(c4.valor, 0) = 0 then 1 else 0 end as c41valor,coalesce(c5.valor, 0) as c50valor,case when coalesce(c5.valor, 0) = 0 then 1 else 0 end as c51valor,coalesce(c6.valor, 0) as c60valor,case when coalesce(c6.valor, 0) = 0 then 1 else 0 end as c61valor,coalesce(c7.valor, 0) as c70valor,case when coalesce(c7.valor, 0) = 0 then 1 else 0 end as c71valor,coalesce(c8.valor, 0) as c80valor,case when coalesce(c8.valor, 0) = 0 then 1 else 0 end as c81valor FROM Datas FULL OUTER JOIN C1 on Datas.id = C1.id FULL OUTER JOIN C2 on C2.id = Datas.id FULL OUTER JOIN C3 on C3.id = Datas.id FULL OUTER JOIN C4 on C4.id = Datas.id FULL OUTER JOIN C5 on C5.id = Datas.id FULL OUTER JOIN C6 on C6.id = Datas.id FULL OUTER JOIN C7 on C7.id = Datas.id FULL OUTER JOIN C8 on C8.id = Datas.id order by Datas.id;".format(country))
        except Exception as tsgs:
            return Response(response=str(tsgs), status=200)
        nome = country
    else:
        #result_set = db.execute("select id,state as name,coalesce(confirmed,0) as confirmed,coalesce(recovered,0) as recovered,coalesce(deaths,0) as deaths from covid_case_brazil_view where state = '{}' and id >= '2020-02-25' order by id asc;".format(state))
        result_set = db.execute("WITH C1 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C1'),C2 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C2'), C3 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C3'), C4 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C4'), C5 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C5'), C6 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C6'), C7 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C7'), C8 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C8'), Datas as  (select * from covid_case_brazil_view where state = '{0}') SELECT Datas.id, Datas.state as name,coalesce(Datas.confirmed, 0) as confirmed,coalesce(Datas.recovered, 0)as recovered,coalesce(Datas.deaths, 0)as deaths, coalesce(c1.valor, 0) as c10valor,case when coalesce(c1.valor, 0) = 0 then 1 else 0 end as c11valor, coalesce(c2.valor, 0) as c20valor,case when coalesce(c2.valor, 0) = 0 then 1 else 0 end as c21valor, coalesce(c3.valor, 0) as c30valor,case when coalesce(c3.valor, 0) = 0 then 1 else 0 end as c31valor, coalesce(c4.valor, 0) as c40valor,case when coalesce(c4.valor, 0) = 0 then 1 else 0 end as c41valor, coalesce(c5.valor, 0) as c50valor,case when coalesce(c5.valor, 0) = 0 then 1 else 0 end as c51valor, coalesce(c6.valor, 0) as c60valor,case when coalesce(c6.valor, 0) = 0 then 1 else 0 end as c61valor, coalesce(c7.valor, 0) as c70valor,case when coalesce(c7.valor, 0) = 0 then 1 else 0 end as c71valor, coalesce(c8.valor, 0) as c80valor,case when coalesce(c8.valor, 0) = 0 then 1 else 0 end as c81valor FROM Datas FULL OUTER JOIN C1 on Datas.id = C1.id FULL OUTER JOIN C2 on C2.id = Datas.id FULL OUTER JOIN C3 on C3.id = Datas.id FULL OUTER JOIN C4 on C4.id = Datas.id FULL OUTER JOIN C5 on C5.id = Datas.id FULL OUTER JOIN C6 on C6.id = Datas.id FULL OUTER JOIN C7 on C7.id = Datas.id FULL OUTER JOIN C8 on C8.id = Datas.id order by Datas.id;".format(state))
        nome = state

    #return Response(response="Ok2", status=200)
    data = []
    name = []
    confirmed = []
    recovered = []
    deaths = []
    c10valor = []
    c20valor = []
    c30valor = []
    c40valor = []
    c50valor = []
    c60valor = []
    c70valor = []
    c80valor = []
    c11valor = []
    c21valor = []
    c31valor = []
    c41valor = []
    c51valor = []
    c61valor = []
    c71valor = []
    c81valor = []
    infection_days = []
    i = 1
    for row in result_set:
        data.append(row[0].strftime("%d/%m/%Y"))
        name.append(row[1])
        confirmed.append(row[2])
        recovered.append(row[3])
        deaths.append(row[4])
        c10valor.append(row[5])
        c11valor.append(row[6])
        c20valor.append(row[7])
        c21valor.append(row[8])
        c30valor.append(row[9])
        c31valor.append(row[10])
        c40valor.append(row[11])
        c41valor.append(row[12])
        c50valor.append(row[13])
        c51valor.append(row[14])
        c60valor.append(row[15])
        c61valor.append(row[16])
        c70valor.append(row[17])
        c71valor.append(row[18])
        c80valor.append(row[19])
        c81valor.append(row[20])
        infection_days.append(i)
        i = i+1
  
    json_files = {"Country": country,"State":state,"populacao": int(populacao),"Beta": "0.53","T_inf": "2.87","N_inf": "99.66", "T_death": "2.28", "CFR": "0.060","Cases":[]}
    #IA

    update_json = {'id':data,'name':name,'confirmed':confirmed,'recovered':recovered,'deaths':deaths,'c10valor':c10valor,'c11valor':c11valor,'c20valor':c20valor,'c21valor':c21valor,'c30valor':c30valor,'c31valor':c31valor,'c40valor':c40valor,'c41valor':c41valor,'c50valor':c50valor,'c51valor':c51valor,'c60valor':c60valor,'c61valor':c61valor,'c70valor':c70valor,'c71valor':c71valor,'c80valor':c80valor,'c81valor':c81valor}#{"region": name, "confirmed": confirmed, "deaths":deaths, "recovered":recovered,"infection_days":infection_days, "data":data}

    json_files_amount = json.loads(json.dumps(json_files))
    json_files_amount['Cases'] = update_json
    return json_files_amount


############################################################
####                    Contato/News                    ####
############################################################ 

@app.route('/api/newsletter', methods=['POST'])
@cross_origin()
def newsletter():
    data = request.get_json(force = True)
    with open('/files/static/lista_emails.txt','a') as f:
        f.write(str(data["email"])+"\n")

    return Response(status=200)

@app.route('/api/contato', methods=['POST'])
@cross_origin()
def contato():
    data = request.get_json(force = True)
    if str(data["sugestao"]) == "True":
        with open('/files/static/sugestao.txt','ab') as f:
           f.write(str(data["nome"]).encode('utf-8')+";".encode('utf-8')+str(data["email"]).encode('utf-8')+";".encode('utf-8')+str(data["mensagem"]).encode('utf-8')+"\n".encode('utf-8'))
    else:
        with open('/files/static/contato.txt','ab') as f:
           f.write(str(data["nome"]).encode('utf-8')+";".encode('utf-8')+str(data["email"]).encode('utf-8')+";".encode('utf-8')+str(data["mensagem"]).encode('utf-8')+"\n".encode('utf-8'))

    return Response(status=202)


############################################################
####                     Dashboard                      ####
############################################################    

@app.route('/api/dashboard/confirmed/daily/', methods=['GET'])
@cross_origin()
def confirmed_daily():
    country = request.args.get('country')
    state = request.args.get('state')

    db = create_engine(db_string)

    if state == "null":
        result_set = db.execute("select id,confirmed from covid_case_view where name = '{}' order by id asc;".format(country))
    else:
        result_set = db.execute("select id,confirmed from covid_case_brazil_view where state = '{}' order by id asc;".format(state))

    data_real = []
    confirmados_real = []    
    last_confirmados = ''
    for row in result_set:
        data_real.append(row[0].strftime("%d/%m/%Y"))
        confirmados_real.append(row[1])
        last_confirmados = int(row[1])

    #predito sird
    if state == "null":
        result_set_sird = db.execute("select id,confirmed from covid_case_predict_sird where name = '{}' order by id asc;".format(country))
    else:
        result_set_sird = db.execute("select id,confirmed from covid_case_predict_sird where name = '{}' order by id asc;".format(state))

    data_sird = []
    confirmados_sird = []


    data_sird.append(data_real[-1])
    confirmados_sird.append(confirmados_real[-1])


    for i,row in enumerate(result_set_sird):
        data_sird.append(row[0].strftime("%d/%m/%Y"))
        confirmados_sird.append(max(0,row[1]))


    #predito ia
    if state == "null":
        result_set_ia = db.execute("select id,confirmed from covid_case_predict_ia where name = '{}' order by id asc;".format(country))
    else:
        result_set_ia = db.execute("select id,confirmed from covid_case_predict_ia where name = '{}' order by id asc;".format(state))

    data_ia = []
    confirmados_ia = []

    data_ia.append(data_real[-1])
    confirmados_ia.append(confirmados_real[-1])

    for i,row in enumerate(result_set_ia):
        data_ia.append(row[0].strftime("%d/%m/%Y"))
        confirmados_ia.append(max(0,row[1]))


    jsonconfirmados = {'real':{'data': data_real,'quantidade': confirmados_real},
                        'SIRD':{'data': data_sird, 'quantidade':confirmados_sird, "maximo":(np.array(confirmados_sird)+np.array(erro_confirmados)).clip(min=0).astype(int).tolist(),"minimo":(np.array(confirmados_sird)-np.array(erro_confirmados)).clip(min=0).astype(int).tolist()}, 
                        'IA':{'data': data_ia,'quantidade':confirmados_ia, "maximo":(np.array(confirmados_ia)+np.array(erro_confirmados)).clip(min=0).astype(int).tolist(),"minimo":(np.array(confirmados_ia)-np.array(erro_confirmados)).clip(min=0).astype(int).tolist()}}

    return jsonify(jsonconfirmados)

@app.route('/api/dashboard/deaths/daily/', methods=['GET'])
@cross_origin()
def deaths_daily():
    country = request.args.get('country')
    state = request.args.get('state')

    db = create_engine(db_string)

    if state == "null":
        result_set = db.execute("select id,deaths from covid_case_view where name = '{}' order by id asc;".format(country))
    else:
        result_set = db.execute("select id,deaths from covid_case_brazil_view where state = '{}' order by id asc;".format(state))

    data_real = [] 
    obitos_real = []

    for row in result_set:
        data_real.append(row[0].strftime("%d/%m/%Y"))
        obitos_real.append(row[1])
        last_confirmados = int(row[1])

    #predito sird
    if state == "null":
        result_set_sird = db.execute("select id,deaths from covid_case_predict_sird where name = '{}' order by id asc;".format(country))
    else:
        result_set_sird = db.execute("select id,deaths from covid_case_predict_sird where name = '{}' order by id asc;".format(state))

    data_sird = []
    obitos_sird = []

    data_sird.append(data_real[-1])
    obitos_sird.append(obitos_real[-1])

    for row in result_set_sird:
        data_sird.append(row[0].strftime("%d/%m/%Y"))
        obitos_sird.append(row[1])

    #predito ia
    if state == "null":
        result_set_ia = db.execute("select id,deaths from covid_case_predict_ia where name = '{}' order by id asc;".format(country))
    else:
        result_set_ia = db.execute("select id,deaths from covid_case_predict_ia where name = '{}' order by id asc;".format(state))

    data_ia = []
    obitos_ia = []

    data_ia.append(data_real[-1])
    obitos_ia.append(obitos_real[-1])

    for row in result_set_ia:
        data_ia.append(row[0].strftime("%d/%m/%Y"))
        obitos_ia.append(row[1])

    jsonobitos = {'real':{'data': data_real,'quantidade': obitos_real},
                    'SIRD':{'data': data_sird, 'quantidade':obitos_sird,"maximo":(np.array(obitos_sird)+np.array(erro_obitos)).clip(min=0).astype(int).tolist(),"minimo":(np.array(obitos_sird)-np.array(erro_obitos)).clip(min=0).astype(int).tolist()},
                    'IA':{'data': data_ia, 'quantidade':obitos_ia,"maximo":(np.array(obitos_ia)+np.array(erro_obitos)).clip(min=0).astype(int).tolist(),"minimo":(np.array(obitos_ia)-np.array(erro_obitos)).clip(min=0).astype(int).tolist()}}


    return jsonify(jsonobitos)

@app.route('/api/dashboard/confirmed/total_cases/', methods=['GET'])
@cross_origin()
def confirmed_total_cases():
    country = request.args.get('country')
    state = request.args.get('state')

    db = create_engine(db_string)

    if state == "null":
        result_set = db.execute("select id,sum(confirmed) over (order by id asc rows between unbounded preceding and current row) from covid_case_view where name = '{}' order by id asc;".format(country))
    else:
        result_set = db.execute("select id,sum(confirmed) over (order by id asc rows between unbounded preceding and current row) from covid_case_brazil_view where state = '{}' order by id asc;".format(state))

    data_real = []
    confirmados_real = []

    for row in result_set:
        data_real.append(row[0].strftime("%d/%m/%Y"))
        confirmados_real.append(row[1])
        last_confirmados = int(row[1])

    #predito sird
    if state == "null":
        result_set_sird = db.execute("select id,sum(confirmed) over (order by id asc rows between unbounded preceding and current row) from covid_case_predict_sird where name = '{}' order by id asc;".format(country))
    else:
        result_set_sird = db.execute("select id,sum(confirmed) over (order by id asc rows between unbounded preceding and current row) from covid_case_predict_sird where name = '{}' order by id asc;".format(state))

    data_sird = []
    confirmados_sird = []

    data_sird.append(data_real[-1])
    confirmados_sird.append(confirmados_real[-1])

    for row in result_set_sird:
        data_sird.append(row[0].strftime("%d/%m/%Y"))
        confirmados_sird.append(confirmados_real[-1] + row[1])

    #predito ia
    if state == "null":
        result_set_ia = db.execute("select id,sum(confirmed) over (order by id asc rows between unbounded preceding and current row) from covid_case_predict_ia where name = '{}' order by id asc;".format(country))
    else:
        result_set_ia = db.execute("select id,sum(confirmed) over (order by id asc rows between unbounded preceding and current row) from covid_case_predict_ia where name = '{}' order by id asc;".format(state))

    data_ia = []
    confirmados_ia = []

    data_ia.append(data_real[-1])
    confirmados_ia.append(confirmados_real[-1])

    
    for row in result_set_ia:
        data_ia.append(row[0].strftime("%d/%m/%Y"))
        confirmados_ia.append(confirmados_real[-1] + row[1])
        
    erro_teste = []
    erro_teste.append(0)
        
    for i in range(1,len(data_ia)):
        erro_teste.append(int(erro_teste[-1]) + int(erro_confirmados[i]))

    jsonconfirmados = {'real':{'data': data_real,'quantidade': confirmados_real},
                        'SIRD':{'data': data_sird, 'quantidade':confirmados_sird,"maximo":(np.array(confirmados_sird)+np.array(erro_teste)).clip(min=0).astype(int).tolist(),"minimo":(np.array(confirmados_sird)-np.array(erro_teste)).clip(min=0).astype(int).tolist()},
                        'IA':{'data': data_ia, 'quantidade':confirmados_ia,"maximo":(np.array(confirmados_ia)+np.array(erro_teste)).clip(min=0).astype(int).tolist(),"minimo":(np.array(confirmados_ia)-np.array(erro_teste)).clip(min=0).astype(int).tolist()}}

    return jsonify(jsonconfirmados)

@app.route('/api/dashboard/deaths/total_cases/', methods=['GET'])
@cross_origin()
def deaths_total_cases():
    country = request.args.get('country')
    state = request.args.get('state')

    db = create_engine(db_string)

    if state == "null":
        result_set = db.execute("select id,sum(deaths) over (order by id asc rows between unbounded preceding and current row) from covid_case_view where name = '{}' order by id asc;".format(country))
    else:
        result_set = db.execute("select id,sum(deaths) over (order by id asc rows between unbounded preceding and current row) from covid_case_brazil_view where state = '{}' order by id asc;".format(state))

    data_real = []
    obitos_real = []

    for row in result_set:
        data_real.append(row[0].strftime("%d/%m/%Y"))
        obitos_real.append(row[1])
        last_confirmados = int(row[1])

    #predito sird
    if state == "null":
        result_set_sird = db.execute("select id,sum(deaths) over (order by id asc rows between unbounded preceding and current row) from covid_case_predict_sird where name = '{}' order by id asc;".format(country))
    else:
        result_set_sird = db.execute("select id,sum(deaths) over (order by id asc rows between unbounded preceding and current row) from covid_case_predict_sird where name = '{}' order by id asc;".format(state))

    data_sird = []
    obitos_sird = []

    data_sird.append(data_real[-1])
    obitos_sird.append(obitos_real[-1])

    for row in result_set_sird:
        data_sird.append(row[0].strftime("%d/%m/%Y"))
        obitos_sird.append(obitos_real[-1] + row[1])

    #predito ia
    if state == "null":
        result_set_ia = db.execute("select id,sum(deaths) over (order by id asc rows between unbounded preceding and current row) from covid_case_predict_ia where name = '{}' order by id asc;".format(country))
    else:
        result_set_ia = db.execute("select id,sum(deaths) over (order by id asc rows between unbounded preceding and current row) from covid_case_predict_ia where name = '{}' order by id asc;".format(state))

    data_ia = []
    obitos_ia = []

    data_ia.append(data_real[-1])
    obitos_ia.append(obitos_real[-1])

    for row in result_set_ia:
        data_ia.append(row[0].strftime("%d/%m/%Y"))
        obitos_ia.append(obitos_real[-1] + row[1])


    erro_teste = []
    erro_teste.append(0)
        
    for i in range(1,len(data_ia)):
        erro_teste.append(int(erro_teste[-1]) + int(erro_obitos[i]))

    jsonobitos = {'real':{'data': data_real,'quantidade': obitos_real},
                'SIRD':{'data': data_sird, 'quantidade':obitos_sird,"maximo":(np.array(obitos_sird)+np.array(erro_teste)).clip(min=0).astype(int).tolist(),"minimo":(np.array(obitos_sird)-np.array(erro_teste)).clip(min=0).astype(int).tolist()},
                'IA':{'data': data_ia, 'quantidade':obitos_ia,"maximo":(np.array(obitos_ia)+np.array(erro_teste)).clip(min=0).astype(int).tolist(),"minimo":(np.array(obitos_ia)-np.array(erro_teste)).clip(min=0).astype(int).tolist()}}


    return jsonify(jsonobitos)

@app.route('/api/dashboard/summary/', methods=['GET'])
@cross_origin()
def summary():
    country = request.args.get('country')
    state = request.args.get('state')

    db = create_engine(db_string)

    inflex_up = "23/05/2020"
    peak = "27/07/2020"
    inflex_down = "12/08/2020"

    if state == "null":
        result_set = db.execute("WITH T AS (select id,sum(confirmed) over (order by id asc rows between unbounded preceding and current row) AS \"confirmed\",sum(deaths) over (order by id asc rows between unbounded preceding and current row) AS \"deaths\" from covid_case_view where name = '{}' order by id desc LIMIT 30) SELECT * FROM t order by id asc;".format(country))
        inflex_up = "05/08/2020"
        peak = "10/09/2020"
        inflex_down = "15/10/2020"
        result_set2 = db.execute("select id from covid_case_view where name = '{0}' and confirmed > 0 order by id asc limit 1;".format(country))
    else:
        result_set = db.execute("WITH T AS (select id,sum(confirmed) over (order by id asc rows between unbounded preceding and current row) AS \"confirmed\",sum(deaths) over (order by id asc rows between unbounded preceding and current row) AS \"deaths\" from covid_case_brazil_view where state = '{}' order by id desc LIMIT 30) SELECT * FROM t order by id asc;".format(state))
        result_set2 = db.execute("select id from covid_case_brazil_view where state = '{0}' and confirmed > 0 order by id asc limit 1;".format(state))

    data = []
    confirmados = []
    obitos = []
    letalidade = []
    exs = ""

    try:
        for row in result_set:
            data.append(row[0].strftime("%d/%m/%Y"))
            confirmados.append(row[1])
            obitos.append(row[2])
            try:
                letalidade.append(round((float(row[2])/float(row[1])*100),2))
            except:
                letalidade.append(round(float(0),2))
    except Exception as ex:
        exs = ex

    
    retorno = ""

    try:
        for row2 in result_set2:
            data_primeiro_caso = row2[0].strftime("%d/%m/%Y")

        dictionary = calculate_cases_func(country,state)

        url = addr + '/api/inflex_peak'

        newheaders = {'Content-Type':'application/json'}
        response_sird = requests.post(url, data=json.dumps(dictionary), headers=newheaders)
        
        retorno = response_sird.json()

        inflex_up = datetime.strptime(data_primeiro_caso,"%d/%m/%Y").date() + timedelta(days=int(retorno['inflex_up']))
        inflex_down = datetime.strptime(data_primeiro_caso,"%d/%m/%Y").date() + timedelta(days=int(retorno['inflex_down']))
        peak = datetime.strptime(data_primeiro_caso,"%d/%m/%Y").date() + timedelta(days=int(retorno['peak']))
    except Exception as ex:
        exs = ex
    try:
        return jsonify({'confirmed': {"data":data,"value":confirmados}, 'deaths': {"data":data,"value":obitos}, 'lethality':{"data":data,"value":letalidade},'inflex_up': str(inflex_up.strftime("%d/%m/%Y")), "peak": str(peak.strftime("%d/%m/%Y")), 'inflex_down':str(inflex_down.strftime("%d/%m/%Y")),"ex":str(exs),"dictionary":dictionary,"retorno":retorno})
    except Exception as ex1:
        return jsonify({"error":str(ex1)})

@app.route('/api/dashboard/invoices/quantity/', methods=['GET'])
@cross_origin()
def invoices_quantity():
    state = request.args.get('state')
    country = request.args.get('country')
    if country == "Brazil" and state == "null":
        state = "Brazil"
        day_predict,quantity_predict,_ = sqlNotasFuturas(state,True)
    else:
        day_predict,quantity_predict,_ = sqlNotasFuturas(state,False)

    arquivo = {}
    day,quantity,_ = sqlNotas(state,'NFC-e')

    erro_nf = []
    erro_nf.append(0)

    

    data_predict_ia = []
    quantity_predict_ia = []

    data_predict_ia.append(day[-1])
    quantity_predict_ia.append(quantity[-1])

    for row in range(0,len(quantity_predict)):
        data_predict_ia.append(day_predict[row])
        quantity_predict_ia.append(quantity_predict[row])
        erro_nf.append(erro_nf_qtd)

    arquivo['NFC-e'] = {"Quantidade":{
                            "real": {"data":day,"quantidade":quantity},
                            "IA": {"data":data_predict_ia,"quantidade":quantity_predict_ia,"maximo":(np.array(quantity_predict_ia)+np.array(erro_nf)).clip(min=0).tolist(),"minimo":(np.array(quantity_predict_ia)-np.array(erro_nf)).clip(min=0).tolist()}}}

    return jsonify(arquivo)

@app.route('/api/dashboard/invoices/value/', methods=['GET'])
@cross_origin()
def invoices_value():
    state = request.args.get('state')
    country = request.args.get('country')
    if country == "Brazil" and state == "null":
        state = "Brazil"
        day_predict,_,value_predict = sqlNotasFuturas(state,True)
    else:
        day_predict,_,value_predict = sqlNotasFuturas(state,False)


    arquivo = {}
    day,_,value = sqlNotas(state,'NFC-e')

    erro_nf = []
    erro_nf.append(0)

    data_predict_ia = []
    value_predict_ia = []

    data_predict_ia.append(day[-1])
    value_predict_ia.append(value[-1])

    for row in range(0,len(value_predict)):
        data_predict_ia.append(day_predict[row])
        value_predict_ia.append(value_predict[row])
        erro_nf.append(erro_nf_valor)

    arquivo['NFC-e'] = {"Valor":{
                            "real": {"data":day,"valor":value},
                            "IA": {"data":data_predict_ia,"valor":value_predict_ia,"maximo":(np.array(value_predict_ia)+np.array(erro_nf)).clip(min=0).tolist(),"minimo":(np.array(value_predict_ia)-np.array(erro_nf)).clip(min=0).tolist()}}}

    return jsonify(arquivo)

@app.route('/api/dashboard/mobility/', methods=['GET'])
@cross_origin()
def dashboard_mobility():
    country = request.args.get('country')
    state = request.args.get('state')
    category = request.args.get('category')

    db = create_engine(db_string)

    dicionario_traducao = { "retail and recreation":"Varejo e Recreação",
                            "grocery and pharmacy":"Mercearia e Farmácia",
                            "parks":"Parques",
                            "transit stations":"Estações de Transporte",
                            "workplaces": "Locais de Trabalho",
                            "residential": "Residencial"}

    if category == "6":
        retorno = []
        
        for i in range(0,6):
            if state == "null":
                result_set = db.execute("select mobility_reports.id,mobility_reports.percent,mobility_measures.name from mobility_reports INNER JOIN mobility_measures on mobility_measure_id =  mobility_measures.id INNER JOIN locales on mobility_reports.locale_id = locales.id inner join countries on locales.country_id = countries.id WHERE mobility_measure_id = {} AND countries.name = '{}' and locales.state_id is null ORDER BY mobility_reports.id;".format(i,country))
            else:
                result_set = db.execute("select mobility_reports.id,mobility_reports.percent,mobility_measures.name from mobility_reports INNER JOIN mobility_measures on mobility_measure_id =  mobility_measures.id INNER JOIN locales on mobility_reports.locale_id = locales.id inner join countries on locales.country_id = countries.id INNER JOIN states ON states.id = locales.state_id WHERE mobility_measure_id = {} AND countries.name = '{}' and states.name = '{}' ORDER BY mobility_reports.id;".format(i,country,state))
            data = []
            percentual = []
            nome = ''
            for row in result_set:
                data.append(row[0].strftime("%d/%m/%Y"))
                valor = row[1]
                if valor == "NaN":
                    percentual.append('')
                else:
                    percentual.append(valor)
                nome = dicionario_traducao[row[2]]
            retorno.append([nome,data,percentual])
        
        return jsonify({retorno[0][0]:{'date': retorno[0][1], 'percent':retorno[0][2]},
                        retorno[1][0]:{'date': retorno[1][1], 'percent':retorno[1][2]},
                        retorno[2][0]:{'date': retorno[2][1], 'percent':retorno[2][2]},
                        retorno[3][0]:{'date': retorno[3][1], 'percent':retorno[3][2]},
                        retorno[4][0]:{'date': retorno[4][1], 'percent':retorno[4][2]},
                        retorno[5][0]:{'date': retorno[5][1], 'percent':retorno[5][2]}})
            
    else:
        if state == "null":
            result_set = db.execute("select mobility_reports.id,mobility_reports.percent,mobility_measures.name from mobility_reports INNER JOIN mobility_measures on mobility_measure_id =  mobility_measures.id INNER JOIN locales on mobility_reports.locale_id = locales.id inner join countries on locales.country_id = countries.id WHERE mobility_measure_id = {} AND countries.name = '{}' and locales.state_id is null ORDER BY mobility_reports.id LIMIT 60;".format(category,country))
        else:
            result_set = db.execute("select mobility_reports.id,mobility_reports.percent,mobility_measures.name from mobility_reports INNER JOIN mobility_measures on mobility_measure_id =  mobility_measures.id INNER JOIN locales on mobility_reports.locale_id = locales.id inner join countries on locales.country_id = countries.id INNER JOIN states ON states.id = locales.state_id WHERE mobility_measure_id = {} AND countries.name = '{}' and states.name = '{}' ORDER BY mobility_reports.id LIMIT 60;".format(category,country,state))

        data = []
        percentual = []

        for row in result_set:
            data.append(row[0].strftime("%d/%m/%Y"))
            valor = row[1]
            if valor == "NaN":
                percentual.append('')
            else:
                percentual.append(valor)
            nome = dicionario_traducao[row[2]]
        return jsonify({nome:{'date': data, 'percent':percentual}})

@app.route('/api/dashboard/restrictive/', methods=['GET'])
@cross_origin()
def dashboard_restrictive():
    country = request.args.get('country')

    db = create_engine(db_string)

    
    result_set = db.execute("WITH summary AS ( SELECT covid_policies.id,mitigation_measures.name, ROW_NUMBER() OVER(PARTITION BY mitigation_measures.name ORDER BY covid_policies.id asc) as rk   FROM covid_policies   INNER JOIN locales ON covid_policies.locale_id = locales.id   INNER JOIN countries on locales.country_id = countries.id    INNER JOIN mitigation_measures ON covid_policies.mitigation_measure_id = mitigation_measures.id  INNER JOIN flags_mitigation on flags_mitigation.id = covid_policies.flag_mitigation_id  WHERE countries.name = '{}'   ORDER BY covid_policies.id asc) SELECT s.* from summary s WHERE s.rk = 1;".format(country))
    
    data = []
    tipo = []

    dicionario_traducao = { "public information campaign": "Campanha de informação pública",
        "cancellation of public events": "Cancelamento de eventos públicos",
        "school closure": "Fechamento de escolas",
        "stay-at-home requirements": "Isolamento social",
        "workplace closure": "Fechamento de comércio",
        "restrictions on gathering size": "Restrição por tamanho de lugar",
        "restrictions on domestic/internal movement": "Restrição de movimentação interna",
        "public transport closures": "Fechamento de transporte público"}

    for row in result_set:
        data.append(row[0].strftime("%d/%m/%Y"))
        tipo.append(dicionario_traducao[row[1]])

    return jsonify({"data": data, "tipo":tipo})

############################################################
####                    Calculation                     ####
############################################################

@app.route('/api/return/calculate/cases/', methods=['GET'])
@cross_origin()
def calculate_cases_return():
    try:
        types = request.args.get('type')
    
        db = create_engine(db_string)

        if types == "country":
            try:
                result_set = db.execute("WITH C1 as(select id,code,valor,name from covid_policies_countries where  code='C1'),C2 as(select id,code,valor,name from covid_policies_countries where  code='C2'),C3 as(select id,code,valor,name from covid_policies_countries where  code='C3'),C4 as(select id,code,valor,name from covid_policies_countries where  code='C4'),C5 as(select id,code,valor,name from covid_policies_countries where  code='C5'),C6 as(select id,code,valor,name from covid_policies_countries where  code='C6'),C7 as(select id,code,valor,name from covid_policies_countries where  code='C7'),C8 as(select id,code,valor,name from covid_policies_countries where  code='C8'),Datas as (select id,name,confirmed,recovered,deaths from covid_case_view) SELECT Datas.id, Datas.name as name,coalesce(Datas.confirmed, 0) as confirmed,coalesce(Datas.recovered, 0)as recovered,coalesce(Datas.deaths, 0)as deaths,coalesce(c1.valor, 0) as c1_original,case when coalesce(c1.valor, 0) = 0 then 1 else 0 end as c1_inverso,coalesce(c2.valor, 0) as c2_original,case when coalesce(c2.valor, 0) = 0 then 1 else 0 end as c2_inverso,coalesce(c3.valor, 0) as c3_original,case when coalesce(c3.valor, 0) = 0 then 1 else 0 end as c3_inverso,coalesce(c4.valor, 0) as c4_original,case when coalesce(c4.valor, 0) = 0 then 1 else 0 end as c4_inverso,coalesce(c5.valor, 0) as c5_original,case when coalesce(c5.valor, 0) = 0 then 1 else 0 end as c5_inverso,coalesce(c6.valor, 0) as c6_original,case when coalesce(c6.valor, 0) = 0 then 1 else 0 end as c6_inverso,coalesce(c7.valor, 0) as c7_original,case when coalesce(c7.valor, 0) = 0 then 1 else 0 end as c7_inverso,coalesce(c8.valor, 0) as c8_original,case when coalesce(c8.valor, 0) = 0 then 1 else 0 end as c8_inverso FROM Datas LEFT JOIN C1 on Datas.id = C1.id and Datas.name = C1.name LEFT JOIN C2 on C2.id = Datas.id and Datas.name = C2.name LEFT JOIN C3 on C3.id = Datas.id and Datas.name = C3.name LEFT JOIN C4 on C4.id = Datas.id and Datas.name = C4.name LEFT JOIN C5 on C5.id = Datas.id and Datas.name = C5.name LEFT JOIN C6 on C6.id = Datas.id and Datas.name = C6.name LEFT JOIN C7 on C7.id = Datas.id and Datas.name = C7.name LEFT JOIN C8 on C8.id = Datas.id and Datas.name = C8.name order by Datas.name,Datas.id;")
            except Exception as tsgs:
                return Response(response=str(tsgs), status=200)
        else:
            result_set = db.execute("WITH C1 as(select id,code,valor,name from covid_policies_states where code='C1'),C2 as(select  id,code,valor,name from covid_policies_states where code='C2'), C3 as(select  id,code,valor,name from covid_policies_states where code='C3'), C4 as(select  id,code,valor,name from covid_policies_states where code='C4'), C5 as(select  id,code,valor,name from covid_policies_states where code='C5'), C6 as(select  id,code,valor,name from covid_policies_states where code='C6'), C7 as(select  id,code,valor,name from covid_policies_states where code='C7'), C8 as(select  id,code,valor,name from covid_policies_states where code='C8'), Datas as (select id,state as name,confirmed,recovered,deaths from covid_case_brazil_view) SELECT Datas.id, Datas.name,coalesce(Datas.confirmed, 0) as confirmed,coalesce(Datas.recovered, 0)as recovered,coalesce(Datas.deaths, 0)as deaths, coalesce(c1.valor, 0) as c1_original,case when coalesce(c1.valor, 0) = 0 then 1 else 0 end as c1_inverso,coalesce(c2.valor, 0) as c2_original,case when coalesce(c2.valor, 0) = 0 then 1 else 0 end as c2_inverso,coalesce(c3.valor, 0) as c3_original,case when coalesce(c3.valor, 0) = 0 then 1 else 0 end as c3_inverso,coalesce(c4.valor, 0) as c4_original,case when coalesce(c4.valor, 0) = 0 then 1 else 0 end as c4_inverso,coalesce(c5.valor, 0) as c5_original,case when coalesce(c5.valor, 0) = 0 then 1 else 0 end as c5_inverso,coalesce(c6.valor, 0) as c6_original,case when coalesce(c6.valor, 0) = 0 then 1 else 0 end as c6_inverso,coalesce(c7.valor, 0) as c7_original,case when coalesce(c7.valor, 0) = 0 then 1 else 0 end as c7_inverso,coalesce(c8.valor, 0) as c8_original,case when coalesce(c8.valor, 0) = 0 then 1 else 0 end as c8_inverso FROM Datas LEFT JOIN C1 on C1.id = Datas.id and Datas.name = C1.name  LEFT JOIN C2 on C2.id = Datas.id and Datas.name = C2.name LEFT JOIN C3 on C3.id = Datas.id and Datas.name = C3.name LEFT JOIN C4 on C4.id = Datas.id and Datas.name = C4.name LEFT JOIN C5 on C5.id = Datas.id and Datas.name = C5.name LEFT JOIN C6 on C6.id = Datas.id and Datas.name = C6.name LEFT JOIN C7 on C7.id = Datas.id and Datas.name = C7.name LEFT JOIN C8 on C8.id = Datas.id and Datas.name = C8.name order by Datas.name,Datas.id;")

        data = []
        name = []
        confirmed = []
        recovered = []
        deaths = []
        c10valor = []
        c20valor = []
        c30valor = []
        c40valor = []
        c50valor = []
        c60valor = []
        c70valor = []
        c80valor = []
        c11valor = []
        c21valor = []
        c31valor = []
        c41valor = []
        c51valor = []
        c61valor = []
        c71valor = []
        c81valor = []
        infection_days = []
        i = 1
        for row in result_set:
            data.append(row[0].strftime("%d/%m/%Y"))
            name.append(row[1])
            confirmed.append(row[2])
            recovered.append(row[3])
            deaths.append(row[4])
            c10valor.append(row[5])
            c11valor.append(row[6])
            c20valor.append(row[7])
            c21valor.append(row[8])
            c30valor.append(row[9])
            c31valor.append(row[10])
            c40valor.append(row[11])
            c41valor.append(row[12])
            c50valor.append(row[13])
            c51valor.append(row[14])
            c60valor.append(row[15])
            c61valor.append(row[16])
            c70valor.append(row[17])
            c71valor.append(row[18])
            c80valor.append(row[19])
            c81valor.append(row[20])
            infection_days.append(i)
            i = i+1


        
        json_files = {"Country": "","State":"","populacao": int(0),"Beta": "0.53","T_inf": "2.87","N_inf": "99.66", "T_death": "2.28", "CFR": "0.060","Cases":[]}
        #IA

        update_json = {'id':data,'name':name,'confirmed':confirmed,'recovered':recovered,'deaths':deaths,'c10valor':c10valor,'c11valor':c11valor,'c20valor':c20valor,'c21valor':c21valor,'c30valor':c30valor,'c31valor':c31valor,'c40valor':c40valor,'c41valor':c41valor,'c50valor':c50valor,'c51valor':c51valor,'c60valor':c60valor,'c61valor':c61valor,'c70valor':c70valor,'c71valor':c71valor,'c80valor':c80valor,'c81valor':c81valor}

        json_files_amount = json.loads(json.dumps(json_files))
        json_files_amount['Cases'] = update_json
    except Exception as ex:
        json_files_amount = str(ex)
    return jsonify(json_files_amount)

@app.route('/api/calculate/cases/', methods=['POST'])
@cross_origin()
def calculate_cases():
    senha = request.form.get('calculate')
    if str(senha) == 'any_text_here':
        try:
            country = request.args.get('country')
            state = request.args.get('state')
            
            nome = ""
            db = create_engine(db_string)

            if state != "null":
                result_set_names2 = db.execute("select name,population from states inner join population_state on population_state.state_id = states.id where states.name = '{}';".format(state))
            else:
                result_set_names2 = db.execute("select name,population from countries inner join population_country on population_country.country_id = countries.id where countries.name = '{}';".format(country))
            
            for rows2 in result_set_names2:
                population = rows2[1]

            populacao = population

            if state == "null":
                try:
                    result_set = db.execute("WITH C1 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C1'),C2 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C2'),C3 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C3'),C4 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C4'),C5 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C5'),C6 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C6'),C7 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C7'),C8 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C8'),Datas as (select id,name,confirmed,recovered,deaths from covid_case_view where name = '{0}') SELECT Datas.id, Datas.name as name,coalesce(Datas.confirmed, 0) as confirmed,coalesce(Datas.recovered, 0)as recovered,coalesce(Datas.deaths, 0)as deaths,coalesce(c1.valor, 0) as c10valor,case when coalesce(c1.valor, 0) = 0 then 1 else 0 end as c11valor,coalesce(c2.valor, 0) as c20valor,case when coalesce(c2.valor, 0) = 0 then 1 else 0 end as c21valor,coalesce(c3.valor, 0) as c30valor,case when coalesce(c3.valor, 0) = 0 then 1 else 0 end as c31valor,coalesce(c4.valor, 0) as c40valor,case when coalesce(c4.valor, 0) = 0 then 1 else 0 end as c41valor,coalesce(c5.valor, 0) as c50valor,case when coalesce(c5.valor, 0) = 0 then 1 else 0 end as c51valor,coalesce(c6.valor, 0) as c60valor,case when coalesce(c6.valor, 0) = 0 then 1 else 0 end as c61valor,coalesce(c7.valor, 0) as c70valor,case when coalesce(c7.valor, 0) = 0 then 1 else 0 end as c71valor,coalesce(c8.valor, 0) as c80valor,case when coalesce(c8.valor, 0) = 0 then 1 else 0 end as c81valor FROM Datas LEFT JOIN C1 on Datas.id = C1.id LEFT JOIN C2 on C2.id = Datas.id LEFT JOIN C3 on C3.id = Datas.id LEFT JOIN C4 on C4.id = Datas.id LEFT JOIN C5 on C5.id = Datas.id LEFT JOIN C6 on C6.id = Datas.id LEFT JOIN C7 on C7.id = Datas.id LEFT JOIN C8 on C8.id = Datas.id order by Datas.id;".format(country))
                except Exception as tsgs:
                    return Response(response=str(tsgs), status=200)
                nome = country
            else:
                result_set = db.execute("WITH C1 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C1'),C2 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C2'), C3 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C3'), C4 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C4'), C5 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C5'), C6 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C6'), C7 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C7'), C8 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C8'), Datas as  (select * from covid_case_brazil_view where state = '{0}') SELECT Datas.id, Datas.state as name,coalesce(Datas.confirmed, 0) as confirmed,coalesce(Datas.recovered, 0)as recovered,coalesce(Datas.deaths, 0)as deaths, coalesce(c1.valor, 0) as c10valor,case when coalesce(c1.valor, 0) = 0 then 1 else 0 end as c11valor, coalesce(c2.valor, 0) as c20valor,case when coalesce(c2.valor, 0) = 0 then 1 else 0 end as c21valor, coalesce(c3.valor, 0) as c30valor,case when coalesce(c3.valor, 0) = 0 then 1 else 0 end as c31valor, coalesce(c4.valor, 0) as c40valor,case when coalesce(c4.valor, 0) = 0 then 1 else 0 end as c41valor, coalesce(c5.valor, 0) as c50valor,case when coalesce(c5.valor, 0) = 0 then 1 else 0 end as c51valor, coalesce(c6.valor, 0) as c60valor,case when coalesce(c6.valor, 0) = 0 then 1 else 0 end as c61valor, coalesce(c7.valor, 0) as c70valor,case when coalesce(c7.valor, 0) = 0 then 1 else 0 end as c71valor, coalesce(c8.valor, 0) as c80valor,case when coalesce(c8.valor, 0) = 0 then 1 else 0 end as c81valor FROM Datas LEFT JOIN C1 on Datas.id = C1.id LEFT JOIN C2 on C2.id = Datas.id LEFT JOIN C3 on C3.id = Datas.id LEFT JOIN C4 on C4.id = Datas.id LEFT JOIN C5 on C5.id = Datas.id LEFT JOIN C6 on C6.id = Datas.id LEFT JOIN C7 on C7.id = Datas.id LEFT JOIN C8 on C8.id = Datas.id order by Datas.id;".format(state))
                nome = state

            data = []
            name = []
            confirmed = []
            recovered = []
            deaths = []
            c10valor = []
            c20valor = []
            c30valor = []
            c40valor = []
            c50valor = []
            c60valor = []
            c70valor = []
            c80valor = []
            c11valor = []
            c21valor = []
            c31valor = []
            c41valor = []
            c51valor = []
            c61valor = []
            c71valor = []
            c81valor = []
            infection_days = []
            i = 1
            for row in result_set:
                data.append(row[0].strftime("%d/%m/%Y"))
                name.append(row[1])
                confirmed.append(row[2])
                recovered.append(row[3])
                deaths.append(row[4])
                c10valor.append(row[5])
                c11valor.append(row[6])
                c20valor.append(row[7])
                c21valor.append(row[8])
                c30valor.append(row[9])
                c31valor.append(row[10])
                c40valor.append(row[11])
                c41valor.append(row[12])
                c50valor.append(row[13])
                c51valor.append(row[14])
                c60valor.append(row[15])
                c61valor.append(row[16])
                c70valor.append(row[17])
                c71valor.append(row[18])
                c80valor.append(row[19])
                c81valor.append(row[20])
                infection_days.append(i)
                i = i+1


            
            json_files = {"Country": country,"State":state,"populacao": int(populacao),"Beta": "0.53","T_inf": "2.87","N_inf": "99.66", "T_death": "2.28", "CFR": "0.060","Cases":[],"Mitigation":[]}
            
            update_json = {"region": name, "confirmed": confirmed, "deaths":deaths, "recovered":recovered,"infection_days":infection_days, "data":data}

            json_files_amount = json.loads(json.dumps(json_files))
            json_files_amount['Cases'] = update_json

            
            
            #SIRD
            url = addr_teste + '/api/cases/sird/calculate'

            newheaders = {'Content-Type':'application/json'}
            response_sird = requests.post(url, data=json.dumps(json_files_amount), headers=newheaders)
            
            response_sird = response_sird.json()
            
            #IA

            update_json = {'id':data,'name':name,'confirmed':confirmed,'recovered':recovered,'deaths':deaths,'c10valor':c10valor,'c11valor':c11valor,'c20valor':c20valor,'c21valor':c21valor,'c30valor':c30valor,'c31valor':c31valor,'c40valor':c40valor,'c41valor':c41valor,'c50valor':c50valor,'c51valor':c51valor,'c60valor':c60valor,'c61valor':c61valor,'c70valor':c70valor,'c71valor':c71valor,'c80valor':c80valor,'c81valor':c81valor}

            json_files_amount = json.loads(json.dumps(json_files))
            json_files_amount['Cases'] = update_json


            url_ia = addr_teste + '/api/cases/ia/calculate'

            newheaders = {'Content-Type':'application/json'}

            response_ia = requests.post(url_ia, data=json.dumps(json_files_amount), headers=newheaders)

            response_ia = response_ia.json()
            
            try:
                qtddatas = len(response_sird['confirmed'])
            except Exception as ex:
                return Response(response=str(ex), status=403)

            

            list_datas_preditas = []
            for i in range(1,qtddatas+1):
                list_datas_preditas.append((datetime.strptime(data[-1],"%d/%m/%Y") + timedelta(days=i)).strftime("%d/%m/%Y"))

            
            db2= create_engine(db_string)
            conn = db2.connect()
            exp = []
            exp.append("Casos calculados com sucesso")
            try:
                conn.execute("delete from covid_case_predict_ia where name = '{}';".format(str(nome)))
                conn.execute("delete from covid_case_predict_sird where name = '{}';".format(str(nome)))
            except Exception as ex:
                return Response(response="Não foi possível deletar informações desse País/Estado: {}".format(ex), status=401)

            for i in range(0,len(response_sird['confirmed'])):
                data = list_datas_preditas[i]

                confirmados_sird = response_sird['confirmed'][i]
                obitos_sird = response_sird['deaths'][i]
                recuperados = 0

                confirmados_ia = response_ia['confirmed'][i]
                obitos_ia = response_ia['deaths'][i]
                recuperados = 0
                
                try:
                    conn.execute("""INSERT INTO covid_case_predict_sird (id,name,confirmed,recovered,deaths) VALUES (%s,%s,%s,%s,%s);""",(datetime.strptime(data,"%d/%m/%Y").strftime("%Y-%m-%d %H:%M:%S"),str(nome),confirmados_sird,recuperados,obitos_sird))
                    #IA
                    conn.execute("""INSERT INTO covid_case_predict_ia (id,name,confirmed,recovered,deaths) VALUES (%s,%s,%s,%s,%s);""",(datetime.strptime(data,"%d/%m/%Y").strftime("%Y-%m-%d %H:%M:%S"),str(nome),confirmados_ia,recuperados,obitos_ia))
                except Exception as ex:
                    exp.append(ex)
            conn.close()
            
            return Response(response=str(exp), status=200)

        except Exception as ex:
            return Response(response=ex, status=403)
    else:
        return Response(response="Não autorizado", status=401)

@app.route('/api/calculate/invoices/', methods=['POST'])
@cross_origin()
def calculate_invoices():
    try:
        senha = request.form.get('calculate')
        if str(senha) == 'any_text_here':
            state = request.args.get('state')
            country = request.args.get('country')
            
            db = create_engine(db_string)
            if country == "Brazil" and state == "null":
                state = "Brazil"

            day_ia,casos_novos ,obitos_novos ,populacao_list ,valor_invoices_2019_list,quantidade_invoices_2019_list ,soma_quantidade_invoices_2019_list,soma_valor_invoices_2019_list ,week ,c10valor ,c20valor ,c30valor ,c40valor ,c50valor ,c60valor ,c70valor ,c80valor ,c11valor ,c21valor ,c31valor ,c41valor ,c51valor ,c61valor ,c71valor ,c81valor ,uf,erro = sqlNotasCalculate(state)
            envio = {'Date':day_ia,'populacao':populacao_list,'Country/Region':uf,'day_of_week':week,'Confirmed':casos_novos,'Deaths':obitos_novos,'Qtde Autorizados':quantidade_invoices_2019_list,'Valor Autorizados':valor_invoices_2019_list,'Qtde Autorizados_2019_mean':soma_quantidade_invoices_2019_list,'Valor Autorizados_2019_mean':soma_valor_invoices_2019_list,'C1':c10valor,'C2':c20valor,'C3':c30valor,'C4':c40valor,'C5':c50valor,'C6':c60valor,'C7':c70valor,'C8':c80valor,'erro':erro}
            try:
            
                newheaders = {'Content-Type':'application/json'}
                #IA
                url_invoices = addr_teste + '/api/invoices/ia/calculate'
                response_invoices = requests.post(url_invoices, data=json.dumps(envio), headers=newheaders)

            except Exception as ex:
                return Response(response=str("Erro1:",ex), status=200)
            try:
                response_invoices = response_invoices.json()
            except Exception as ex:
                return Response(response=str("Erro2:",ex), status=200)

            list_datas_preditas = []
            for i in range(1,len(response_invoices["value"])+1):
               list_datas_preditas.append(datetime.strptime(day_ia[-1],"%d/%m/%Y") + timedelta(days=i+1))

            quantity_ia = response_invoices["quantity"]
            value_ia = response_invoices["value"]
            
            db2= create_engine(db_string)
            conn = db2.connect()
            exp = []

            try:
                conn.execute("delete from document_expeditions_predict_ia where name = '{}';".format(str(state)))
            except Exception as ex:
                return Response(response="Não foi possível deletar informações desse País/Estado: {}".format(ex), status=401)

            
            for i in range(0,len(quantity_ia)):
                data = day_ia[i]

                try:
                    conn.execute("""INSERT INTO document_expeditions_predict_ia (id,quantity,value,name) VALUES ('{}',{},{},'{}');""".format(list_datas_preditas[i].strftime("%Y-%m-%d %H:%M:%S"),quantity_ia[i],value_ia[i],str(state)))
                except Exception as ex:
                    return Response(response=str(ex), status=501)
            return Response(response="Casos calculados com sucesso", status=200)
        else:
            return Response(response="Bad solicitation", status=401)
    except Exception as ex:
        return Response(response=ex, status=403)
    
@app.route('/api/return/calculate/invoices/', methods=['GET'])
@cross_origin()
def calculate_invoices_teste():
    try:
        state = request.args.get('state')
        db = create_engine(db_string)

        day_ia = []
        casos_novos = []
        obitos_novos = []
        populacao_list = []
        
        valor_invoices_2019_list = []
        quantidade_invoices_2019_list = []
        
        soma_valor_invoices_2019_list = []
        soma_quantidade_invoices_2019_list = []
        week = []
        c10valor = []
        c20valor = []
        c30valor = []
        c40valor = []
        c50valor = []
        c60valor = []
        c70valor = []
        c80valor = []
        c11valor = []
        c21valor = []
        c31valor = []
        c41valor = []
        c51valor = []
        c61valor = []
        c71valor = []
        c81valor = []
        uf = []
        erro = ""
        try:
            day_ia,casos_novos ,obitos_novos ,populacao_list ,valor_invoices_2019_list,quantidade_invoices_2019_list ,soma_quantidade_invoices_2019_list,soma_valor_invoices_2019_list ,week ,c10valor ,c20valor ,c30valor ,c40valor ,c50valor ,c60valor ,c70valor ,c80valor ,c11valor ,c21valor ,c31valor ,c41valor ,c51valor ,c61valor ,c71valor ,c81valor ,uf,erro = sqlNotasCalculate(state)
            envio = {'Date':day_ia,'populacao':populacao_list,'Country/Region':uf,'day_of_week':week,'Confirmed':casos_novos,'Deaths':obitos_novos,'Qtde Autorizados':quantidade_invoices_2019_list,'Valor Autorizados':valor_invoices_2019_list,'Qtde Autorizados_2019_mean':soma_quantidade_invoices_2019_list,'Valor Autorizados_2019_mean':soma_valor_invoices_2019_list,'C1':c10valor,'C2':c20valor,'C3':c30valor,'C4':c40valor,'C5':c50valor,'C6':c60valor,'C7':c70valor,'C8':c80valor,'erro':erro}
        except Exception as ex:
            return Response(response=str("Erro1:",ex), status=401)
        return jsonify(envio)
    except Exception as ex:
        return Response(response=ex, status=403)

@app.route('/api/calculate/optimization/', methods=['GET'])
@cross_origin()
def calculate_optimization_cases():
    try:
        country = request.args.get('country')
        state = request.args.get('state')
        
        nome = ""
        db = create_engine(db_string)

        if state != "null":
            result_set_names2 = db.execute("select name,population from states inner join population_state on population_state.state_id = states.id where states.name = '{}';".format(state))
        else:
            result_set_names2 = db.execute("select name,population from countries inner join population_country on population_country.country_id = countries.id where countries.name = '{}';".format(country))
        
        for rows2 in result_set_names2:
            population = rows2[1]

        populacao = population

        if state == "null":
            try:
                result_set = db.execute("WITH C1 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C1'),C2 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C2'),C3 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C3'),C4 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C4'),C5 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C5'),C6 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C6'),C7 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C7'),C8 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C8'),Datas as (select id,name,confirmed,recovered,deaths from covid_case_view where name = '{0}') SELECT Datas.id, Datas.name as name,coalesce(Datas.confirmed, 0) as confirmed,coalesce(Datas.recovered, 0)as recovered,coalesce(Datas.deaths, 0)as deaths,coalesce(c1.valor, 0) as c10valor,case when coalesce(c1.valor, 0) = 0 then 1 else 0 end as c11valor,coalesce(c2.valor, 0) as c20valor,case when coalesce(c2.valor, 0) = 0 then 1 else 0 end as c21valor,coalesce(c3.valor, 0) as c30valor,case when coalesce(c3.valor, 0) = 0 then 1 else 0 end as c31valor,coalesce(c4.valor, 0) as c40valor,case when coalesce(c4.valor, 0) = 0 then 1 else 0 end as c41valor,coalesce(c5.valor, 0) as c50valor,case when coalesce(c5.valor, 0) = 0 then 1 else 0 end as c51valor,coalesce(c6.valor, 0) as c60valor,case when coalesce(c6.valor, 0) = 0 then 1 else 0 end as c61valor,coalesce(c7.valor, 0) as c70valor,case when coalesce(c7.valor, 0) = 0 then 1 else 0 end as c71valor,coalesce(c8.valor, 0) as c80valor,case when coalesce(c8.valor, 0) = 0 then 1 else 0 end as c81valor FROM Datas LEFT JOIN C1 on Datas.id = C1.id LEFT JOIN C2 on C2.id = Datas.id LEFT JOIN C3 on C3.id = Datas.id LEFT JOIN C4 on C4.id = Datas.id LEFT JOIN C5 on C5.id = Datas.id LEFT JOIN C6 on C6.id = Datas.id LEFT JOIN C7 on C7.id = Datas.id LEFT JOIN C8 on C8.id = Datas.id order by Datas.id;".format(country))
            except Exception as tsgs:
                return Response(response=str(tsgs), status=200)
            nome = country
        else:
            result_set = db.execute("WITH C1 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C1'),C2 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C2'), C3 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C3'), C4 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C4'), C5 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C5'), C6 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C6'), C7 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C7'), C8 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C8'), Datas as  (select * from covid_case_brazil_view where state = '{0}') SELECT Datas.id, Datas.state as name,coalesce(Datas.confirmed, 0) as confirmed,coalesce(Datas.recovered, 0)as recovered,coalesce(Datas.deaths, 0)as deaths, coalesce(c1.valor, 0) as c10valor,case when coalesce(c1.valor, 0) = 0 then 1 else 0 end as c11valor, coalesce(c2.valor, 0) as c20valor,case when coalesce(c2.valor, 0) = 0 then 1 else 0 end as c21valor, coalesce(c3.valor, 0) as c30valor,case when coalesce(c3.valor, 0) = 0 then 1 else 0 end as c31valor, coalesce(c4.valor, 0) as c40valor,case when coalesce(c4.valor, 0) = 0 then 1 else 0 end as c41valor, coalesce(c5.valor, 0) as c50valor,case when coalesce(c5.valor, 0) = 0 then 1 else 0 end as c51valor, coalesce(c6.valor, 0) as c60valor,case when coalesce(c6.valor, 0) = 0 then 1 else 0 end as c61valor, coalesce(c7.valor, 0) as c70valor,case when coalesce(c7.valor, 0) = 0 then 1 else 0 end as c71valor, coalesce(c8.valor, 0) as c80valor,case when coalesce(c8.valor, 0) = 0 then 1 else 0 end as c81valor FROM Datas LEFT JOIN C1 on Datas.id = C1.id LEFT JOIN C2 on C2.id = Datas.id LEFT JOIN C3 on C3.id = Datas.id LEFT JOIN C4 on C4.id = Datas.id LEFT JOIN C5 on C5.id = Datas.id LEFT JOIN C6 on C6.id = Datas.id LEFT JOIN C7 on C7.id = Datas.id LEFT JOIN C8 on C8.id = Datas.id order by Datas.id;".format(state))
            nome = state

        data = []
        name = []
        confirmed = []
        recovered = []
        deaths = []
        c10valor = []
        c20valor = []
        c30valor = []
        c40valor = []
        c50valor = []
        c60valor = []
        c70valor = []
        c80valor = []
        c11valor = []
        c21valor = []
        c31valor = []
        c41valor = []
        c51valor = []
        c61valor = []
        c71valor = []
        c81valor = []
        infection_days = []
        i = 1
        for row in result_set:
            data.append(row[0].strftime("%d/%m/%Y"))
            name.append(row[1])
            confirmed.append(row[2])
            recovered.append(row[3])
            deaths.append(row[4])
            c10valor.append(row[5])
            c11valor.append(row[6])
            c20valor.append(row[7])
            c21valor.append(row[8])
            c30valor.append(row[9])
            c31valor.append(row[10])
            c40valor.append(row[11])
            c41valor.append(row[12])
            c50valor.append(row[13])
            c51valor.append(row[14])
            c60valor.append(row[15])
            c61valor.append(row[16])
            c70valor.append(row[17])
            c71valor.append(row[18])
            c80valor.append(row[19])
            c81valor.append(row[20])
            infection_days.append(i)
            i = i+1
  
        json_files = {"Country": country,"State":state,"populacao": int(populacao),"Beta": "0.53","T_inf": "2.87","N_inf": "99.66", "T_death": "2.28", "CFR": "0.060","Cases":[],"Mitigation":[]}

        update_json = {'id':data,'name':name,'confirmed':confirmed,'recovered':recovered,'deaths':deaths,'c10valor':c10valor,'c11valor':c11valor,'c20valor':c20valor,'c21valor':c21valor,'c30valor':c30valor,'c31valor':c31valor,'c40valor':c40valor,'c41valor':c41valor,'c50valor':c50valor,'c51valor':c51valor,'c60valor':c60valor,'c61valor':c61valor,'c70valor':c70valor,'c71valor':c71valor,'c80valor':c80valor,'c81valor':c81valor}

        json_files_amount = json.loads(json.dumps(json_files))
        json_files_amount['CCOC'] = update_json

        day_ia,casos_novos ,obitos_novos ,populacao_list ,valor_invoices_2019_list,quantidade_invoices_2019_list ,soma_quantidade_invoices_2019_list,soma_valor_invoices_2019_list ,week ,c10valor ,c20valor ,c30valor ,c40valor ,c50valor ,c60valor ,c70valor ,c80valor ,c11valor ,c21valor ,c31valor ,c41valor ,c51valor ,c61valor ,c71valor ,c81valor ,uf,erro = sqlNotasCalculate(state)
        json_files_amount['Invoices'] = {'Date':day_ia,'populacao':populacao_list,'Country/Region':uf,'day_of_week':week,'Confirmed':casos_novos,'Deaths':obitos_novos,'Qtde Autorizados':quantidade_invoices_2019_list,'Valor Autorizados':valor_invoices_2019_list,'Qtde Autorizados_2019_mean':soma_quantidade_invoices_2019_list,'Valor Autorizados_2019_mean':soma_valor_invoices_2019_list,'C1':c10valor,'C2':c20valor,'C3':c30valor,'C4':c40valor,'C5':c50valor,'C6':c60valor,'C7':c70valor,'C8':c80valor,'erro':erro}


        url_ia = addr_teste + '/api/otimization/'

        newheaders = {'Content-Type':'application/json'}

        response_ia = requests.post(url_ia, data=json.dumps(json_files_amount), headers=newheaders)

        response_ia = response_ia.json()
        
        try:
            qtddatas = len(response_ia['Datas'])
        except Exception as ex:
            return Response(response=str(ex), status=403)

        exp = []

        list_datas_preditas = []
        for i in range(1,qtddatas+1):
            list_datas_preditas.append((datetime.strptime(data[-1],"%d/%m/%Y") + timedelta(days=i)).strftime("%d/%m/%Y"))

        sc_confirmados = []
        so_obitos = []
        sq_quantidade = []
        sv_valor = []

        mc_confirmados = []
        mc_obitos = []
        mc_quantidade = []
        mc_valor = []

        sc_mitigacao_c = []
        so_mitigacao_c = []
        sq_mitigacao_c = []
        sv_mitigacao_c = []
        mc_mitigacao_c = []


        for x in range(0,30):
            sc_confirmados.append(int(response_ia['Serie_Confirmados']['confirmed'][x]))
            so_obitos.append(int(response_ia['Serie_Obitos']['obitos'][x]))
            sq_quantidade.append(int(response_ia['Serie_Quantidade']['quantidade'][x]))
            sv_valor.append(int(response_ia['Serie_Valor']['valor'][x]))
            
            mc_confirmados.append(int(response_ia['Serie_MelhorCenario']['confirmed'][x]))
            mc_obitos.append(int(response_ia['Serie_MelhorCenario']['obitos'][x]))
            mc_quantidade.append(int(response_ia['Serie_MelhorCenario']['quantidade'][x]))
            mc_valor.append(int(response_ia['Serie_MelhorCenario']['valor'][x]))
            
            
            
            
        sc_mitigacao_c.append(response_ia['Serie_Confirmados']['mitigacao'][0])
        sc_mitigacao_c.append(response_ia['Serie_Confirmados']['mitigacao'][1])
        sc_mitigacao_c.append(response_ia['Serie_Confirmados']['mitigacao'][2])
        sc_mitigacao_c.append(response_ia['Serie_Confirmados']['mitigacao'][3])
        sc_mitigacao_c.append(response_ia['Serie_Confirmados']['mitigacao'][4])
        sc_mitigacao_c.append(response_ia['Serie_Confirmados']['mitigacao'][5])
        sc_mitigacao_c.append(response_ia['Serie_Confirmados']['mitigacao'][6])
        sc_mitigacao_c.append(response_ia['Serie_Confirmados']['mitigacao'][7])

        so_mitigacao_c.append(response_ia['Serie_Obitos']['mitigacao'][0])
        so_mitigacao_c.append(response_ia['Serie_Obitos']['mitigacao'][1])
        so_mitigacao_c.append(response_ia['Serie_Obitos']['mitigacao'][2])
        so_mitigacao_c.append(response_ia['Serie_Obitos']['mitigacao'][3])
        so_mitigacao_c.append(response_ia['Serie_Obitos']['mitigacao'][4])
        so_mitigacao_c.append(response_ia['Serie_Obitos']['mitigacao'][5])
        so_mitigacao_c.append(response_ia['Serie_Obitos']['mitigacao'][6])
        so_mitigacao_c.append(response_ia['Serie_Obitos']['mitigacao'][7])

        sq_mitigacao_c.append(response_ia['Serie_Quantidade']['mitigacao'][0])
        sq_mitigacao_c.append(response_ia['Serie_Quantidade']['mitigacao'][1])
        sq_mitigacao_c.append(response_ia['Serie_Quantidade']['mitigacao'][2])
        sq_mitigacao_c.append(response_ia['Serie_Quantidade']['mitigacao'][3])
        sq_mitigacao_c.append(response_ia['Serie_Quantidade']['mitigacao'][4])
        sq_mitigacao_c.append(response_ia['Serie_Quantidade']['mitigacao'][5])
        sq_mitigacao_c.append(response_ia['Serie_Quantidade']['mitigacao'][6])
        sq_mitigacao_c.append(response_ia['Serie_Quantidade']['mitigacao'][7])

        sv_mitigacao_c.append(response_ia['Serie_Valor']['mitigacao'][0])
        sv_mitigacao_c.append(response_ia['Serie_Valor']['mitigacao'][1])
        sv_mitigacao_c.append(response_ia['Serie_Valor']['mitigacao'][2])
        sv_mitigacao_c.append(response_ia['Serie_Valor']['mitigacao'][3])
        sv_mitigacao_c.append(response_ia['Serie_Valor']['mitigacao'][4])
        sv_mitigacao_c.append(response_ia['Serie_Valor']['mitigacao'][5])
        sv_mitigacao_c.append(response_ia['Serie_Valor']['mitigacao'][6])
        sv_mitigacao_c.append(response_ia['Serie_Valor']['mitigacao'][7])


        mc_mitigacao_c.append(int(response_ia['Serie_MelhorCenario']['mitigacao'][0]))
        mc_mitigacao_c.append(int(response_ia['Serie_MelhorCenario']['mitigacao'][1]))
        mc_mitigacao_c.append(int(response_ia['Serie_MelhorCenario']['mitigacao'][2]))
        mc_mitigacao_c.append(int(response_ia['Serie_MelhorCenario']['mitigacao'][3]))
        mc_mitigacao_c.append(int(response_ia['Serie_MelhorCenario']['mitigacao'][4]))
        mc_mitigacao_c.append(int(response_ia['Serie_MelhorCenario']['mitigacao'][5]))
        mc_mitigacao_c.append(int(response_ia['Serie_MelhorCenario']['mitigacao'][6]))
        mc_mitigacao_c.append(int(response_ia['Serie_MelhorCenario']['mitigacao'][7]))

        db2= create_engine(db_string)
        conn = db2.connect()
        try:
            conn.execute("delete from otimizacao_confirmados where nome = '{}';".format(str(nome)))
            conn.execute("delete from otimizacao_obitos where nome = '{}';".format(str(nome)))
            conn.execute("delete from otimizacao_valor where nome = '{}';".format(str(nome)))
            conn.execute("delete from otimizacao_quantidade where nome = '{}';".format(str(nome)))
            conn.execute("delete from otimizacao_melhorcaso where nome = '{}';".format(str(nome)))
            conn.execute("delete from otimizacao_mitigacao where nome = '{}';".format(str(nome)))
        except Exception as ex:
            return Response(response="Não foi possível deletar informações desse País/Estado: {}".format(ex), status=401)

        try:
            #confirmados
            conn.execute("""INSERT INTO otimizacao_mitigacao (tipo,nome,c1,c2,c3,c4,c5,c6,c7,c8) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);""",('confirmados',str(nome),sc_mitigacao_c[0],sc_mitigacao_c[1],sc_mitigacao_c[2],sc_mitigacao_c[3],sc_mitigacao_c[4],sc_mitigacao_c[5],sc_mitigacao_c[6],sc_mitigacao_c[7]))
            #obitos
            conn.execute("""INSERT INTO otimizacao_mitigacao (tipo,nome,c1,c2,c3,c4,c5,c6,c7,c8) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);""",('obitos',str(nome),so_mitigacao_c[0],so_mitigacao_c[1],so_mitigacao_c[2],so_mitigacao_c[3],so_mitigacao_c[4],so_mitigacao_c[5],so_mitigacao_c[6],so_mitigacao_c[7]))
            #quantidade
            conn.execute("""INSERT INTO otimizacao_mitigacao (tipo,nome,c1,c2,c3,c4,c5,c6,c7,c8) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);""",('quantidade',str(nome),sq_mitigacao_c[0],sq_mitigacao_c[1],sq_mitigacao_c[2],sq_mitigacao_c[3],sq_mitigacao_c[4],sq_mitigacao_c[5],sq_mitigacao_c[6],sq_mitigacao_c[7]))
            #valor
            conn.execute("""INSERT INTO otimizacao_mitigacao (tipo,nome,c1,c2,c3,c4,c5,c6,c7,c8) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);""",('valor',str(nome),sv_mitigacao_c[0],sv_mitigacao_c[1],sv_mitigacao_c[2],sv_mitigacao_c[3],sv_mitigacao_c[4],sv_mitigacao_c[5],sv_mitigacao_c[6],sv_mitigacao_c[7]))   
            #melhor
            conn.execute("""INSERT INTO otimizacao_mitigacao (tipo,nome,c1,c2,c3,c4,c5,c6,c7,c8) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);""",('melhor',str(nome),mc_mitigacao_c[0],mc_mitigacao_c[1],mc_mitigacao_c[2],mc_mitigacao_c[3],mc_mitigacao_c[4],mc_mitigacao_c[5],mc_mitigacao_c[6],mc_mitigacao_c[7]))   
        except Exception as ex:
            exp.append(ex)


        try:
            for i in range(0,30):
                #confirmados
                conn.execute("""INSERT INTO otimizacao_confirmados (id,nome,valor) VALUES (%s,%s,%s);""",(datetime.strptime(list_datas_preditas[i],"%d/%m/%Y").strftime("%Y-%m-%d %H:%M:%S"),str(nome),sc_confirmados[i]))
                #obitos
                conn.execute("""INSERT INTO otimizacao_obitos (id,nome,valor) VALUES (%s,%s,%s);""",(datetime.strptime(list_datas_preditas[i],"%d/%m/%Y").strftime("%Y-%m-%d %H:%M:%S"),str(nome),so_obitos[i]))
                #quantidade
                conn.execute("""INSERT INTO otimizacao_valor (id,nome,valor) VALUES (%s,%s,%s);""",(datetime.strptime(list_datas_preditas[i],"%d/%m/%Y").strftime("%Y-%m-%d %H:%M:%S"),str(nome),sv_valor[i]))
                #valor
                conn.execute("""INSERT INTO otimizacao_quantidade (id,nome,valor) VALUES (%s,%s,%s);""",(datetime.strptime(list_datas_preditas[i],"%d/%m/%Y").strftime("%Y-%m-%d %H:%M:%S"),str(nome),sq_quantidade[i]))   
                #melhor
                conn.execute("""INSERT INTO otimizacao_melhorcaso (id,nome,confirmados,obitos,valor,quantidade) VALUES (%s,%s,%s,%s,%s,%s);""",(datetime.strptime(list_datas_preditas[i],"%d/%m/%Y").strftime("%Y-%m-%d %H:%M:%S"),str(nome),mc_confirmados[i],mc_obitos[i],mc_valor[i],mc_quantidade[i]))
        except Exception as ex:
            exp.append(ex)
            
        conn.close()

        exp.append("Casos calculados com sucesso")
        return Response(response="Casos calculados com sucesso", status=200)
    except Exception as ex:
        return Response(response=str("Erro:",ex), status=401)

@app.route('/api/return/calculate/optimization/', methods=['GET'])
@cross_origin()
def return_calculate_optimization():
    try:
        country = request.args.get('country')
        state = request.args.get('state')
        
        nome = ""
        db = create_engine(db_string)

        if state != "null":
            result_set_names2 = db.execute("select name,population from states inner join population_state on population_state.state_id = states.id where states.name = '{}';".format(state))
        else:
            result_set_names2 = db.execute("select name,population from countries inner join population_country on population_country.country_id = countries.id where countries.name = '{}';".format(country))
        
        for rows2 in result_set_names2:
            population = rows2[1]

        populacao = population

        if state == "null":
            try:
                result_set = db.execute("WITH C1 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C1'),C2 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C2'),C3 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C3'),C4 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C4'),C5 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C5'),C6 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C6'),C7 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C7'),C8 as(select id,code,valor,name from covid_policies_countries where name = '{0}' and code='C8'),Datas as (select id,name,confirmed,recovered,deaths from covid_case_view where name = '{0}') SELECT Datas.id, Datas.name as name,coalesce(Datas.confirmed, 0) as confirmed,coalesce(Datas.recovered, 0)as recovered,coalesce(Datas.deaths, 0)as deaths,coalesce(c1.valor, 0) as c10valor,case when coalesce(c1.valor, 0) = 0 then 1 else 0 end as c11valor,coalesce(c2.valor, 0) as c20valor,case when coalesce(c2.valor, 0) = 0 then 1 else 0 end as c21valor,coalesce(c3.valor, 0) as c30valor,case when coalesce(c3.valor, 0) = 0 then 1 else 0 end as c31valor,coalesce(c4.valor, 0) as c40valor,case when coalesce(c4.valor, 0) = 0 then 1 else 0 end as c41valor,coalesce(c5.valor, 0) as c50valor,case when coalesce(c5.valor, 0) = 0 then 1 else 0 end as c51valor,coalesce(c6.valor, 0) as c60valor,case when coalesce(c6.valor, 0) = 0 then 1 else 0 end as c61valor,coalesce(c7.valor, 0) as c70valor,case when coalesce(c7.valor, 0) = 0 then 1 else 0 end as c71valor,coalesce(c8.valor, 0) as c80valor,case when coalesce(c8.valor, 0) = 0 then 1 else 0 end as c81valor FROM Datas LEFT JOIN C1 on Datas.id = C1.id LEFT JOIN C2 on C2.id = Datas.id LEFT JOIN C3 on C3.id = Datas.id LEFT JOIN C4 on C4.id = Datas.id LEFT JOIN C5 on C5.id = Datas.id LEFT JOIN C6 on C6.id = Datas.id LEFT JOIN C7 on C7.id = Datas.id LEFT JOIN C8 on C8.id = Datas.id order by Datas.id;".format(country))
            except Exception as tsgs:
                return Response(response=str(tsgs), status=200)
            nome = country
        else:
            result_set = db.execute("WITH C1 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C1'),C2 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C2'), C3 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C3'), C4 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C4'), C5 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C5'), C6 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C6'), C7 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C7'), C8 as(select  id,code,valor,name from covid_policies_states where name = '{0}' and code='C8'), Datas as  (select * from covid_case_brazil_view where state = '{0}') SELECT Datas.id, Datas.state as name,coalesce(Datas.confirmed, 0) as confirmed,coalesce(Datas.recovered, 0)as recovered,coalesce(Datas.deaths, 0)as deaths, coalesce(c1.valor, 0) as c10valor,case when coalesce(c1.valor, 0) = 0 then 1 else 0 end as c11valor, coalesce(c2.valor, 0) as c20valor,case when coalesce(c2.valor, 0) = 0 then 1 else 0 end as c21valor, coalesce(c3.valor, 0) as c30valor,case when coalesce(c3.valor, 0) = 0 then 1 else 0 end as c31valor, coalesce(c4.valor, 0) as c40valor,case when coalesce(c4.valor, 0) = 0 then 1 else 0 end as c41valor, coalesce(c5.valor, 0) as c50valor,case when coalesce(c5.valor, 0) = 0 then 1 else 0 end as c51valor, coalesce(c6.valor, 0) as c60valor,case when coalesce(c6.valor, 0) = 0 then 1 else 0 end as c61valor, coalesce(c7.valor, 0) as c70valor,case when coalesce(c7.valor, 0) = 0 then 1 else 0 end as c71valor, coalesce(c8.valor, 0) as c80valor,case when coalesce(c8.valor, 0) = 0 then 1 else 0 end as c81valor FROM Datas LEFT JOIN C1 on Datas.id = C1.id LEFT JOIN C2 on C2.id = Datas.id LEFT JOIN C3 on C3.id = Datas.id LEFT JOIN C4 on C4.id = Datas.id LEFT JOIN C5 on C5.id = Datas.id LEFT JOIN C6 on C6.id = Datas.id LEFT JOIN C7 on C7.id = Datas.id LEFT JOIN C8 on C8.id = Datas.id order by Datas.id;".format(state))
            nome = state

        data = []
        name = []
        confirmed = []
        recovered = []
        deaths = []
        c10valor = []
        c20valor = []
        c30valor = []
        c40valor = []
        c50valor = []
        c60valor = []
        c70valor = []
        c80valor = []
        c11valor = []
        c21valor = []
        c31valor = []
        c41valor = []
        c51valor = []
        c61valor = []
        c71valor = []
        c81valor = []
        infection_days = []
        i = 1
        for row in result_set:
            data.append(row[0].strftime("%d/%m/%Y"))
            name.append(row[1])
            confirmed.append(row[2])
            recovered.append(row[3])
            deaths.append(row[4])
            c10valor.append(row[5])
            c11valor.append(row[6])
            c20valor.append(row[7])
            c21valor.append(row[8])
            c30valor.append(row[9])
            c31valor.append(row[10])
            c40valor.append(row[11])
            c41valor.append(row[12])
            c50valor.append(row[13])
            c51valor.append(row[14])
            c60valor.append(row[15])
            c61valor.append(row[16])
            c70valor.append(row[17])
            c71valor.append(row[18])
            c80valor.append(row[19])
            c81valor.append(row[20])
            infection_days.append(i)
            i = i+1
  
        json_files = {"Country": country,"State":state,"populacao": int(populacao),"Beta": "0.53","T_inf": "2.87","N_inf": "99.66", "T_death": "2.28", "CFR": "0.060","Cases":[],"Mitigation":[]}

        update_json = {'id':data,'name':name,'confirmed':confirmed,'recovered':recovered,'deaths':deaths,'c10valor':c10valor,'c11valor':c11valor,'c20valor':c20valor,'c21valor':c21valor,'c30valor':c30valor,'c31valor':c31valor,'c40valor':c40valor,'c41valor':c41valor,'c50valor':c50valor,'c51valor':c51valor,'c60valor':c60valor,'c61valor':c61valor,'c70valor':c70valor,'c71valor':c71valor,'c80valor':c80valor,'c81valor':c81valor

        json_files_amount = json.loads(json.dumps(json_files))
        json_files_amount['CCOC'] = update_json

        day_ia,casos_novos ,obitos_novos ,populacao_list ,valor_invoices_2019_list,quantidade_invoices_2019_list ,soma_quantidade_invoices_2019_list,soma_valor_invoices_2019_list ,week ,c10valor ,c20valor ,c30valor ,c40valor ,c50valor ,c60valor ,c70valor ,c80valor ,c11valor ,c21valor ,c31valor ,c41valor ,c51valor ,c61valor ,c71valor ,c81valor ,uf,erro = sqlNotasCalculate(state)
        json_files_amount['Invoices'] = {'Date':day_ia,'populacao':populacao_list,'Country/Region':uf,'day_of_week':week,'Confirmed':casos_novos,'Deaths':obitos_novos,'Qtde Autorizados':quantidade_invoices_2019_list,'Valor Autorizados':valor_invoices_2019_list,'Qtde Autorizados_2019_mean':soma_quantidade_invoices_2019_list,'Valor Autorizados_2019_mean':soma_valor_invoices_2019_list,'C1':c10valor,'C2':c20valor,'C3':c30valor,'C4':c40valor,'C5':c50valor,'C6':c60valor,'C7':c70valor,'C8':c80valor,'erro':erro}

        return jsonify(json_files_amount)
    except Exception as ex:
        return Response(response=str("Erro:",ex), status=401)

############################################################
####                    Simulation                      ####
############################################################

@app.route('/api/simulation/scenarios/', methods=['POST'])
@cross_origin()
def simulation_post_scenario():

    data = request.get_json(force = True)

    populacao = int(data['Populacao'])
    T_inf = float(data['T_inf'])
    Beta = float(data['Beta'])
    N_inf = float(data['N_inf'])
    T_death = float(data['T_death'])
    CFR = float(data['CFR'])
    Country = str(data['Country'])
    State = str(data['State'])
    Cases = []
    Invoices = []
    SchoolClosure = bool(str(data['SchoolClosure']) == "true" if True else False )
    WorkplaceClosure = bool(str(data['WorkplaceClosure']) == "true" if True else False )
    CancellationOfPublicEvents = bool(str(data['CancellationOfPublicEvents']) == "true" if True else False )
    RestrictionsOnGatheringSize = bool(str(data['RestrictionsOnGatheringSize']) == "true" if True else False )
    PublicTransportClosures = bool(str(data['PublicTransportClosures']) == "true" if True else False )
    StayAtHomeRequirements = bool(str(data['StayAtHomeRequirements']) == "true" if True else False )
    RestrictionsOnDomesticMovement = bool(str(data['RestrictionsOnDomesticMovement']) == "true" if True else False )
    RestrictionsOnInternationalTravel = bool(str(data['RestrictionsOnInternationalTravel']) == "true" if True else False )

    json_files = {"populacao":populacao,"T_inf":T_inf,"Beta":Beta,"N_inf":N_inf,"T_death":T_death,"CFR":CFR,"Country":Country,"State":State,"Cases":Cases,"Invoices":Invoices,"SchoolClosure":SchoolClosure,"WorkplaceClosure":WorkplaceClosure,"CancellationOfPublicEvents":CancellationOfPublicEvents,"RestrictionsOnGatheringSize":RestrictionsOnGatheringSize,"PublicTransportClosures":PublicTransportClosures,"StayAtHomeRequirements":StayAtHomeRequirements,"RestrictionsOnDomesticMovement":RestrictionsOnDomesticMovement,"RestrictionsOnInternationalTravel":RestrictionsOnInternationalTravel}
    
    try:
        if len(Cases) == 0:
            country = Country
            state = State

            db = create_engine(db_string)

            if state == "null":
                result_set = db.execute("select id,confirmed,deaths,coalesce(recovered,0) as recovered from covid_case_view where name = '{}' order by id asc;".format(country))
            else:
                result_set = db.execute("select id,confirmed,deaths,coalesce(recovered,0) as recovered from covid_case_brazil_view where state = '{}' order by id asc;".format(state))

            data = []
            regiao = []
            confirmados = []
            obitos = []
            recovered = []
            infection_days = []

            confirmados_acumulado = []
            obitos_acumulado = []
            recovered_acumulado = []
            
            c10valor = []
            c20valor = []
            c30valor = []
            c40valor = []
            c50valor = []
            c60valor = []
            c70valor = []
            c80valor = []
            c11valor = []
            c21valor = []
            c31valor = []
            c41valor = []
            c51valor = []
            c61valor = []
            c71valor = []
            c81valor = []

            confirmados_acumulado_valor = 0
            obitos_acumulado_valor = 0
            recovered_acumulado_valor = 0

            last_confirmados = 0
            last_obitos = 0

            i = 1
            for row in result_set:

                data.append(row[0].strftime("%d/%m/%Y"))
                confirmados.append(row[1])
                obitos.append(row[2])
                recovered.append(row[3])
                regiao.append(state)
                infection_days.append(i)

                confirmados_acumulado_valor = confirmados_acumulado_valor + int(row[1])
                confirmados_acumulado.append(confirmados_acumulado_valor)

                obitos_acumulado_valor = obitos_acumulado_valor + int(row[2])
                obitos_acumulado.append(obitos_acumulado_valor)

                recovered_acumulado_valor = recovered_acumulado_valor + int(row[3])
                recovered_acumulado.append(recovered_acumulado_valor)
                
                c10valor.append(int(SchoolClosure))
                c11valor.append(int(not SchoolClosure))
                c20valor.append(int(WorkplaceClosure))
                c21valor.append(int(not WorkplaceClosure))
                c30valor.append(int(CancellationOfPublicEvents))
                c31valor.append(int(not CancellationOfPublicEvents))
                c40valor.append(int(RestrictionsOnGatheringSize))
                c41valor.append(int(not RestrictionsOnGatheringSize))
                c50valor.append(int(PublicTransportClosures))
                c51valor.append(int(not PublicTransportClosures))
                c60valor.append(int(StayAtHomeRequirements))
                c61valor.append(int(not StayAtHomeRequirements))
                c70valor.append(int(RestrictionsOnDomesticMovement))
                c71valor.append(int(not RestrictionsOnDomesticMovement))
                c80valor.append(int(RestrictionsOnInternationalTravel))
                c81valor.append(int(not RestrictionsOnInternationalTravel))

                i = i + 1

            update_json_daily = {"region": regiao, "confirmed": confirmados, "deaths":obitos, "recovered":recovered,"infection_days":infection_days}
            
            json_files_daily = json_files
            json_files_daily['Cases'] = update_json_daily

        #SIRD
        url = addr + '/api/simulation/cases/sird'

        newheaders = {'Content-Type':'application/json'}

        response_sird = requests.post(url, data=json.dumps(json_files_daily), headers=newheaders)

        response_sird = response_sird.json()

        
        update_json = {'id':data,'name':regiao,'confirmed':confirmados,'recovered':recovered,'deaths':obitos,'c10valor':c10valor,'c11valor':c11valor,'c20valor':c20valor,'c21valor':c21valor,'c30valor':c30valor,'c31valor':c31valor,'c40valor':c40valor,'c41valor':c41valor,'c50valor':c50valor,'c51valor':c51valor,'c60valor':c60valor,'c61valor':c61valor,'c70valor':c70valor,'c71valor':c71valor,'c80valor':c80valor,'c81valor':c81valor}

        json_files_daily = json_files
        json_files_daily['Cases'] = update_json

        #IA
        url_ia = addr + '/api/cases/ia/calculate'

        response_ia = requests.post(url_ia, data=json.dumps(json_files_daily), headers=newheaders)

        response_ia = response_ia.json()

        qtddatas = len(response_sird['confirmed'])

        list_datas_preditas = []
        list_datas_preditas.append(datetime.strptime(data[-1],"%d/%m/%Y").strftime("%d/%m/%Y"))
        for i in range(1,qtddatas+1):
            list_datas_preditas.append((datetime.strptime(data[-1],"%d/%m/%Y") + timedelta(days=i)).strftime("%d/%m/%Y"))


        sird_confirmed_amount = []
        sird_confirmed_amount_value = confirmados_acumulado[-1]
        sird_confirmed_amount.append(sird_confirmed_amount_value)

        sird_deaths_amount = []
        sird_deaths_amount_value = obitos_acumulado[-1]
        sird_deaths_amount.append(sird_deaths_amount_value)

        ia_confirmed_amount = []
        ia_confirmed_amount_value = confirmados_acumulado[-1]
        ia_confirmed_amount.append(ia_confirmed_amount_value)

        ia_deaths_amount = []
        ia_deaths_amount_value = obitos_acumulado[-1]
        ia_deaths_amount.append(ia_deaths_amount_value)



        for i in range(0,len(response_sird['confirmed'])):
            sird_confirmed_amount_value = sird_confirmed_amount_value + int(response_sird['confirmed'][i])
            sird_confirmed_amount.append(sird_confirmed_amount_value)

            sird_deaths_amount_value = sird_deaths_amount_value + int(response_sird['deaths'][i])
            sird_deaths_amount.append(sird_deaths_amount_value)

            ia_confirmed_amount_value = ia_confirmed_amount_value + int(response_ia['confirmed'][i])
            ia_confirmed_amount.append(ia_confirmed_amount_value)

            ia_deaths_amount_value = ia_deaths_amount_value + int(response_ia['deaths'][i])
            ia_deaths_amount.append(ia_deaths_amount_value)


        real_deaths_amount = []
        real_deaths_amount_value = 0

        real_confirmed_amount = []
        real_confirmed_amount_value = 0
        for i in range(0,len(confirmados)):
            real_deaths_amount_value = real_deaths_amount_value + obitos[i]
            real_deaths_amount.append(real_deaths_amount_value)

            real_confirmed_amount_value = real_confirmed_amount_value + confirmados[i]
            real_confirmed_amount.append(real_confirmed_amount_value)



        ia_confirmed_daily = []
        ia_confirmed_daily.append(confirmados[-1])
        ia_confirmed_daily = ia_confirmed_daily + response_ia['confirmed']

        ia_deaths_daily = []
        ia_deaths_daily.append(obitos[-1])
        ia_deaths_daily = ia_deaths_daily + response_ia['deaths']

        sird_confirmed_daily = []
        sird_confirmed_daily.append(confirmados[-1])
        sird_confirmed_daily = sird_confirmed_daily + response_sird['confirmed']

        sird_deaths_daily = []
        sird_deaths_daily.append(obitos[-1])
        sird_deaths_daily = sird_deaths_daily + response_sird['deaths']
        
        if country == "Brazil" and state == "null":
            state = "Brazil"

        if state == "null":
            day_invoices = []
            quantity_invoices = []
            value_invoices = []
        else:
            day_invoices,quantity_invoices,value_invoices = sqlNotas(state,'NFC-e')

        #INVOICES PREDITO
        if state == "null":
            day_ia = []
            quantity_ia = []
            value_ia = []
        else:
            result_set_invoices = db.execute("select avg(amount) as amount, avg(count) as count from document_expeditions inner join locales on document_expeditions.locale_id = locales.id inner join states on states.id = state_id inner join document_models on document_models.id = document_model_id where states.name = '{}' and date_part('year', document_expeditions.id) = 2019 and code = 'NFC-e' group by states.name;".format(state))
            
            quantity_invoices_2019 = 0
            value_invoices_2019 = 0

            for row in result_set_invoices:
                quantity_invoices_2019 = row[1]
                value_invoices_2019 = row[0]

            day_ia = list_datas_preditas[1:]
            populacao = int(json_files['populacao'])
            casos_novos = ia_confirmed_daily[1:]
            obitos_novos = ia_deaths_daily[1:]

            quantity_invoices_2019_list = []
            value_invoices_2019_list = []
            populacao_list = []
            week = []
            uf = []
            c10valor = []
            c20valor = []
            c30valor = []
            c40valor = []
            c50valor = []
            c60valor = []
            c70valor = []
            c80valor = []
            c11valor = []
            c21valor = []
            c31valor = []
            c41valor = []
            c51valor = []
            c61valor = []
            c71valor = []
            c81valor = []


            for i in range(0,len(day_ia)):
                quantity_invoices_2019_list.append(float(quantity_invoices_2019))
                value_invoices_2019_list.append(float(value_invoices_2019))
                populacao_list.append(populacao)
                week.append(i%6)
                uf.append(state)
                c10valor.append(int(SchoolClosure))
                c11valor.append(int(not SchoolClosure))
                c20valor.append(int(WorkplaceClosure))
                c21valor.append(int(not WorkplaceClosure))
                c30valor.append(int(CancellationOfPublicEvents))
                c31valor.append(int(not CancellationOfPublicEvents))
                c40valor.append(int(RestrictionsOnGatheringSize))
                c41valor.append(int(not RestrictionsOnGatheringSize))
                c50valor.append(int(PublicTransportClosures))
                c51valor.append(int(not PublicTransportClosures))
                c60valor.append(int(StayAtHomeRequirements))
                c61valor.append(int(not StayAtHomeRequirements))
                c70valor.append(int(RestrictionsOnDomesticMovement))
                c71valor.append(int(not RestrictionsOnDomesticMovement))
                c80valor.append(int(RestrictionsOnInternationalTravel))
                c81valor.append(int(not RestrictionsOnInternationalTravel))

            day_ia,casos_novos ,obitos_novos ,populacao_list ,valor_invoices_2019_list,quantidade_invoices_2019_list ,soma_quantidade_invoices_2019_list,soma_valor_invoices_2019_list ,week ,c10valor ,c20valor ,c30valor ,c40valor ,c50valor ,c60valor ,c70valor ,c80valor ,c11valor ,c21valor ,c31valor ,c41valor ,c51valor ,c61valor ,c71valor ,c81valor ,uf,erro = sqlNotasCalculate(state)

            ia_confirmed_daily_invoices = []
            ia_confirmed_daily_invoices.append(confirmados)
            ia_confirmed_daily_invoices = ia_confirmed_daily + response_ia['confirmed']

            ia_deaths_daily_invoices = []
            ia_deaths_daily_invoices.append(obitos)
            ia_deaths_daily_invoices = ia_deaths_daily + response_ia['deaths']

            envio = {'Date':day_ia[-60:-1],'populacao':populacao_list[-60:-1],'Country/Region':uf[-60:-1],'day_of_week':week[-60:-1],'Confirmed':ia_confirmed_daily_invoices[-60:-1],'Deaths':ia_deaths_daily_invoices[-60:-1],'Qtde Autorizados':quantidade_invoices_2019_list[-60:-1],'Valor Autorizados':valor_invoices_2019_list[-60:-1],'Qtde Autorizados_2019_mean':soma_quantidade_invoices_2019_list[-60:-1],'Valor Autorizados_2019_mean':soma_valor_invoices_2019_list[-60:-1],'C1':c10valor[-60:-1],'C2':c20valor[-60:-1],'C3':c30valor[-60:-1],'C4':c40valor[-60:-1],'C5':c50valor[-60:-1],'C6':c60valor[-60:-1],'C7':c70valor[-60:-1],'C8':c80valor[-60:-1]}

            #IA
            url_invoices = addr + '/api/invoices/ia/calculate'
            response_invoices = requests.post(url_invoices, data=json.dumps(envio), headers=newheaders)

            response_invoices = response_invoices.json()

            quantidade = []
            valor = []
            for a in range(0,len(response_invoices["quantity"])):
                quantidade.append(response_invoices["quantity"][a])
                valor.append(response_invoices["value"][a])

            quantity_ia = []
            quantity_ia.append(quantity_invoices[-1])
            quantity_ia = quantity_ia + quantidade

            value_ia = []
            value_ia.append(value_invoices[-1])
            value_ia = value_ia + valor
        
        erro_nf_qtd_list = []
        erro_nf_valor_list = []
        erro_nf_qtd_list.append(0)
        erro_nf_valor_list.append(0)

        for i in range(1,len(value_ia)):
            erro_nf_qtd_list.append(erro_nf_qtd)
            erro_nf_valor_list.append(erro_nf_valor)


        resposta = {
                    "Confirmados": {
                        "Diario": {
                            "real": {"data":data,"quantidade":confirmados},
                            "IA": {"data":list_datas_preditas,"quantidade":ia_confirmed_daily,"maximo":(np.array(ia_confirmed_daily)+np.array(erro_confirmados)).clip(min=0).tolist(),"minimo":(np.array(ia_confirmed_daily)-np.array(erro_confirmados)).clip(min=0).tolist()},
                            "SIRD": {"data":list_datas_preditas,"quantidade":sird_confirmed_daily,"maximo":(np.array(sird_confirmed_daily)+np.array(erro_confirmados)).clip(min=0).tolist(),"minimo":(np.array(sird_confirmed_daily)-np.array(erro_confirmados)).clip(min=0).tolist()}},
                        "Acumulado": {
                                "real": {"data":data,"quantidade":real_confirmed_amount},
                                "IA": {"data":list_datas_preditas,"quantidade":ia_confirmed_amount,"maximo":(np.array(ia_confirmed_amount)+np.array(erro_confirmados)).clip(min=0).tolist(),"minimo":(np.array(ia_confirmed_amount)-np.array(erro_confirmados)).clip(min=0).tolist()},
                                "SIRD": {"data":list_datas_preditas,"quantidade":sird_confirmed_amount,"maximo":(np.array(sird_confirmed_amount)+np.array(erro_confirmados)).clip(min=0).tolist(),"minimo":(np.array(sird_confirmed_amount)-np.array(erro_confirmados)).clip(min=0).tolist()}}},
                    "Obitos": { 
                        "Diario": {
                                "real": {"data":data,"quantidade":obitos},
                                "IA": {"data":list_datas_preditas,"quantidade":ia_deaths_daily,"maximo":(np.array(ia_deaths_daily)+np.array(erro_obitos)).clip(min=0).tolist(),"minimo":(np.array(ia_deaths_daily)-np.array(erro_obitos)).clip(min=0).tolist()},
                                "SIRD": {"data":list_datas_preditas,"quantidade":sird_deaths_daily,"maximo":(np.array(sird_deaths_daily)+np.array(erro_obitos)).clip(min=0).tolist(),"minimo":(np.array(sird_deaths_daily)-np.array(erro_obitos)).clip(min=0).tolist()}},
                        "Acumulado": {
                                "real": {"data":data,"quantidade":real_deaths_amount},
                                "IA": {"data":list_datas_preditas,"quantidade":ia_deaths_amount,"maximo":(np.array(ia_deaths_amount)+np.array(erro_obitos)).clip(min=0).tolist(),"minimo":(np.array(ia_deaths_amount)-np.array(erro_obitos)).clip(min=0).tolist()},
                                "SIRD": {"data":list_datas_preditas,"quantidade":sird_deaths_amount,"maximo":(np.array(sird_deaths_amount)+np.array(erro_obitos)).clip(min=0).tolist(),"minimo":(np.array(sird_deaths_amount)-np.array(erro_obitos)).clip(min=0).tolist()}}},
                    "Notas": {
                        "NFC-e": {
                            "Quantidade":{
                                "real": {"data":day_invoices,"quantidade":quantity_invoices},
                                "IA": {"data":list_datas_preditas[0:len(quantity_ia)],"quantidade":quantity_ia,"maximo":(np.array(quantity_ia)+np.array(erro_nf_qtd_list)).clip(min=0).tolist(),"minimo":(np.array(quantity_ia)-np.array(erro_nf_qtd_list)).clip(min=0).tolist()}},
                            "Valor":{
                                "real": {"data":day_invoices,"valor":value_invoices},
                                "IA": {"data":list_datas_preditas[0:len(quantity_ia)],"valor":value_ia,"maximo":(np.array(value_ia)+np.array(erro_nf_valor_list)).clip(min=0).tolist(),"minimo":(np.array(value_ia)-np.array(erro_nf_valor_list)).clip(min=0).tolist()}},
                            }
                        }
                    }
        
        return jsonify(resposta)
    except Exception as ex:
        return Response(response=str(ex), status=500)
    
############################################################
####                     Validation                     ####
############################################################

@app.route('/api/validacao/mitigacao/', methods=['GET'])
@cross_origin(headers=['Content-Type'])
def validacao_mitigacao():

    country = request.args.get('country')
    db = create_engine(db_string)
    query = "select covid_policies._created ,covid_policies._updated, covid_policies.id,mitigation_measures.code, mitigation_measures.name,countries.name from covid_policies INNER JOIN locales ON covid_policies.locale_id = locales.id INNER JOIN countries on locales.country_id = countries.id INNER JOIN mitigation_measures ON covid_policies.mitigation_measure_id = mitigation_measures.id  INNER JOIN flags_mitigation on flags_mitigation.id = covid_policies.flag_mitigation_id  WHERE countries.name = '{}'  ORDER BY covid_policies.id desc".format(country)
    
    result_set = db.execute(query)

    criado = []
    atualizado = []
    data = []
    codigo = []
    nome = []
    pais = ""
    for row in result_set:
        criado.append(row[0].strftime("%d/%m/%Y"))
        atualizado.append(row[1].strftime("%d/%m/%Y"))
        data.append(row[2].strftime("%d/%m/%Y"))
        codigo.append(row[3])
        nome.append(row[4])
        pais = row[5]


    envio = {'criado':criado,"atualizado":atualizado,"data":data,"codigo":codigo,"nome":nome,"pais":pais}

    return jsonify(envio)

############################################################
####                     Diagnosis                      ####
############################################################

@app.route('/api/diagnosis/xray', methods=['POST'])
@cross_origin()
def diagnostic_xray():
    uploaded_files = request.files.getlist("files")

    images = request.files.to_dict()

    url = addr + '/api/xray'

    response = requests.post(url, files=images)

    data = json.loads(jsonpickle.decode(response.text))

    data = jsonpickle.encode(data)

    return Response(response=data, status=200)

@app.route('/api/diagnosis/tc', methods=['POST'])
@cross_origin()
def diagnostic_tc():

    uploaded_files = request.files.getlist("files")

    images = request.files.to_dict()

    url = addr + '/api/tc'

    response = requests.post(url, files=images)

    data = json.loads(jsonpickle.decode(response.text))

    data = jsonpickle.encode(data)

    return Response(response=data, status=200)
    
@app.route('/api/diagnosis/dicom', methods=['POST'])
@cross_origin()
def diagnostic_dicom():
    strs = ""
    try:
        images = request.files.getlist("files")

        dicts = { str(j):i for j,i in enumerate(images)}

        url = addr + '/api/dicom'

        response = requests.post(url, files=dicts)

        data = json.loads(jsonpickle.decode(response.text))

        strs = jsonpickle.encode(data)
        strs = jsonify(strs)
    except Exception as ex:
        strs = jsonify({"erro":str(ex)})
    strs.headers.add('Access-Control-Allow-Origin', '*')
    return strs


@app.route('/api/diagnosis/nii', methods=['POST'])
@cross_origin()
def diagnostic_nii():
    uploaded_files = request.files.getlist("files")

    images = request.files.to_dict()

    url = addr_clara + '/api/nii'

    response = requests.post(url, files=images)

    return Response(response=response.text, status=200)

############################################################
####                   Optimization                     ####
############################################################

@app.route('/api/optimization/low/deaths', methods=['GET'])
@cross_origin()
def optimization_low_deaths():

    country = str(request.args.get('country'))
    state = str(request.args.get('state'))

    db = create_engine(db_string)

    result_set = db.execute("select id,deaths from covid_case_brazil_view where state = '{}' order by id asc;".format(state))

    data_real = []
    deaths_real = []    
    last_deaths = ''
    for row in result_set:
        data_real.append(row[0].strftime("%d/%m/%Y"))
        deaths_real.append(row[1])
        last_deaths = int(row[1])

    result_set_otimization = db.execute("select id,valor from otimizacao_obitos where nome = '{}' order by id asc;".format(state))

    data_otimizacao = []
    deaths_otimizacao = []

    data_otimizacao.append(data_real[-1])
    deaths_otimizacao.append(deaths_real[-1])

    for i,row in enumerate(result_set_otimization):
        data_otimizacao.append(row[0].strftime("%d/%m/%Y"))
        deaths_otimizacao.append(max(0,row[1]))


    result_set_mitigation = db.execute("select c1,c2,c3,c4,c5,c6,c7,c8 from otimizacao_mitigacao where nome = '{}' and tipo='obitos';".format(state))

    c1=''
    c2=''
    c3=''
    c4=''
    c5=''
    c6=''
    c7=''
    c8=''

    for row in result_set_mitigation:
        c1=int(row[0])
        c2=int(row[1])
        c3=int(row[2])
        c4=int(row[3])
        c5=int(row[4])
        c6=int(row[5])
        c7=int(row[6])
        c8=int(row[7])

    jsonconfirmados = {
            "Obitos": {
                "Acumulado": {
                    "IA": {
                        "data": data_otimizacao,
                        "maximo": (np.array(deaths_otimizacao)+np.array(erro_obitos)).clip(min=0).astype(int).tolist(),
                        "minimo": (np.array(deaths_otimizacao)-np.array(erro_obitos)).clip(min=0).astype(int).tolist(),
                        "quantidade": deaths_otimizacao  
                    },
                    "real": {
                        "data": data_real,
                        "quantidade": deaths_real
                    },
                },
            },
            "Mitigacao":{
                "SchoolClosure":True if c1 == 1 else False ,
                "WorkplaceClosure":True if c2 == 1  else False,
                "CancellationOfPublicEvents":True if c3 == 1 else False,
                "RestrictionsOnGatheringSize":True if c4 == 1 else False,
                "PublicTransportClosures":True if c5 == 1 else False,
                "StayAtHomeRequirements":True if c6 == 1 else False,
                "RestrictionsOnDomesticMovement": True if c7 == 1 else False,
                "RestrictionsOnInternationalTravel": True if c8 == 1 else False
            },
        }
    return jsonify(jsonconfirmados)

@app.route('/api/optimization/low/cases', methods=['GET'])
@cross_origin()
def optimization_low_cases():
    country = str(request.args.get('country'))
    state = str(request.args.get('state'))

    db = create_engine(db_string)

    result_set = db.execute("select id,confirmed from covid_case_brazil_view where state = '{}' order by id asc;".format(state))

    data_real = []
    confirmados_real = []    
    last_confirmados = ''
    for row in result_set:
        data_real.append(row[0].strftime("%d/%m/%Y"))
        confirmados_real.append(row[1])
        last_confirmados = int(row[1])

    result_set_otimization = db.execute("select id,valor from otimizacao_confirmados where nome = '{}' order by id asc;".format(state))

    data_otimizacao = []
    confirmados_otimizacao = []

    data_otimizacao.append(data_real[-1])
    confirmados_otimizacao.append(confirmados_real[-1])

    for i,row in enumerate(result_set_otimization):
        data_otimizacao.append(row[0].strftime("%d/%m/%Y"))
        confirmados_otimizacao.append(max(0,row[1]))


    result_set_mitigation = db.execute("select c1,c2,c3,c4,c5,c6,c7,c8 from otimizacao_mitigacao where nome = '{}' and tipo='confirmados';".format(state))

    c1=''
    c2=''
    c3=''
    c4=''
    c5=''
    c6=''
    c7=''
    c8=''

    for row in result_set_mitigation:
        c1=int(row[0])
        c2=int(row[1])
        c3=int(row[2])
        c4=int(row[3])
        c5=int(row[4])
        c6=int(row[5])
        c7=int(row[6])
        c8=int(row[7])

    jsonconfirmados = {
            "Confirmados": {
                "Acumulado": {
                    "IA": {
                        "data": data_otimizacao,
                        "maximo": (np.array(confirmados_otimizacao)+np.array(erro_confirmados)).clip(min=0).astype(int).tolist(),
                        "minimo": (np.array(confirmados_otimizacao)-np.array(erro_confirmados)).clip(min=0).astype(int).tolist(),
                        "quantidade": confirmados_otimizacao
                    },
                    "real": {
                        "data": data_real,
                        "quantidade": confirmados_real
                    },
                },
            },
            "Mitigacao":{
                "SchoolClosure":True if c1 == 1 else False ,
                "WorkplaceClosure":True if c2 == 1  else False,
                "CancellationOfPublicEvents":True if c3 == 1 else False,
                "RestrictionsOnGatheringSize":True if c4 == 1 else False,
                "PublicTransportClosures":True if c5 == 1 else False,
                "StayAtHomeRequirements":True if c6 == 1 else False,
                "RestrictionsOnDomesticMovement": True if c7 == 1 else False,
                "RestrictionsOnInternationalTravel": True if c8 == 1 else False
            },
        }
    return jsonify(jsonconfirmados)

@app.route('/api/optimization/high_economy/value', methods=['GET'])
@cross_origin()
def optimization_higheconomy_value():

    country = str(request.args.get('country'))
    state = str(request.args.get('state'))

    db = create_engine(db_string)

    day,_,value = sqlNotas(state,'NFC-e')

    result_set_otimization = db.execute("select id,valor from otimizacao_valor where nome = '{}' order by id asc;".format(state))

    data_otimizacao = []
    confirmados_otimizacao = []

    data_otimizacao.append(day[-1])
    confirmados_otimizacao.append(value[-1])

    for i,row in enumerate(result_set_otimization):
        data_otimizacao.append(row[0].strftime("%d/%m/%Y"))
        confirmados_otimizacao.append(float(max(0,row[1])))


    result_set_mitigation = db.execute("select c1,c2,c3,c4,c5,c6,c7,c8 from otimizacao_mitigacao where nome = '{}' and tipo='valor';".format(state))

    c1=''
    c2=''
    c3=''
    c4=''
    c5=''
    c6=''
    c7=''
    c8=''

    for row in result_set_mitigation:
        c1=int(row[0])
        c2=int(row[1])
        c3=int(row[2])
        c4=int(row[3])
        c5=int(row[4])
        c6=int(row[5])
        c7=int(row[6])
        c8=int(row[7])

    jsonconfirmados = {
            "Notas": {
                "NFC-e": {
                    "Valor": {
                        "IA": {
                            "data": data_otimizacao,
                            "maximo": (np.array(confirmados_otimizacao)+np.array(erro_nf_valor_list)).clip(min=0).astype(int).tolist(),
                            "minimo": (np.array(confirmados_otimizacao)-np.array(erro_nf_valor_list)).clip(min=0).astype(int).tolist(),
                            "valor": confirmados_otimizacao
                        },
                        "real": {
                            "data": day,
                            "valor": value
                        }
                    }
                },
            },
            "Mitigacao":
            {
                "SchoolClosure":True if c1 == 1 else False ,
                "WorkplaceClosure":True if c2 == 1  else False,
                "CancellationOfPublicEvents":True if c3 == 1 else False,
                "RestrictionsOnGatheringSize":True if c4 == 1 else False,
                "PublicTransportClosures":True if c5 == 1 else False,
                "StayAtHomeRequirements":True if c6 == 1 else False,
                "RestrictionsOnDomesticMovement": True if c7 == 1 else False,
                "RestrictionsOnInternationalTravel": True if c8 == 1 else False
            },
        }
    return jsonify(jsonconfirmados)

@app.route('/api/optimization/high_economy/quantity', methods=['GET'])
@cross_origin()
def optimization_higheconomy_quantity():
    country = str(request.args.get('country'))
    state = str(request.args.get('state'))

    db = create_engine(db_string)

    day,quantity,_ = sqlNotas(state,'NFC-e')

    result_set_otimization = db.execute("select id,valor from otimizacao_quantidade where nome = '{}' order by id asc;".format(state))

    data_otimizacao = []
    confirmados_otimizacao = []

    data_otimizacao.append(day[-1])
    confirmados_otimizacao.append(quantity[-1])

    for i,row in enumerate(result_set_otimization):
        data_otimizacao.append(row[0].strftime("%d/%m/%Y"))
        confirmados_otimizacao.append(max(0,row[1]))


    result_set_mitigation = db.execute("select c1,c2,c3,c4,c5,c6,c7,c8 from otimizacao_mitigacao where nome = '{}' and tipo='quantidade';".format(state))

    c1=''
    c2=''
    c3=''
    c4=''
    c5=''
    c6=''
    c7=''
    c8=''

    for row in result_set_mitigation:
        c1=int(row[0])
        c2=int(row[1])
        c3=int(row[2])
        c4=int(row[3])
        c5=int(row[4])
        c6=int(row[5])
        c7=int(row[6])
        c8=int(row[7])

    jsonconfirmados = {
            "Notas": {
                "NFC-e": {
                    "Quantidade": {
                        "IA": {
                            "data": data_otimizacao ,
                            "maximo":(np.array(confirmados_otimizacao)+np.array(erro_nf_qtd_list)).clip(min=0).astype(int).tolist() ,
                            "minimo": (np.array(confirmados_otimizacao)-np.array(erro_nf_qtd_list)).clip(min=0).astype(int).tolist() ,
                            "quantidade":  confirmados_otimizacao 
                        },
                        "real": {
                            "data": day ,
                            "quantidade": quantity 
                        }
                    }
                },
            },
            "Mitigacao":
            {
                "SchoolClosure":True if c1 == 1 else False ,
                "WorkplaceClosure":True if c2 == 1  else False,
                "CancellationOfPublicEvents":True if c3 == 1 else False,
                "RestrictionsOnGatheringSize":True if c4 == 1 else False,
                "PublicTransportClosures":True if c5 == 1 else False,
                "StayAtHomeRequirements":True if c6 == 1 else False,
                "RestrictionsOnDomesticMovement": True if c7 == 1 else False,
                "RestrictionsOnInternationalTravel": True if c8 == 1 else False
            },
        }
    return jsonify(jsonconfirmados)

@app.route('/api/optimization/moderate', methods=['GET'])
@cross_origin()
def optimization_moderate():
    country = str(request.args.get('country'))
    state = str(request.args.get('state'))

    db = create_engine(db_string)

    day,quantity,value = sqlNotas(state,'NFC-e')

    result_set = db.execute("select id,confirmed,deaths from covid_case_brazil_view where state = '{}' order by id asc;".format(state))

    data_real = []
    confirmados_real_cc = []    
    deaths_real_ob = []    
    for row in result_set:
        data_real.append(row[0].strftime("%d/%m/%Y"))
        confirmados_real_cc.append(row[1])
        deaths_real_ob.append(row[2])



    result_set_otimization = db.execute("select id,confirmados,obitos,valor,quantidade from otimizacao_melhorcaso where nome = '{}' order by id asc;".format(state))

    data_otimizacao = []
    confirmados_otimizacao = []
    obitos_otimizacao = []
    valor_otimizacao = []
    quantidade_otimizacao = []

    data_otimizacao.append(day[-1])
    confirmados_otimizacao.append(confirmados_real_cc[-1])
    obitos_otimizacao.append(deaths_real_ob[-1])
    valor_otimizacao.append(value[-1])
    quantidade_otimizacao.append(quantity[-1])

    for i,row in enumerate(result_set_otimization):
        data_otimizacao.append(row[0].strftime("%d/%m/%Y"))
        confirmados_otimizacao.append(max(0,row[1]))
        obitos_otimizacao.append(max(0,row[2]))
        valor_otimizacao.append(max(0,row[3]))
        quantidade_otimizacao.append(max(0,row[4]))

    result_set_mitigation = db.execute("select c1,c2,c3,c4,c5,c6,c7,c8 from otimizacao_mitigacao where nome = '{}' and tipo='melhor';".format(state))

    c1=''
    c2=''
    c3=''
    c4=''
    c5=''
    c6=''
    c7=''
    c8=''

    for row in result_set_mitigation:
        c1=int(row[0])
        c2=int(row[1])
        c3=int(row[2])
        c4=int(row[3])
        c5=int(row[4])
        c6=int(row[5])
        c7=int(row[6])
        c8=int(row[7])

    x = {
            "Confirmados": {
                "Acumulado": {
                    "IA": {
                        "data": data_otimizacao,
                        "maximo": (np.array(confirmados_otimizacao)+np.array(erro_confirmados)).clip(min=0).astype(int).tolist(),
                        "minimo": (np.array(confirmados_otimizacao)-np.array(erro_confirmados)).clip(min=0).astype(int).tolist(),
                        "quantidade": confirmados_otimizacao
                    },
                    "real": {
                        "data": data_real,
                        "quantidade": confirmados_real_cc
                    },
                },
            },
            "Notas": {
                "NFC-e": {
                    "Quantidade": {
                        "IA": {
                            "data": data_otimizacao,
                            "maximo":(np.array(quantidade_otimizacao)+np.array(erro_nf_qtd_list)).clip(min=0).astype(int).tolist() ,
                            "minimo": (np.array(quantidade_otimizacao)-np.array(erro_nf_qtd_list)).clip(min=0).astype(int).tolist() ,
                            "quantidade":  quantidade_otimizacao 
                        },
                        "real": {
                            "data": day,
                            "quantidade": quantity
                        }
                    },
                    "Valor": {
                        "IA": {
                            "data":data_otimizacao,
                            "maximo": (np.array(valor_otimizacao)+np.array(erro_nf_valor_list)).clip(min=0).astype(int).tolist(),
                            "minimo": (np.array(valor_otimizacao)-np.array(erro_nf_valor_list)).clip(min=0).astype(int).tolist(),
                            "valor": valor_otimizacao
                        },
                        "real": {
                            "data": day,
                            "valor": value
                        }
                    }
                },
            },
            "Obitos": {
                "Acumulado": {
                    "IA": {
                       "data": data_otimizacao,
                        "maximo": (np.array(obitos_otimizacao)+np.array(erro_obitos)).clip(min=0).astype(int).tolist(),
                        "minimo": (np.array(obitos_otimizacao)-np.array(erro_obitos)).clip(min=0).astype(int).tolist(),
                        "quantidade": obitos_otimizacao 
                    },
                    "real": {
                        "data": data_real,
                        "quantidade": deaths_real_ob
                    },
                }
            },
            "Mitigacao":{
                "SchoolClosure":True if c1 == 1 else False ,
                "WorkplaceClosure":True if c2 == 1  else False,
                "CancellationOfPublicEvents":True if c3 == 1 else False,
                "RestrictionsOnGatheringSize":True if c4 == 1 else False,
                "PublicTransportClosures":True if c5 == 1 else False,
                "StayAtHomeRequirements":True if c6 == 1 else False,
                "RestrictionsOnDomesticMovement": True if c7 == 1 else False,
                "RestrictionsOnInternationalTravel": True if c8 == 1 else False
            },
            }
    return jsonify(x)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9050)