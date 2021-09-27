"""App entry point."""
import sys
import logging
from app import create_app

logging.basicConfig(stream=sys.stderr)
sys.path.insert(0, "/var/www/forecast-api/")

application = create_app()
celery = application.celery

if __name__ == "__main__":
    application.run(host='0.0.0.0', debug=True)
