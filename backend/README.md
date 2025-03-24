# to run almbic migration

    alembic revision --autogenerate -m "Initial migration"
    alembic upgrade head

# to run using uv

    uvicorn app.main:app --reload


# to get a hash string:
    penssl rand -hex 32


# todos
    -   add category on habit
    -   create a streak model
    -   One of the most important parts of a streak system is managing dates correctly across   different timezones. Users expect their streaks to reset at their local midnight, not based on server time