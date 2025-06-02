from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.orm import Session, joinedload

from lanchonete.database import get_session
from lanchonete.models import Comanda, Combo, Pedido_Item, Produto
from lanchonete.schemas import (
    ComandaOut,
    CreateComanda,
    UpdateComanda
)

router = APIRouter(prefix='/comandas', tags=['comanda'])


# --- Pedido Item e Comanda ---
@router.post('/', response_model=ComandaOut, status_code=HTTPStatus.CREATED)
def criar_comanda(comanda: CreateComanda, session: Session = Depends(get_session)):
    for item in comanda.itens:
        if not item.id_produto and not item.id_combo:
            raise HTTPException(status_code=422, detail='Cada item deve conter pelo menos id_produto ou id_combo')

    nova_comanda = Comanda(
        id_client=comanda.id_cliente,
        tipo_entrega=comanda.tipo_entrega,
        metodo_pagamento=comanda.metodo_pagamento,
        valor_a_pagar=comanda.valor_a_pagar,
        troco=comanda.troco,
        status_comanda=comanda.status_comanda.value,
        status_pagamento=comanda.status_pagamento.value,
        preco_total=0.0,  # will be updated later
    )
    session.add(nova_comanda)
    session.flush()  # needed for nova_comanda.id to be generated

    total = 0.0
    for item in comanda.itens:
        # Creates the order item
        pedido = Pedido_Item(
            id_comanda=nova_comanda.id,
            id_produto=item.id_produto,
            id_combo=item.id_combo,
            quantidade=item.quantidade,
            observacao=item.observacao,
        )

        # Searches for product or combo price
        if item.id_produto:
            produto = session.get(Produto, item.id_produto)
            if not produto:
                raise HTTPException(status_code=404, detail=f'Produto ID {item.id_produto} não encontrado')
            total += produto.preco * item.quantidade

        elif item.id_combo:
            combo = session.get(Combo, item.id_combo)
            if not combo:
                raise HTTPException(status_code=404, detail=f'Combo ID {item.id_combo} não encontrado')
            total += combo.preco * item.quantidade

        session.add(pedido)

    # Updates the total price
    nova_comanda.preco_total = total
    session.commit()
    session.refresh(nova_comanda)
    return nova_comanda


@router.get('/', response_model=List[ComandaOut])
def listar_comandas(session: Session = Depends(get_session)):
    comandas = session.scalars(select(Comanda)).all()
    return comandas


@router.delete('/{comanda_id}', status_code=HTTPStatus.NO_CONTENT)
def delete_comanda(comanda_id: int, session: Session = Depends(get_session)):
    comanda = session.scalar(select(Comanda).where(Comanda.id == comanda_id))
    if not comanda:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Comanda não encontrada")
    # Deleta todos os itens de pedido associados primeiro
    session.execute(delete(Pedido_Item).where(Pedido_Item.id_comanda == comanda_id))
    session.delete(comanda)
    session.commit()
    return

@router.put('/{comanda_id}', response_model=ComandaOut)
def update_comanda(comanda_id: int, comanda_update: UpdateComanda, session: Session = Depends(get_session)):
    comanda = session.scalar(select(Comanda).where(Comanda.id == comanda_id))
    if not comanda:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Comanda não encontrada")

    # Update fields from the request
    if comanda_update.id_cliente is not None:
        comanda.id_client = comanda_update.id_cliente
    if comanda_update.tipo_entrega is not None:
        comanda.tipo_entrega = comanda_update.tipo_entrega
    if comanda_update.metodo_pagamento is not None:
        comanda.metodo_pagamento = comanda_update.metodo_pagamento
    if comanda_update.valor_a_pagar is not None:
        comanda.valor_a_pagar = comanda_update.valor_a_pagar
    if comanda_update.troco is not None:
        comanda.troco = comanda_update.troco
    if comanda_update.status_comanda is not None:
        comanda.status_comanda = comanda_update.status_comanda  # Assuming it's an Enum
    if comanda_update.status_pagamento is not None:
        comanda.status_pagamento = comanda_update.status_pagamento  # Assuming it's an Enum


    if comanda_update.itens is not None:
        for item in comanda.pedido_item:
            session.delete(item)
        comanda.pedido_item.clear()  # Clear the relationship

        total = 0.0
        for item_data in comanda_update.itens:
            if not item_data.id_produto and not item_data.id_combo:
                raise HTTPException(
                    status_code=422,
                    detail='Cada item deve conter pelo menos id_produto ou id_combo',
                )

            pedido_item = Pedido_Item(
                id_comanda=comanda.id,
                id_produto=item_data.id_produto,
                id_combo=item_data.id_combo,
                quantidade=item_data.quantidade,
                observacao=item_data.observacao,
            )
            session.add(pedido_item)

            # Calculate total based on new items
            if item_data.id_produto:
                produto = session.get(Produto, item_data.id_produto)
                if not produto:
                    raise HTTPException(
                        status_code=404,
                        detail=f'Produto ID {item_data.id_produto} não encontrado',
                    )
                total += produto.preco * item_data.quantidade
            elif item_data.id_combo:
                combo = session.get(Combo, item_data.id_combo)
                if not combo:
                    raise HTTPException(
                        status_code=404,
                        detail=f'Combo ID {item_data.id_combo} não encontrado',
                    )
                total += combo.preco * item_data.quantidade

        comanda.preco_total = total

    session.add(comanda)
    session.commit()
    session.refresh(comanda)
    return comanda

@router.get('/{comanda_id}', response_model=ComandaOut)
def get_comanda(comanda_id: int, session: Session = Depends(get_session)):
    comanda = session.scalar(
        select(Comanda)
        # --- CRITICAL CHANGE HERE ---
        .options(
            joinedload(Comanda.pedido_item), # Eager load related items
            joinedload(Comanda.cliente_rel)  # <-- Eager load the client relationship
        )
        .where(Comanda.id == comanda_id)
    )

    if not comanda:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Comanda não encontrada")
    return comanda