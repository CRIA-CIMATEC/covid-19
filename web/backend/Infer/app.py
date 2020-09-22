from flask import Flask, request, Response,jsonify
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
import jsonpickle
import numpy as np
import cv2
import os
from PIL import Image
import json
import pandas as pd
import os
import urllib.request
from tensorflow.keras.models import load_model
from keras.preprocessing.image import img_to_array
import tensorflow as tf
from pysir import pysir
from tensorflow.keras import backend as K
import dill
from flask_cors import CORS,cross_origin
import pickle
from pickle import load
import joblib
from collections import namedtuple
from functools import partial
from multiprocessing import Pool
from sklearn.preprocessing import MinMaxScaler
from collections import Counter
import itertools 
from datetime import timedelta
import datetime
from sklearn.ensemble import GradientBoostingRegressor

app = Flask(__name__)
app.config['CORS_HEADERS'] = "Content-Type"
app.config['CORS_RESOURCES'] = {r"/api/*": {"origins": "*"}}
app.secret_key = 'password_very_secure'
cors = CORS(app)

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

paths = '/files/static/models/'


############################################################
####                    Functions                       ####
############################################################

def generate_single_region_dataset(key, region_data, look_back, look_forward, x_columns, y_columns=None, gen_x=True, gen_y=True):
    
    # Check region dataframe
    if region_data is None:
        print('generate_single_region_dataset error: Region data is None!')
        return (None, None)
    
    # Check number of regions
    if len(region_data[key].unique()) > 1:
        print('generate_single_region_dataset error: More than one region in the dataframe!')
        return (None, None)
    else:
        region_name = region_data[key].unique()[0]
    
    # Drop 'Region' column
    region_data = region_data.drop(columns=key)
    
    # Check the number of samples available to
    # generate the look back and look forward windows
    if gen_y:
        if len(region_data) < (look_back + look_forward):
            print('generate_single_region_dataset error: Not enough samples '+
                  'in {} to generate the windows!'.format(region_name))
            return (None, None)
        
        n_samples = len(region_data) - look_back - look_forward + 1        
    else:        
        if len(region_data) < (look_back):
            print('generate_single_region_dataset error: Not enough samples '+
                  'in {} to generate the windows!'.format(region_name))
            return (None, None)
        n_samples = len(region_data) - look_back + 1

    var_names = x_columns
    
    # Generate inputs
    if gen_x:
        inputs = pd.DataFrame()
        
        for i in range(n_samples):
            input_window = region_data.T.iloc[:, i:i+look_back]
            wide_input_sample = pd.DataFrame()
            
            for var in var_names:
                var_input_sample = input_window.loc[var:var, :]
                var_input_sample.columns = ['{}_t{}'.format(var, a) for a in range(1-look_back, 1)]
                var_input_sample = var_input_sample.reset_index(drop=True)
                wide_input_sample = pd.concat([wide_input_sample, var_input_sample], axis='columns')
                
            inputs = pd.concat([inputs, wide_input_sample], axis='index')
            
        # Reset index
        inputs = inputs.reset_index(drop=True)

    # Generate outputs
    if gen_y:
        
        if y_columns is None:
            print('generate_single_region_dataset error: Need to specify column labels!')
            return (None, None)
        
        var_names = y_columns
        outputs = pd.DataFrame()
        
        for i in range(n_samples):
            output_window = region_data.T.iloc[:, i+look_back : i+look_back+look_forward]
            wide_output_sample = pd.DataFrame()

            for var in var_names:
                var_output_sample = output_window.loc[var:var, :]
                var_output_sample.columns = ['{}_t+{}'.format(var, a) for a in range(1, look_forward+1)]
                var_output_sample = var_output_sample.reset_index(drop=True)
                wide_output_sample = pd.concat([wide_output_sample, var_output_sample], axis='columns')

            outputs = pd.concat([outputs, wide_output_sample], axis='index')
        
        # Reset index
        outputs = outputs.reset_index(drop=True)
        
    if gen_x and gen_y:
        return (inputs, outputs)
    elif gen_x:
        return (inputs, None)
    elif gen_y:
        return (None, outputs)

def generate_regions_dataset(key, regions_data, look_back, look_forward, x_columns, y_columns=None, 
                             gen_x=True, gen_y=True):
    
    regions_names = regions_data[key].unique()
    
    all_regions_x = pd.DataFrame()
    all_regions_y = pd.DataFrame()
    
    for region_name in regions_names:
        
        region_data = regions_data[regions_data[key]==region_name]
        
        region_x, region_y = generate_single_region_dataset(key,
            region_data, look_back=look_back, look_forward=look_forward, x_columns=x_columns, y_columns=y_columns,
            gen_x=gen_x, gen_y=gen_y
        )
        
        if not (region_x is None):
            all_regions_x = pd.concat([all_regions_x, region_x])
            all_regions_x = all_regions_x.reset_index(drop=True)
            
        if not (region_y is None):
            all_regions_y = pd.concat([all_regions_y, region_y])
            all_regions_y = all_regions_y.reset_index(drop=True)
    
    if gen_x and gen_y:
        return (all_regions_x, all_regions_y)
    elif gen_x:
        return (all_regions_x, None)
    elif gen_y:
        return (None, all_regions_y)

def input_ID(df):
    lista_regiao = list(df["Country/Region"].unique())
    identificadores = np.arange(0,len(lista_regiao))
    lista_df = []
    l=0
    for i in lista_regiao:
        
        mask = df['Country/Region'] == i
        df_temp = df.loc[mask]
        df_temp.insert(0, "ID", identificadores[l] )
        lista_df.append(df_temp)
        l=l+1
    df_final = pd.concat(lista_df) 
    return df_final

def create_PT_multi(sequences, n_steps_in, n_steps_out):
    X, y = list(), list()
    for i in range(len(sequences)):
        # find the end of this pattern
        end_ix = i + n_steps_in
        out_end_ix = end_ix + n_steps_out-1
        # check if we are beyond the dataset
        if out_end_ix >= len(sequences):
            break
        # gather input and output parts of the pattern
        seq_x, seq_y = sequences[i:end_ix, :-1], sequences[end_ix:out_end_ix+1, -1]
        X.append(seq_x)
        y.append(seq_y)
    return np.array(X), np.array(y)

def preditores_targets(np_treino, vp, vf):
    identificador = np.unique(np_treino[:,0], axis=0)  
    lista_treinoX = []
    lista_treinoY = []
    for i in identificador:
        
        mask = np_treino[:,0] ==i
        dados_treino_temp = np_treino[mask]
        dados_treino_temp = dados_treino_temp[:,1:]
        
        if(vp + vf <= dados_treino_temp.shape[0]):
            treinamentoX_full, treinamentoY_full = create_PT_multi(dados_treino_temp, vp, vf) 
            lista_treinoX.append(treinamentoX_full)
            lista_treinoY.append(treinamentoY_full)
        else:
            print("A serie temporal com identificação "+ str(i) + " não foi considerada (poucos dados)")
    
    preditores = np.concatenate(lista_treinoX)
    targets = np.concatenate(lista_treinoY)
    
    return preditores, targets

def melhor_caso(avaliacao, possibilidades, lista_predicoes):
    df_avaliacao = pd.DataFrame(columns=["ID","Media","Somatório","C1","C2","C3","C4","C5","C6","C7","C8"])
    for i in range(0,len(lista_predicoes)):
        df_temp = lista_predicoes[i]
        media = df_temp.mean()
        somatorio = df_temp.sum()
        df_avaliacao.at[i,"ID"] = i
        df_avaliacao.at[i,"Media"] = media
        df_avaliacao.at[i,"Somatório"] = somatorio
        df_avaliacao.at[i,["C1","C2","C3","C4","C5","C6","C7","C8"]] = possibilidades[i]
        
    if(avaliacao== "min"):
        melhor_combincacao = df_avaliacao[df_avaliacao["Somatório"] == df_avaliacao["Somatório"].min()]
    if(avaliacao== "max"):
        melhor_combincacao = df_avaliacao[df_avaliacao["Somatório"] == df_avaliacao["Somatório"].max()]
    return df_avaliacao, melhor_combincacao

def pred_possibilidades_nf(regra, possibilidades, lb, lf, normalizador_x, normalizador_y, modelo_rna,complemento_df,lista_df_predicoes_cc,lista_df_predicoes_mc,lista_df_predicoes_cc_norm,lista_df_predicoes_mc_norm):
    
    lista_df_cenarios = []
    for j in range(0,len(possibilidades)):
        cenario = complemento_df.copy()
        # INSERINDO UMA COMBINAÇÃO DE MEDIDAS DE MITIGAÇÃO
        cenario.loc[lb-1,["C1","C2","C3","C4","C5","C6","C7","C8"]] = possibilidades[j]
        pred_conf = lista_df_predicoes_cc_norm[j]
        pred_death = lista_df_predicoes_mc_norm[j]
               
        if(regra == "qtd"):
            # CRIANDO PREDITORES
            x_columns_qtde = ["day_of_week", "populacao", "Deaths", "Confirmed","Qtde Autorizados", "Qtde Autorizados_2019_mean",'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']
            x_qtde,_ = generate_regions_dataset("Country/Region",cenario, lb, lf, x_columns_qtde, gen_x=True, gen_y=False)
            # CRIANDO ADICIONANDO OS VALORES PREDITOS DE CASOS CONFIRMADOS E MORTES AOS PREDITORES
            new_data = normalizador_x.transform(x_qtde)
            new_data = np.append(new_data, pred_conf, axis=1)
            new_data = np.append(new_data, pred_death, axis=1)           
           
        if(regra == "vlr"):
            x_columns_value = ["day_of_week", "populacao", "Deaths", "Confirmed","Valor Autorizados", "Valor Autorizados_2019_mean",'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']
            x_value,_ = generate_regions_dataset("Country/Region",cenario, lb, lf, x_columns_value, gen_x=True, gen_y=False)
            # CRIANDO ADICIONANDO OS VALORES PREDITOS DE CASOS CONFIRMADOS E MORTES AOS PREDITORES
            new_data = normalizador_x.transform(x_value)
            new_data = np.append(new_data, pred_conf, axis=1)
            new_data = np.append(new_data, pred_death, axis=1)                    
    
        lista_df_cenarios.append(new_data)
              
    lista_df_predicoes = []
    for h in range(0,len(lista_df_cenarios)):
        # APLICANDO OS NORMALIZADORES
        x_scaled = lista_df_cenarios[h]
        x_scaled_newshape = np.reshape(x_scaled,(x_scaled.shape[0],1, x_scaled.shape[1]))
        # CARREGANDO A ESTRUTURA DA REDE
        modelo = modelo_rna
        
        predicao =  modelo.predict(x_scaled_newshape) 
        predicao = normalizador_y.inverse_transform(predicao)
        lista_df_predicoes.append(predicao.reshape(1,-1))
    return lista_df_predicoes

def melhor_caso_geral(possibilidades, otimo_cc, otimo_mc, otimo_qtd, otimo_valor):
    df_avaliacao = pd.DataFrame(columns=["ID","Somatório Qtd","Somatório Valor", "Somatório Confirmados", "Somatório Mortes","C1","C2","C3","C4","C5","C6","C7","C8"])
    for i in range(0,len(possibilidades)):
        df_avaliacao.at[i,"ID"] = i
        df_avaliacao.at[i,"Somatório Qtd"] = otimo_qtd.iloc[i,2]
        df_avaliacao.at[i,"Somatório Valor"] = otimo_valor.iloc[i,2]
        df_avaliacao.at[i,"Somatório Confirmados"] = otimo_cc.iloc[i,2]
        df_avaliacao.at[i,"Somatório Mortes"] = otimo_mc.iloc[i,2]
        df_avaliacao.at[i,["C1","C2","C3","C4","C5","C6","C7","C8"]] = possibilidades[i]
        
    normalizador = MinMaxScaler(feature_range=(0, 1))
    dados_normalziados = normalizador.fit_transform(df_avaliacao)
    df_avaliacao_normalizado = pd.DataFrame(dados_normalziados,columns=["ID","Somatório Qtd","Somatório Valor", "Somatório Confirmados", "Somatório Mortes","C1","C2","C3","C4","C5","C6","C7","C8"])
    df_avaliacao_normalizado = df_avaliacao_normalizado.drop(["ID"], axis=1)
    df_avaliacao_normalizado["ID"] = df_avaliacao["ID"]
    
    for i in range(0,len(possibilidades)): 
        df_avaliacao_normalizado.at[i,"Dist"] = (df_avaliacao_normalizado.iloc[i,1]+df_avaliacao_normalizado.iloc[i,2]) - (df_avaliacao_normalizado.iloc[i,3]+ df_avaliacao_normalizado.iloc[i,4])
    
    melhor_combincacao = df_avaliacao_normalizado[df_avaliacao_normalizado["Dist"] == df_avaliacao_normalizado["Dist"].max()]
        
    return df_avaliacao_normalizado, melhor_combincacao

def R_squared(y_true, y_pred):

    numpy_ = type(y_true).__name__ == 'ndarray'

    if(numpy_):
        y_true_mean = y_true.mean()
        y_pred_mean = y_pred.mean()

        sum_num = np.sum((y_pred-y_pred_mean)*y_true)
        numerator = np.square(sum_num)

        denominator = np.sum(np.square(y_pred - y_pred_mean)) \
            * np.sum(np.square(y_true - y_true_mean))

    else:
        y_true_mean = K.mean(y_true)
        y_pred_mean = K.mean(y_pred)

        numerator = K.square(K.sum((y_pred-y_pred_mean)*y_true))
        denominator = K.sum(K.square(y_pred - y_pred_mean))*K.sum(K.square(y_true - y_true_mean))


    R2 = numerator/denominator

    return R2

def fac2(y_true, y_pred, to_numpy=False):
    min_ = 0.5
    max_ = 2

    division = tf.divide(y_pred, y_true)

    greater_min = tf.greater_equal(division, min_)
    less_max = tf.less_equal(division, max_)

    res = tf.equal(greater_min, less_max)
    res = tf.cast(res, tf.float32)

    fac_2 = tf.reduce_mean(res)

    return K.get_value(fac_2) if to_numpy else fac_2

def pearson_r(y_true, y_pred):

    numpy_ = type(y_true).__name__ == 'ndarray'

    if(numpy_):
        y_true_mean = y_true.mean()
        y_pred_mean = y_pred.mean()

        diff_yt = y_true - y_true_mean
        diff_yp = y_pred - y_pred_mean

        numerator = np.sum((diff_yt) * (diff_yp))
        denominator = np.sqrt(np.sum(np.square(diff_yt))) * np.sqrt(np.sum(np.square(diff_yp)))
    else:

        y_true_mean = K.mean(y_true)
        y_pred_mean = K.mean(y_pred)

        diff_yt = y_true - y_true_mean
        diff_yp = y_pred - y_pred_mean

        numerator = K.sum((diff_yt) * (diff_yp))
        denominator = K.sqrt(K.sum(K.square(diff_yt))) * K.sqrt(K.sum(K.square(diff_yp)))

    r = numerator/denominator

    return r

def _get_single_region_dataset(args, region_name):
    
    key = args[0]
    regions_data = args[1]
    
    region_data = regions_data[regions_data[key]==region_name]
    
    new_args = args.copy()
    new_args[1] = region_data
    
    region_x, region_y = generate_single_region_dataset(*new_args)
    
    return (region_x, region_y)

def create_dataset_value(model_confirmed, model_deaths, normalizador_confirmed, normalizador_deaths, normalizador_notas, data,lookback):
    new_data = data.drop(['day_of_week_t-{}'.format(i) for i in range(1,lookback)], axis=1)
    new_data = new_data.drop(['day_of_week_t0'], axis=1)
    
    new_data = new_data.drop(['populacao_t-{}'.format(i) for i in range(1,lookback)], axis=1)
    new_data = new_data.drop(['populacao_t0'], axis=1)
    
    new_data = new_data.drop(['Valor Autorizados_t-{}'.format(i) for i in range(1,lookback)], axis=1)
    new_data = new_data.drop(['Valor Autorizados_t0'], axis=1)
    
    new_data = new_data.drop(['Valor Autorizados_2019_mean_t-{}'.format(i) for i in range(1,lookback)], axis=1)
    new_data = new_data.drop(['Valor Autorizados_2019_mean_t0'], axis=1)
    

    #Predictions Confirmed
    new_data_x_conf_scaler = normalizador_confirmed.transform(new_data)
    
    new_data_reshaped = np.empty([new_data_x_conf_scaler.shape[0], 4, 10])

    k = 0
    for i in range(10):
        for j in range(4):
            new_data_reshaped[:, j, i] = new_data_x_conf_scaler[:, k]
            k = k + 1

    new_data_pred_conf = model_confirmed.predict(new_data_reshaped)
    
    #Predictions Deaths
    new_data_x_death_scaler = normalizador_deaths.transform(new_data)

    new_data_reshaped = np.empty([new_data_x_death_scaler.shape[0], 4, 10])

    k = 0
    for i in range(10):
        for j in range(4):
            new_data_reshaped[:, j, i] = new_data_x_death_scaler[:, k]
            k = k + 1

    new_data_pred_deaths = model_deaths.predict(new_data_reshaped)
    
    #Creating dataset
    
    new_data = normalizador_notas.transform(data)
    new_data = np.append(new_data, new_data_pred_conf, axis=1)
    new_data = np.append(new_data, new_data_pred_deaths, axis=1)
    
    return new_data

def create_dataset_qtde(model_confirmed, model_deaths, normalizador_confirmed, normalizador_deaths, normalizador_notas, data,lookback):
    new_data = data.drop(['day_of_week_t-{}'.format(i) for i in range(1,lookback)], axis=1)
    new_data = new_data.drop(['day_of_week_t0'], axis=1)
    
    new_data = new_data.drop(['populacao_t-{}'.format(i) for i in range(1,lookback)], axis=1)
    new_data = new_data.drop(['populacao_t0'], axis=1)
    
    new_data = new_data.drop(['Qtde Autorizados_2019_mean_t-{}'.format(i) for i in range(1,lookback)], axis=1)
    new_data = new_data.drop(['Qtde Autorizados_2019_mean_t0'], axis=1)
    
    new_data = new_data.drop(['Qtde Autorizados_t-{}'.format(i) for i in range(1,lookback)], axis=1)
    new_data = new_data.drop(['Qtde Autorizados_t0'], axis=1)
    
    #Predictions Confirmed
    new_data_x_conf_scaler = normalizador_confirmed.transform(new_data)
    
    new_data_reshaped = np.empty([new_data_x_conf_scaler.shape[0], 4, 10])

    k = 0
    for i in range(10):
        for j in range(4):
            new_data_reshaped[:, j, i] = new_data_x_conf_scaler[:, k]
            k = k + 1

    new_data_pred_conf = model_confirmed.predict(new_data_reshaped)
    
    #Predictions Deaths
    new_data_x_death_scaler = normalizador_deaths.transform(new_data)

    new_data_reshaped = np.empty([new_data_x_death_scaler.shape[0], 4, 10])

    k = 0
    for i in range(10):
        for j in range(4):
            new_data_reshaped[:, j, i] = new_data_x_death_scaler[:, k]
            k = k + 1

    new_data_pred_deaths = model_deaths.predict(new_data_reshaped)
    
    #Creating dataset
    
    new_data = normalizador_notas.transform(data)
    new_data = np.append(new_data, new_data_pred_conf, axis=1)
    new_data = np.append(new_data, new_data_pred_deaths, axis=1)
    
    return new_data

def get_num_colors(img):    
    return len(Counter(img.reshape(-1)))

def make_histogram(img):
    """ Take an image and create a historgram from it's luma values """
    y_vals = img[:,:,0].flatten()
    histogram = np.zeros(256, dtype=int)
    for y_index in range(y_vals.size):
        histogram[y_vals[y_index]] += 1
    return histogram

def make_cumsum(histogram):
    """ Create an array that represents the cumulative sum of the histogram """
    cumsum = np.zeros(256, dtype=int)
    cumsum[0] = histogram[0]
    for i in range(1, histogram.size):
        cumsum[i] = cumsum[i-1] + histogram[i]
    return cumsum

def make_mapping(histogram, cumsum, IMG_W, IMG_H):
    """ Create a mapping s.t. each old luma value is mapped to a new
        one between 0 and 255. Mapping is created using:
         - M(i) = max(0, round((luma_levels*cumsum(i))/(h*w))-1)
        where luma_levels is the number of luma levels in the image """
    mapping = np.zeros(256, dtype=int)
    luma_levels = 256
    for i in range(histogram.size):
        mapping[i] = max(0, round((luma_levels*cumsum[i])/(IMG_H*IMG_W))-1)
    return mapping

def apply_mapping(img, mapping):
    """ Apply the mapping to our image """
    new_image = img.copy()
    new_image[:,:,0] = list(map(lambda a : mapping[a], img[:,:,0]))
    return new_image

def convert_rgb_to_ycbcr(im):
    xform = np.array([[.299, .587, .114], [-.1687, -.3313, .5], [.5, -.4187, -.0813]])
    ycbcr = im.dot(xform.T)
    ycbcr[:,:,[1,2]] += 128
    return np.uint8(ycbcr)

def run_equilize(img):
    img = img.astype(np.uint8)
    if (get_num_colors(img) <= 90):
        imagem=img
        IMG_W = imagem.shape[:2][0]
        IMG_H = imagem.shape[:2][1]
        imagem = cv2.cvtColor(imagem, cv2.COLOR_BGR2YCR_CB)
        histogram = make_histogram(imagem)
        cumsum = make_cumsum(histogram)
        mapping = make_mapping(histogram, cumsum, IMG_W, IMG_H)
        new_image = apply_mapping(imagem, mapping)
        new_image = cv2.cvtColor(new_image, cv2.COLOR_YCrCb2BGR)
        new_image32 = new_image.astype(np.float32)
        return new_image32
    else:
        img = img.astype(np.float32)
        return img

def xray_def(imgs_dict):
    abnormal = {}
    covid = {}
    itens = {}

    for key, img in imgs_dict.items():
        image = Image.open((os.path.join('/files/static/uploads/', img)))
        
        image = prepare_image(image, 299)

        pred = modelo_image_valid_xray.predict_proba(image)

        try:
            if (pred[0][0] > pred[0][1]) and (pred[0][0] > pred[0][2]):
                image = cv2.imread(os.path.join('/files/static/uploads/', img))
                image = cv2.resize(image, (299, 299))
                image = run_equilize(image)
                image = np.divide(image.reshape(1, 299, 299, 3), 255.)
                res_abnormal = model_abnormality.predict(image)[0]
                abnormal.update({'abnormal': "%2.f" % (res_abnormal[0]*100)})
                res_covid = [0, 0]

                if(float(res_abnormal[0]*100) > 50):
                    res_covid = model_covid.predict(image)[0]

                covid.update({'covid': "%2.f" % (res_covid[0]*100)})
                itens.update({key:["{:.0f}".format(res_abnormal[0]*100),"{:.0f}".format(res_covid[0]*100),True]})
            else:
                itens.update({key:["0","0",False]})
        except Exception as ex:
            itens.update({key:["-99","-99",False]})
    json_dump = json.dumps(itens)


    return json_dump

def tc_def(imgs_dict):
    try:
        itens = {}
        for key,img in imgs_dict.items():
            imagens = dim_2d_preprocessing("/files/static/uploads/"+img)
            retorno = model_tc_2d.predict(imagens)
            itens.update({key:[100,"{:.0f}".format(retorno[0][1]*100),True]})
        json_dump = json.dumps(itens)
        return json_dump
    except Exception as ex:
        return str(ex)

def dicom_def(imgs_dict):
    lista = []
    for key,img in imgs_dict.items():
        lista.append(img)
    imagens = dim_3d_preprocessing(lista,"/files/static/uploads/")
    retorno = model_tc_3d.predict(imagens)
    json_dump = json.dumps({"laminas":["{:.0f}".format(100),"{:.0f}".format(retorno[0][1]*100),True]})
    return json_dump


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def dim_2d_preprocessing(img_fullname):
    IMG_DIM = 224
    im = []

    im = cv2.imread(img_fullname)

    
    im = cv2.resize(im, (IMG_DIM, IMG_DIM))

    im = im.reshape(-1,IMG_DIM, IMG_DIM, 3).astype('float32') / 255

    return im
 
def dim_3d_preprocessing(list_imgs, input_dir):
    list_imgs.sort()
    images = []
    NUM_SLICES = 16
    IMG_DIM = 224
    
    for i in range(0,NUM_SLICES):
        img_fullname = input_dir + list_imgs[i]
        im = cv2.imread(img_fullname,cv2.IMREAD_GRAYSCALE)    
        im = cv2.resize(im, (IMG_DIM, IMG_DIM))
        im = im.reshape(IMG_DIM, IMG_DIM, 1).astype('float32') / 255
        images.append(im)
    images = np.array(images)
    images = images.reshape(-1, IMG_DIM, IMG_DIM, NUM_SLICES, 1)
    
    return images

def prepare_image(image, target=None):
    # if the image mode is not RGB, convert it
    if image.mode != "RGB":
        image = image.convert("RGB")

    image = np.array(image)
    # resize the input image and preprocess it
    if(target != None):
        image = resize_and_pad(image, target)
    # normalise pixel values to real numbers between 0.0 - 1.0
    image = np.expand_dims(image, axis=0)
    image = image / 255.0

    # return the processed image
    return image

def resize_and_pad(im, desired_size):
    old_size = im.shape[:2]  # old_size is in (height, width) format
    ratio = float(desired_size)/max(old_size)
    new_size = tuple([int(x*ratio) for x in old_size])
    # new_size should be in (width, height) format
    im = cv2.resize(im, (new_size[1], new_size[0]))
    delta_w = desired_size - new_size[1]
    delta_h = desired_size - new_size[0]
    top, bottom = delta_h//2, delta_h-(delta_h//2)
    left, right = delta_w//2, delta_w-(delta_w//2)
    color = [0, 0, 0]
    new_im = cv2.copyMakeBorder(im, top, bottom, left, right, cv2.BORDER_CONSTANT,
                                value=color)
    return new_im


############################################################
####                      Classes                       ####
############################################################

class BaseModelsConfirmed:
    
    def __init__(self, base_path):
        
        self.load_models(base_path)
    
    def _load_artifacts(self, model_path):
        
        with open('{}/x_scaler.pkl'.format(model_path), 'rb') as scaler_file:
            x_scaler = load(scaler_file)

        with open('{}/y_scaler.pkl'.format(model_path), 'rb') as scaler_file:
            y_scaler = load(scaler_file)

        model = load_model('{}/model.h5'.format(model_path))
        
        artifacts = {'x_scaler':x_scaler, 'y_scaler':y_scaler, 'model':model}
        
        artifacts = namedtuple('Artifacts', artifacts.keys())(*artifacts.values())
        
        return artifacts
    
    def load_models(self, base_path):
        
        model_paths = os.listdir(base_path)
        
        models = dict()
        
        for model_path in model_paths:
            
            model_artifacts = self._load_artifacts('{}/{}'.format(base_path,model_path))
            models[model_path] = model_artifacts
        
        self.models = namedtuple('Models', models.keys())(*models.values())
        
    def transform_x_data(self, x_data, model_name):
        
        model_artifacts = getattr(self.models, model_name)
        
        x_data_scaled = model_artifacts.x_scaler.transform(x_data)
        
        return x_data_scaled
        
    def inverse_transform_y_data(self, y_data_scaled, model_name):
        
        model_artifacts = getattr(self.models, model_name)
        
        y_data = model_artifacts.y_scaler.inverse_transform(y_data_scaled)
        
        return y_data
        
    def reshape_x_data(self, x_data, model_name, lookback=4, lookforward=0):
        
        if model_name == 'CNN_LSTM_real':
            x_columns = 10
            
            new_x_data = np.empty([x_data.shape[0], lookback, x_columns])
            
            k = 0
            for i in range(x_columns):
                for j in range(lookback):
                    new_x_data[:, j, i] = x_data[:, k]
                    k = k + 1
        
        elif model_name == 'LSTM_real':
            
            new_x_data = np.reshape(x_data, (x_data.shape[0], 1, x_data.shape[1]))
            
        elif (model_name=='LSTM_sintetico') or (model_name=='CNN_LSTM_sintetico'):
            
            new_x_data, _ = preditores_targets(x_data, lookback, lookforward)
        
        else:
            print('BaseModels.reshape_x_data error. Model name not defined.')
            return None
        
        return new_x_data
    
    def model_predict(self, dataset, model_name, lookback=4, lookforward=0, scale=True):
        
        if (model_name=='LSTM_real') or (model_name=='CNN_LSTM_real'):
            
            x_columns = ["Deaths", "Confirmed", "C1","C2","C3","C4","C5","C6","C7","C8"]
            y_columns = ["Confirmed"]
            
            # Gera dados de entrada para o modelo com colunas de lookback
            x_data, _ = generate_regions_dataset(
                "Country/Region", dataset, lookback, lookforward, x_columns, y_columns=y_columns,
                gen_x=True, gen_y=False
            )
                
        elif (model_name=='LSTM_sintetico') or (model_name=='CNN_LSTM_sintetico'):
            
            # Insere coluna ID com IDs para cada região do DataFrame
            dataset_id = input_ID(dataset)
            
            # Formatando colunas de interesse na ordem correta
            x_columns = ["ID","Deaths", "Confirmed", "C1","C2","C3","C4","C5","C6","C7","C8"]
            y_columns = ["Confirmed"]
            cols_sequence = x_columns + y_columns
            x_data = dataset_id[cols_sequence]
            
        else:
            print('BaseModels.model_predict error. Model name not defined.')
            return None
        
        x_data_scaled = self.transform_x_data(x_data, model_name)
        
        new_x_data = self.reshape_x_data(x_data_scaled, model_name, lookback, lookforward)
        
        model_artifacts = getattr(self.models, model_name)
        y_pred = model_artifacts.model.predict(new_x_data)    
        
        if scale:
            y_pred = self.inverse_transform_y_data(y_pred, model_name)
        
        return y_pred
    
    def predict(self, dataset, lookback=4, lookforward=0, scale=False):
        
        models_names = self.models._fields
        n_models = len(models_names)
        
        models_preds = []
        
        for model_name in models_names:
            
            y_pred = self.model_predict(
                dataset, model_name, lookback=lookback, lookforward=lookforward, scale=scale
            )
            
            models_preds.append(y_pred)
            
        y_preds = np.hstack(models_preds)
        
        y_preds = np.reshape(y_preds, (y_preds.shape[0], 30, n_models), order='F')
        
        return y_preds

class MetaModelConfirmed:
    
    def __init__(self, base_path, metamodel_path):
        
        self.base_models = BaseModelsConfirmed(base_path)
        
        self.load_model(metamodel_path)
        
    def load_model(self, metamodel_path):
        
        with open('{}/meta_y_scaler.pkl'.format(metamodel_path), 'rb') as scaler_file:
            self.meta_y_scaler = load(scaler_file)

        self.metamodel = load_model('{}/metamodel.h5'.format(metamodel_path))
    
    def predict(self, x_data, lookback=4, lookforward=0, scale=True):
        
        base_pred = self.base_models.predict(x_data, lookback=lookback, lookforward=lookforward)
        
        meta_pred = self.metamodel.predict(base_pred)
        
        if scale:
            meta_pred = self.meta_y_scaler.inverse_transform(meta_pred)
        
        return meta_pred

class BaseModelsDeaths:
    
    def __init__(self, base_path):
        
        self.load_models(base_path)
    
    def _load_artifacts(self, model_path):
        
        with open('{}/x_scaler.pkl'.format(model_path), 'rb') as scaler_file:
            x_scaler = load(scaler_file)

        with open('{}/y_scaler.pkl'.format(model_path), 'rb') as scaler_file:
            y_scaler = load(scaler_file)

        model = load_model('{}/model.h5'.format(model_path))
        
        artifacts = {'x_scaler':x_scaler, 'y_scaler':y_scaler, 'model':model}
        
        artifacts = namedtuple('Artifacts', artifacts.keys())(*artifacts.values())
        
        return artifacts
    
    def load_models(self, base_path):
        
        model_paths = os.listdir(base_path)
        
        models = dict()
        
        for model_path in model_paths:
            
            model_artifacts = self._load_artifacts('{}/{}'.format(base_path,model_path))
            models[model_path] = model_artifacts
        
        self.models = namedtuple('Models', models.keys())(*models.values())
        
    def transform_x_data(self, x_data, model_name):
        
        model_artifacts = getattr(self.models, model_name)
        
        x_data_scaled = model_artifacts.x_scaler.transform(x_data)
        
        return x_data_scaled
        
    def inverse_transform_y_data(self, y_data_scaled, model_name):
        
        model_artifacts = getattr(self.models, model_name)
        
        y_data = model_artifacts.y_scaler.inverse_transform(y_data_scaled)
        
        return y_data
        
    def reshape_x_data(self, x_data, model_name, lookback=4, lookforward=0):
        
        if model_name == 'CNN_LSTM_real':
            x_columns = 10
            
            new_x_data = np.empty([x_data.shape[0], lookback, x_columns])
            
            k = 0
            for i in range(x_columns):
                for j in range(lookback):
                    new_x_data[:, j, i] = x_data[:, k]
                    k = k + 1
        
        elif model_name == 'LSTM_real':
            
            new_x_data = np.reshape(x_data, (x_data.shape[0], 1, x_data.shape[1]))
            
        elif (model_name=='LSTM_sintetico') or (model_name=='CNN_LSTM_sintetico'):
            
            new_x_data, _ = preditores_targets(x_data, lookback, lookforward)
        
        else:
            print('BaseModelsDeaths.reshape_x_data error. Model name not defined.')
            return None
        
        return new_x_data
    
    def model_predict(self, dataset, model_name, lookback=4, lookforward=0, scale=True):
        
        if (model_name=='LSTM_real') or (model_name=='CNN_LSTM_real'):
            
            x_columns = ["Deaths", "Confirmed", "C1","C2","C3","C4","C5","C6","C7","C8"]
            y_columns = ["Deaths"]
            
            # Gera dados de entrada para o modelo com colunas de lookback
            x_data, _ = generate_regions_dataset(
                "Country/Region", dataset, lookback, lookforward, x_columns, y_columns=y_columns,
                gen_x=True, gen_y=False
            )
                
        elif (model_name=='LSTM_sintetico') or (model_name=='CNN_LSTM_sintetico'):
            
            # Insere coluna ID com IDs para cada região do DataFrame
            dataset_id = input_ID(dataset)
            
            # Formatando colunas de interesse na ordem correta
            x_columns = ["ID","Deaths", "Confirmed", "C1","C2","C3","C4","C5","C6","C7","C8"]
            y_columns = ["Deaths"]
            cols_sequence = x_columns + y_columns
            x_data = dataset_id[cols_sequence]
            
        else:
            print('BaseModelsDeaths.model_predict error. Model name not defined.')
            return None
        
        x_data_scaled = self.transform_x_data(x_data, model_name)
        
        new_x_data = self.reshape_x_data(x_data_scaled, model_name, lookback, lookforward)
        
        model_artifacts = getattr(self.models, model_name)
        y_pred = model_artifacts.model.predict(new_x_data)    
        
        if scale:
            y_pred = self.inverse_transform_y_data(y_pred, model_name)
        
        return y_pred
    
    def predict(self, dataset, lookback=4, lookforward=0, scale=False):
        
        models_names = self.models._fields
        n_models = len(models_names)
        
        models_preds = []
        
        for model_name in models_names:
            
            y_pred = self.model_predict(
                dataset, model_name, lookback=lookback, lookforward=lookforward, scale=scale
            )
            
            models_preds.append(y_pred)
            
        y_preds = np.hstack(models_preds)
        
        y_preds = np.reshape(y_preds, (y_preds.shape[0], 30, n_models), order='F')
        
        return y_preds

class MetaModelDeaths:
    
    def __init__(self, base_path, metamodel_path):
        
        self.base_models = BaseModelsDeaths(base_path)
        
        self.load_model(metamodel_path)
        
    def load_model(self, metamodel_path):
        
        with open('{}/meta_y_scaler.pkl'.format(metamodel_path), 'rb') as scaler_file:
            self.meta_y_scaler = load(scaler_file)

        self.metamodel = load_model('{}/metamodel.h5'.format(metamodel_path))
    
    def predict(self, x_data, lookback=4, lookforward=0, scale=True):
        
        base_pred = self.base_models.predict(x_data, lookback=lookback, lookforward=lookforward)
        
        meta_pred = self.metamodel.predict(base_pred)
        
        if scale:
            meta_pred = self.meta_y_scaler.inverse_transform(meta_pred)
        
        return meta_pred

############################################################
####                      Models                        ####
############################################################

#Diagnostico
modelo_image_valid_xray = load_model(paths + 'Wholedataset_8layers.h5', custom_objects={'LeakyReLU': tf.keras.layers.LeakyReLU})

model_abnormality = load_model(os.path.join(paths, 'anormal_v24082020.h5'))

model_covid = load_model(os.path.join(paths, 'covid_v24082020.h5'))

model_tc_3d = load_model(os.path.join(paths, '3d_cnn_16_slices_v26062020.h5'))
model_tc_2d = load_model(os.path.join(paths, '2d_cnn_v26062020.h5'))

#Casos e Obitos

metamodel_confirmed = MetaModelConfirmed(paths + 'base_models_confirmed_27_08', paths + 'CNN_LSTM_metamodel_confirmed_27_08')

metamodel_deaths = MetaModelDeaths(paths + 'base_models_deaths_27_08', paths + 'CNN_LSTM_metamodel_deaths_27_08')

#Invoices

x_scaler_value_invoices = load(open(paths +'Xscaler_Valor_Invoices.pkl', 'rb'))
y_scaler_value_invoices =  load(open(paths +'Yscaler_Valor_Invoices.pkl', 'rb'))
modelo_value_invoices = load_model(paths +'LSTM_NotasFiscais_Valor_Invoices.h5')

x_scaler_qtde_invoices =  load(open(paths +'Xscaler_Qtde_Invoices.pkl', 'rb'))
y_scaler_qtde_invoices =  load(open(paths +'Yscaler_Qtde_Invoices.pkl', 'rb'))
modelo_qtde_invoices = load_model(paths +'LSTM_NotasFiscais_Qtde_Invoices.h5')

model_confirmed_invoices = load_model(paths +"FULL_DATASET_CONFIRMED_Modelo_CNN_LSTM_Invoices.h5")
model_deaths_invoices = load_model(paths +"KFOLD_DEATHS_Modelo_CNN_LSTM_Invoices.h5")

normalizador_confirmed_invoices = load(open(paths +"Normalizador_Preditores_CONFIRMADOS_Invoices.pkl", "rb"))
normalizador_deaths_invoices = load(open(paths +"Normalizador_Preditores_MORTES_Invoices.pkl", "rb"))

#Pico/Inflexão

x_scaler_inflexao =  load(open(os.path.join(paths,   "x_scale_27_08.pkl"), 'rb'))
y_scaler_inflexao = load(open(os.path.join(paths,   "y_scale_27_08.pkl"), 'rb'))

modelo_inflexao = load_model(os.path.join(paths,  'final_weights_nsgaii_best_model_27_08.h5'),custom_objects={
            'R_squared':R_squared,
            'pearson_r':pearson_r,
            'fac2':fac2
        })

############################################################
####                    Simulation                      ####
############################################################

@app.route('/api/simulation/cases/sird', methods=['POST'])
@cross_origin()
def simulation_cases_sird_teste():
    try:
        json_files = request.get_json(force = True)

        populacao = json_files['populacao']
        beta = json_files['Beta']
        T_inf = json_files['T_inf']
        N_inf = json_files['N_inf']
        T_death = json_files['T_death']
        CFR = json_files['CFR']

        bounds = {'beta':float(beta),'T_inf':float(T_inf),'N_inf':float(N_inf),'T_death':float(T_death),'cfr':float(CFR)}

        dataset = pd.DataFrame(json_files['Cases'])

        model = pysir.SIRD(int(populacao))
        history = model.fit(data=dataset, bounds=bounds)
        y_pred = model.predict(data=dataset, look_forward=30)

        pred_json = str('{"confirmed":' + str(y_pred["confirmed"].values).replace(".",",")[:-2] + '],"deaths":' + str(y_pred["deaths"].values).replace(".",",")[:-2] + ']}')

        return Response(response=pred_json, status=200, mimetype='application/json')
    except Exception as ex:
        return Response(response=str(ex), status=400)

############################################################
####               Dashboard - Calculate                ####
############################################################

@app.route('/api/cases/sird/calculate', methods=['POST'])
@cross_origin(headers=['Content-Type'])
def cases_sird_calculate():
    try:
        json_files = request.get_json(force = True)
        populacao = json_files['populacao']
        beta = json_files['Beta']
        T_inf = json_files['T_inf']
        N_inf = json_files['N_inf']
        T_death = json_files['T_death']
        CFR = json_files['CFR']
        bounds = {'beta':float(beta),'T_inf':float(T_inf),'N_inf':float(N_inf),'T_death':float(T_death),'cfr':float(CFR)}
        dataset = pd.DataFrame(json_files['Cases'])
        model = pysir.SIRD(int(populacao)) 
        history = model.fit(data=dataset)
        y_pred = model.predict(data=dataset, look_forward=30)
        pred_json = str('{"confirmed":' + str(y_pred["confirmed"].values).replace(".",",")[:-2] + '],"deaths":' + str(y_pred["deaths"].values).replace(".",",")[:-2] + ']}')
        return Response(response=pred_json, status=200, mimetype='application/json')
    except Exception as ex:
        return Response(response=str(ex), status=400)

@app.route('/api/cases/ia/calculate', methods=['POST'])
@cross_origin(headers=['Content-Type'])
def cases_ia_calculate():

    try:
        json_files = request.get_json(force = True)

        dataframe = pd.DataFrame(json_files['Cases'])
        cols_to_drop = ['c{}1valor'.format(i) for i in range(1,9)]
        cols_to_drop.append('recovered')
        dataframe = dataframe.drop(columns=cols_to_drop)


        dataframe = dataframe.rename(columns={'id':'Date',
            'name':'Country/Region',
            'confirmed':'Confirmed',
            'deaths':'Deaths',
            'c10valor':'C1',
            'c20valor':'C2',
            'c30valor':'C3',
            'c40valor':'C4',
            'c50valor':'C5',
            'c60valor':'C6', 
            'c70valor':'C7',
            'c80valor':'C8'})

        last_endpoint = dataframe.tail(4)

        y_casosconfirmados = metamodel_confirmed.predict(last_endpoint)
        y_obitos = metamodel_deaths.predict(last_endpoint)

        return jsonify({"confirmed": y_casosconfirmados[0].tolist(),"deaths": y_obitos[0].tolist()})
    except Exception as ex:
        return Response(response=str(ex), status=417)

@app.route('/api/invoices/ia/calculate', methods=['POST'])
@cross_origin(headers=['Content-Type'])
def invoices_api():
    try:
        json_files = request.get_json(force = True)

        dataset = pd.DataFrame(json_files)
        x_columns_qtde = ["day_of_week", "populacao", "Deaths", "Confirmed","Qtde Autorizados", "Qtde Autorizados_2019_mean",'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']
        x_columns_value = ["day_of_week", "populacao", "Deaths", "Confirmed","Valor Autorizados", "Valor Autorizados_2019_mean",'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']

        x_qtde,_ = generate_regions_dataset("Country/Region",dataset, 4, 30, x_columns_qtde, gen_x=True, gen_y=False)
        x_value,_ = generate_regions_dataset("Country/Region",dataset, 4, 30, x_columns_value,gen_x=True, gen_y=False)
        x_scaled_qtde = create_dataset_qtde(model_confirmed_invoices, model_deaths_invoices, normalizador_confirmed_invoices,normalizador_deaths_invoices,x_scaler_qtde_invoices,x_qtde,4)
        x_scaled_value = create_dataset_value(model_confirmed_invoices, model_deaths_invoices, normalizador_confirmed_invoices,normalizador_deaths_invoices,x_scaler_value_invoices,x_value,4)
        x_scaled_qtde= np.reshape(x_scaled_qtde,(x_scaled_qtde.shape[0],1, x_scaled_qtde.shape[1]))

        y_scaled_qtde = modelo_qtde_invoices.predict(x_scaled_qtde) 

        quantidade = y_scaler_qtde_invoices.inverse_transform(y_scaled_qtde)
        x_scaled_value= np.reshape(x_scaled_value,(x_scaled_value.shape[0],1,x_scaled_value.shape[1]))

        y_scaled_value = modelo_value_invoices.predict(x_scaled_value) 

        valor = y_scaler_value_invoices.inverse_transform(y_scaled_value)
        return jsonify({"quantity": np.around(quantidade[-1].tolist(),decimals=0).tolist(),"value": np.around(valor[-1].tolist(),decimals=2).tolist()})
    except Exception as ex:
        return Response(response=str(ex), status=417)

@app.route('/api/inflex_peak', methods=['POST'])
@cross_origin(headers=['Content-Type'])
def inflex_peak_api():
    json_files = request.get_json(force = True)
    dataset = pd.DataFrame(json_files['Cases'])

    colunas = ['id','name','confirmed','recovered','deaths','c10valor','c11valor','c20valor','c21valor','c30valor','c31valor','c40valor','c41valor','c50valor','c51valor','c60valor','c61valor','c70valor','c71valor','c80valor','c81valor']

    dataset = dataset.rename(columns={'id':'Datas',
        'name':'Name',
        'confirmed':'Confirmed',
        'recovered':'Recovered',
        'deaths':'Deaths',
        'c10valor':'C1.0',
        'c11valor':'C1.1',
        'c20valor':'C2.0',
        'c21valor':'C2.1',
        'c30valor':'C3.0',
        'c31valor':'C3.1',
        'c40valor':'C4.0',
        'c41valor':'C4.1',
        'c50valor':'C5.0',
        'c51valor':'C5.1',
        'c60valor':'C6.0',
        'c61valor':'C6.1',
        'c70valor':'C7.0',
        'c71valor':'C7.1',
        'c80valor':'C8.0',
        'c81valor':'C8.1'})

    x_columns = ["Name","Deaths","Confirmed","C1.1","C2.1","C3.1","C4.1","C5.1","C6.1","C7.1","C8.1"]
    dataset = dataset[x_columns]

    x_columns_inflexao = ['Deaths', 'Confirmed', 'C1.1', 'C2.1', 'C3.1', 'C4.1', 'C5.1', 'C6.1', 'C7.1', 'C8.1']

    y_columns_inflexao = ['peak', 'postinflex', 'preinflex']

    lookback=25
    lookforward=0

    x_inflexao, _ = generate_regions_dataset("Name",dataset, lookback, lookforward, x_columns_inflexao, y_columns=y_columns_inflexao,gen_x=True, gen_y=False)

    x_last = x_inflexao[-1:]

    x_scaled_inflexao = x_scaler_inflexao.transform(x_last)


    x_scaled_inflexao= np.reshape(x_scaled_inflexao,(x_scaled_inflexao.shape[0],x_scaled_inflexao.shape[1], 1))


    y_scaled_inflexao = modelo_inflexao.predict(x_scaled_inflexao) 


    y_inflexao = y_scaler_inflexao.inverse_transform(y_scaled_inflexao)

    peak = y_inflexao[0,0]
    y_inflexao_ant=y_inflexao[0,2]
    y_inflexao_post=y_inflexao[0,1]
    return jsonify({"peak":str(int(peak)),"inflex_up":str(int(y_inflexao_ant)),"inflex_down":str(int(y_inflexao_post))})

############################################################
####                     Otimização                     ####
############################################################

@app.route('/api/otimization/', methods=['POST'])
@cross_origin(headers=['Content-Type'])
def otimization_calculate():
    erro = 0
    try:
        json_files = request.get_json(force = True)
        start_time_geral = datetime.datetime.now() 
        dados_reais = pd.DataFrame(json_files['CCOC'])
        cols_to_drop = ['c{}1valor'.format(i) for i in range(1,9)]
        cols_to_drop.append('recovered')
        dados_reais = dados_reais.drop(columns=cols_to_drop)
        dados_reais.columns = [
            'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8',
            'Confirmed', 'Deaths', 'Date', 'Country/Region'
        ]

        df_nf = pd.DataFrame(json_files['Invoices'])
        dados_selecao = dados_reais.reset_index(drop=True)
        lookback = 4
        #EXTRAÇÃO DOS ÚLTIMOS MOMENTOS DA SÉRIE
        ultimos_momentos = df_nf.tail(lookback).reset_index(drop=True)
        # EXTRAÇÃO DAS DATAS DE FIM DA SÉRIE E DE INÍCIO
        ultima_data = ultimos_momentos.loc[lookback-1,"Date"]
        data_inicio_pred = datetime.datetime.strptime(ultima_data,'%d/%m/%Y') + timedelta(days = 1)

        # CRIAÇÃO DE TODAS AS COMBINAÇÕES POSSÍVEIS 
        frag_cenario = list(itertools.product([0, 1], repeat=8))

        #CRIANDO DATAFRAME PARA CADA POSSIBILIDADE
        cenarios_possiveis = []
        for j in range(0,len(frag_cenario)):
            cenario = ultimos_momentos.copy()
            #### INSERINDO UMA COMBINAÇÃO DE MEDIDAS DE MITIGAÇÃO
            cenario.loc[lookback-1,["C1","C2","C3","C4","C5","C6","C7","C8"]] = frag_cenario[j]
            cenarios_possiveis.append(cenario)

        start_time = datetime.datetime.now()

        #### PREDICÃO CASOS CONFIRMADOS
        lista_df_predicoes_cc = []
        lista_df_predicoes_cc_norm = []   
        i=1
        for cenario in cenarios_possiveis:
            pred_metamodel_cc_norm = metamodel_confirmed.predict(cenario, scale=False)
            pred_metamodel_cc = metamodel_confirmed.predict(cenario)

            lista_df_predicoes_cc_norm.append(pred_metamodel_cc_norm)
            lista_df_predicoes_cc.append(pred_metamodel_cc)
            i=i+1

        time_elapsed = datetime.datetime.now() - start_time 

        dRan1 = pd.date_range(start =str(data_inicio_pred), periods=30, freq ='D')

        All_otimizacao_Casos_Confirmados, otimizacao_Casos_Confirmados = melhor_caso("min",frag_cenario, lista_df_predicoes_cc)
        All_otimizacao_Casos_Confirmados.sort_values(["Somatório"])

        otimizacao_Casos_Confirmados.reset_index(drop= True)

        #### SOLUÇÃO EM NUMPY (MEDIDA DE MITIGAÇÃO)
        otimizacao_Casos_Confirmados[["C1","C2","C3","C4","C5","C6","C7","C8"]].values

        #### VALORES PREDITOS
        buscador_id = otimizacao_Casos_Confirmados.reset_index(drop= True).loc[0,"ID"]
        df_pred_cc = pd.DataFrame(columns = ["Confirmed","Date"])
        df_pred_cc["Confirmed"] = lista_df_predicoes_cc[buscador_id].reshape(-1)
        df_pred_cc["Date"] = dRan1
        df_pred_cc["Confirmed"] = df_pred_cc["Confirmed"].round(0)
        #df_pred_cc

        #### SOLUÇÃO EM NUMPY (VALORES PREDITOS)
        df_pred_cc["Confirmed"].values

        dRan1 = pd.date_range(start =str(data_inicio_pred), periods=30, freq ='D')

        start_time = datetime.datetime.now() 

        #### PREDCÃO MORTES CONFIRMADAS
        lista_df_predicoes_mc = []  
        lista_df_predicoes_mc_norm = []
        i=1
        for cenario in cenarios_possiveis:
            pred_metamodel_mc_norm = metamodel_deaths.predict(cenario, scale=False)
            pred_metamodel_mc = metamodel_deaths.predict(cenario)

            lista_df_predicoes_mc_norm.append(pred_metamodel_mc_norm)
            lista_df_predicoes_mc.append(pred_metamodel_mc)
            i=i+1

        time_elapsed = datetime.datetime.now() - start_time 

        dRan1 = pd.date_range(start =str(data_inicio_pred), periods=30, freq ='D')

        All_otimizacao_Mortes_Confirmadas, otimizacao_Mortes_Confirmadas = melhor_caso("min",frag_cenario, lista_df_predicoes_mc)
        All_otimizacao_Mortes_Confirmadas.sort_values(["Somatório"])

        otimizacao_Mortes_Confirmadas.reset_index(drop= True)

        #### SOLUÇÃO EM NUMPY (MEDIDA DE MITIGAÇÃO)
        otimizacao_Mortes_Confirmadas[["C1","C2","C3","C4","C5","C6","C7","C8"]].values

        #### VALORES PREDITOS
        buscador_id = otimizacao_Mortes_Confirmadas.reset_index(drop= True).loc[0,"ID"]
        df_pred_mc = pd.DataFrame(columns = ["Deaths","Date"])
        df_pred_mc["Deaths"] = lista_df_predicoes_mc[buscador_id].reshape(-1)
        df_pred_mc["Date"] = dRan1
        df_pred_mc["Deaths"] = df_pred_mc["Deaths"].round(0)

        #### SOLUÇÃO EM NUMPY (VALORES PREDITOS)
        df_pred_mc["Deaths"].values

        dRan1 = pd.date_range(start =str(data_inicio_pred), periods=30, freq ='D')

        # NOVO
    

        dados_selecao = pd.DataFrame(json_files['Invoices'])

        nf_qtd_2019 = df_nf.loc[0,"Qtde Autorizados_2019_mean"]
        nf_vlr_2019 = df_nf.loc[0,"Valor Autorizados_2019_mean"]
        regiao_pop = df_nf.loc[0,"populacao"]
        selecao_1 = df_nf.loc[0,"Country/Region"]


        df_nf_2020_qtd = pd.DataFrame(json_files['Invoices']['Qtde Autorizados'])
        df_nf_2020_qtd['data'] = df_nf['Date'].apply(lambda x: datetime.datetime.strptime(x,'%d/%m/%Y'))

        df_nf_2020_vlr = pd.DataFrame(json_files['Invoices']['Valor Autorizados'])
        df_nf_2020_vlr['data'] = df_nf['Date'].apply(lambda x: datetime.datetime.strptime(x,'%d/%m/%Y'))

        # O MODELO UTILZA A IDEIA DO LOOKBACK PARA O DESENVOLVIMENTO DE PREDICAO...
        lookback_modelo_nf = 4
        lookforward_modelo_nf = 30
        ultimos_momentos_para_nf = dados_selecao.iloc[-lookback_modelo_nf:,:]
        ultimos_momentos_para_nf = ultimos_momentos_para_nf.reset_index(drop=True)

        df_columns = ["day_of_week", "populacao", "Deaths", "Confirmed","Qtde Autorizados","Valor Autorizados", "Qtde Autorizados_2019_mean","Valor Autorizados_2019_mean",'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']

        complemento_df = pd.DataFrame(columns = df_columns)
        complemento_df["Confirmed"] = ultimos_momentos_para_nf["Confirmed"]
        complemento_df["Deaths"] = ultimos_momentos_para_nf["Deaths"]
        complemento_df["Country/Region"] = selecao_1
        complemento_df["populacao"] = regiao_pop
        complemento_df["Date"] = ultimos_momentos_para_nf["Date"]
        complemento_df["day_of_week"] = ultimos_momentos_para_nf["day_of_week"]#.dt.dayofweek
        complemento_df["Qtde Autorizados"] = df_nf["Qtde Autorizados"].tail(lookback_modelo_nf).reset_index(drop=True)
        complemento_df["Valor Autorizados"] = df_nf["Valor Autorizados"].tail(lookback_modelo_nf).reset_index(drop=True)
        complemento_df["Qtde Autorizados_2019_mean"] = nf_qtd_2019
        complemento_df["Valor Autorizados_2019_mean"] = nf_vlr_2019
        complemento_df.loc[:, ["C1","C2","C3","C4","C5","C6","C7","C8"]] = ultimos_momentos_para_nf.loc[:, ["C1","C2","C3","C4","C5","C6","C7","C8"]]
        complemento_df = complemento_df.reset_index(drop=True)

        qtd_nf_predicoes_possiveis = pred_possibilidades_nf("qtd", frag_cenario, lookback_modelo_nf, lookforward_modelo_nf, x_scaler_qtde_invoices, y_scaler_qtde_invoices, modelo_qtde_invoices,complemento_df,lista_df_predicoes_cc,lista_df_predicoes_mc,lista_df_predicoes_cc_norm,lista_df_predicoes_mc_norm)

        dRan1 = pd.date_range(start =str(data_inicio_pred), periods=30, freq ='D')

        All_otimizacao_qtd_nf, otimizacao_qtd_nf = melhor_caso("max",frag_cenario, qtd_nf_predicoes_possiveis)
        All_otimizacao_qtd_nf.sort_values(["Somatório"])

        otimizacao_qtd_nf.reset_index(drop= True)

        #### SOLUÇÃO EM NUMPY (MEDIDA DE MITIGAÇÃO)
        otimizacao_qtd_nf[["C1","C2","C3","C4","C5","C6","C7","C8"]].values

        #### VALORES PREDITOS
        buscador_id = otimizacao_qtd_nf.reset_index(drop= True).loc[0,"ID"]
        df_pred_qtd_nf = pd.DataFrame(columns = ["Quantidade","Date"])
        df_pred_qtd_nf["Quantidade"] = qtd_nf_predicoes_possiveis[buscador_id].reshape(-1)
        df_pred_qtd_nf["Date"] = dRan1
        df_pred_qtd_nf["Quantidade"] = df_pred_qtd_nf["Quantidade"].round(0)

        #### SOLUÇÃO EM NUMPY (VALORES PREDITOS)
        df_pred_qtd_nf["Quantidade"].values

        dRan1 = pd.date_range(start =str(data_inicio_pred), periods=30, freq ='D')

        valor_nf_predicoes_possiveis = pred_possibilidades_nf("vlr", frag_cenario, lookback_modelo_nf, lookforward_modelo_nf, x_scaler_value_invoices, y_scaler_value_invoices, modelo_value_invoices,complemento_df,lista_df_predicoes_cc,lista_df_predicoes_mc,lista_df_predicoes_cc_norm,lista_df_predicoes_mc_norm)

        dRan1 = pd.date_range(start =str(data_inicio_pred), periods=30, freq ='D')

        All_otimizacao_valor_nf, otimizacao_valor_nf = melhor_caso("max",frag_cenario, valor_nf_predicoes_possiveis)
        All_otimizacao_valor_nf.sort_values(["Somatório"])

        otimizacao_valor_nf.reset_index(drop= True)

        #### SOLUÇÃO EM NUMPY (MEDIDA DE MITIGAÇÃO)
        otimizacao_valor_nf[["C1","C2","C3","C4","C5","C6","C7","C8"]].values

        #### VALORES PREDITOS
        buscador_id = otimizacao_qtd_nf.reset_index(drop= True).loc[0,"ID"]
        df_pred_vlr_nf = pd.DataFrame(columns = ["Valor","Date"])
        df_pred_vlr_nf["Valor"] = valor_nf_predicoes_possiveis[buscador_id].reshape(-1)
        df_pred_vlr_nf["Date"] = dRan1
        df_pred_vlr_nf["Valor"] = df_pred_vlr_nf["Valor"].round(0)

        #### SOLUÇÃO EM NUMPY (VALORES PREDITOS)
        df_pred_vlr_nf["Valor"].values

        dRan1 = pd.date_range(start =str(data_inicio_pred), periods=30, freq ='D')

        df_distancias = melhor_caso_geral(frag_cenario, All_otimizacao_Casos_Confirmados, All_otimizacao_Mortes_Confirmadas, All_otimizacao_qtd_nf, All_otimizacao_valor_nf)

        #### VERIFICAÇÃO DE TODAS AS DISTÂNCIAS
        df_distancias[0]

        #### VERIFICAÇÃO DA SOLUÇÃO ÓTIMA 

        buscador_id = df_distancias[1].reset_index(drop= False).loc[0,"ID"]
        df_pred_dist = pd.DataFrame(columns = ["Pred Quantidade","Pred Valor","Pred Confirmados","Pred Mortes","Date"])
        df_pred_dist["Pred Quantidade"] = qtd_nf_predicoes_possiveis[buscador_id].reshape(-1)
        df_pred_dist["Pred Valor"] = valor_nf_predicoes_possiveis[buscador_id].reshape(-1)
        df_pred_dist["Pred Confirmados"] = lista_df_predicoes_cc[buscador_id].reshape(-1)
        df_pred_dist["Pred Mortes"] = lista_df_predicoes_mc[buscador_id].reshape(-1)
        df_pred_dist = df_pred_dist.round(0)
        df_pred_dist["Date"] = dRan1
        df_pred_dist

        df_pred_dist[["Pred Quantidade","Pred Valor","Pred Confirmados","Pred Mortes"]].values
        

        time_elapsed_geral = datetime.datetime.now() - start_time_geral 

        
        confirmados = df_pred_cc["Confirmed"].values

        mitigacao_confirmados = otimizacao_Casos_Confirmados[["C1","C2","C3","C4","C5","C6","C7","C8"]].values

        obitos = df_pred_mc["Deaths"].values

        mitigacao_obitos = otimizacao_Mortes_Confirmadas[["C1","C2","C3","C4","C5","C6","C7","C8"]].values

        valor = df_pred_vlr_nf["Valor"].values

        qtde = df_pred_qtd_nf["Quantidade"].values

        temp_mitigacao_melhor_cenario = df_distancias[1]

        mitigacao_melhor_cenario = temp_mitigacao_melhor_cenario[["C1","C2","C3","C4","C5","C6","C7","C8"]].values

        return jsonify({"Datas": df_pred_dist["Date"].tolist(),"Serie_Confirmados":{"confirmed": confirmados.tolist(),"mitigacao": mitigacao_confirmados[0].tolist()},
            "Serie_Obitos":{"obitos": obitos.tolist(),"mitigacao": mitigacao_obitos[0].tolist()},
            "Serie_Valor":{"valor": valor.tolist(),"mitigacao": otimizacao_valor_nf[["C1","C2","C3","C4","C5","C6","C7","C8"]].values[0].tolist()},
            "Serie_Quantidade":{"quantidade": qtde.tolist(),"mitigacao": otimizacao_qtd_nf[["C1","C2","C3","C4","C5","C6","C7","C8"]].values[0].tolist()},
            "Serie_MelhorCenario":{"confirmed": df_pred_dist["Pred Confirmados"].values.tolist(),"obitos": df_pred_dist["Pred Mortes"].values.tolist(),"valor": df_pred_dist["Pred Valor"].values.tolist(),"quantidade": df_pred_dist["Pred Quantidade"].values.tolist(),"mitigacao":mitigacao_melhor_cenario[0].tolist()}})

    except Exception as ex:
        return Response(response="Erro n {0}: {1}".format(str(erro),str(ex)), status=400)

############################################################
####                     Diagnosis                      ####
############################################################
@app.route('/api/xray', methods=['POST'])
@cross_origin()
def xray_api():
    uploaded_files = request.files.getlist("files")

    imgs_dict = {}
    images = request.files.to_dict() #convert multidict to dict
    for image in images:     #image will be the key 
        file_name = images[image].filename
        name = images[image].name
        images[image].save(os.path.join('/files/static/uploads/', file_name))
        imgs_dict.update({name: file_name})

    lista = xray_def(imgs_dict)

    data = jsonpickle.encode(lista)

    try:
        for image in images:
            os.remove('/files/static/uploads/' + images[image].filename)
    except:
        pass

    return Response(response=data, status=200)

@app.route('/api/tc', methods=['POST'])
@cross_origin()
def tc_api():
    uploaded_files = request.files.getlist("files")

    imgs_dict = {}
    images = request.files.to_dict() #convert multidict to dict
    for image in images:     #image will be the key 
        file_name = images[image].filename
        name = images[image].name
        images[image].save(os.path.join('/files/static/uploads/', file_name))
        imgs_dict.update({name: file_name})

    lista = tc_def(imgs_dict)

    data = jsonpickle.encode(lista)

    try:
        for image in images:
            os.remove('/files/static/uploads/' + images[image].filename)
    except:
        pass

    return Response(response=data, status=200)

@app.route('/api/dicom', methods=['POST'])
@cross_origin()
def dicom_api():
    uploaded_files = request.files.getlist("files")

    imgs_dict = {}
    images = request.files.to_dict() #convert multidict to dict
    for image in images:     #image will be the key 
        file_name = images[image].filename
        name = images[image].name
        images[image].save(os.path.join('/files/static/uploads/', file_name))
        imgs_dict.update({name: file_name})

    lista = dicom_def(imgs_dict)

    data = jsonpickle.encode(lista)

    try:
        for image in images:
            os.remove('/files/static/uploads/' + images[image].filename)
    except:
        pass

    return Response(response=data, status=200)

############################################################
####                      STATUS                        ####
############################################################

@app.route('/api/status/', methods=['GET'])
def check_status():
    return Response(response="Servidor Funcional", status=200)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
