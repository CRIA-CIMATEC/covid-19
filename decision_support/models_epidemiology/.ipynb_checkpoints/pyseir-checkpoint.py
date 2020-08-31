#!/usr/bin/env python
# coding: utf-8

# # Python implementation of SEIR model

# In[1]:


import pandas as pd
import numpy as np
from numbers import Number
from scipy.optimize import differential_evolution
from scipy.optimize import brute
from scipy.integrate import solve_ivp
from sklearn.metrics import mean_squared_log_error
from sklearn.metrics import mean_squared_error


# ### Classe do modelo SEIR

# In[2]:


class SEIR_model:
    def __init__(self):
        pass
    
    def fit(self, data, pop, bounds=None, **kwargs):
        
        if bounds is None:
            self.bounds = {
                'R_0': (0.1, 8),
                'T_inc': (0.1, 8),
                'T_inf': (0.1, 15),
                'N_inf': (1, 100)
            }
        else:
            self.bounds = bounds
        
        self.params = SEIR_fit(data=data, population=pop, bounds=self.bounds, **kwargs)
    
    def evaluate(self, data, pop, **kwargs):
        
        loss = SEIR_evaluate(self.params, data=data, population=pop, **kwargs)
        
        return loss
    
    def predict(self, data, pop, look_forward):
        
        region = data['region'].values
        past_days = data['infection_days_t0'].iloc[-1]
        n_days = past_days + look_forward
        
        solution = SEIR_solve(self.params, population=pop, n_days=n_days)
        
        sus, exp, inf, res = solution
        pred_confirmed = inf+res
        
        y_pred_confirm = np.vstack(
            [pred_confirmed[(day):(day+look_forward)] for day in data['infection_days_t0']]
        )

        confirmed_cols = ['confirmed_t+{}'.format(x) for x in range(1, look_forward+1)]
        y_pred_confirm_df = pd.DataFrame(y_pred_confirm, columns=confirmed_cols)
        y_pred_confirm_df.insert(0, column='region', value=region)
        
        return y_pred_confirm_df


# ### Equações diferenciais ordinárias do modelo SEIR

# In[3]:


# Susceptible equation
def dS_dt(S, I, R_t, T_inf):
    return -(R_t / T_inf) * (I * S)

# Exposed equation
def dE_dt(S, E, I, R_t, T_inf, T_inc):
    return (R_t / T_inf) * (I * S) - (1/T_inc) * E

# Infected equation
def dI_dt(I, E, T_inc, T_inf):
    return (1/T_inc) * E - (1/T_inf) * I

# Resistant equation
def dR_dt(I, T_inf):
    return (1/T_inf) * I

def SEIR_equations(t, y, R_t, T_inf, T_inc):
    
    if callable(R_t):
        reproduction = R_t(t)
    else:
        reproduction = R_t
    
    S, E, I, R = y
    
    S_out = dS_dt(S, I, reproduction, T_inf)
    E_out = dE_dt(S, E, I, reproduction, T_inf, T_inc)
    I_out = dI_dt(I, E, T_inc, T_inf)
    R_out = dR_dt(I, T_inf)
    
    return [S_out, E_out, I_out, R_out]


# ### Função para solucionar equações diferenciais do modelo

# In[4]:


def SEIR_solve(params, population, n_days, verbose=False):
    
    R_0 = params['R_0']
    T_inc = params['T_inc']
    T_inf = params['T_inf']
    N_inf = params['N_inf']
    
    # State at time = 0 for SEIR model
    susceptible_0 = (population-N_inf)/population
    exposed_0 = 0
    infected_0 = N_inf/population
    resistant_0 = 0
    y0 = [susceptible_0, exposed_0, infected_0, resistant_0]
    
    solution = solve_ivp(SEIR_equations, [0, n_days], y0, method='RK45', max_step=1,
                    args=(R_0, T_inf, T_inc), t_eval=np.arange(n_days))
    
    solution = solution.y*population
    solution = np.around(solution, 0)
    
    if verbose:
        # Check for negative values on the predictions
        for pred, pred_name in zip(solution, ['susceptible', 'exposed', 'infected', 'resistant']):
            if not np.all(pred>=0):
                print('WARNING: Negative values on the {} predictions!'.format(pred_name))
    
    return solution


# ### Função para avaliar métricas de erro do modelo

# In[5]:


def SEIR_evaluate(params, data, population, **kwargs):
    
    # Getting function parameters
    metric = kwargs.get('metric', 'mse')
    weights = kwargs.get('weights', None)
    
    n_days = data['infection_days_t0'].iloc[-1]
    
    solution = SEIR_solve(params, population, n_days)
    
    infect_pred = solution[2]
    resist_pred = solution[3]
    confirm_pred = infect_pred+resist_pred
    
    y_true_confirm = data.filter(regex='^confirmed', axis=1).values
    window = y_true_confirm.shape[1]
    
    y_pred_confirm = np.vstack( [confirm_pred[(day-window):(day)] for day in data['infection_days_t0']] )
    
#     weights = 1 / np.arange(1, n_days+1)[::-1]  # Recent data is more heavily weighted
    
    if metric == 'mse':
        loss = mean_squared_error(y_true_confirm, y_pred_confirm, weights)
    if metric == 'rmse':
        loss = mean_squared_error(y_true_confirm, y_pred_confirm, weights, squared=False)
    elif metric == 'msle':
        loss = mean_squared_log_error(y_true_confirm, y_pred_confirm, weights)
    
    return loss


# ### Funções para ajustar parâmetros do modelo aos dados

# In[6]:


def _loss_func_helper(params_vals, params_names, fixed_params_dict, data, population, weights, metric):
    params = dict(zip(params_names, params_vals))
    params.update(fixed_params_dict)
    loss = SEIR_evaluate(params, data, population, weights=weights, metric=metric)
    return loss


# In[7]:


def SEIR_fit(data, population, bounds, **kwargs):
    
    # Getting function parameters
    metric = kwargs.get('metric', 'mse')
    weights = kwargs.get('weights', None)
    method = kwargs.get('method', 'diff_evol')
    Ns = kwargs.get('Ns', 10)
    verbose = kwargs.get('verbose', False)
    
    # Expected keys in bounds dictionary
    params_list = ['R_0', 'T_inc', 'T_inf', 'N_inf']
    
    if not (set(bounds.keys()) == set(params_list)):
        print('Dict keys must be {}. Returning None.'.format(params_list))
        return None

    optim_params_names = list()
    optim_params_bounds = list()
    fixed_params_names = list()
    fixed_params_vals = list()
    
    # Checking if params are fixed or to optimize
    for param in params_list:
        
        # Param bounds is a number, so it's a fixed param.
        if isinstance(bounds[param], Number):
            fixed_params_names.append(param)
            fixed_params_vals.append(bounds[param])
        
        # Param bounds is a sequence (min, max), so it's a param to optimize.
        elif isinstance(bounds[param], (list, tuple)):
            
            if len(bounds[param]) == 2:
                optim_params_names.append(param)
                optim_params_bounds.append(bounds[param])
            else:
                print(
                    'ERROR: {} bounds has length {}.'.format(param, len(bounds[param])),
                    'Bounds must be in the form (min,max).',
                    'Returning None.'
                )
                return None
        
        # Param bounds is a slice (start, stop, step), so it's a param to optimize using 'brute'.
        elif isinstance(bounds[param], slice):
            
            if method == 'brute':
                optim_params_names.append(param)
                optim_params_bounds.append(bounds[param])
            else:
                print(
                    'ERROR: {} bounds are in a slice object.'.format(param),
                    'Slice object must be used with method="brute".',
                    'Returning None.'
                )
                return None
        else:
            print(
                'ERROR: {} bounds specified as {}.'.format(param, type(bounds[param])),
                'Bounds must be a number, for a fixed parameter, or',
                'a sequence in the form (min,max) or a slice object',
                'in the form (start, stop, step) if method="brute".',
                'Returning None.'
                )
            return None
    
    fixed_params_dict = dict(zip(fixed_params_names, fixed_params_vals))
    
    if len(optim_params_bounds) == 0:
        print('No parameters to optimize. Returning fixed parameters.')
        return fixed_params_dict
    
    if method == 'diff_evol':
        
        optim_res = differential_evolution(
            _loss_func_helper, bounds=optim_params_bounds,
            args=(optim_params_names, fixed_params_dict,
                  data, population, weights, metric),
            popsize=40, mutation=0.8, recombination=0.9,
            updating='deferred', polish=True, workers=-1, seed=0
        )
        
        if verbose:
            print('Value of objective function:', optim_res.fun)
            print('Number of evaluations of the objective function:', optim_res.nfev)
            print('Number of iterations performed by the optimizer:', optim_res.nit)
            print('Optimizer exited successfully:', optim_res.success)
            print('Message:', optim_res.message)
            print()
        
        best_params = dict(zip(optim_params_names, optim_res.x))
        best_params.update(fixed_params_dict)
        
    elif method == 'brute':
        x_out, fval, _, _ = brute(
            _loss_func_helper, ranges=optim_params_bounds,
            args=(optim_params_names, fixed_params_dict,
                  data, population, weights, metric),
            Ns=Ns, full_output=True, finish=None, workers=-1)
        
        if verbose:
            print('Value of objective function:', fval)
        
        best_params = dict(zip(optim_params_names, x_out))
        best_params.update(fixed_params_dict)
    
    return best_params


# In[ ]:




