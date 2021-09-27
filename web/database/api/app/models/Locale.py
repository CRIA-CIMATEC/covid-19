"""Locale database model."""
from .. import db
from . import CommonColumns


class Locale(CommonColumns):
    """Model for Locales"""

    __tablename__ = 'locales'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    country_id = db.Column(
        db.Integer, db.ForeignKey('countries.id'), nullable=False
    )
    state_id = db.Column(db.Integer, db.ForeignKey('states.id'))
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)
    covid_case = db.relationship('CovidCase', backref='locales', lazy=True)
    covid_policy = db.relationship('CovidPolicy', backref='locales', lazy=True)
    document_expedition = db.relationship(
        'DocumentExpedition', backref='locales', lazy=True
    )
    mobility_report = db.relationship(
        'MobilityReport', backref='locales', lazy=True
    )
