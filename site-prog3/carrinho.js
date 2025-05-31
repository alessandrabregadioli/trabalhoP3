// Cart management
let cart = JSON.parse(localStorage.getItem("cowabungaCart")) || []
const deliveryFee = 5.99

// DOM elements
const emptyCart = document.getElementById("emptyCart")
const cartContent = document.getElementById("cartContent")
const headerItemCount = document.getElementById("headerItemCount")
const itemsList = document.getElementById("itemsList")
const subtotalElement = document.getElementById("subtotal")
const totalPriceElement = document.getElementById("totalPrice")
const promoCodeInput = document.getElementById("promoCode")

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  renderCart()
  setupPromoCode()
})

// Render cart
function renderCart() {
  updateHeaderCount()

  if (cart.length === 0) {
    emptyCart.classList.remove("hidden")
    cartContent.classList.add("hidden")
  } else {
    emptyCart.classList.add("hidden")
    cartContent.classList.remove("hidden")
    renderCartItems()
    updatePrices()
  }
}

// Update header count
function updateHeaderCount() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
  headerItemCount.textContent = `${itemCount} ${itemCount === 1 ? "ITEM" : "ITENS"}`
}

// Render cart items
function renderCartItems() {
  itemsList.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            <div class="item-row">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                    <div class="item-price">R$ ${item.price.toFixed(2).replace(".", ",")}</div>
                </div>
                
                <div class="item-controls">
                    <button class="remove-btn" onclick="removeItem(${item.id})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </button>
                    
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14"/>
                            </svg>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14"/>
                                <path d="M12 5v14"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

// Update quantity
function updateQuantity(itemId, newQuantity) {
  if (newQuantity === 0) {
    removeItem(itemId)
    return
  }

  cart = cart.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))

  saveCart()
  renderCart()
}

// Remove item
function removeItem(itemId) {
  cart = cart.filter((item) => item.id !== itemId)
  saveCart()
  renderCart()
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cowabungaCart", JSON.stringify(cart))
}

// Update prices
function updatePrices() {
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const total = subtotal + deliveryFee

  subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`
  totalPriceElement.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`
}

// Setup promo code
function setupPromoCode() {
  const promoBtn = document.querySelector(".promo-btn")

  promoBtn.addEventListener("click", () => {
    const code = promoCodeInput.value.trim().toLowerCase()

    if (code === "cowabunga10") {
      showPromoFeedback("Código aplicado! 10% de desconto", "success")
      // Apply discount logic here
    } else if (code === "") {
      showPromoFeedback("Digite um código promocional", "error")
    } else {
      showPromoFeedback("Código inválido", "error")
    }
  })

  promoCodeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      promoBtn.click()
    }
  })
}

// Show promo feedback
function showPromoFeedback(message, type) {
  const feedback = document.createElement("div")
  feedback.textContent = message
  feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === "success" ? "#16a34a" : "#dc2626"};
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        font-weight: bold;
        z-index: 1000;
        animation: fadeInOut 3s ease-in-out;
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
    if (document.body.contains(feedback)) {
      document.body.removeChild(feedback)
    }
    if (document.head.contains(style)) {
      document.head.removeChild(style)
    }
  }, 3000)
}
