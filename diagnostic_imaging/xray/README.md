# Chest X ray Deep Learning tool – COVID-19

<p align="center"><img width="650px" src="https://github.com/CRIA-CIMATEC/covid-19/blob/master/diagnostic_imaging/images/model_design_xray_en.png?raw=true" /></p>


## Unzip weights models

<pre>
$ cd xray_anormal_model
$ unzip anormal_model.zip

$ cd ../xray_covid_model
$ unzip covid_model.zip
</pre>

## Create environment to perform predictions

   * Firstly, install the Anaconda https://docs.anaconda.com/anaconda/install/
   * To create the environment run:
   <pre>conda env create -f cpu_environment.yml</pre>







