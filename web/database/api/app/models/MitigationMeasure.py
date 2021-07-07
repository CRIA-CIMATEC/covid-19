"""MigitaionMeasure database model."""
from .. import db
from . import CommonColumns


class MitigationMeasure(CommonColumns):
    """Model for mitigation measures"""

    __tablename__ = 'mitigation_measures'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    name = db.Column(db.String(100), unique=True, nullable=False)
    covid_policy = db.relationship(
        'CovidPolicy', backref='mitigation_measures', lazy=True
    )
