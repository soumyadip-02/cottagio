// Simple SPA-like helpers: render on pages based on body data-page attribute
// Configuration: set RAW GitHub URL for products JSON here
const RAW_PRODUCTS_URL = 'https://raw.githubusercontent.com/soumyadip-02/cottagio/main/data/products.json';

async function fetchProducts() {
  // Try RAW GitHub first, fallback to local data/products.json if network fails
  try {
    const resp = await fetch(RAW_PRODUCTS_URL, {cache: 'no-store'});
    if(!resp.ok) throw new Error('RAW fetch failed')
    const data = await resp.json();
    window.PRODUCTS = data || [];
    return window.PRODUCTS;
  } catch (err) {
    console.warn('RAW fetch failed, falling back to local data/products.json', err);
    try {
      const resp = await fetch('data/products.json');
      if(!resp.ok) throw new Error('Local fetch failed')
      const data = await resp.json();
      window.PRODUCTS = data || [];
      return window.PRODUCTS;
    } catch (localErr) {
      console.error('Failed to load products from both RAW GitHub and local file', localErr);
      window.PRODUCTS = [];
      return window.PRODUCTS;
    }
  }
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
  const iconPath = document.getElementById('icon-path')
  const root = document.documentElement
  const cur = localStorage.getItem('cottagio_theme') || 'light'
  const SUN_PATH = 'M12 4.354a1 1 0 011 1V7.5a1 1 0 11-2 0V5.354a1 1 0 011-1zM4.222 6.343a1 1 0 011.415 0l1.06 1.06a1 1 0 11-1.415 1.414L4.222 7.757a1 1 0 010-1.414zM18.364 6.343a1 1 0 010 1.414l-1.06 1.06a1 1 0 11-1.415-1.414l1.06-1.06a1 1 0 011.415 0zM12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm7.5-4.5a1 1 0 011 1H19.5a1 1 0 110-2h1.999a1 1 0 011 1zM6 12a1 1 0 011-1H4.5a1 1 0 110 2H7a1 1 0 01-1-1zM17.778 17.657a1 1 0 01-1.415 0l-1.06-1.06a1 1 0 011.415-1.414l1.06 1.06a1 1 0 010 1.414zM6.636 17.657a1 1 0 000-1.414l1.06-1.06a1 1 0 111.415 1.414l-1.06 1.06a1 1 0 01-1.415 0z'
  const MOON_PATH = 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'
  if(cur === 'dark') root.classList.add('dark')
  // set initial icon
  if(iconPath){
    iconPath.setAttribute('d', root.classList.contains('dark') ? MOON_PATH : SUN_PATH)
  }

  toggle && toggle.addEventListener('click', ()=>{
    root.classList.toggle('dark')
    const isDark = root.classList.contains('dark')
    localStorage.setItem('cottagio_theme', isDark ? 'dark' : 'light')
    if(iconPath) iconPath.setAttribute('d', isDark ? MOON_PATH : SUN_PATH)
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
