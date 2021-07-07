"""CovidPolicy database model."""
from .. import db
from . import CommonColumns


class CovidPolicy(CommonColumns):
    """Model for covid policy tracker"""

    __tablename__ = "covid_policies"
    id = db.Column(db.DateTime, primary_key=True)
    locale_id = db.Column(
        db.Integer, db.ForeignKey('locales.id'), primary_key=True
    )
    mitigation_measure_id = db.Column(
        db.Integer, db.ForeignKey('mitigation_measures.id'), primary_key=True
    )
    flag_mitigation_id = db.Column(
        db.Integer, db.ForeignKey('flags_mitigation.id')
    )
    density_mitigation_id = db.Column(
        db.Integer, db.ForeignKey('densities_mitigation.id')
    )
