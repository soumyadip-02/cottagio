// Simple SPA-like helpers: render on pages based on body data-page attribute
let PRODUCTS = [];

async function loadProducts() {
  try {
    const response = await fetch('/data/products.json');
    PRODUCTS = await response.json();
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}

// Cart persisted in localStorage
const CART_KEY = 'cottagio_cart_v1'
function loadCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY) || '[]') }catch(e){return []}
}
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)) }
function addToCart(productId, qty=1){
  const cart = loadCart()
  const idx = cart.findIndex(i => i.id === productId)
  if(idx >= 0) cart[idx].qty += qty
  else cart.push({id:productId, qty})
  saveCart(cart)
  alert('Added to cart')
}

// Simple router helper to read query param id
function getQueryParam(name){
  const params = new URLSearchParams(location.search)
  return params.get(name)
}

// Render home product grid
function renderHome(){
  const container = document.getElementById('products')
  if(!container) return
  container.innerHTML = ''
  PRODUCTS.forEach(p => {
    const el = document.createElement('article')
    el.className = 'card'
    el.innerHTML = `
      <a href="product.html?id=${p.id}"><img src="${p.photos[0]}" loading="lazy"/></a>
      <div class="body">
        <h3>${p.title}</h3>
        <p class="muted">${p.short}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <strong>$${p.price}</strong>
          <div>
            <a class="btn" href="product.html?id=${p.id}">View</a>
          </div>
        </div>
      </div>
    `
    container.appendChild(el)
  })
}

// Render product page
function renderProduct(){
  const id = getQueryParam('id')
  const p = PRODUCTS.find(i => i.id === id)
  if(!p) return
  document.getElementById('prod-title').textContent = p.title
  document.getElementById('prod-price').textContent = '$' + p.price
  document.getElementById('prod-desc').textContent = p.description
  document.getElementById('prod-seller').innerHTML = `<strong>${p.seller.name}</strong><br/>${p.seller.phone}<br/><span class="muted">${p.seller.location}</span>`
  const photos = document.getElementById('prod-photos')
  photos.innerHTML = ''
  p.photos.forEach(src => {
    const img = document.createElement('img')
    img.src = src
    img.loading = 'lazy'
    img.style.width = '100%'
    img.style.borderRadius = '8px'
    img.style.marginBottom = '8px'
    photos.appendChild(img)
  })
  document.getElementById('add-cart').addEventListener('click', ()=> addToCart(p.id, Number(document.getElementById('qty').value)||1))
}

// Render cart page
function renderCart(){
  const cart = loadCart()
  const el = document.getElementById('cart-items')
  if(!el) return
  el.innerHTML = ''
  if(cart.length === 0){ el.innerHTML = '<p>Your cart is empty.</p>'; return }
  let total = 0
  cart.forEach(item => {
    const p = PRODUCTS.find(x => x.id === item.id)
    if(!p) return
    const row = document.createElement('div')
    row.className = 'card'
    row.style.display = 'flex'
    row.style.gap = '12px'
    row.style.alignItems = 'center'
    row.innerHTML = `
      <img src="${p.photos[0]}" style="width:120px;height:80px;object-fit:cover;border-radius:8px"/>
      <div style="flex:1">
        <div style="font-weight:600">${p.title}</div>
        <div class="muted">Seller: ${p.seller.name} • ${p.seller.phone}</div>
      </div>
      <div style="text-align:right">
        <div>$${p.price} x ${item.qty}</div>
        <div style="font-weight:700">$${p.price * item.qty}</div>
        <button data-id="${item.id}" class="btn remove">Remove</button>
      </div>
    `
    el.appendChild(row)
    total += p.price * item.qty
  })
  const totel = document.createElement('div')
  totel.style.marginTop = '12px'
  totel.innerHTML = `<h3>Total: $${total}</h3>`
  el.appendChild(totel)
  document.querySelectorAll('.remove').forEach(b => b.addEventListener('click', e => {
    const id = e.currentTarget.getAttribute('data-id')
    const cart = loadCart().filter(i => i.id !== id)
    saveCart(cart)
    renderCart()
  }))
}

// Light/Dark toggle
function setupTheme(){
  const toggle = document.getElementById('theme-toggle')
  const root = document.documentElement
  const cur = localStorage.getItem('cottagio_theme') || 'light'
  if(cur === 'dark') root.classList.add('dark')
  toggle && toggle.addEventListener('click', ()=>{
    root.classList.toggle('dark')
    const isDark = root.classList.contains('dark')
    localStorage.setItem('cottagio_theme', isDark ? 'dark' : 'light')
  })
}

// Mobile navigation toggle
function setupNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
}

// Init based on page
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  setupTheme();
  setupNavToggle();
  const page = document.body.dataset.page
  if(page === 'home') renderHome()
  if(page === 'product') renderProduct()
  if(page === 'cart') renderCart()
})
