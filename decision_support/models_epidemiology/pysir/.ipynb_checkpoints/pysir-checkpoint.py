#!/usr/bin/env python
# coding: utf-8

# # PySIR - Python implementation of SIR-based models

# #### Author: Lucas Vilas Boas Alves <lucas.vbalves@gmail.com>

# In[1]:


import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import multiprocessing as mp
from numbers import Number
from scipy.optimize import differential_evolution
from scipy.optimize import brute
from scipy.integrate import solve_ivp
from sklearn.metrics import mean_squared_log_error
from sklearn.metrics import mean_squared_error


# ### Base class for estimators of SIR-based models

# In[2]:


class BaseEstimator:
    
    def fit(self, data, bounds=None, **kwargs):
        
        if bounds is None:
            self.bounds = self.model.bounds
        else:
            self.bounds = bounds
        
        best_params, history = fit_model(self.model, data, bounds=self.bounds, **kwargs)
        
        self.params = best_params
        
        return history
    
    def evaluate(self, data, **kwargs):
        
        loss = evaluate_model(self.model, self.params, data, **kwargs)
        
        return loss
    
    def solve(self, n_days):
        
        solution = solve_model(self.model, self.params, n_days)
        
        return solution
    
    def predict(self, data, look_forward):
        
        y_pred = self.model.get_predictions(self.params, data, look_forward)
        
        return y_pred
    
    def plot_predictions(self, n_days, x, y_true, **kwargs):
        
        image = self.model.plot_predictions(self.params, n_days, x, y_true, **kwargs)
        
        return image


# ### Estimator class for the SIR model

# In[3]:


class SIR(BaseEstimator):
    
    def __init__(self, population):
        
        self.population = population
        self.model = SIR_model(population)


# ### Estimator class for the SEIR model

# In[4]:


class SEIR(BaseEstimator):
    
    def __init__(self, population):
        
        self.population = population
        self.model = SEIR_model(population)


# ### Estimator class for the SIRD model

# In[5]:


class SIRD(BaseEstimator):
    
    def __init__(self, population):
        
        self.population = population
        self.model = SIRD_model(population)


# ### Estimator class for the SEIRD model

# In[6]:


class SEIRD(BaseEstimator):
    
    def __init__(self, population):
        
        self.population = population
        self.model = SEIRD_model(population)


# ### Class containing the ordinary differential equations (ODEs), attributes and methods of the SIR model

# In[7]:


class SIR_model:
    
    def __init__(self, population):
        
        self.population = population
        
        # Bounds dictionary
        self.bounds = {
            'beta': (0.01, 8),
            'T_inf': (0.01, 15),
            'N_inf': (1, 100)
        }
        
        # Expected keys in bounds dictionary
        self.params_names = list(self.bounds.keys())
        
        # List of compartiments names
        self.compart_names = ['susceptible', 'infected', 'resistant']
        
    # State at time = 0 for SIR model
    def get_init_state(self, params):
        
        N_inf = params.get('N_inf', None)
        
        susceptible_0 = (self.population-N_inf)/self.population
        infected_0 = N_inf/self.population
        resistant_0 = 0
        
        return [susceptible_0, infected_0, resistant_0]
    
    def ode(self, t, y, params):
        
        beta = params.get('beta', None)
        T_inf = params.get('T_inf', None)
        
        if callable(beta):
            beta = beta(t, params)
        
        S, I, R = y
        
        # Susceptible equation
        S_out = -beta * (S * I)
        
        # Infected equation
        I_out = beta * (S * I) - (1/T_inf) * I
        
        # Resistant equation
        R_out = (1/T_inf) * I

        return [S_out, I_out, R_out]
    
    def get_targets(self, params, data):
        
        n_days = data['infection_days'].iloc[-1]
        
        # Generate model predictions
        S, I, R = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        y_pred = daily_infect_pred[-data.shape[0]:]
        
        y_true = data.loc[:, 'confirmed'].values
        
        return [y_true, y_pred]
    
    def get_predictions(self, params, data, look_forward):
        
        past_days = data['infection_days'].iloc[-1]
        
        n_days = past_days + look_forward
        
        # Generate model predictions
        S, I, R = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        y_pred = pd.DataFrame(daily_infect_pred,
                              columns=['confirmed'],
                              index=range(1, len(daily_infect_pred)+1) )
        
        if 'region' in data.columns:
            region = data['region'].values[0]
            y_pred.insert(0, column='region', value=region)
        
        y_pred = y_pred.iloc[past_days:, :]
        
        return y_pred
    
    def plot_predictions(self, params, n_days, x_data, y_true_data, **kwargs):
        
        title = kwargs.get('title', '')
        plt_s = kwargs.get('plt_s', False)
        plt_i = kwargs.get('plt_i', True)
        plt_r = kwargs.get('plt_r', False)
        
        # Generate model predictions
        S, I, R = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        fig = plt.figure(figsize=(15,5))

        # Subplot 1
        ax1 = fig.add_subplot(1,2,1)
        
        million = 1000000
        
        ax1.plot(daily_infect_pred/million, ls='--', c='cyan', label='Daily Infected')
        
        if plt_s:
            ax1.plot(S/million, 'blue', label='Susceptible')
        if plt_i:
            ax1.plot(I/million, 'magenta', label='Infected')
        if plt_r:
            ax1.plot(R/million, 'green', label='Resistant')

        ax1.set_xticks(np.linspace(1 , len(I), num=7, dtype=int))
        ax1.set_title('SIR model')
        ax1.set_xlabel('Days', fontsize=10)
        ax1.set_ylabel('Population (millions)', fontsize=10)
        ax1.legend(loc='best')

        # Subplot 2
        ax2 = fig.add_subplot(1,2,2)
        
        x = x_data.loc[:, 'confirmed'].values
        x_days = x_data.loc[:, 'infection_days'].values
        
        y_true = y_true_data.loc[:, 'confirmed'].values
        y_true_days = y_true_data.loc[:, 'infection_days'].values
        
        y_pred = daily_infect_pred[:y_true_days[-1]]
        y_pred_days = range(1, len(y_pred)+1)
        
        ax2.plot(x_days, x, 'black', label='True daily confirmed cases (model input)')
        
        ax2.plot(y_true_days, y_true, 'red', label='True daily confirmed cases')
        
        ax2.plot(y_pred_days, y_pred,
                 ls='--', c='cyan', label='Predicted daily confirmed cases')

        ax2.set_xticks(np.linspace(1, len(y_pred), num=7, dtype=int))
        ax2.set_title('Model prediction and real data')
        ax2.set_ylabel("Population", fontsize=10)
        ax2.set_xlabel("Days", fontsize=10)
        ax2.legend(loc='best')

        fig.suptitle(title)
        
        return (fig, ax1, ax2)


# ### Class containing the ordinary differential equations (ODEs), attributes and methods of the SEIR model

# In[8]:


class SEIR_model:
    
    def __init__(self, population):
        
        self.population = population
        
        # Bounds dictionary
        self.bounds = {
            'beta': (0.01, 8),
            'T_inc': (0.01, 8),
            'T_inf': (0.01, 15),
            'N_inf': (1, 100)
        }
        
        # Expected keys in bounds dictionary
        self.params_names = list(self.bounds.keys())
        
        # List of compartiments names
        self.compart_names = ['susceptible', 'exposed', 'infected', 'resistant']
        
    # State at time = 0 for SEIR model
    def get_init_state(self, params):
        
        N_inf = params.get('N_inf', None)
        
        susceptible_0 = (self.population-N_inf)/self.population
        exposed_0 = 0
        infected_0 = N_inf/self.population
        resistant_0 = 0
        
        return [susceptible_0, exposed_0, infected_0, resistant_0]

    def ode(self, t, y, params):
        
        beta = params.get('beta', None)
        T_inf = params.get('T_inf', None)
        T_inc = params.get('T_inc', None)
        
        if callable(beta):
            beta = beta(t, params)
        
        S, E, I, R = y
        
        # Susceptible equation
        S_out = -beta * (S * I)
        
        # Exposed equation
        E_out = beta * (S * I) - (1/T_inc) * E
        
        # Infected equation
        I_out = (1/T_inc) * E - (1/T_inf) * I
        
        # Resistant equation
        R_out = (1/T_inf) * I

        return [S_out, E_out, I_out, R_out]
    
    def get_targets(self, params, data):
        
        n_days = data['infection_days'].iloc[-1]
        
        # Generate model predictions
        S, E, I, R = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        y_pred = daily_infect_pred[-data.shape[0]:]
        
        y_true = data.loc[:, 'confirmed'].values
        
        return [y_true, y_pred]
    
    def get_predictions(self, params, data, look_forward):
        
        past_days = data['infection_days'].iloc[-1]
        
        n_days = past_days + look_forward
        
        # Generate model predictions
        S, E, I, R = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        y_pred = pd.DataFrame(daily_infect_pred,
                              columns=['confirmed'],
                              index=range(1, len(daily_infect_pred)+1) )
        
        if 'region' in data.columns:
            region = data['region'].values[0]
            y_pred.insert(0, column='region', value=region)
        
        y_pred = y_pred.iloc[past_days:, :]
        
        return y_pred
    
    def plot_predictions(self, params, n_days, x_data, y_true_data, **kwargs):
        
        title = kwargs.get('title', '')
        plt_s = kwargs.get('plt_s', False)
        plt_e = kwargs.get('plt_e', False)
        plt_i = kwargs.get('plt_i', True)
        plt_r = kwargs.get('plt_r', False)
        
        # Generate model predictions
        S, E, I, R = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        fig = plt.figure(figsize=(15,5))

        # Subplot 1
        ax1 = fig.add_subplot(1,2,1)
        
        million = 1000000
        
        ax1.plot(daily_infect_pred/million, ls='--', c='cyan', label='Daily Infected')
        
        if plt_s:
            ax1.plot(S/million, 'blue', label='Susceptible')
        if plt_e:
            ax1.plot(E/million, 'salmon', label='Exposed')
        if plt_i:
            ax1.plot(I/million, 'magenta', label='Infected')
        if plt_r:
            ax1.plot(R/million, 'green', label='Resistant')

        ax1.set_xticks(np.linspace(1 , len(I), num=7, dtype=int))
        ax1.set_title('SEIR model')
        ax1.set_xlabel('Days', fontsize=10)
        ax1.set_ylabel('Population (millions)', fontsize=10)
        ax1.legend(loc='best')

        # Subplot 2
        ax2 = fig.add_subplot(1,2,2)
        
        x = x_data.loc[:, 'confirmed'].values
        x_days = x_data.loc[:, 'infection_days'].values
        
        y_true = y_true_data.loc[:, 'confirmed'].values
        y_true_days = y_true_data.loc[:, 'infection_days'].values
        
        y_pred = daily_infect_pred[:y_true_days[-1]]
        y_pred_days = range(1, len(y_pred)+1)
        
        ax2.plot(x_days, x, 'black', label='True daily confirmed cases (model input)')
        
        ax2.plot(y_true_days, y_true, 'red', label='True daily confirmed cases')
        
        ax2.plot(y_pred_days, y_pred,
                 ls='--', c='cyan', label='Predicted daily confirmed cases')

        ax2.set_xticks(np.linspace(1, len(y_pred), num=7, dtype=int))
        ax2.set_title('Model prediction and real data')
        ax2.set_ylabel("Population", fontsize=10)
        ax2.set_xlabel("Days", fontsize=10)
        ax2.legend(loc='best')

        fig.suptitle(title)
        
        return (fig, ax1, ax2)


# ### Class containing the ordinary differential equations (ODEs), attributes and methods of the SIRD model

# In[9]:


class SIRD_model:
    
    def __init__(self, population):
        
        self.population = population
        
        # Bounds dictionary
        self.bounds = {
            'beta': (0.01, 8),
            'T_inf': (0.01, 15),
            'N_inf': (1, 100),
            'T_death': (0.01, 15),
            'cfr': (0.001, 0.5)
        }
        
        # Expected keys in bounds dictionary
        self.params_names = list(self.bounds.keys())
        
        # List of compartiments names
        self.compart_names = ['susceptible', 'infected', 'resistant', 'dead']
        
    # State at time = 0 for SIRD model
    def get_init_state(self, params):
        
        N_inf = params.get('N_inf', None)
        
        susceptible_0 = (self.population-N_inf)/self.population
        infected_0 = N_inf/self.population
        resistant_0 = 0
        dead_0 = 0
        
        return [susceptible_0, infected_0, resistant_0, dead_0]
    
    def ode(self, t, y, params):
        
        beta = params.get('beta', None)
        T_inf = params.get('T_inf', None)
        T_death = params.get('T_death', None)
        cfr = params.get('cfr', None)
        
        if callable(beta):
            beta = beta(t, params)
        
        S, I, R, D = y
        
        # Susceptible equation
        S_out = -beta * (S * I)
        
        # Infected equation
        I_out = beta * (S * I) - ((1-cfr)/T_inf) * I - (cfr/T_death) * I
        
        # Resistant equation
        R_out = ((1-cfr)/T_inf) * I
        
        # Dead equation
        D_out = (cfr/T_death) * I

        return [S_out, I_out, R_out, D_out]
    
    def get_targets(self, params, data):
        
        n_days = data['infection_days'].iloc[-1]
        
        # Generate model predictions
        S, I, R, D = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R+D, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        daily_death_pred = np.diff(D, prepend=0)
        daily_death_pred = np.clip(daily_death_pred, 0, np.inf)
        
        y_pred_infect = daily_infect_pred[-data.shape[0]:]
        y_pred_death = daily_death_pred[-data.shape[0]:]
        y_pred = np.concatenate([y_pred_infect, y_pred_death])
        
        y_true_infect = data.loc[:, 'confirmed'].values
        y_true_death = data.loc[:, 'deaths'].values
        y_true = np.concatenate([y_true_infect, y_true_death])
        
        return [y_true, y_pred]
    
    def get_predictions(self, params, data, look_forward):
        
        past_days = data['infection_days'].iloc[-1]
        
        n_days = past_days + look_forward
        
        # Generate model predictions
        S, I, R, D = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R+D, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        daily_death_pred = np.diff(D, prepend=0)
        daily_death_pred = np.clip(daily_death_pred, 0, np.inf)
        
        daily_infect_pred = np.reshape(daily_infect_pred, (-1,1))
        daily_death_pred = np.reshape(daily_death_pred, (-1,1))
        
        y_pred = np.hstack([daily_infect_pred, daily_death_pred])
        
        y_pred = pd.DataFrame(y_pred,
                              columns=['confirmed', 'deaths'],
                              index=range(1, len(daily_infect_pred)+1) )
        
        if 'region' in data.columns:
            region = data['region'].values[0]
            y_pred.insert(0, column='region', value=region)
        
        y_pred = y_pred.iloc[past_days:, :]
        
        return y_pred
    
    def plot_predictions(self, params, n_days, x_data, y_true_data, **kwargs):
        
        title = kwargs.get('title', '')
        plt_s = kwargs.get('plt_s', False)
        plt_i = kwargs.get('plt_i', True)
        plt_r = kwargs.get('plt_r', False)
        plt_d = kwargs.get('plt_d', False)
        
        # Generate model predictions
        S, I, R, D = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R+D, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        daily_death_pred = np.diff(D, prepend=0)
        daily_death_pred = np.clip(daily_death_pred, 0, np.inf)
        
        fig = plt.figure(figsize=(15,10))

        # Subplot 1
        ax1 = fig.add_subplot(2,2,1)
        
        million = 1000000
        
        ax1.plot(daily_infect_pred/million, ls='--', c='cyan', label='Daily Infected')
        ax1.plot(daily_death_pred/million, ls='--', c='purple', label='Daily Deaths')
        
        if plt_s:
            ax1.plot(S/million, 'blue', label='Susceptible')
        if plt_i:
            ax1.plot(I/million, 'magenta', label='Infected')
        if plt_r:
            ax1.plot(R/million, 'green', label='Resistant')
        if plt_d:
            ax1.plot(D/million, 'silver', label='Dead')

        ax1.set_xticks(np.linspace(1 , len(I), num=7, dtype=int))
        ax1.set_title('SIRD model')
        ax1.set_xlabel('Days', fontsize=10)
        ax1.set_ylabel('Population (millions)', fontsize=10)
        ax1.legend(loc='best')

        # Subplot 2 - Confirmed
        ax2 = fig.add_subplot(2,2,2)
        
        x = x_data.loc[:, 'confirmed'].values
        x_days = x_data.loc[:, 'infection_days'].values
        
        y_true = y_true_data.loc[:, 'confirmed'].values
        y_true_days = y_true_data.loc[:, 'infection_days'].values
        
        y_pred = daily_infect_pred[:y_true_days[-1]]
        y_pred_days = range(1, len(y_pred)+1)
        
        ax2.plot(x_days, x, 'black', label='True daily confirmed cases (model input)')
        
        ax2.plot(y_true_days, y_true, 'red', label='True daily confirmed cases')
        
        ax2.plot(y_pred_days, y_pred,
                 ls='--', c='cyan', label='Predicted daily confirmed cases')

        ax2.set_xticks(np.linspace(1, len(y_pred), num=7, dtype=int))
        ax2.set_title('Model prediction and real data')
        ax2.set_ylabel("Population", fontsize=10)
        ax2.set_xlabel("Days", fontsize=10)
        ax2.legend(loc='best')
        
        # Subplot 3 - Deaths
        ax3 = fig.add_subplot(2,2,3)
        
        x = x_data.loc[:, 'deaths'].values
        x_days = x_data.loc[:, 'infection_days'].values
        
        y_true = y_true_data.loc[:, 'deaths'].values
        y_true_days = y_true_data.loc[:, 'infection_days'].values
        
        y_pred = daily_death_pred[:y_true_days[-1]]
        y_pred_days = range(1, len(y_pred)+1)
        
        ax3.plot(x_days, x, 'black', label='True daily deaths (model input)')
        
        ax3.plot(y_true_days, y_true, 'red', label='True daily deaths')
        
        ax3.plot(y_pred_days, y_pred,
                 ls='--', c='purple', label='Predicted daily deaths')

        ax3.set_xticks(np.linspace(1, len(y_pred), num=7, dtype=int))
        ax3.set_title('Model prediction and real data')
        ax3.set_ylabel("Population", fontsize=10)
        ax3.set_xlabel("Days", fontsize=10)
        ax3.legend(loc='best')
        
        fig.suptitle(title, y=0.94)
        fig.subplots_adjust(wspace=0.25, hspace=0.25)
        
        return (fig, ax1, ax2, ax3)


# ### Class containing the ordinary differential equations (ODEs), attributes and methods of the SEIRD model

# In[10]:


class SEIRD_model:
    
    def __init__(self, population):
        
        self.population = population
        
        # Bounds dictionary
        self.bounds = {
            'beta': (0.01, 8),
            'T_inc': (0.01, 8),
            'T_inf': (0.01, 15),
            'N_inf': (1, 100),
            'T_death': (0.01, 15),
            'cfr': (0.001, 0.5)
        }
        
        # Expected keys in bounds dictionary
        self.params_names = list(self.bounds.keys())
        
        # List of compartiments names
        self.compart_names = ['susceptible', 'exposed', 'infected', 'resistant', 'dead']
        
    # State at time = 0 for SEIRD model
    def get_init_state(self, params):
        
        N_inf = params.get('N_inf', None)
        
        susceptible_0 = (self.population-N_inf)/self.population
        exposed_0 = 0
        infected_0 = N_inf/self.population
        resistant_0 = 0
        dead_0 = 0
        
        return [susceptible_0, exposed_0, infected_0, resistant_0, dead_0]
    
    def ode(self, t, y, params):
        
        beta = params.get('beta', None)
        T_inc = params.get('T_inc', None)
        T_inf = params.get('T_inf', None)
        T_death = params.get('T_death', None)
        cfr = params.get('cfr', None)
        
        if callable(beta):
            beta = beta(t, params)
        
        S, E, I, R, D = y
        
        # Susceptible equation
        S_out = -beta * (S * I)
        
        # Exposed equation
        E_out = beta * (S * I) - (1/T_inc) * E
        
        # Infected equation
        I_out = (1/T_inc) * E - ((1-cfr)/T_inf) * I - (cfr/T_death) * I
        
        # Resistant equation
        R_out = ((1-cfr)/T_inf) * I
        
        # Dead equation
        D_out = (cfr/T_death) * I

        return [S_out, E_out, I_out, R_out, D_out]
    
    def get_targets(self, params, data):
        
        n_days = data['infection_days'].iloc[-1]
        
        # Generate model predictions
        S, E, I, R, D = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R+D, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        daily_death_pred = np.diff(D, prepend=0)
        daily_death_pred = np.clip(daily_death_pred, 0, np.inf)
        
        y_pred_infect = daily_infect_pred[-data.shape[0]:]
        y_pred_death = daily_death_pred[-data.shape[0]:]
        y_pred = np.concatenate([y_pred_infect, y_pred_death])
        
        y_true_infect = data.loc[:, 'confirmed'].values
        y_true_death = data.loc[:, 'deaths'].values
        y_true = np.concatenate([y_true_infect, y_true_death])
        
        return [y_true, y_pred]
    
    def get_predictions(self, params, data, look_forward):
        
        past_days = data['infection_days'].iloc[-1]
        
        n_days = past_days + look_forward
        
        # Generate model predictions
        S, E, I, R, D = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R+D, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        daily_death_pred = np.diff(D, prepend=0)
        daily_death_pred = np.clip(daily_death_pred, 0, np.inf)
        
        daily_infect_pred = np.reshape(daily_infect_pred, (-1,1))
        daily_death_pred = np.reshape(daily_death_pred, (-1,1))
        
        y_pred = np.hstack([daily_infect_pred, daily_death_pred])
        
        y_pred = pd.DataFrame(y_pred,
                              columns=['confirmed', 'deaths'],
                              index=range(1, len(daily_infect_pred)+1) )
        
        if 'region' in data.columns:
            region = data['region'].values[0]
            y_pred.insert(0, column='region', value=region)
        
        y_pred = y_pred.iloc[past_days:, :]
        
        return y_pred
    
    def plot_predictions(self, params, n_days, x_data, y_true_data, **kwargs):
        
        title = kwargs.get('title', '')
        plt_s = kwargs.get('plt_s', False)
        plt_e = kwargs.get('plt_e', False)
        plt_i = kwargs.get('plt_i', True)
        plt_r = kwargs.get('plt_r', False)
        plt_d = kwargs.get('plt_d', False)
        
        # Generate model predictions
        S, E, I, R, D = solve_model(self, params, n_days)
        daily_infect_pred = np.diff(I+R+D, prepend=0)
        daily_infect_pred = np.clip(daily_infect_pred, 0, np.inf)
        
        daily_death_pred = np.diff(D, prepend=0)
        daily_death_pred = np.clip(daily_death_pred, 0, np.inf)
        
        fig = plt.figure(figsize=(15,10))

        # Subplot 1
        ax1 = fig.add_subplot(2,2,1)
        
        million = 1000000
        
        ax1.plot(daily_infect_pred/million, ls='--', c='cyan', label='Daily Infected')
        ax1.plot(daily_death_pred/million, ls='--', c='purple', label='Daily Deaths')
        
        if plt_s:
            ax1.plot(S/million, 'blue', label='Susceptible')
        if plt_e:
            ax1.plot(E/million, 'salmon', label='Exposed')
        if plt_i:
            ax1.plot(I/million, 'magenta', label='Infected')
        if plt_r:
            ax1.plot(R/million, 'green', label='Resistant')
        if plt_d:
            ax1.plot(D/million, 'silver', label='Dead')

        ax1.set_xticks(np.linspace(1 , len(I), num=7, dtype=int))
        ax1.set_title('SEIRD model')
        ax1.set_xlabel('Days', fontsize=10)
        ax1.set_ylabel('Population (millions)', fontsize=10)
        ax1.legend(loc='best')

        # Subplot 2 - Confirmed
        ax2 = fig.add_subplot(2,2,2)
        
        x = x_data.loc[:, 'confirmed'].values
        x_days = x_data.loc[:, 'infection_days'].values
        
        y_true = y_true_data.loc[:, 'confirmed'].values
        y_true_days = y_true_data.loc[:, 'infection_days'].values
        
        y_pred = daily_infect_pred[:y_true_days[-1]]
        y_pred_days = range(1, len(y_pred)+1)
        
        ax2.plot(x_days, x, 'black', label='True daily confirmed cases (model input)')
        
        ax2.plot(y_true_days, y_true, 'red', label='True daily confirmed cases')
        
        ax2.plot(y_pred_days, y_pred,
                 ls='--', c='cyan', label='Predicted daily confirmed cases')

        ax2.set_xticks(np.linspace(1, len(y_pred), num=7, dtype=int))
        ax2.set_title('Model prediction and real data')
        ax2.set_ylabel("Population", fontsize=10)
        ax2.set_xlabel("Days", fontsize=10)
        ax2.legend(loc='best')
        
        # Subplot 3 - Deaths
        ax3 = fig.add_subplot(2,2,3)
        
        x = x_data.loc[:, 'deaths'].values
        x_days = x_data.loc[:, 'infection_days'].values
        
        y_true = y_true_data.loc[:, 'deaths'].values
        y_true_days = y_true_data.loc[:, 'infection_days'].values
        
        y_pred = daily_death_pred[:y_true_days[-1]]
        y_pred_days = range(1, len(y_pred)+1)
        
        ax3.plot(x_days, x, 'black', label='True daily deaths (model input)')
        
        ax3.plot(y_true_days, y_true, 'red', label='True daily deaths')
        
        ax3.plot(y_pred_days, y_pred,
                 ls='--', c='purple', label='Predicted daily deaths')

        ax3.set_xticks(np.linspace(1, len(y_pred), num=7, dtype=int))
        ax3.set_title('Model prediction and real data')
        ax3.set_ylabel("Population", fontsize=10)
        ax3.set_xlabel("Days", fontsize=10)
        ax3.legend(loc='best')
        
        fig.suptitle(title, y=0.94)
        fig.subplots_adjust(wspace=0.25, hspace=0.25)
        
        return (fig, ax1, ax2, ax3)


# ### Function for solving ordinary differential equations (ODEs) of the model

# In[11]:


def solve_model(model, params, n_days):
    
    y0 = model.get_init_state(params)
    
    solution = solve_ivp(model.ode, [0, n_days], y0, method='RK45', max_step=1,
                         args=([params]), t_eval=np.arange(n_days))
    
    if solution.success == False:
        print('WARNING! solve_ivp status {}: {}'.format(solution.status, solution.message))
    
    solution = solution.y*model.population
    solution = np.around(solution, 0)
    solution = np.clip(solution, 0, np.inf)
    
    return solution


# ### Function to evaluate model error metrics

# In[12]:


def evaluate_model(model, params, data, **kwargs):
    
    # Getting function parameters
    metric = kwargs.get('metric', 'mse')
    weights = kwargs.get('weights', None)
    
    y_true, y_pred = model.get_targets(params, data)
    
    if metric == 'mse':
        loss = mean_squared_error(y_true, y_pred, weights)
    if metric == 'rmse':
        loss = mean_squared_error(y_true, y_pred, weights, squared=False)
    elif metric == 'msle':
        loss = mean_squared_log_error(y_true, y_pred, weights)
    
    return loss


# ### Function to adjust model parameters to data

# In[13]:


def fit_model(model, data, bounds, **kwargs):
    
    # Getting function parameters
    metric = kwargs.get('metric', 'mse')
    weights = kwargs.get('weights', None)
    method = kwargs.get('method', 'diff_evol')
    verbose = kwargs.get('verbose', False)
    
    # Expected keys in bounds dictionary
    params_names = model.params_names
    
    if not (list(bounds.keys()) == params_names):
        raise ValueError('Dict keys must be {}.'.format(params_names))
    
    optim_params_names, optim_params_bounds, fixed_params_dict = _params_parser(bounds, method)
    
    if len(optim_params_bounds) == 0:
        if verbose:
            print('No parameters to optimize. Returning fixed parameters.')
        
        return [fixed_params_dict, None]
    
    try:
        # Create new process and queue to log the model fit history
        manager = mp.Manager()
        eval_queue = manager.Queue()
        history_queue = manager.Queue()
        history_logger_process = mp.Process(target=_history_logger, args=(eval_queue, history_queue), daemon=True)
        history_logger_process.start()

        loss_func_args = [optim_params_names, fixed_params_dict,
                          model, data, weights, metric, eval_queue]

        if method == 'diff_evol':
            best_params = _diff_evol_fitter(optim_params_bounds, loss_func_args, **kwargs)

        elif method == 'brute':
            best_params = _brute_fitter(optim_params_bounds, loss_func_args, **kwargs)

        best_params.update(fixed_params_dict)
    
    finally:
        
        eval_queue.put(['STOP', None])

        while True:
            info = history_queue.get()

            if info[0] == 'RESULT':
                history = info[1]
                history_queue.task_done()
                
                eval_queue.join()
                history_queue.join()
                
                history_logger_process.join()
                
                break
                
    return [best_params, history]


# In[14]:


def _diff_evol_fitter(optim_params_bounds, loss_func_args, **kwargs):
    
    workers = kwargs.get('workers', -1)
    verbose = kwargs.get('verbose', False)
    
    optim_res = differential_evolution(
        _loss_func_wrapper, bounds=optim_params_bounds,
        args=(loss_func_args),
        popsize=15, mutation=0.8, recombination=0.9, strategy='rand1bin',
        updating='deferred', polish=True, workers=workers, seed=0
    )

    if verbose:
        print('Value of objective function:', optim_res.fun)
        print('Number of evaluations of the objective function:', optim_res.nfev)
        print('Number of iterations performed by the optimizer:', optim_res.nit)
        print('Optimizer exited successfully:', optim_res.success)
        print('Message:', optim_res.message)
        print()
        
    optim_params_names = loss_func_args[0]
    
    best_params = dict(zip(optim_params_names, optim_res.x))
    
    return best_params


# In[15]:


def _brute_fitter(optim_params_bounds, loss_func_args, **kwargs):
    
    workers = kwargs.get('workers', -1)
    verbose = kwargs.get('verbose', False)
    Ns = kwargs.get('Ns', 10)
    
    x_out, fval, _, _ = brute(
        _loss_func_wrapper, ranges=optim_params_bounds,
        args=(loss_func_args),
        Ns=Ns, full_output=True, finish=None, workers=workers)

    if verbose:
        print('Value of objective function:', fval)
        
    optim_params_names = loss_func_args[0]
    
    best_params = dict(zip(optim_params_names, x_out))
    
    return best_params


# In[16]:


def _history_logger(eval_queue=None, history_queue=None):
    
    history = pd.DataFrame()
    
    while True:
        info = eval_queue.get()
        
        pid = info[0]
        eval_result = info[1]
                
        if pid == 'STOP':
            history_queue.put(['RESULT', history])
            eval_queue.task_done()
            break
        else:
            history = pd.concat([history, eval_result], ignore_index=True)
            eval_queue.task_done()


# ### Wrapper function to adapt optimization methods outputs and loss evaluation function inputs

# In[17]:


def _loss_func_wrapper(params_vals, *args):
    
    params_names = args[0]
    fixed_params_dict = args[1]
    
    model = args[2]
    data = args[3]
    
    weights = args[4]
    metric = args[5]
    
    eval_queue = args[6]
            
    params = dict(zip(params_names, params_vals))
    params.update(fixed_params_dict)
    loss = evaluate_model(model, params, data, weights=weights, metric=metric)
    
    eval_result = pd.DataFrame(params, index=[0])
    eval_result['loss'] = loss
    
    pid = os.getpid()
    eval_queue.put([pid, eval_result])
    
    return loss


# ### Function to parse arguments received by the function that fit the model parameters

# In[18]:


def _params_parser(bounds, method, from_callable=False):
    
    optim_params_names = list()
    optim_params_bounds = list()
    fixed_params_dict = dict()
    
    # Checking if params are fixed or to optimize
    for param in bounds.keys():
        
        # Param bounds is a number, so it's a fixed param.
        if isinstance(bounds[param], Number):
            fixed_params_dict.update([(param, bounds[param])])
        
        # Param bounds is a sequence (min, max) or (func, func_kwargs)
        elif isinstance(bounds[param], (list, tuple)):
            
            # Can be a param to optimize (min, max) or a time varying function (func, func_kwargs)
            if len(bounds[param]) == 2:
                
                # Param is a time varying function
                if callable(bounds[param][0]):
                    
                    # Add function as a fixed param
                    fixed_params_dict.update([(param, bounds[param][0])])
                    
                    # Parse function param
                    callable_params = _params_parser(bounds[param][1], method, from_callable=True)
                    
                    # Add function params to be optmized
                    optim_params_names.extend(callable_params[0])
                    optim_params_bounds.extend(callable_params[1])
                    
                    # Add fixed function params
                    fixed_params_dict.update(callable_params[2])
                
                # Param is to be optmized
                else:
                    optim_params_names.append(param)
                    optim_params_bounds.append(bounds[param])
                    
            else:
                raise ValueError(
                    '''{} bounds has length {}. Bounds must be in the form (min,max) or (func, func_kwargs).
                    '''.format(param, len(bounds[param])),
                )
        
        # Param bounds is a slice (start, stop, step), so it's a param to optimize using 'brute'.
        elif isinstance(bounds[param], slice):
            
            if method == 'brute':
                optim_params_names.append(param)
                optim_params_bounds.append(bounds[param])
            else:
                raise ValueError(
                    '''{} bounds are in a slice object. Slice object must be used with method="brute".
                    '''.format(param),
                )
        else:
            # If param is for a callable, add as a fixed param (user defined)
            if from_callable:
                fixed_params_dict.update([(param, bounds[param])])
                
            else:
                raise TypeError(
                    '''{} bounds specified as {}. Bounds must be:
                    - A number, for a fixed parameter;
                    - A sequence in the form (min,max);
                    - A sequence in the form (func, func_kwargs);
                    - A slice object in the form (start, stop, step) if method="brute".
                    '''.format(param, type(bounds[param])),
                )
    
    return (optim_params_names, optim_params_bounds, fixed_params_dict)

