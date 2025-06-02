const BASE_API_URL = 'http://127.0.0.1:8000'; // **AJUSTE ESTA URL SE SUA API ESTIVER EM OUTRO LUGAR**
let selectedItems = {}; // Stores selected products and combos with their quantities and observations
let allProducts = []; // Cache for product data
let allCombos = [];   // Cache for combo data

// Function to update quantity for an item/combo
function updateQuantity(inputId, change) {
    const inputElement = document.getElementById(inputId);
    let currentValue = parseInt(inputElement.value);
    currentValue = isNaN(currentValue) ? 0 : currentValue;
    let newValue = currentValue + change;

    if (newValue < 0) {
        newValue = 0;
    }
    inputElement.value = newValue;
    updateSelectedItems();
}

// Function to update the selectedItems object and refresh the summary
function updateSelectedItems() {
    selectedItems = {};
    let total = 0;

    // Get all product inputs
    document.querySelectorAll('#product-list input[type="number"]').forEach(input => {
        const quantity = parseInt(input.value);
        if (quantity > 0) {
            const productId = parseInt(input.dataset.id);
            const product = allProducts.find(p => p.id === productId);

            if (product) {
                const observacaoInput = document.querySelector(`#product-observacao-${productId}`);
                const observacao = observacaoInput ? observacaoInput.value : '';

                selectedItems[`product-${productId}`] = {
                    id_produto: productId,
                    quantidade: quantity,
                    observacao: observacao,
                    price: product.preco,
                    name: product.nome, // Store name for summary
                    type: 'product'
                };
                total += product.preco * quantity;
            }
        }
    });

    // Get all combo inputs
    document.querySelectorAll('#combo-list input[type="number"]').forEach(input => {
        const quantity = parseInt(input.value);
        if (quantity > 0) {
            const comboId = parseInt(input.dataset.id);
            const combo = allCombos.find(c => c.id === comboId);

            if (combo) {
                const observacaoInput = document.querySelector(`#combo-observacao-${comboId}`);
                const observacao = observacaoInput ? observacaoInput.value : '';

                selectedItems[`combo-${comboId}`] = {
                    id_combo: comboId,
                    quantidade: quantity,
                    observacao: observacao,
                    price: combo.preco,
                    name: combo.nome, // Store name for summary
                    type: 'combo'
                };
                total += combo.preco * quantity;
            }
        }
    });

    renderOrderSummary(total);
}

// Function to render the order summary
function renderOrderSummary(total) {
    const summaryDiv = document.getElementById('order-summary-details');
    summaryDiv.innerHTML = ''; // Clear previous summary
    const finalTotalSpan = document.getElementById('final-total');
    const valorPagarInput = document.getElementById('valorPagar');

    if (Object.keys(selectedItems).length === 0) {
        summaryDiv.innerHTML = '<p>No items selected yet. Start adding your favorites!</p>';
    } else {
        for (const key in selectedItems) {
            const item = selectedItems[key];
            const itemPrice = (item.price * item.quantidade).toFixed(2);
            summaryDiv.innerHTML += `
                <p><strong>${item.name}</strong> x ${item.quantidade} - R$ ${itemPrice}</p>
                ${item.observacao ? `<p style="font-size:0.9em; margin-left:15px;"><em>Note: ${item.observacao}</em></p>` : ''}
            `;
        }
    }
    finalTotalSpan.textContent = total.toFixed(2);
    valorPagarInput.value = total.toFixed(2);
}

// Function to fetch products from the API and render them
async function fetchAndRenderProducts() {
    const productListDiv = document.getElementById('product-list');
    productListDiv.innerHTML = '<p class="loading-message">Loading products...</p>';
    try {
        const response = await fetch(`${BASE_API_URL}/produto/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();

        // Adjust here - access the 'produtos' property of the object
        allProducts = responseData.produtos || [];

        if (allProducts.length === 0) {
            productListDiv.innerHTML = '<p>No products available at the moment. Check back later!</p>';
            return;
        }

        productListDiv.innerHTML = ''; // Limpa a mensagem de loading

        allProducts.forEach(product => {
            // Add a "Popular" tag if product.popular is true
            const popularTag = product.popular ? '<span class="popular-tag">Popular</span>' : '';

            const productCard = `
                <div class="item-card">
                    ${popularTag}
                    <img src="${product.imagem_link || 'https://via.placeholder.com/150'}" alt="${product.nome}">
                    <h3>${product.nome}</h3>
                    <p>${product.descricao}</p>
                    <p class="price">R$ ${product.preco.toFixed(2)}</p>
                    <div class="quantity-control">
                        <button type="button" onclick="updateQuantity('product-${product.id}', -1)">-</button>
                        <input type="number" id="product-${product.id}" value="0" min="0" data-id="${product.id}" data-type="product">
                        <button type="button" onclick="updateQuantity('product-${product.id}', 1)">+</button>
                    </div>
                    <input type="text" id="product-observacao-${product.id}" placeholder="Special requests?">
                </div>
            `;
            productListDiv.innerHTML += productCard;
        });

        addEventListenersToQuantityControls();
        addEventListenersToObservationInputs();
    } catch (error) {
        console.error('Error fetching products:', error);
        productListDiv.innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
    }
}

// Function to fetch combos from the API and render them
async function fetchAndRenderCombos() {
    const comboListDiv = document.getElementById('combo-list');
    comboListDiv.innerHTML = '<p class="loading-message">Loading combos...</p>';
    try {
        const response = await fetch(`${BASE_API_URL}/combos/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allCombos = await response.json();
        comboListDiv.innerHTML = ''; // Clear loading message

        if (allCombos.length === 0) {
            comboListDiv.innerHTML = '<p>No combos available at the moment. Check back later!</p>';
            return;
        }

        allCombos.forEach(combo => {
            const productNames = combo.produtos.map(p => p.nome).join(', ');
            // Add a "Popular" tag if combo.popular is true
            const popularTag = combo.popular ? '<span class="popular-tag">Popular</span>' : '';

            const comboCard = `
                <div class="combo-card">
                    ${popularTag}
                    <img src="${combo.imagem_link || 'https://via.placeholder.com/150'}" alt="${combo.nome}">
                    <h3>${combo.nome}</h3>
                    <p class="combo-products">Includes: ${productNames}</p>
                    <p class="price">R$ ${combo.preco.toFixed(2)}</p>
                    <div class="quantity-control">
                        <button type="button" onclick="updateQuantity('combo-${combo.id}', -1)">-</button>
                        <input type="number" id="combo-${combo.id}" value="0" min="0" data-id="${combo.id}" data-type="combo">
                        <button type="button" onclick="updateQuantity('combo-${combo.id}', 1)">+</button>
                    </div>
                    <input type="text" id="combo-observacao-${combo.id}" placeholder="Special requests?">
                </div>
            `;
            comboListDiv.innerHTML += comboCard;
        });
        addEventListenersToQuantityControls();
        addEventListenersToObservationInputs();
    } catch (error) {
        console.error('Error fetching combos:', error);
        comboListDiv.innerHTML = '<p class="error-message">Failed to load combos. Please try again later.</p>';
    }
}

// Helper function to add event listeners to newly rendered quantity controls
function addEventListenersToQuantityControls() {
    document.querySelectorAll('.quantity-control button').forEach(button => {
        // Remove existing listeners to prevent duplicates
        button.removeEventListener('click', updateSelectedItems);
        button.addEventListener('click', updateSelectedItems);
    });
    document.querySelectorAll('.quantity-control input[type="number"]').forEach(input => {
        input.removeEventListener('input', updateSelectedItems);
        input.addEventListener('input', updateSelectedItems);
    });
}

// Helper function to add event listeners to newly rendered observation inputs
function addEventListenersToObservationInputs() {
    document.querySelectorAll('input[id$="-observacao-"]').forEach(input => {
        input.removeEventListener('input', updateSelectedItems);
        input.addEventListener('input', updateSelectedItems);
    });
}


// Handle form submission
document.getElementById('comandaForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const comandaData = {
        id_cliente: document.getElementById('clienteId').value ? parseInt(document.getElementById('clienteId').value) : null,
        tipo_entrega: document.getElementById('tipoEntrega').value,
        metodo_pagamento: document.getElementById('metodoPagamento').value,
        valor_a_pagar: parseFloat(document.getElementById('valorPagar').value),
        troco: parseFloat(document.getElementById('troco').value),
        itens: []
    };

    for (const key in selectedItems) {
        const item = selectedItems[key];
        if (item.quantidade > 0) { // Only add items with quantity > 0
            const comandaItem = {
                quantidade: item.quantidade,
                observacao: item.observacao
            };
            if (item.type === 'product') {
                comandaItem.id_produto = item.id_produto;
            } else if (item.type === 'combo') {
                comandaItem.id_combo = item.id_combo;
            }
            comandaData.itens.push(comandaItem);
        }
    }

    if (comandaData.itens.length === 0) {
        alert('Please select at least one item or combo before placing your order.');
        return;
    }

    console.log('Sending Comanda Data:', comandaData); // For debugging

    try {
        const response = await fetch(`${BASE_API_URL}/comandas/`, { // Adjust API endpoint if necessary
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comandaData)
        });

        if (response.ok) {
            const result = await response.json();
            alert('Order placed successfully! Your order ID is: ' + result.id + '\nTotal: R$' + result.preco_total.toFixed(2));
            // Optionally, clear the form or redirect
            document.getElementById('comandaForm').reset();
            // Reset quantities in cards
            document.querySelectorAll('input[type="number"]').forEach(input => input.value = 0);
            document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
            updateSelectedItems(); // Reset summary
        } else {
            const errorData = await response.json();
            alert('Failed to place order: ' + (errorData.detail || 'Unknown error'));
            console.error('API Error:', errorData);
        }
    } catch (error) {
        console.error('Network or other error:', error);
        alert('An error occurred while placing your order. Please try again.');
    }
});

// Initial load: Fetch products and combos when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderProducts();
    fetchAndRenderCombos();
    updateSelectedItems(); // Initial summary render
});