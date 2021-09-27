"""feat: adds covid_case view

Revision ID: 1f9c7c0edf0d
Revises: dd9ff7c566bc
Create Date: 2020-05-28 15:27:22.095814

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '1f9c7c0edf0d'
down_revision = 'dd9ff7c566bc'
branch_labels = None
depends_on = None


class ReplaceableObject(object):
    def __init__(self, name, sqltext):
        self.name = name
        self.sqltext = sqltext


covid_case_view = ReplaceableObject(
    "covid_case_view",
    """
    SELECT cc.id, c.name, cc.confirmed, cc.recovered, cc.deaths
    FROM covid_cases cc
        INNER JOIN locales l ON l.id = cc.locale_id
        INNER JOIN countries c on l.country_id = c.id
    WHERE l.state_id isnull
    ORDER BY cc.id, c.name ASC;
    """,
)


def upgrade():
    op.create_view(covid_case_view)


def downgrade():
    op.drop_view(covid_case_view)
