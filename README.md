# Forever — MERN e-commerce

Fashion storefront: React (Vite + Tailwind CSS) frontend, Express + MongoDB backend.

- `frontend/` — storefront (home, collection with filters/sort/search, product, cart, checkout, orders, login/sign-up, about, contact)
- `backend/` — REST API: JWT auth, products, per-user cart, orders, Cash on Delivery / Stripe / Razorpay
- `design/` — page screenshots from the [Figma design](https://www.figma.com/design/TBe3mud1W5e0a5b3WrCcfe/Forever)

## Run locally

```bash
# API — no MongoDB needed: in-memory database, seeded with 52 products
cd backend && npm install && npm run dev:memory

# or against a real database: copy .env.example to .env, fill it in, then
npm run seed   # once — inserts the catalogue if the collection is empty
npm run dev

# storefront (separate terminal)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

`npm test` in `backend/` runs the API end-to-end against an in-memory MongoDB.

## API

| Route | Auth | |
|---|---|---|
| `POST /api/user/register` · `/login` · `/admin` | — | returns a JWT |
| `GET /api/product/list` · `/api/product/:id` | — | |
| `POST /api/product/add` · `/remove` | admin | `image` is an array of URLs |
| `GET` / `PUT /api/cart` | user | `{ cartData: { productId: { size: qty } } }` |
| `POST /api/order/place` · `/stripe` · `/razorpay` | user | `{ items: [{ productId, size, quantity }], address }` — priced server-side |
| `POST /api/order/verifyStripe` · `/verifyRazorpay` | user | |
| `GET /api/order/user` | user | |
| `GET /api/order/list` · `POST /api/order/status` | admin | |

Send the token as `Authorization: Bearer <token>`.

## Deploy on Vercel (two projects from this repo)

1. **Backend** — Root Directory `backend`. Set the variables from `backend/.env.example`
   (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`, and payment keys if used).
   In MongoDB Atlas, allow access from `0.0.0.0/0` (Vercel has no fixed IPs). Run `npm run seed` once with the production `MONGODB_URI`.
2. **Frontend** — Root Directory `frontend`. Set `VITE_BACKEND_URL` to the backend URL, then redeploy.
3. Put the frontend URL into the backend's `FRONTEND_URL` and redeploy the backend.
