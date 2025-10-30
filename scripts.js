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
    // take top 5 products for the homepage slider
    const top = (window.PRODUCTS || []).slice(0,5);
    if(!top.length) return;

    // create slider
    const slider = document.createElement('div');
    slider.className = 'slider';
    const track = document.createElement('div');
    track.className = 'slider-track';
    top.forEach(p => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.innerHTML = `
        <div class="product-card">
          <a href="product.html?id=${p.id}">
            <div class="thumb"><img src="${p.photos[0]||''}" alt="${p.title}" onerror="this.style.display='none'"/></div>
            <div class="info"><h3>${p.title}</h3><p class="muted">₹${p.price}</p></div>
          </a>
        </div>
      `;
      track.appendChild(slide);
    });
    slider.appendChild(track);
    const controls = document.createElement('div');
    controls.className = 'slider-controls';
    const prev = document.createElement('button'); prev.textContent = '<';
    const next = document.createElement('button'); next.textContent = '>';
    controls.appendChild(prev); controls.appendChild(next);
    container.appendChild(slider); container.appendChild(controls);

    let pos = 0;
    const step = 280; // slide width
    prev.addEventListener('click', ()=>{
      pos = Math.max(0, pos - step);
      track.style.transform = `translateX(-${pos}px)`;
    });
    next.addEventListener('click', ()=>{
      pos = Math.min((track.scrollWidth - slider.clientWidth), pos + step);
      track.style.transform = `translateX(-${pos}px)`;
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
    // contact seller button will show modal with seller info
    document.getElementById('prod-seller').innerHTML = `<button id="contact-seller" class="btn">Contact Seller</button>`;

    // image slideshow
    const photos = document.getElementById('prod-photos');
    photos.innerHTML = '';
    const imgs = p.photos && p.photos.length ? p.photos : [''];
    const wrap = document.createElement('div'); wrap.className = 'thumb';
    const imgEl = document.createElement('img');
    imgEl.src = imgs[0]; imgEl.loading = 'lazy'; imgEl.alt = p.title; imgEl.onerror = ()=>{imgEl.style.display='none'};
    wrap.appendChild(imgEl);
    if(imgs.length > 1){
      const prev = document.createElement('button'); prev.className='ctrl prev'; prev.textContent = '<';
      const next = document.createElement('button'); next.className='ctrl next'; next.textContent = '>';
      wrap.appendChild(prev); wrap.appendChild(next);
      let idx = 0;
      prev.addEventListener('click', ()=>{
        idx = (idx - 1 + imgs.length) % imgs.length; imgEl.src = imgs[idx];
      });
      next.addEventListener('click', ()=>{
        idx = (idx + 1) % imgs.length; imgEl.src = imgs[idx];
      });
    }
    photos.appendChild(wrap);

    // contact modal wiring
    const contactBtn = document.getElementById('contact-seller');
    if(contactBtn){
      contactBtn.addEventListener('click', ()=>{
        showContactModal(p.seller);
      });
    }
  });
}

// show contact modal without revealing info directly on page
function showContactModal(seller){
  const existing = document.getElementById('contact-modal');
  if(existing) existing.remove();
  const modal = document.createElement('div'); modal.id='contact-modal'; modal.className='modal';
  // seller.location is shown immediately (not hidden). Phone is revealed after clicking the button.
  modal.innerHTML = `
    <div class="panel">
      <button class="close" id="close-modal">×</button>
      <h3>Contact Seller</h3>
      <p class="muted">Click below to reveal the seller phone number</p>
      <div style="margin-top:12px">
        <strong id="seller-name">${seller && seller.name ? seller.name : 'Seller'}</strong><br/>
        <div id="seller-location" style="margin-top:8px">Location: <em>${seller && seller.location ? seller.location : 'Not listed'}</em></div>
      </div>
      <div style="text-align:center;margin-top:12px">
        <button id="reveal-contact" class="btn">Reveal Contact</button>
      </div>
      <div id="revealed" style="margin-top:12px;display:none"></div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-modal').addEventListener('click', ()=> modal.remove());
  document.getElementById('reveal-contact').addEventListener('click', ()=>{
    const reveal = document.getElementById('revealed');
    reveal.style.display = 'block';
    const phone = seller && seller.phone ? seller.phone : 'Not listed';
    // render phone as clickable link if available
    if(phone && phone.toLowerCase() !== 'not listed') {
      reveal.innerHTML = `Phone: <a href="tel:${phone.replace(/\s+/g,'')}" class="btn-link">${phone}</a>`;
    } else {
      reveal.innerHTML = `Phone: <em>${phone}</em>`;
    }
  });
}

// Light/Dark toggle
function setupTheme(){
  const toggle = document.getElementById('theme-toggle')
  const iconPath = document.getElementById('icon-path')
  const root = document.documentElement
  const cur = localStorage.getItem('cottagio_theme') || 'light'
  const SUN_PATH = 'M12 4.354a1 1 0 011 1V7.5a1 1 0 11-2 0V5.354a1 1 0 011-1zM4.222 6.343a1 1 0 011.415 0l1.06 1.06a1 1 0 11-1.415 1.414L4.222 7.757a1 1 0 010-1.414zM18.364 6.343a1 1 0 010 1.414l-1.06[...]'
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

// Wrap numeric sequences in spans.numeric across the document
// This keeps digits styled consistently (e.g., using Roboto Mono)
function applyNumericStyling(root = document.body){
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  const textNodes = [];
  while(walker.nextNode()) textNodes.push(walker.currentNode);

  const digitRegex = /\d[\d,\.\s]*/g;
  textNodes.forEach(node => {
    // Skip empty or whitespace-only nodes
    if(!node.nodeValue || !node.nodeValue.trim()) return;
    // Skip if parent is input, textarea, code, pre or already inside .numeric
    const p = node.parentElement;
    if(!p) return;
    const tag = p.tagName && p.tagName.toLowerCase();
    if(['input','textarea','code','pre','script','style'].includes(tag)) return;
    if(p.closest && p.closest('.numeric')) return;

    if(digitRegex.test(node.nodeValue)){
      const span = document.createElement('span');
      // Replace numeric sequences with spans
      span.innerHTML = node.nodeValue.replace(digitRegex, (match)=>{
        return `<span class="numeric">${match}</span>`;
      });
      node.parentNode.replaceChild(span, node);
    }
  });
}

// Run after small delay so dynamic content (products) can render
setTimeout(()=> applyNumericStyling(document.body), 500);

// Lightweight parallax handler for .parallax-bg
function setupParallax(){
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // disable on touch devices to avoid jank
  if('ontouchstart' in window) return;
  const bg = document.querySelector('.parallax-bg');
  if(!bg) return;

  let ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(()=>{
      const rect = bg.getBoundingClientRect();
      const winH = window.innerHeight;
      // compute offset relative to viewport centre
      const pct = (rect.top + rect.height/2 - winH/2) / winH;
      // small translate for subtle parallax
      const max = 60; // px
      const y = Math.max(-max, Math.min(max, -pct * max));
      bg.style.transform = `translate3d(0, ${y}px, 0) scale(1.02)`;
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  // run once to position
  onScroll();
}

// init parallax after DOM ready
document.addEventListener('DOMContentLoaded', ()=> setTimeout(setupParallax, 150));
