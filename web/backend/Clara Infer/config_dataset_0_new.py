#!/usr/bin/env python
# coding: utf-8

# In[ ]:


# Script para configurar json do modelo de classificação


# In[3]:


import json, os, sys, getopt


# In[4]:


def getListOfFiles(dirName):
    # create a list of file and sub directories 
    # names in the given directory 
    listOfFile = os.listdir(dirName)
    allFiles = list()
    # Iterate over all the entries
    for entry in listOfFile:
        # Create full path
        fullPath = os.path.join(dirName, entry)
        # If entry is a directory then get the list of files in this directory 
        if os.path.isdir(fullPath):
            allFiles = allFiles + getListOfFiles(fullPath)
        else:
            allFiles.append(fullPath)
                
    return allFiles


def main(argv):

    arg_file = ''
    try:
        opts, args = getopt.getopt(argv,"hi:",["ifile="])
    except getopt.GetoptError:
        print('test.py -i <file>')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print('test.py -i <inputfile> -o <outputfile>')
            sys.exit()
        elif opt in ("-i", "--ifile"):
            arg_file = arg
    print('Input file is "', arg_file)
    
    arg_file_filename = '%s'%arg_file
    arg_file_filename = arg_file_filename.split('.')[0]

    ts_masks = getListOfFiles(os.path.join(os.getcwd(),'clara_train_covid19_ct_lung_seg_v1/eval'))
    ts_masks = [s for s in ts_masks if arg_file_filename in s]
    
    ts_images = getListOfFiles(os.path.join(os.getcwd(),'UPLOAD_IMAGES'))
    ts_images = [s for s in ts_images if arg_file in s]

    ts_masks.sort()
    ts_images.sort()
    
#     print('ts_masks:',ts_masks)
#     print('ts_images:',ts_images)


    # In[33]:


    # lê json
    json_file_path = './clara_train_covid19_3d_ct_classification_v1_2_etapa_AUG/config/original/dataset_0.json'
    key_list = list()
    with open(json_file_path, 'r') as j:
         contents = json.loads(j.read())

    # apaga conteudo de inferência       
    new_contents = contents.copy()
    del new_contents['validation']

    # transformando lista de inferencia em dicionário
    ts_dict = list()
    for i in range(len(ts_images)):
        my_dict = {'image':ts_images[i],'label_image':ts_masks[i]}
        ts_dict.append(my_dict)

    # inserindo dicionario de inferència no json
    new_contents['validation']=ts_dict

    # salvando novo json
    out_path = './clara_train_covid19_3d_ct_classification_v1_2_etapa_AUG/config/'
    with open(os.path.join(out_path,'dataset_0.json'), 'w') as fp:
        json.dump(new_contents, fp,indent=4)

if __name__ == "__main__":
   main(sys.argv[1:])