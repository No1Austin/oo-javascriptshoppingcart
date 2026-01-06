// =======================
// OO CLASSES
// =======================
class Product {
  constructor(id, name, price) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}

class ShoppingCartItem {
  constructor(product, quantity = 1) {
    this.product = product;
    this.quantity = quantity;
  }

  getTotalPrice() {
    return this.product.price * this.quantity;
  }
}

class ShoppingCart {
  constructor() {
    this.items = [];
  }

  getTotalItems() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalCost() {
    return this.items.reduce((sum, item) => sum + item.getTotalPrice(), 0);
  }

  addItem(product, quantity = 1) {
    if (!Number.isFinite(quantity) || quantity <= 0) return;

    const existing = this.items.find((i) => i.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push(new ShoppingCartItem(product, quantity));
    }
  }

  removeItem(productId) {
    this.items = this.items.filter((i) => i.product.id !== productId);
  }

  clear() {
    this.items = [];
  }
}

// =======================
// DATA (a few products)
// =======================
const products = [
  new Product(1, "Apple", 0.99),
  new Product(2, "Bread", 2.49),
  new Product(3, "Milk", 3.25),
  new Product(4, "Eggs (12 pack)", 4.10),
  new Product(5, "Cheese", 5.75),
  new Product(6, "Orange Juice", 3.99),
];

// =======================
// DOM ELEMENTS
// =======================
const productsEl = document.getElementById("products");
const cartListEl = document.getElementById("cartList");
const clearCartBtn = document.getElementById("clearCartBtn");

const badgeItemsEl = document.getElementById("badgeItems");
const badgeTotalEl = document.getElementById("badgeTotal");

const totalItemsEl = document.getElementById("totalItems");
const totalCostEl = document.getElementById("totalCost");

// =======================
// CART INSTANCE
// =======================
const cart = new ShoppingCart();

// =======================
// HELPERS
// =======================
function money(n) {
  return `$${n.toFixed(2)}`;
}

function clampQty(n) {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(99, n));
}

// =======================
// RENDER PRODUCTS
// =======================
function renderProducts() {
  productsEl.innerHTML = products
    .map(
      (p) => `
      <div class="product" data-id="${p.id}">
        <div>
          <h3>${p.name}</h3>
          <p class="muted">Price per item</p>
          <div class="price">${money(p.price)}</div>
        </div>

        <div class="controls">
          <div class="qty">
            <button type="button" class="minus">−</button>
            <input type="text" class="qtyInput" value="1" inputmode="numeric" />
            <button type="button" class="plus">+</button>
          </div>
          <button type="button" class="btn accent addBtn">Add</button>
        </div>
      </div>
    `
    )
    .join("");

  // Hook up events for +/- and Add buttons
  productsEl.querySelectorAll(".product").forEach((card) => {
    const id = parseInt(card.dataset.id, 10);
    const product = products.find((x) => x.id === id);

    const input = card.querySelector(".qtyInput");
    const plus = card.querySelector(".plus");
    const minus = card.querySelector(".minus");
    const addBtn = card.querySelector(".addBtn");

    plus.addEventListener("click", () => {
      input.value = clampQty(parseInt(input.value, 10) + 1);
    });

    minus.addEventListener("click", () => {
      input.value = clampQty(parseInt(input.value, 10) - 1);
    });

    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^\d]/g, "");
      if (input.value === "") return;
      input.value = clampQty(parseInt(input.value, 10));
    });

    input.addEventListener("blur", () => {
      if (input.value === "") input.value = "1";
      input.value = clampQty(parseInt(input.value, 10));
    });

    addBtn.addEventListener("click", () => {
      const qty = clampQty(parseInt(input.value, 10));
      cart.addItem(product, qty);
      renderCart();
      input.value = "1";
    });
  });
}

// =======================
// RENDER CART
// =======================
function renderCart() {
  if (cart.items.length === 0) {
    cartListEl.innerHTML = `<div class="empty">Your cart is empty</div>`;
  } else {
    cartListEl.innerHTML = `
      <div class="cart-list">
        ${cart.items
          .map(
            (item) => `
            <div class="cart-item">
              <div>
                <strong>${item.product.name}</strong>
                <div class="meta">
                  <span class="pill">Qty: ${item.quantity}</span>
                  <span class="pill">Each: ${money(item.product.price)}</span>
                  <span class="pill">Line: ${money(item.getTotalPrice())}</span>
                </div>
              </div>

              <div class="cart-actions">
                <button class="btn danger removeBtn" data-id="${item.product.id}" type="button">
                  Remove
                </button>
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    `;

    // Remove button events
    cartListEl.querySelectorAll(".removeBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = parseInt(btn.dataset.id, 10);
        cart.removeItem(productId);
        renderCart();
      });
    });
  }

  // Update totals UI
  const totalItems = cart.getTotalItems();
  const totalCost = cart.getTotalCost();

  totalItemsEl.textContent = totalItems.toString();
  totalCostEl.textContent = money(totalCost);

  badgeItemsEl.textContent = totalItems.toString();
  badgeTotalEl.textContent = money(totalCost);
}

// Clear cart
clearCartBtn.addEventListener("click", () => {
  cart.clear();
  renderCart();
});

// =======================
// INIT
// =======================
renderProducts();
renderCart();
