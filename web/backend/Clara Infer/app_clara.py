import flask
from flask import Flask, request, Response, jsonify, session
import requests
import os
import datetime
import json
import jsonpickle

app = flask.Flask(__name__)
app.config["DEBUG"] = True

@app.route('/api/teste', methods=['GET'])
def teste():
    return Response(response="Server Online\n", status=200)

@app.route('/api/clara', methods=['GET'])
def clara():

    nome_image = request.args.get('image')
    os.system('python config_datalist_new.py -i {}'.format(nome_image))
    os.system('singularity exec --bind /files/ /opt/share/nvidia.sif sh /files/clara_train_covid19_ct_lung_seg_v1/commands/infer.sh')
    os.system('python config_dataset_0_new.py -i {}'.format(nome_image))
    os.system('singularity exec --bind /files/ /opt/share/nvidia.sif sh /files/clara_train_covid19_3d_ct_classification_v1_2_etapa_AUG/commands/infer.sh')
    stream = os.popen('python result_new.py -i {}'.format(nome_image))
    retorno = stream.read()
    return Response(response=str(retorno), status=200)

@app.route('/api/nii', methods=['POST'])
def gpus():

    uploaded_files = request.files.getlist("files")
    imgs_dict = {}
    images = request.files.to_dict()
    for image in images:    
        print(images[image]) 
        file_name = images[image].filename
        name = images[image].name
        images[image].save(os.path.join('/files/', file_name))
        imgs_dict.update({name: file_name})

    url = "http://someipaddress:9050/api/clara?image={}".format(name)
    try:
        retorno = requests.get(url)

        retorno = retorno.text.replace("'",'"').replace("\n","")
        teste = json.loads(retorno)
        jsons = json.dumps(teste)

        return Response(response=jsons, status=200)
    except Exception as ex:
        return Response(response="Erro: {}".format(str(ex)), status=400)

app.run()
