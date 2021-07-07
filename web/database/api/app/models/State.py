"""State database model."""
from .. import db
from . import CommonColumns


# TODO: Adds Internationalization with SQLAlchemy-i18n
class State(CommonColumns):
    """Model for States"""

    __tablename__ = 'states'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    locales = db.relationship('Locale', backref='states', lazy=True)
