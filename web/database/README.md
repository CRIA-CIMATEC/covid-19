# Forecast

Repositório contendo o código fonte das demandas desenvolvidas pela equipe de forecast.

**Organização:**

-   api: backend da aplicação web contendo modeladem do banco de dados, regras de negócio e scripts para automatização de tarefas;
-   submodules: link para o repositório individual de cada participante da equipe, assim que um requisito é finalizado o mesmo é consolidado em `api`.

## Api

### Dependências

-   python3.7
-   postgresql
-   redis server

### Instalação

#### `python3.7 -m venv venv` [opcional]

Cria um ambiente encapsulado para instalar as dependências da aplicação. Antes é prosseguir é necessário ativar o ambiente com `source venv/bin/activate`. Veja mais em [python-venv](https://docs.python.org/3.7/library/venv.html)

#### `python3.7 -m pip install -rrequirements.txt`

Realiza a instalação das dependências da api.

#### PostgreSQL

**Opções:**

1. [PostgreSQL](https://www.postgresql.org)
2. Docker: `docker run --name postgres -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=covid19 -p 5432:5432 -d postgres`

**Obs:** Recomendável a opção `2`, para isso o Docker precisa ser [instalado](https://www.docker.com/products/docker-desktop).

#### Redis server

**Instalação:**

1. `wget http://download.redis.io/redis-stable.tar.gz`
2. `tar xvzf redis-stable.tar.gz`
3. `cd redis-stable`
4. `sudo make install`
5. `redis-server --daemonize yes`

Mais informações em [redis.io](https://redis.io/)

### Uso

#### Ambiente

Necessário a criação do arquivo .env setando as variáveis de ambiente utilizadas na aplicação:

```shell
# .env
export SECRET_KEY='chave secreta'
export FLASK_ENV='modo de operação do flask (development|production|...)'
export SQLALCHEMY_DATABASE_URI='string de conexão com banco de dados'
export CELERY_BROKER_URL='redis url'
export CELERY_RESULT_BACKEND='redis url'
```

_Exemplo:_

```shell
# .env
export SECRET_KEY='secretkey%#$@#@'
export FLASK_ENV='development'
export SQLALCHEMY_DATABASE_URI='postgresql://postgres:mysecretpassword@localhost:5432/covid19'
export CELERY_BROKER_URL='redis://localhost:6379'
export CELERY_RESULT_BACKEND='redis://localhost:6379'
```

#### `flask run`

Inicia a api

#### `flask db upgrade`

Aplica as migrações do banco de dados

#### `redis-server`

Inicializa o redis server. Para verificar se o serviço está funcionando basta executar `redis-cli ping`, `PONG` deve ser retornado.

#### `celery flower -A wsgi.celery --loglevel=info --port=5555 &`

Inicializa o flower. É possível adicionar restrição de acesso com `--basic_auth`, `Google OAuth2` ou `Github OAuth`.

Mais informações em [flower-auth](https://flower.readthedocs.io/en/latest/auth.html)

#### `celery worker -A wsgi.celery --loglevel=info --logfile=celery_worker.log --detach --pidfile=''`

Inicializa o Celery Worker

#### `celery beat -A wsgi.celery --loglevel=info --logfile=celery_beat.log --detach --pidfile=''`

Inicializa o Celery Beat (para cron jobs)

#### `celery -A wsgi.celery inspect registered`

Lista todas tasks registradas

#### `celery -A wsgi.celery call task_id`

Executa a task especificada

#### `celery -A wsgi.celery --help`

Mais informações

### ERROS

**error:** `pg_config executable not found`
`sudo apt-get install libpq-dev python3.7-dev`

**error:** `error: command 'x86_64-linux-gnu-gcc' failed with exit status 1`

```shell
sudo apt-get install python3.7 python3.7-dev \
     build-essential libssl-dev libffi-dev \
     libxslt1-dev zlib1g-dev python3-pip
```

**error:** `error: invalid command 'bdist_wheel'`
`pip install wheel`
