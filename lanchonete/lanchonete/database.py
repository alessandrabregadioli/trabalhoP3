from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from lanchonete.settings import Settings

settings = Settings()
engine = create_engine(
    settings.DATABASE_URL,
    pool_recycle=3600,
    pool_pre_ping=True,
    pool_size=10,       # Tamanho do pool de conexões (ex: 10 conexões prontas)
    max_overflow=30     # Quantas conexões extras podem ser criadas temporariamente (ex: +20 além do pool_size)
)

def get_session():
    db = Session(engine) # Crie a sessão
    try:
        yield db # Ceda a sessão para o endpoint/função
    finally:
        db.close()