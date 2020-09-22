"""feat: adds covid_case view for Brazilian states

Revision ID: 17edc656a549
Revises: 986152862257
Create Date: 2020-06-12 19:13:21.164690

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '17edc656a549'
down_revision = '986152862257'
branch_labels = None
depends_on = None


class ReplaceableObject(object):
    def __init__(self, name, sqltext):
        self.name = name
        self.sqltext = sqltext


covid_case_brazil_view = ReplaceableObject(
    "covid_case_brazil_view",
    """
    SELECT cc.id, c.name as country, s.name as state, cc.confirmed, cc.recovered, cc.deaths
    FROM covid_cases cc
        INNER JOIN locales l ON l.id = cc.locale_id
        INNER JOIN countries c on l.country_id = c.id
        INNER JOIN states s on s.id = l.state_id
    WHERE l.state_id is not null and c.name = 'Brazil'
    ORDER BY cc.id, state ASC;
    """,
)


def upgrade():
    op.create_view(covid_case_brazil_view)


def downgrade():
    op.drop_view(covid_case_brazil_view)
