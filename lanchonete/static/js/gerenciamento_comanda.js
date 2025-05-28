const BASE_API_URL = 'http://127.0.0.1:8000';
let currentComandaId = null;
let allComandas = [];

// DOM Elements
const comandasContainer = document.getElementById('comandasContainer');
const comandaModal = document.getElementById('comandaModal');
const confirmModal = document.getElementById('confirmModal');
const closeBtn = document.querySelector('.close-btn');
const refreshBtn = document.getElementById('refreshBtn');
const saveBtn = document.getElementById('saveBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadComandas();

    closeBtn.addEventListener('click', () => comandaModal.style.display = 'none');
    refreshBtn.addEventListener('click', loadComandas);
    saveBtn.addEventListener('click', saveComandaChanges);
    editBtn.addEventListener('click', editComanda);
    deleteBtn.addEventListener('click', showDeleteConfirmation);
    confirmYes.addEventListener('click', deleteComanda);
    confirmNo.addEventListener('click', () => confirmModal.style.display = 'none');

    statusFilter.addEventListener('change', filterComandas);
    searchInput.addEventListener('input', filterComandas);

    window.addEventListener('click', (event) => {
        if (event.target === comandaModal) {
            comandaModal.style.display = 'none';
        }
        if (event.target === confirmModal) {
            confirmModal.style.display = 'none';
        }
    });
});

// Load all comandas from API
async function loadComandas() {
    try {
        comandasContainer.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Carregando comandas...</div>';

        const response = await fetch(`${BASE_API_URL}/comandas/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allComandas = await response.json();
        renderComandas(allComandas);
    } catch (error) {
        console.error('Error loading comandas:', error);
        comandasContainer.innerHTML = '<div class="error-message">Erro ao carregar comandas. Tente novamente.</div>';
    }
}

// Render comandas as cards
function renderComandas(comandas) {
    if (comandas.length === 0) {
        comandasContainer.innerHTML = '<div class="no-results">Nenhuma comanda encontrada.</div>';
        return;
    }

    comandasContainer.innerHTML = '';

    comandas.forEach(comanda => {
        const comandaCard = document.createElement('div');
        comandaCard.className = 'comanda-card';
        comandaCard.dataset.id = comanda.id;
        comandaCard.dataset.status = comanda.status_comanda;

        // Format date
        const dataRegistro = new Date(comanda.data_registro);
        const formattedDate = dataRegistro.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Get first few items for preview
        const itemsPreview = comanda.pedido_item.slice(0, 3).map(item => {
            const name = item.id_produto ? `Produto #${item.id_produto}` : `Combo #${item.id_combo}`;
            return `${item.quantidade}x ${name}`;
        }).join(', ');

        comandaCard.innerHTML = `
            <div class="comanda-header">
                <span class="comanda-id">#${comanda.id}</span>
                <span class="comanda-status status-${comanda.status_comanda.replace(' ', '-')}">
                    ${comanda.status_comanda}
                </span>
            </div>
            <p class="comanda-cliente">${comanda.cliente_rel ? `Cliente: ${comanda.cliente_rel.nome}` : 'Cliente não informado'}</p>
            <p class="comanda-metadata">${formattedDate}</p>
            <p class="comanda-metadata">${comanda.tipo_entrega} • ${comanda.metodo_pagamento}</p>
            <p class="comanda-items-preview">${itemsPreview}${comanda.pedido_item.length > 3 ? '...' : ''}</p>
            <p class="comanda-total">Total: R$ ${comanda.preco_total.toFixed(2)}</p>
        `;

        comandaCard.addEventListener('click', () => openComandaModal(comanda.id));
        comandasContainer.appendChild(comandaCard);
    });
}

// Filter comandas by status and search
function filterComandas() {
    const status = statusFilter.value;
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = allComandas;

    if (status !== 'all') {
        filtered = filtered.filter(comanda => comanda.status_comanda === status);
    }

    if (searchTerm) {
        filtered = filtered.filter(comanda => {
            return comanda.id.toString().includes(searchTerm) ||
                   (comanda.cliente_rel && comanda.cliente_rel.nome.toLowerCase().includes(searchTerm)) || // Agora verificando cliente_rel
                   (comanda.id_cliente && comanda.id_cliente.toString().includes(searchTerm)) ||
                   comanda.pedido_item.some(item =>
                       (item.id_produto && item.id_produto.toString().includes(searchTerm)) ||
                       (item.id_combo && item.id_combo.toString().includes(searchTerm))
                   );
        });
    }

    renderComandas(filtered);
}

// Open modal with comanda details
async function openComandaModal(comandaId) {
    try {
        currentComandaId = comandaId;

        const response = await fetch(`${BASE_API_URL}/comandas/${comandaId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const comanda = await response.json();
        // The comanda object now should include the 'cliente' data if the backend is updated
        displayComandaDetails(comanda);
        comandaModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading comanda details:', error);
        alert('Erro ao carregar detalhes da comanda.');
    }
}

// Display comanda details in modal
async function displayComandaDetails(comanda) {
    // Format date
    const dataRegistro = new Date(comanda.data_registro);
    const formattedDate = dataRegistro.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Set basic info
    document.getElementById('comandaId').textContent = comanda.id;

    // **UPDATED**: Display client name and address directly from the comanda object
     const clienteInfoElement = document.getElementById('clienteInfo');
    if (comanda.cliente_rel) { // Agora verificando cliente_rel
        let clientDetails = `<strong>${comanda.cliente_rel.nome}</strong>`;
        if (comanda.cliente_rel.email) {
            clientDetails += `<br>Email: ${comanda.cliente_rel.email}`;
        }
        if (comanda.cliente_rel.telefone) {
            clientDetails += `<br>Telefone: ${comanda.cliente_rel.telefone}`;
        }
        if (comanda.cliente_rel.endereco_rua && comanda.cliente_rel.endereco_num_residencia) {
            clientDetails += `<br>Endereço: ${comanda.cliente_rel.endereco_rua}, ${comanda.cliente_rel.endereco_num_residencia}`;
            if (comanda.cliente_rel.endereco_complemento) {
                clientDetails += `, ${comanda.cliente_rel.endereco_complemento}`;
            }
            if (comanda.cliente_rel.endereco_bairro) {
                clientDetails += ` - ${comanda.cliente_rel.endereco_bairro}`;
            }
            if (comanda.cliente_rel.endereco_cidade) {
                clientDetails += ` (${comanda.cliente_rel.endereco_cidade})`;
            }
        }
        clienteInfoElement.innerHTML = clientDetails;
    } else {
        clienteInfoElement.textContent = 'Não informado';
    }

    document.getElementById('tipoEntrega').textContent = comanda.tipo_entrega;
    document.getElementById('metodoPagamento').textContent = comanda.metodo_pagamento;
    document.getElementById('dataComanda').textContent = formattedDate;
    document.getElementById('totalComanda').textContent = comanda.preco_total.toFixed(2);
    document.getElementById('valorPagar').textContent = comanda.valor_a_pagar.toFixed(2);
    document.getElementById('trocoComanda').textContent = comanda.troco.toFixed(2);

    // Set status selects
    document.getElementById('statusComandaSelect').value = comanda.status_comanda;
    document.getElementById('statusPagamentoSelect').value = comanda.status_pagamento;

    // Render items
    const itemsList = document.getElementById('itensList');
    itemsList.innerHTML = '';

    if (comanda.pedido_item.length === 0) {
        itemsList.innerHTML = '<p>Nenhum item nesta comanda.</p>';
    } else {
        // Use Promise.all to fetch all product/combo details concurrently
        const itemDetailsPromises = comanda.pedido_item.map(async item => {
            if (item.id_produto) {
                const product = await getProductDetails(item.id_produto);
                return {
                    name: product.nome || `Produto #${item.id_produto}`,
                    price: product.preco || 0,
                    quantity: item.quantidade,
                    observation: item.observacao
                };
            } else if (item.id_combo) {
                const combo = await getComboDetails(item.id_combo);
                return {
                    name: combo.nome || `Combo #${item.id_combo}`,
                    price: combo.preco || 0,
                    quantity: item.quantidade,
                    observation: item.observacao
                };
            }
            return null;
        });

        const itemsWithDetails = await Promise.all(itemDetailsPromises);

        itemsWithDetails.forEach(itemDetail => {
            if (!itemDetail) return; // Skip if item details couldn't be fetched

            const itemElement = document.createElement('div');
            itemElement.className = 'item-row';

            const totalItemPrice = (itemDetail.quantity * itemDetail.price).toFixed(2);

            itemElement.innerHTML = `
                <div>
                    <span class="item-name">${itemDetail.name}</span>
                    <span class="item-quantity">x${itemDetail.quantity}</span>
                    ${itemDetail.observation ? `<p class="item-observation">Obs: ${itemDetail.observation}</p>` : ''}
                </div>
                <span class="item-price">R$ ${totalItemPrice}</span>
            `;

            itemsList.appendChild(itemElement);
        });
    }
}


// Helper function to get product details (price and name)
async function getProductDetails(productId) {
    try {
        const response = await fetch(`${BASE_API_URL}/produto/${productId}`); // Assuming /produtos endpoint
        if (!response.ok) return { preco: 0, nome: `Produto #${productId}` };
        const product = await response.json();
        return { preco: product.preco || 0, nome: product.nome || `Produto #${productId}` };
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return { preco: 0, nome: `Produto #${productId}` };
    }
}

// Helper function to get combo details (price and name)
async function getComboDetails(comboId) {
    try {
        const response = await fetch(`${BASE_API_URL}/combos/${comboId}`);
        if (!response.ok) return { preco: 0, nome: `Combo #${comboId}` };
        const combo = await response.json();
        return { preco: combo.preco || 0, nome: combo.nome || `Combo #${comboId}` };
    } catch (error) {
        console.error(`Error fetching combo ${comboId}:`, error);
        return { preco: 0, nome: `Combo #${comboId}` };
    }
}


// Save changes to comanda status
async function saveComandaChanges() {
    const statusComanda = document.getElementById('statusComandaSelect').value;
    const statusPagamento = document.getElementById('statusPagamentoSelect').value;

    try {
        const response = await fetch(`${BASE_API_URL}/comandas/${currentComandaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status_comanda: statusComanda,
                status_pagamento: statusPagamento
            })
        });

        if (response.ok) {
            alert('Comanda atualizada com sucesso!');
            loadComandas();
            comandaModal.style.display = 'none';
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Erro ao atualizar comanda');
        }
    } catch (error) {
        console.error('Error updating comanda:', error);
        alert(error.message);
    }
}

// Show delete confirmation modal
function showDeleteConfirmation() {
    document.getElementById('confirmMessage').textContent =
        `Tem certeza que deseja excluir a comanda #${currentComandaId}? Esta ação não pode ser desfeita.`;
    confirmModal.style.display = 'flex';
}

// Delete comanda
async function deleteComanda() {
    try {
        const response = await fetch(`${BASE_API_URL}/comandas/${currentComandaId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Comanda excluída com sucesso!');
            loadComandas();
            confirmModal.style.display = 'none';
            comandaModal.style.display = 'none';
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Erro ao excluir comanda');
        }
    } catch (error) {
        console.error('Error deleting comanda:', error);
        alert(error.message);
    }
}

// Edit comanda (would redirect to edit page in a real app)
function editComanda() {
    alert('Funcionalidade de edição completa será implementada em uma próxima versão.');
    // In a real app, you would redirect to an edit page or open an edit modal
    // window.location.href = `editar_comanda.html?id=${currentComandaId}`;
}