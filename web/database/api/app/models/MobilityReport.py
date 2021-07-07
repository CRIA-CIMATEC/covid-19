"""MobilityReport database model."""
from .. import db
from . import CommonColumns


class MobilityReport(CommonColumns):
    """Model for mobility report tracker"""

    __tablename__ = "mobility_reports"
    id = db.Column(db.DateTime, primary_key=True)
    locale_id = db.Column(
        db.Integer, db.ForeignKey('locales.id'), primary_key=True
    )
    mobility_measure_id = db.Column(
        db.Integer, db.ForeignKey('mobility_measures.id'), primary_key=True
    )
    percent = db.Column(db.Float)
