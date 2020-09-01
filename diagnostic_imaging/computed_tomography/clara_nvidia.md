# Clara Classification COVID and non-COVID model and lung segmentation model

## Support for Covid diagnosis using Aritificial Intelligence in Computed Tomography imagess

### Reference Center for Artificial Intelligence at SENAI CIMATEC

The model proposed by SENAI CIMATEC was developed in the [Clara NVIDIA framework](https://www.nvidia.com/pt-br/healthcare/), therefore, this Notebook covers all the information from the installation of the framework to the development and execution of the model, in addition to the configuration of the neural networks and hyperparameters used.

This notebook includes the Classification and Segmentation models of Clara NVIDIA.

## 1.0 Installation


### 1.1 System requirements:
- Driver requirements

NVIDIA CUDA 10.1.243, which requires NVIDIA Driver version 418.xx. However, if you are running Tesla (for example, T4 or any other Tesla card), you can use the NVIDIA driver version 384.111+ or 410. You can also use the 396 driver on the Tesla T4. The CUDA driver compatibility package supports only specific drivers. For a complete list of supported drivers, see the topic [CUDA Application Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/index.html#cuda-application-compatibility). For more information, see [CUDA Compatibility and Updates](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html#cuda-compatibility-and-upgrades).

- GPU requirements

Compute resource CUDA 6.0 and higher. This corresponds to GPUs in the Pascal, Volta and Turing families. Specifically, for a list of GPUs to which this computing resource corresponds, see [CUDA GPUs](https://developer.nvidia.com/cuda-gpus). For additional support details, see [Support matrix for deep learning frameworks](https://docs.nvidia.com/deeplearning/dgx/support-matrix/index.html).

- Software requirements

Singularity installed, see the [instructions](https://singularity.lbl.gov/all-releases)

OR

NVIDIA Container Toolkit installed, see the [instructions](https://github.com/NVIDIA/nvidia-docker).

** Note: ** the original Clara NVIDIA documentation was written specifically for the Docker container, however, the proposed model was developed in the Singularity container. Both containers lead to the same results presented, thus, it is up to the user to run the model in one of the mentioned containers, however, ** we recommend the use of Singularity, as this documentation was written specifically for that container (version 2.5.2) **.

Source: [NVIDIA Clara user guide](https://docs.nvidia.com/clara/tlt-mi/clara-train-sdk-v3.0/nvmidl/index.html)
