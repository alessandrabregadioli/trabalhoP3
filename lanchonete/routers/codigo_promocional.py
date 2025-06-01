from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.orm import Session, joinedload

from lanchonete.database import get_session
from lanchonete.models import CodPromocional
from lanchonete.schemas import (
    GetCodigoPromocional,
    ListCodigoPromocional,
    PostCodigoPromocional
)

router = APIRouter(prefix='/codigo_promocional', tags=['codigo_promocional'])

@router.post('/', response_model = GetCodigoPromocional, status_code=HTTPStatus.CREATED)
def post_codigo(d_codigo: PostCodigoPromocional, session: Session = Depends(get_session)):
    db_codigo = CodPromocional(**d_codigo.dict())
    session.add(db_codigo)
    session.commit()
    session.refresh(db_codigo)
    return db_codigo

@router.get('/{id_codigo}', response_model = GetCodigoPromocional)
def get_codigo(id_codigo: int, session: Session = Depends(get_session)):
    db_codigo = session.scalar(select(CodPromocional).where(CodPromocional.id == id_codigo))
    if not db_codigo:
        raise HTTPException(status_code= HTTPStatus.NOT_FOUND, detail="Código não existe")
    
    return db_codigo

@router.delete('/{id_codigo}')
def delete_codigo(id_codigo: int, session: Session = Depends(get_session)):
    db_codigo = session.scalar(select(CodPromocional).where(CodPromocional.id == id_codigo))
    if not db_codigo:
        raise HTTPException(status_code= HTTPStatus.NOT_FOUND, detail="Código não existe")
    session.delete(db_codigo)
    session.commit()
    return "Código excluído com sucesso"

@router.get('/', response_model=ListCodigoPromocional)
def get_list_codigo(session: Session = Depends(get_session)):
    codigos_db = session.scalars(select(CodPromocional)).all()
    return {"codigos": codigos_db}