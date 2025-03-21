# to run almbic migration

    alembic revision --autogenerate -m "Initial migration"
    alembic upgrade head

# to run using uv

    uvicorn app.main:app --reload
