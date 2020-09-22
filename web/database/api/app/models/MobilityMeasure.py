"""MobilityMeasure database model."""
from .. import db
from . import CommonColumns


class MobilityMeasure(CommonColumns):
    """Model for mobility measures"""

    __tablename__ = 'mobility_measures'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    mobility_report = db.relationship(
        'MobilityReport', backref='mobility_measures', lazy=True
    )
