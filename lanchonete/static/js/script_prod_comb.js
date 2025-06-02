const API_URL = 'http://127.0.0.1:8000'; // Substitua pela URL da sua API

// --- Funções de Produto ---
async function fetchProducts() {
    const response = await fetch(`${API_URL}/produto/`);
    const data = await response.json();
    const productListDiv = document.getElementById('productList');
    productListDiv.innerHTML = '';
    data.produtos.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'item-card';

        // Create the image HTML
        let productImageHtml = '';
        if (product.imagem_link) { // Check if imagem_link exists
            productImageHtml = `<img src="${product.imagem_link}" alt="${product.nome}" style="max-width: 80px; height: auto; margin-right: 15px; border-radius: 4px;">`;
        }

        productCard.innerHTML = `
            <div style="display: flex; align-items: center; width: 100%;">
                ${productImageHtml}
                <div style="flex-grow: 1;">
                    <span>${product.id} - <strong>${product.nome}</strong> - R$ ${product.preco.toFixed(2)} (${product.tipo})</span>
                </div>
                <div style="white-space: nowrap;">
                    <button class="edit" onclick="editProductPrompt(${product.id}, '${product.nome}', '${product.descricao}', '${product.imagem_link}', ${product.preco}, '${product.tipo}')">Editar</button>
                    <button onclick="deleteProduct(${product.id})">Excluir</button>
                </div>
            </div>
        `;
        productListDiv.appendChild(productCard);
    });
}

async function createProduct(event) {
    event.preventDefault();
    
    // Coleta dos valores
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const image_link = document.getElementById('productImageLink').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const popularBool = document.getElementById('produtoPopular').value === 'true'; // Conversão explícita
    const type = document.getElementById('productType').value;

    // Verificação de valores (opcional, mas recomendado)
    if (isNaN(price)) {
        alert("Preço inválido!");
        return;
    }

    const produtoData = {
        nome: name,
        descricao: description,
        imagem_link: image_link,
        preco: price,
        tipo: type,
        popular: popularBool // Já convertido para boolean
    };

    console.log("Enviando:", produtoData); // Para debug

    try {
        const response = await fetch(`${API_URL}/produto/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produtoData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro completo:", errorData); // Log mais detalhado
            throw new Error(errorData.detail || "Erro desconhecido");
        }

        alert('Produto criado com sucesso!');
        document.getElementById('createProductForm').reset();
        fetchProducts();
    } catch (error) {
        console.error("Erro completo:", error);
        alert(`Erro ao criar produto: ${error.message}`);
    }
}

async function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const response = await fetch(`${API_URL}/produto/${id}`, { method: 'DELETE' });
    if (response.ok) {
        alert('Produto excluído com sucesso!');
        fetchProducts();
    } else {
        const errorData = await response.json();
        alert(`Erro ao excluir produto: ${errorData.detail}`);
    }
}

async function editProductPrompt(id, currentName, currentDescription, currentImageLink, currentPrice, currentType, currentPopular) {
    // Obter novos valores
    const newName = prompt('Novo nome do produto:', currentName);
    if (newName === null) return;
    
    const newDescription = prompt('Nova descrição:', currentDescription);
    if (newDescription === null) return;
    
    const newImageLink = prompt('Novo link da imagem:', currentImageLink);
    if (newImageLink === null) return;
    
    const newPrice = prompt('Novo preço:', currentPrice);
    if (newPrice === null) return;
    
    const newType = prompt('Novo tipo (bebida, lanche, entrada, sobremesa):', currentType);
    if (newType === null) return;
    
    // Adicionar prompt para popular (convertendo boolean para string legível)
    const currentPopularStr = currentPopular ? 'Sim' : 'Não';
    const newPopular = confirm(`Produto popular? (Atual: ${currentPopularStr})\nClique em OK para Sim ou Cancelar para Não`);
    
    // Preparar dados atualizados
    const updatedData = {
        nome: newName,
        descricao: newDescription,
        imagem_link: newImageLink,
        preco: parseFloat(newPrice),
        tipo: newType,
        popular: newPopular // Já é boolean (true/false)
    };

    // Enviar requisição
    const response = await fetch(`${API_URL}/produto/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });

    // Tratar resposta
    if (response.ok) {
        alert('Produto atualizado com sucesso!');
        fetchProducts();
    } else {
        const errorData = await response.json();
        alert(`Erro ao atualizar produto: ${errorData.detail}`);
    }
}

// --- Funções de Combo ---
async function fetchCombos() {
    const response = await fetch(`${API_URL}/combos/`);
    const data = await response.json();
    const comboListDiv = document.getElementById('comboList');
    comboListDiv.innerHTML = '';
    data.forEach(combo => {
        const comboCard = document.createElement('div');
        comboCard.className = 'item-card';

        let comboImageHtml = '';
        if (combo.imagem_link) {
            comboImageHtml = `<img src="${combo.imagem_link}" alt="${combo.nome}" style="max-width: 100px; height: auto; margin-right: 15px; border-radius: 4px;">`;
        }

        // Get the names of the products and join them for the description
        const productNames = combo.produtos.map(product => product.nome).join(', ');

        comboCard.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                ${comboImageHtml}
                <div>
                    <h3>${combo.nome}</h3>
                    <p>Preço: R$ ${combo.preco.toFixed(2)}</p>
                </div>
            </div>
            <div class="combo-description">
                <strong>Contém:</strong> ${productNames}
            </div>
            <div>
                <button class="edit" onclick="editComboPrompt(${combo.id}, '${combo.nome}', '${combo.imagem_link}', ${combo.preco}, [${combo.produtos.map(p => p.id).join(',')}])">Editar</button>
                <button onclick="deleteCombo(${combo.id})">Excluir</button>
            </div>
        `;
        comboListDiv.appendChild(comboCard);
    });
}

async function createCombo(event) {
    event.preventDefault();
    const name = document.getElementById('comboName').value;
    const image_link = document.getElementById('comboImageLink').value;
    const price = parseFloat(document.getElementById('comboPrice').value);
    const productsInput = document.getElementById('comboProducts').value;
    const popularBool = document.getElementById('comboPopular').value === 'true'; 

    const product_ids = productsInput.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    // Basic validation
    if (isNaN(price)) {
        alert("Preço do combo inválido!");
        return;
    }
    if (product_ids.length === 0) {
        alert("Por favor, insira pelo menos um ID de produto para o combo.");
        return;
    }

    const comboData = {
        nome: name,
        imagem_link: image_link,
        preco: price,
        popular: popularBool, 
        produtos: product_ids
    };

    console.log("Enviando Combo:", comboData); // For debugging

    try {
        const response = await fetch(`${API_URL}/combos/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comboData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro completo ao criar combo:", errorData); // More detailed log
            throw new Error(errorData.detail || "Erro desconhecido ao criar combo");
        }

        alert('Combo criado com sucesso!');
        document.getElementById('createComboForm').reset();
        fetchCombos();
    } catch (error) {
        console.error("Erro na requisição do combo:", error);
        alert(`Erro ao criar combo: ${error.message}`);
    }
}

async function deleteCombo(id) {
    if (!confirm('Tem certeza que deseja excluir este combo?')) return;
    const response = await fetch(`${API_URL}/combos/${id}`, { method: 'DELETE' });
    if (response.ok) {
        alert('Combo excluído com sucesso!');
        fetchCombos();
    } else {
        const errorData = await response.json();
        alert(`Erro ao excluir combo: ${errorData.detail}`);
    }
}

async function editComboPrompt(id, currentName, currentImageLink, currentPrice, currentProductIds) {
    const newName = prompt('Novo nome do combo:', currentName);
    if (newName === null) return;
    const newImageLink = prompt('Novo link da imagem do combo:', currentImageLink);
    if (newImageLink === null) return;
    const newPrice = prompt('Novo preço do combo:', currentPrice);
    if (newPrice === null) return;
    const newProductIds = prompt('Novos IDs de produtos (separados por vírgula):', currentProductIds.join(','));
    if (newProductIds === null) return;

    const product_ids_array = newProductIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    const updatedData = {
        nome: newName,
        imagem_link: newImageLink,
        preco: parseFloat(newPrice),
        produtos: product_ids_array
    };

    const response = await fetch(`${API_URL}/combos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });

    if (response.ok) {
        alert('Combo atualizado com sucesso!');
        fetchCombos();
    } else {
        const errorData = await response.json();
        alert(`Erro ao atualizar combo: ${errorData.detail}`);
    }
}

// Global variable to store selected product IDs and their names for the current combo being created/edited
let currentSelectedProductIds = new Set();
let allAvailableProducts = []; // To store all products fetched once

// --- New Functions for Product Selection Modal ---

// Function to open the modal
function openProductSelectionModal() {
    document.getElementById('productSelectionModal').style.display = 'block';
    renderProductsForSelection();
}

// Function to close the modal
function closeProductSelectionModal() {
    document.getElementById('productSelectionModal').style.display = 'none';
}

// Function to render all products inside the selection modal
async function renderProductsForSelection() {
    const productsContainer = document.getElementById('allProductsForSelection');
    productsContainer.innerHTML = 'Carregando produtos...';

    // Fetch products only once if not already fetched
    if (allAvailableProducts.length === 0) {
        try {
            const response = await fetch(`${API_URL}/produto/`);
            const data = await response.json();
            allAvailableProducts = data.produtos; // Store all products
        } catch (error) {
            productsContainer.innerHTML = 'Erro ao carregar produtos.';
            console.error('Error fetching products for selection:', error);
            return;
        }
    }

    productsContainer.innerHTML = ''; // Clear loading message

    allAvailableProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'selection-product-card';
        // Check if this product is already selected
        if (currentSelectedProductIds.has(product.id)) {
            productCard.classList.add('selected');
        }

        productCard.innerHTML = `
            <img src="${product.imagem_link}" alt="${product.nome}" style="max-width: 100px;">
            <h4>${product.nome}</h4>
            <p>R$ ${product.preco.toFixed(2)}</p>
        `;
        productCard.onclick = () => toggleProductSelection(product.id, productCard);
        productsContainer.appendChild(productCard);
    });
}

// Function to toggle selection of a product in the modal
function toggleProductSelection(productId, cardElement) {
    if (currentSelectedProductIds.has(productId)) {
        currentSelectedProductIds.delete(productId);
        cardElement.classList.remove('selected');
    } else {
        currentSelectedProductIds.add(productId);
        cardElement.classList.add('selected');
    }
    updateSelectedProductsDisplay();
}

// Function to update the display of selected products below the "Selecionar Produtos" button
function updateSelectedProductsDisplay() {
    const displayDiv = document.getElementById('selectedProductsDisplay');
    displayDiv.innerHTML = ''; // Clear previous display

    if (currentSelectedProductIds.size === 0) {
        displayDiv.innerHTML = 'Nenhum produto selecionado.';
        document.getElementById('comboProductsHidden').value = ''; // Clear hidden input
        return;
    }

    const selectedProductNames = [];
    currentSelectedProductIds.forEach(id => {
        const product = allAvailableProducts.find(p => p.id === id);
        if (product) {
            selectedProductNames.push(product.nome);
            const tag = document.createElement('span');
            tag.className = 'selected-product-tag';
            tag.innerHTML = `${product.nome} <span class="remove-tag" data-product-id="${product.id}">&times;</span>`;
            tag.querySelector('.remove-tag').onclick = (e) => {
                e.stopPropagation(); // Prevent card click event
                removeProductFromSelection(product.id);
            };
            displayDiv.appendChild(tag);
        }
    });

    // Update the hidden input field with comma-separated IDs
    document.getElementById('comboProductsHidden').value = Array.from(currentSelectedProductIds).join(',');
}

// Function to remove a product directly from the display tags
function removeProductFromSelection(productId) {
    currentSelectedProductIds.delete(productId);
    updateSelectedProductsDisplay();
    // Also, update the modal's card state if it's open
    const cardInModal = document.querySelector(`#allProductsForSelection .selection-product-card:has(img[alt="${allAvailableProducts.find(p => p.id === productId)?.nome}"])`);
    if (cardInModal) {
        cardInModal.classList.remove('selected');
    }
}


// --- Modified `createCombo` function ---
async function createCombo(event) {
    event.preventDefault();
    const name = document.getElementById('comboName').value;
    const image_link = document.getElementById('comboImageLink').value;
    const price = parseFloat(document.getElementById('comboPrice').value);
    // Get product IDs from the hidden input, which is updated by the selection modal
    const productsInput = document.getElementById('comboProductsHidden').value;
    const product_ids = productsInput.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id) && id !== ''); // Filter out empty strings from split

    if (product_ids.length === 0) {
        alert('Por favor, selecione pelo menos um produto para o combo.');
        return;
    }

    const response = await fetch(`${API_URL}/combos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: name, imagem_link: image_link, preco: price, produtos: product_ids })
    });
    if (response.ok) {
        alert('Combo criado com sucesso!');
        document.getElementById('createComboForm').reset();
        currentSelectedProductIds.clear(); // Clear selected products after creation
        updateSelectedProductsDisplay(); // Reset the display
        fetchCombos();
    } else {
        const errorData = await response.json();
        alert(`Erro ao criar combo: ${errorData.detail}`);
    }
}


// --- Event Listeners and Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    fetchCombos();
    document.getElementById('createProductForm').addEventListener('submit', createProduct);
    document.getElementById('createComboForm').addEventListener('submit', createCombo);

    // Event listeners for the new product selection modal
    document.getElementById('openProductSelection').addEventListener('click', openProductSelectionModal);
    document.querySelector('#productSelectionModal .close-button').addEventListener('click', closeProductSelectionModal);
    document.getElementById('saveSelectionButton').addEventListener('click', closeProductSelectionModal); // Save just closes the modal
});

// Initial call to update display if needed (e.g., on page load, if editing an existing combo)
updateSelectedProductsDisplay();
// --- Inicialização ---
