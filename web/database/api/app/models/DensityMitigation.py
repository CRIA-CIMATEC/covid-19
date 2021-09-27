"""DensityMitigation database model."""
from .. import db
from . import CommonColumns


class DensityMitigation(CommonColumns):
    """Model for densities of the mitigation measures"""

    __tablename__ = 'densities_mitigation'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    covid_policy = db.relationship(
        'CovidPolicy', backref='densities_mitigation', lazy=True
    )
