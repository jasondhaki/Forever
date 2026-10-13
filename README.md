# Forever — MERN e-commerce

Fashion storefront built with React (Vite + Tailwind CSS), with an Express / MongoDB backend to follow.

- `frontend/` — React app (home, collection with filters/sort/search, product, cart, checkout, orders, login, about, contact)
- `design/` — page screenshots from the [Figma design](https://www.figma.com/design/TBe3mud1W5e0a5b3WrCcfe/Forever)

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Deploy on Vercel with **Root Directory** set to `frontend` (`vercel.json` handles SPA routing).

Until the backend lands, products come from `src/assets/assets.js` and the cart/orders persist in `localStorage`.
