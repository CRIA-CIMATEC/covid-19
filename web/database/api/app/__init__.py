"""Initialize app."""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_celery import Celery

db = SQLAlchemy()
migrate = Migrate()
celery = Celery()


def create_app():
    """Construct the core application."""
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object('config.Config')

    # Initialize Plugins
    db.init_app(app)
    migrate.init_app(app, db)
    celery.init_app(app)

    app.celery = celery

    with app.app_context():
        # Import parts of our application
        from . import routes

        # Create Database Models
        db.create_all()

        return app
