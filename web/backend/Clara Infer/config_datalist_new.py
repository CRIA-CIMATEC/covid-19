#!/usr/bin/env python
# coding: utf-8


import json, os, glob, shutil, sys, getopt


# In[ ]:
# shutil.rmtree('./clara_train_covid19_ct_lung_seg_v1/eval',ignore_errors=True)

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
    
    print('arg_file:',arg_file)

    ts_images = getListOfFiles(os.path.join(os.getcwd(),'UPLOAD_IMAGES'))

    ts_images = [s for s in ts_images if arg_file in s]

    ok=True

    for ts_image in ts_images:
        
        if not ts_image.endswith('.nii.gz') or ts_image.endswith('.nii'):
            print('Imagem em formato inválido, só são aceitas imagens no formato ".nii" e .nii.gz')
            ok=False


    # In[33]:



    if ok:
      
      # lê json
      json_file_path = './clara_train_covid19_ct_lung_seg_v1/config/original/datalist.json'
      key_list = list()
      with open(json_file_path, 'r') as j:
           contents = json.loads(j.read())
     
      # apaga conteudo de inferência       
      new_contents = contents.copy()
      del new_contents['my_infer_key']
      
      # transformando lista de inferencia em dicionário
      ts_dict = list()
      for i in range(len(ts_images)):
          my_dict = {'image':ts_images[i]} 
          ts_dict.append(my_dict)
      print('Quantidade de imagens para treinamento:',(len(ts_images)))
      print('Keys add:',len(ts_dict))
      
      # inserindo dicionario de inferència no json
      new_contents['my_infer_key']=ts_dict
      
      # salvando novo json
      out_path = './clara_train_covid19_ct_lung_seg_v1/config'
      with open(os.path.join(out_path,'datalist.json'), 'w') as fp:
          json.dump(new_contents, fp,indent=4)

if __name__ == "__main__":
   main(sys.argv[1:])