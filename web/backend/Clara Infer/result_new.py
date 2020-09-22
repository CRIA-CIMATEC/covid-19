#!/usr/bin/env python
# coding: utf-8

# In[2]:


import pandas as pd
import matplotlib.pyplot as plt
import os, shutil, sys, getopt
import numpy as np


# In[4]:

def main(argv):


    arg_file = ''
    try:
        opts, args = getopt.getopt(argv,"hi:",["ifile="])
    except getopt.GetoptError:
        #print('test.py -i <file>')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print('test.py -i <inputfile> -o <outputfile>')
            sys.exit()
        elif opt in ("-i", "--ifile"):
            arg_file = arg
    #print('Input file is "', arg_file)


    df = pd.read_csv('./clara_train_covid19_3d_ct_classification_v1_2_etapa_AUG/eval/preds_model.csv',
                     header=None,names=['path','non-COVID','COVID'])

    # remove aval of seg model directory
    shutil.rmtree('./clara_train_covid19_ct_lung_seg_v1/eval',ignore_errors=True)

    # In[12]:


    files = df['path'].tolist()
    covid_prob = df['non-COVID'].tolist()
    non_covid_prob = df['COVID'].tolist()

    files = [s for s in files if arg_file in s]

    i = 0
    for file in files:
        #covid = "{:.0f}".format(covid_prob[i]*100)
        #retorno_json = str('"{}":[100,{},True]').format(file.split(os.path.sep)[-1],covid))
        try:
            arquivo = file.split(os.path.sep)[-1]
            n_cov = non_covid_prob[i]*100
            jsons = {'{}'.format(arquivo): ['100', '{:.0f}'.format(n_cov), 'True']}
            print(jsons)
        except Exception as ex:
            print(ex)
        #print({"laminas":["{:.0f}".format(100),"{:.0f}".format(covid_prob[i]*100),True]})
        #print('Probabilidades da imagem "%s"\nCOVID19: %s\nNão-COVID-19: %s\n'          %(file.split(os.path.sep)[-1],covid_prob[i],non_covid_prob[i]))

if __name__ == "__main__":
   main(sys.argv[1:])
# In[ ]: