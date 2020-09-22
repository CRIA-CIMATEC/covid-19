"""App configuration."""
from os import environ, path
from dotenv import load_dotenv
from celery.schedules import crontab

basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env'))


class Config:
    """Set Flask configuration variables from .env file."""

    # General Config
    SECRET_KEY = environ.get('SECRET_KEY')
    FLASK_ENV = environ.get('FLASK_ENV')
    FLASK_APP = 'wsgi.py'

    # Flask-SQLAlchemy
    SQLALCHEMY_DATABASE_URI = environ.get('SQLALCHEMY_DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Celery
    CELERY_IMPORTS = "app.tasks"
    CELERY_BROKER_URL = environ.get('CELERY_BROKER_URL')
    CELERY_RESULT_BACKEND = environ.get('CELERY_RESULT_BACKEND')
    CELERY_ENABLE_UTC = True
    CELERY_TIMEZONE = 'America/Bahia'
    CELERYBEAT_SCHEDULE = {
        'sync-John-Hopkins-database-each-3hours': {
            'task': 'app.tasks.sync_John_Hopkins',
            'schedule': crontab(minute=0, hour='*/3'),
        },
        'sync-Oxford-database-each-3hours': {
            'task': 'app.tasks.sync_Oxford',
            'schedule': crontab(minute=2, hour='*/3'),
        },
        'sync-Sefaz-database-each-3hours': {
            'task': 'app.tasks.sync_Sefaz',
            'schedule': crontab(minute=4, hour='*/3'),
        },
        'sync-Mobility-database-each-3hours': {
            'task': 'app.tasks.sync_Mobility',
            'schedule': crontab(minute=6, hour='*/3'),
        },
        'sync-Painel-Covid-database-each-3hours': {
            'task': 'app.tasks.sync_Painel_Covid',
            'schedule': crontab(minute=8, hour='*/3'),
        },
    }
