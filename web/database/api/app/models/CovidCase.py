"""CovidCase database model."""
from .. import db
from . import CommonColumns


class CovidCase(CommonColumns):
    """Model for covid cases"""

    __tablename__ = 'covid_cases'
    id = db.Column(db.DateTime, primary_key=True)
    locale_id = db.Column(
        db.Integer, db.ForeignKey('locales.id'), primary_key=True
    )
    confirmed = db.Column(db.Integer)
    recovered = db.Column(db.Integer)
    deaths = db.Column(db.Integer)
