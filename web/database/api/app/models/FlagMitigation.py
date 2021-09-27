"""FlagMitigation database model."""
from .. import db
from . import CommonColumns


class FlagMitigation(CommonColumns):
    """Model for flags of mitigation measures"""

    __tablename__ = 'flags_mitigation'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    covid_policy = db.relationship(
        'CovidPolicy', backref='flags_mitigation', lazy=True
    )
