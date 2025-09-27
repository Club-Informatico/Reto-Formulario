from pathlib import Path
from sqlalchemy import event
from sqlmodel import SQLModel, Session, create_engine

DB_FILE = Path(__file__).resolve().parent / "database.sqlite"
engine = create_engine(
  f"sqlite:///{DB_FILE}",
  connect_args={"check_same_thread": False},
)

@event.listens_for(engine, "connect")
def _sqlite_pragmas(dbapi_connection, connection_record):
  cur = dbapi_connection.cursor()
  cur.execute("PRAGMA journal_mode=WAL;")
  cur.execute("PRAGMA foreign_keys=ON;")
  cur.close()

def init_db() -> None:
  SQLModel.metadata.create_all(engine)

def get_session():
  with Session(engine) as session:
    yield session
