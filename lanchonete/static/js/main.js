window.addEventListener("load", function () {
    const flkty = new Flickity(".gallery", {
        wrapAround: false,
        cellAlign: "center",
        contain: true,
        pageDots: false,
        prevNextButtons: true,
    });

    setTimeout(() => {
        flkty.select(2, false, true);
    }, 100);
});
const baseURL = "http://localhost:8000"; // muda se necessário

async function carregarDestaques() {
    const carrossel = document.getElementById('carrossel-destaques');

    // Puxa produtos
    const resProdutos = await fetch(`${baseURL}/produto/`);
    const dadosProdutos = await resProdutos.json();

    // Puxa combos
    const resCombos = await fetch(`${baseURL}/combos/`);
    const dadosCombos = await resCombos.json();

    // Junta os dois e filtra os populares
    const populares = [
        ...dadosProdutos.produtos.filter(p => p.popular),
        ...dadosCombos.filter(c => c.popular)
    ];

    populares.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('gallery-cell', 'card-base');

        // Verifica se é combo pela presença de `produtos` E de imagem do combo
        const isCombo = item.produtos && item.imagem_link;

        const imagem = isCombo ? item.imagem_link : item.imagem_link;
        const descricao = isCombo
            ? item.produtos.map(p => p.nome).join(', ')
            : item.descricao;

        const botaoTexto = isCombo ? "Pedir Combo" : "Pedir";

        card.innerHTML = `
            <img src="${imagem}" alt="${item.nome}">
            <h3 class="titulo-burger">${item.nome}</h3>
            <p class="descricao-burger">${descricao}</p>
            <div class="precos">
                <span class="new">R$ ${item.preco.toFixed(2)}</span>
            </div>
            <a href="comanda"><button class="btn-primario">${botaoTexto}</button></a>
            
        `;

        carrossel.appendChild(card);
    });
}


carregarDestaques();

new Granim({
    element: '#canvas-gradiente',
    direction: 'top-bottom',
    isPausedWhenNotInView: false,
    states : {
    "default-state": {
        gradients: [
        ['#E57F32', '#ED3D2D'],
        ['#9F7947', '#356F66']     
        ],
        transitionSpeed: 5000
    }
    }
});

const carrossel = document.getElementById('carrossel-destaques');
const btnEsquerda = document.getElementById('btn-esquerda');
const btnDireita = document.getElementById('btn-direita');

btnEsquerda.addEventListener('click', () => {
    carrossel.scrollBy({ left: -300, behavior: 'smooth' });
});

btnDireita.addEventListener('click', () => {
    carrossel.scrollBy({ left: 300, behavior: 'smooth' });
});