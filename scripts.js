// Simple SPA-like helpers: render on pages based on body data-page attribute
async function fetchProducts() {
  return fetch('data/products.json')
    .then(response => response.json())
    .then(data => {
      window.PRODUCTS = data;
    })
    .catch(error => console.error('Error loading products:', error));
}

// Simple router helper to read query param id
function getQueryParam(name){
  const params = new URLSearchParams(location.search)
  return params.get(name)
}

// Render home product grid
function renderHome(){
  fetchProducts().then(() => {
    const container = document.getElementById('products');
    if(!container) return;
    container.innerHTML = '';
    PRODUCTS.slice(0, 3).forEach(p => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <a href="product.html?id=${p.id}"><img src="${p.photos[0]}" loading="lazy"/></a>
        <div class="body">
          <h3>${p.title}</h3>
          <p class="muted">${p.short}</p>
          <strong>₹${p.price}</strong>
        </div>
      `;
      container.appendChild(el);
    });
  });
}

// Render product page
function renderProduct(){
  fetchProducts().then(() => {
    const id = getQueryParam('id');
    const p = PRODUCTS.find(i => i.id === id);
    if(!p) return;
    document.getElementById('prod-title').textContent = p.title;
    document.getElementById('prod-price').textContent = '₹' + p.price;
    document.getElementById('prod-desc').textContent = p.description;
    document.getElementById('prod-seller').innerHTML = `<strong>${p.seller.name}</strong><br/>${p.seller.phone}<br/><span class="muted">${p.seller.location}</span>`;
    const photos = document.getElementById('prod-photos');
    photos.innerHTML = '';
    p.photos.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
      img.style.width = '100%';
      img.style.borderRadius = '8px';
      img.style.marginBottom = '8px';
      photos.appendChild(img);
    });
  });
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
  await fetchProducts();
  setupTheme();
  setupNavToggle();
  const page = document.body.dataset.page
  if(page === 'home') renderHome()
  if(page === 'product') renderProduct()
})
