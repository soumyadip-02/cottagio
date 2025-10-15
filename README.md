# Cottagio — Static Marketplace

A small static marketplace scaffold (HTML, CSS, JS) connecting buyers and sellers. This is not an e-commerce platform; it facilitates connections between buyers and sellers.

## How to preview

- Option 1 (open locally): open `index.html` in your browser (best to use a local static server due to CORS/browser restrictions on modules).
- Option 2 (quick local server with Python):

```powershell
# from repository root
python -m http.server 8000
# then open http://localhost:8000/index.html
```

## Notes

- Seller contact numbers are shown on product pages (this demo has no backend or real messaging).
- Theme is toggled with the Theme button and persisted to localStorage.
