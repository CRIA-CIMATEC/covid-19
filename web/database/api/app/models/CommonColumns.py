"""CommonColumns abstract database model."""
from .. import db


class CommonColumns(db.Model):
    __abstract__ = True
    _created = db.Column(db.DateTime, default=db.func.now())
    _updated = db.Column(
        db.DateTime, default=db.func.now(), onupdate=db.func.now()
    )
