"""Routes for application."""
from flask import current_app as app
from flask import jsonify


@app.route('/')
def version():
    """Return version."""
    return jsonify(
        name='Covid19 api, developed by SENAI CIMATEC', version='v0.1.dev',
    )
