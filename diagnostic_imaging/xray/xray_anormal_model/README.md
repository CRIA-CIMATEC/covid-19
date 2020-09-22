# Chest X ray Deep Learning tool – COVID-19

## Anormality Model
<p>The model has the function of identifying whether a chest X-ray examination shows any abnormality. In other words, the model identifies whether there is any anormality in the examination, but without identifying the cause.</p>

<p>The model is implemented using the Inception V3 architecture, a convolutional neural network to assist in image analysis and object detection, and started as a module for Googlenet. This architecture was adapted in its final layers to detect whether an x-ray scan is normal or abnormal. The model was trained with approximately 44 thousand images, 20% of which were used for validation and 10% for testing.</p>
