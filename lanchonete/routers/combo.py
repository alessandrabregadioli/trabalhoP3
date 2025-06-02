from typing import List

from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from lanchonete.database import get_session
from lanchonete.models import Combo, Produto, Combo_Produto
from lanchonete.schemas import (
    GetCombo,
    PostCombo,
)

router = APIRouter(prefix='/combos', tags=['combo'])


# ------ COMBO ------
@router.post('/', response_model=GetCombo)
def criar_combo(combo: PostCombo, session: Session = Depends(get_session)):
    produtos = session.query(Produto).filter(Produto.id.in_(combo.produtos)).all()
    if not produtos or len(produtos) != len(combo.produtos):
        raise HTTPException(status_code=400, detail='Um ou mais produtos não encontrados')
    novo_combo = Combo(nome=combo.nome, imagem_link=combo.imagem_link, preco=combo.preco, produtos=produtos, popular = str(combo.popular))
    session.add(novo_combo)
    session.commit()
    session.refresh(novo_combo)
    return novo_combo


@router.get('/', response_model=List[GetCombo])
def get_combos(session: Session = Depends(get_session)):
    return session.scalars(select(Combo)).all()


@router.get('/{combo_id}', response_model=GetCombo)
def get_combo(combo_id: int, session: Session = Depends(get_session)):
    combo = session.scalar(select(Combo).where(Combo.id == combo_id))
    if not combo:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Combo não encontrado")
    return combo


@router.delete('/{combo_id}')
def delete_combo(combo_id: int, session: Session = Depends(get_session)):
    combo = session.scalar(select(Combo).where(Combo.id == combo_id))
    if not combo:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Combo não encontrado")
    session.delete(combo)
    session.commit()
    return "Combo excluído com sucesso"

@router.put('/{combo_id}', response_model=GetCombo)
def atualizar_combo(combo_id: int, combo_atualizacao: PostCombo, session: Session = Depends(get_session)):
    combo = session.scalar(select(Combo).where(Combo.id == combo_id))
    if not combo:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Combo não encontrado")

    # Update basic combo attributes
    combo.nome = combo_atualizacao.nome
    combo.imagem_link = combo_atualizacao.imagem_link
    combo.preco = combo_atualizacao.preco

    # Handle product associations
    if combo_atualizacao.produtos is not None:
        # Fetch the products to associate
        produtos_para_associar = session.query(Produto).filter(Produto.id.in_(combo_atualizacao.produtos)).all()

        # Check if all provided product IDs exist
        if len(produtos_para_associar) != len(combo_atualizacao.produtos):
            raise HTTPException(status_code=400, detail='Um ou mais produtos para associação não encontrados')

        # Clear existing associations and add new ones
        combo.produtos.clear()  # This clears the associated products in the Python object
        combo.produtos.extend(produtos_para_associar) # This adds the new products to the Python object

    session.add(combo) # Re-add the combo to the session for it to detect changes in relationships
    session.commit()
    session.refresh(combo)
    return combo