"""Country database model."""
from .. import db
from . import CommonColumns


# TODO: Adds Internationalization with SQLAlchemy-i18n
class Country(CommonColumns):
    """Model for Countries"""

    __tablename__ = 'countries'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    locales = db.relationship('Locale', backref='countries', lazy=True)
