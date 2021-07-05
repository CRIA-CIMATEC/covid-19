import tensorflow as tf
import cv2
import numpy as np
import pandas as pd
import json
import shutil
import os
import pickle
from collections import Counter
from callback import MultipleClassAUROC, MultiGPUModelCheckpoint
from configparser import ConfigParser
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, TensorBoard, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import multi_gpu_model
from tensorflow.keras.models import load_model
from models.keras import ModelFactory
import matplotlib.pyplot as plt
plt.switch_backend('agg')



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


def main():
    # parser config
    config_file = "./config.ini"
    cp = ConfigParser()
    cp.read(config_file)

    # default config
    output_dir = cp["DEFAULT"].get("output_dir")
    image_source_dir = cp["DEFAULT"].get("image_source_dir")
    base_model_name = cp["DEFAULT"].get("base_model_name")
    class_names = cp["DEFAULT"].get("class_names").split(",")

    # train config
    use_base_model_weights = cp["TRAIN"].getboolean("use_base_model_weights")
    use_trained_model_weights = cp["TRAIN"].getboolean("use_trained_model_weights")
    use_best_weights = cp["TRAIN"].getboolean("use_best_weights")
    output_weights_name = cp["TRAIN"].get("output_weights_name")
    epochs = cp["TRAIN"].getint("epochs")
    batch_size = cp["TRAIN"].getint("batch_size")
    initial_learning_rate = cp["TRAIN"].getfloat("initial_learning_rate")
    generator_workers = cp["TRAIN"].getint("generator_workers")
    image_dimension = cp["TRAIN"].getint("image_dimension")
    train_steps = cp["TRAIN"].get("train_steps")
    patience_reduce_lr = cp["TRAIN"].getint("patience_reduce_lr")
    min_lr = cp["TRAIN"].getfloat("min_lr")
    validation_steps = cp["TRAIN"].get("validation_steps")
    positive_weights_multiply = cp["TRAIN"].getfloat("positive_weights_multiply")
    dataset_csv_dir = cp["TRAIN"].get("dataset_csv_dir")
    
    
    df_train = pd.read_csv('../base_covid_24fev2021_cropped_aug.csv', dtype='str')

    
    df_val = df_train[df_train['divisao'] == 'validacao']
    
    
    df_train['covid19'] = 'X' #Cria coluna default do tensorflow
    df_train.loc[(df_train['classe']=='covid19'), 'covid19']=1
    df_train.loc[(df_train['classe']=='anormal'), 'covid19']=0
    df_train.loc[(df_train['classe']=='normal'), 'covid19']=0
    df_train['covid19'] = df_train['covid19'].astype(str)
    
    df_val['covid19'] = 'X' #Cria coluna default do tensorflow
    df_val.loc[(df_val['classe']=='covid19'), 'covid19']=1
    df_val.loc[(df_val['classe']=='anormal'), 'covid19']=0
    df_val.loc[(df_val['classe']=='normal'), 'covid19']=0
    df_val['covid19'] = df_val['covid19'].astype(str)
    
    
  
    #df_train = df_train[df_train['divisao'] != 'teste']
    
    
    train_datagen = ImageDataGenerator(rescale = 1./255,
                                       preprocessing_function=run_equilize,
                                  )

    valida_datagen = ImageDataGenerator(rescale = 1./255,
                                        preprocessing_function=run_equilize,
                                   )
    train_generator = train_datagen.flow_from_dataframe(
    df_train,
    x_col="filename",
    y_col="covid19",
    interpolation='nearest',
    target_size=(299, 299),
    batch_size=batch_size,
    class_mode='binary',
    shuffle= True,
    subset=None)

    validation_generator = valida_datagen.flow_from_dataframe(
        df_val,
        x_col="filename",
        y_col="covid19",
        interpolation='nearest',
        target_size=(299, 299),
        batch_size=batch_size,
        class_mode='binary',
        shuffle= True,
        subset=None)
        
    model_factory = ModelFactory()
    model = model_factory.get_model(
        class_names,
        model_name=base_model_name,
        use_base_weights=use_base_model_weights,
        input_shape=(image_dimension, image_dimension, 3))

    print(model.summary())
        
    output_weights_path = os.path.join(output_dir, output_weights_name)
    print(f"** set output weights path to: {output_weights_path} **")
    print("** check multiple gpu availability **")
    print("Num GPUs Available: ", len(tf.config.experimental.list_physical_devices('GPU')))
    gpus = len(os.getenv("CUDA_VISIBLE_DEVICES", "1").split(","))
    if gpus > 1:
        print(f"** multi_gpu_model is used! gpus={gpus} **")
        model_train = multi_gpu_model(model,gpus, cpu_merge=True, cpu_relocation=False)
        # FIXME: currently (Keras 2.1.2) checkpoint doesn't work with multi_gpu_model
        checkpoint = MultiGPUModelCheckpoint(
            filepath=output_weights_path,
            monitor="val_loss",
            base_model=model,
            save_weights_only=True,
            save_best_only=True,
            verbose=1,
        )
    else:
        model_train = model
        checkpoint = ModelCheckpoint(
             output_weights_path,
             monitor="val_loss",
             base_model=model,
             save_weights_only=True,
             save_best_only=True,
             verbose=1,
        )

    print("** compile model with class weights **")
    optimizer = Adam(lr=initial_learning_rate)
   
    callbacks = [
        checkpoint,
        TensorBoard(log_dir=os.path.join(output_dir, "logs"), batch_size=batch_size),
        ReduceLROnPlateau(monitor='val_loss', factor=0.1, patience=patience_reduce_lr,
                        verbose=1, mode="min", min_lr=min_lr),
        tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
    ]

    print("** start training **")
    learning_rate = initial_learning_rate
    model_train.compile(optimizer=optimizer, loss="binary_crossentropy", metrics=['acc'])
    history = model_train.fit(train_generator,
        steps_per_epoch=len(df_train)//batch_size,
        epochs=100,
        validation_data = validation_generator,
        validation_steps=len(df_val)//batch_size,
        callbacks=callbacks,
        use_multiprocessing=True,
        workers=generator_workers,
        shuffle=False,
    )
    model_train.save("covid_model.h5")
    model_train.save_weights("covid_model_weight.h5")

    print(history.history)
    plt.figure(num=1, figsize=(20,10))
    plt.title('Loss')
    plt.plot(history.history['loss'], label='Train')
    plt.plot(history.history['val_loss'], label='Validation')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.savefig('loss.png')

    plt.clf()
    plt.figure(num=1, figsize=(20,10))
    plt.title('Accuracy')
    plt.plot(history.history['acc'], label='Train')
    plt.plot(history.history['val_acc'], label='Validation')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.savefig('acc.png')

if __name__ == "__main__":
    main()
