"""DocumentExpedition database model."""
from .. import db
from . import CommonColumns


class DocumentExpedition(CommonColumns):
    """Model for document expeditions electronic"""

    __tablename__ = 'document_expeditions'
    id = db.Column(db.DateTime, primary_key=True)
    locale_id = db.Column(
        db.Integer, db.ForeignKey('locales.id'), primary_key=True
    )
    document_model_id = db.Column(
        db.Integer, db.ForeignKey('document_models.id'), primary_key=True
    )
    count = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Float, nullable=False)
