"""DocumentModel database model."""
from .. import db
from . import CommonColumns


class DocumentModel(CommonColumns):
    """Model for document model electronic"""

    __tablename__ = 'document_models'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    name = db.Column(db.String(100), unique=True, nullable=False)
    document_expedition = db.relationship(
        'DocumentExpedition', backref='document_models', lazy=True
    )
