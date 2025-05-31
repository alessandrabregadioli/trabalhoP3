// Menu data
const menuItems = [
  {
    id: 1,
    name: "BACONBUNGA",
    description:
      "Pão brioche artesanal douradinho no capricho, cheddar derretido de dar onda e uma avalanche de bacon crocante — tipo, MUITO bacon mesmo.",
    price: 24.99,
    image: "https://via.placeholder.com/200x200/fb923c/ffffff?text=BACON",
    category: "burgers",
    popular: true,
  },
  {
    id: 2,
    name: "SURFBUNGA",
    description:
      "Blend especial de carnes nobres, queijo suíço derretido, alface crocante e molho secreto da casa que vai te fazer pegar a próxima onda.",
    price: 22.99,
    image: "https://via.placeholder.com/200x200/0f766e/ffffff?text=SURF",
    category: "burgers",
  },
  {
    id: 3,
    name: "RADICALBUNGA",
    description:
      "Duplo blend, duplo queijo, dupla emoção! Para quem não tem medo de encarar o tubular mais insano da costa.",
    price: 28.99,
    image: "https://via.placeholder.com/200x200/dc2626/ffffff?text=RADICAL",
    category: "burgers",
    popular: true,
  },
  {
    id: 4,
    name: "VEGGIEBUNGA",
    description:
      "Hambúrguer vegano com blend de grão-de-bico e quinoa, perfeito para quem curte uma vibe mais natural.",
    price: 21.99,
    image: "https://via.placeholder.com/200x200/16a34a/ffffff?text=VEGGIE",
    category: "burgers",
  },
  {
    id: 5,
    name: "Batata Radical",
    description: "Batatas fritas crocantes temperadas com nosso mix secreto de especiarias californianas.",
    price: 12.99,
    image: "https://via.placeholder.com/200x200/eab308/ffffff?text=BATATA",
    category: "sides",
  },
  {
    id: 6,
    name: "Onion Rings Tubulares",
    description: "Anéis de cebola empanados e fritos até ficarem dourados como um pôr do sol na praia.",
    price: 14.99,
    image: "https://via.placeholder.com/200x200/f59e0b/ffffff?text=ONION",
    category: "sides",
  },
  {
    id: 7,
    name: "Cowabunga Cola",
    description: "Refrigerante artesanal com sabor único que vai te transportar para as praias da Califórnia.",
    price: 8.99,
    image: "https://via.placeholder.com/200x200/3b82f6/ffffff?text=COLA",
    category: "drinks",
  },
  {
    id: 8,
    name: "Smoothie Tropical",
    description: "Vitamina de frutas tropicais para manter a energia nas ondas.",
    price: 11.99,
    image: "https://via.placeholder.com/200x200/ec4899/ffffff?text=SMOOTHIE",
    category: "drinks",
  },
  {
    id: 9,
    name: "Combo Clássico",
    description: "X-Cowabunga + Batata Radical + Cowabunga Cola. O combo que começou tudo!",
    price: 35.99,
    image: "https://via.placeholder.com/200x200/f97316/ffffff?text=COMBO",
    category: "combos",
    popular: true,
  },
]

// Cart management
const cart = JSON.parse(localStorage.getItem("cowabungaCart")) || []
let activeCategory = "burgers"

// DOM elements
const menuGrid = document.getElementById("menuGrid")
const cartCount = document.getElementById("cartCount")
const cartSummary = document.getElementById("cartSummary")
const cartItemsText = document.getElementById("cartItemsText")
const cartTotal = document.getElementById("cartTotal")

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  setupCategoryButtons()
  renderMenuItems()
  updateCartDisplay()
})

// Setup category buttons
function setupCategoryButtons() {
  const categoryButtons = document.querySelectorAll(".category-btn")

  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      categoryButtons.forEach((btn) => btn.classList.remove("active"))

      // Add active class to clicked button
      this.classList.add("active")

      // Update active category
      activeCategory = this.dataset.category

      // Re-render menu items
      renderMenuItems()
    })
  })
}

// Render menu items
function renderMenuItems() {
  const filteredItems = menuItems.filter((item) => item.category === activeCategory)

  menuGrid.innerHTML = filteredItems
    .map(
      (item) => `
        <div class="menu-item">
            ${
              item.popular
                ? `
                <div class="popular-tag">
                    ⭐ POPULAR
                </div>
            `
                : ""
            }
            
            <div class="item-content">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-price">R$ ${item.price.toFixed(2).replace(".", ",")}</div>
            </div>
            
            <button class="add-btn" onclick="addToCart(${item.id})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                </svg>
                ADICIONAR
            </button>
        </div>
    `,
    )
    .join("")
}

// Add item to cart
function addToCart(itemId) {
  const item = menuItems.find((item) => item.id === itemId)
  const existingItem = cart.find((cartItem) => cartItem.id === itemId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      ...item,
      quantity: 1,
    })
  }

  // Save to localStorage
  localStorage.setItem("cowabungaCart", JSON.stringify(cart))

  // Update display
  updateCartDisplay()

  // Add visual feedback
  showAddedToCartFeedback()
}

// Update cart display
function updateCartDisplay() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  // Update cart count
  cartCount.textContent = itemCount
  cartCount.classList.toggle("hidden", itemCount === 0)

  // Update cart summary
  if (itemCount > 0) {
    cartSummary.classList.remove("hidden")
    cartItemsText.textContent = `${itemCount} ${itemCount === 1 ? "item" : "itens"}`
    cartTotal.textContent = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`
  } else {
    cartSummary.classList.add("hidden")
  }
}

// Show added to cart feedback
function showAddedToCartFeedback() {
  // Create temporary feedback element
  const feedback = document.createElement("div")
  feedback.textContent = "Adicionado ao carrinho!"
  feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #16a34a;
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        font-weight: bold;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `

  // Add CSS animation
  const style = document.createElement("style")
  style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `
  document.head.appendChild(style)

  document.body.appendChild(feedback)

  // Remove after animation
  setTimeout(() => {
    document.body.removeChild(feedback)
    document.head.removeChild(style)
  }, 2000)
}
