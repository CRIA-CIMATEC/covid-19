import os
import sys
from tensorflow.keras.layers import AveragePooling2D, Dropout, Flatten, Dense, Input
from tensorflow.keras.models import Model, load_model, save_model
from tensorflow.keras.optimizers import Adam, SGD
from tensorflow.keras.utils import to_categorical
from tensorflow.keras import optimizers, models, layers
from tensorflow.keras.applications.inception_v3 import InceptionV3
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, CSVLogger, TensorBoard, ReduceLROnPlateau
from tensorflow.keras.preprocessing.image import ImageDataGenerator#, img_to_array, load_img
from tensorflow.keras.utils import multi_gpu_model
from tensorflow.keras import regularizers

from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.model_selection import train_test_split

from sklearn.metrics import roc_curve, roc_auc_score, precision_recall_curve, auc
from sklearn.metrics import classification_report, confusion_matrix, average_precision_score

from itertools import cycle
from imutils import paths
import matplotlib.pyplot as plt

import numpy as np
from numpy import interp
import cv2
import glob

import datetime
import shutil

import pandas as pd

from collections import Counter


df = pd.read_csv('../datasets/2xcovid_7agosto_aug.csv', dtype='str')

df.loc[(df['class']=='covid19'), 'class']=1
df.loc[(df['class']=='anormal'), 'class']=0
df.loc[(df['class']=='normal'), 'class']=0
df['class'] = df['class'].astype(str)


training_dataset = df[(df['partition']=='training')]
training_dataset = training_dataset.append(df[(df['partition']=='test')], ignore_index=True)
validation_dataset = df[(df['partition']=='validation')]


prefixo = datetime.datetime.now().strftime('%d_%m_%H_%M_%S_trello_bin')
os.makedirs('./models/'+ prefixo, exist_ok = True)
output_folder = './models/'+prefixo+'/'



width = 299
height = width

# set learning rate, epochs and batch size
INIT_LR = 1e-3    # This value is specific to what model is chosen: Inception, VGG or ResnNet.
EPOCHS =100
BS = 32 #batch_size


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
    


############################################
train_datagen = ImageDataGenerator(rescale = 1./255,
                    preprocessing_function=run_equilize,
                                  )

valida_datagen = ImageDataGenerator(rescale = 1./255,
                    preprocessing_function=run_equilize,
                    )

############################################
train_generator = train_datagen.flow_from_dataframe(
    training_dataset,
    x_col='filename',
    interpolation='nearest',
    target_size=(height, width),
    batch_size=BS,
    class_mode='binary',
    shuffle= True,
    subset=None)


############################################


validation_generator = valida_datagen.flow_from_dataframe(
    validation_dataset,
    x_col='filename',
    interpolation='nearest',
    target_size=(height, width),
    batch_size=BS,
    class_mode='binary',
    shuffle= True,
    subset=None)

baseModel = InceptionV3(weights='imagenet', include_top=False, input_tensor=Input(shape=(width, height, 3)))

#Add on a couple of custom CNN layers on top of the Inception V3 model. 
headModel = baseModel.output
headModel = AveragePooling2D(pool_size=(4, 4))(headModel)
headModel = Flatten(name="flatten")(headModel)
headModel = Dense(128, activation="relu")(headModel) 
headModel = Dropout(0.5)(headModel)
headModel = Dense(1, activation="sigmoid")(headModel)

# Compose the final model
model = Model(inputs=baseModel.input, outputs=headModel)

#model = multi_gpu_model(model, 2, cpu_merge=True, cpu_relocation=False)

model.compile(loss="binary_crossentropy", optimizer='SGD', metrics=["accuracy"])


csv_log = CSVLogger(output_folder +'log_rede_inception.log')
filepath=(output_folder +'{epoch:02d}_AC{accuracy:.3f}_VAC{val_accuracy:.3f}_L{loss:.5f}_VL{val_loss:.5f}.h5')

patience_reduce_lr=1
min_lr=1e-8 
output_dir =  './TensorBoard_log/'
callbacks = [
            ModelCheckpoint(filepath,
                                  monitor='val_accuracy',
                                  include_optimizer=False,
                                  save_best_only=False),

            ReduceLROnPlateau(monitor='val_loss', factor=0.1, patience=patience_reduce_lr,
                              verbose=1, mode="min", min_lr=min_lr),
            EarlyStopping(monitor='val_accuracy', patience=10, restore_best_weights=True), csv_log]

H = model.fit(
    train_generator,
    steps_per_epoch=len(training_dataset)//BS,
    epochs=100,
    validation_data = validation_generator,
    validation_steps=len(validation_dataset)//BS,
    callbacks=callbacks,
    use_multiprocessing=True,
    workers=4,
    verbose=1)


model_train.save("anormal_model.h5")
model_train.save_weights("anormal_model_weights.h5")



training_log = pd.read_csv(output_folder + 'log_rede_inception.log')

fig_acc = plt.figure(figsize=(10, 4))
plt.plot(training_log['accuracy'], linewidth=1, label='Train_accuracy')
plt.plot(training_log['val_accuracy'], linewidth=1, label='Val_accuracy')
plt.tick_params(labelsize = 14)
plt.title('Train Model Accuracy', fontsize=14)
plt.legend(loc='best', fontsize=12, ncol=4)
plt.ylim(0,1)
plt.xlabel('Epochs', fontsize=14)
plt.ylabel('Loss', fontsize=14)
plt.tight_layout()
plt.close()
plt.savefig(pasta_saida +'model_loss.png', dpi=14)


fig_loss = plt.figure(figsize=(10, 4))
plt.plot(training_log['loss'], linewidth=1, label='Train_loss')
plt.plot(training_log['val_loss'], linewidth=1, label='Val_loss')
plt.tick_params(labelsize = 14)
plt.ylim(0,1)
plt.title('Train Model loss', fontsize=14)
plt.legend(loc='best', fontsize=12, ncol=4)
plt.xlabel('Epochs', fontsize=14)
plt.ylabel('Loss', fontsize=14)
plt.tight_layout()
plt.close()
plt.savefig(pasta_saida +'model_loss.png', dpi=14)



