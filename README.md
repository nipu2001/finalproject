# EntraDigimart

EntraDigimart is a multi-role e-commerce marketplace mobile app with a React Native (Expo) frontend and a Node.js + Express backend using a MySQL database. It supports admin, seller, customer, investor, and affiliate roles. The platform includes product management, orders, reviews, file uploads, JWT authentication, and seller analytics.

---

## Features

The project implements the following features:

- Authentication & Authorization
  - JWT-based authentication with token storage on the client (Expo SecureStore).
  - Role-Based Access Control (RBAC): `admin`, `seller`, `customer`, `investor`, `affiliate`.
  - Middleware (`middleware/auth.js`) to validate tokens and populate `req.user` for authorization checks.

- User Management
  - User registration (with optional file uploads for seller/investor documents).
  - Login, profile retrieval and update, password reset (email via Nodemailer).

- Product Management
  - CRUD operations for products (sellers can add/update/delete their products).
  - Product images upload (Multer) and storage in `/uploads`.
  - Product status flags (`active`, `out_of_stock`, `violation`, `deleted`).
  - Inventory endpoints for sellers (`/api/products/inventory`).

- Orders & Payments
  - Create orders with normalized `order_items` and total calculation.
  - Order lifecycle: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `rejected`.
  - Order actions for sellers/admins: accept, reject, update payment status.

- Reviews & Ratings
  - Customers can post reviews and ratings (1-5 stars).
  - Review uniqueness enforced (one review per user per product).
  - Rating summaries and product review endpoints.

- Favorites / Wishlist
  - Users can add/remove favorites and view their favorite products.

- Admin & Business Features
  - Admin user management (created/updated on DB initialization).
  - Seller application workflow and approval status.
  - Investor and affiliate record management.

- Database & Performance
  - MySQL relational schema with foreign keys and constraints.
  - Automatic table creation and indexing on startup (`config/database.js`).
  - ACID-compliant transaction support via MySQL.

- Dev & Debugging Helpers
  - Health check (`GET /health`) and DB test endpoint (`GET /api/test-db`).
  - Extensive request logging in `server.js` and debug/test scripts in the backend.

---

## Quick Start (Backend)

1. Copy `.env.example` to `.env` and fill in values (create one if missing).

2. Install dependencies:

```powershell
cd digiMart-backend
npm install
```

3. Start MySQL and ensure credentials in `.env` are correct. The server will create the database/tables automatically on first run.

4. Run the server:

```powershell
node server.js
```

or with `nodemon`:

```powershell
npx nodemon server.js
```

---

## Quick Start (Frontend - Expo)

```powershell
cd frontend
npm install
npx expo start
```

Edit `frontend/api.js` to set `BASE_URL` to your backend IP (e.g., `http://<YOUR_IP>:5000/api`).

---

## Important Endpoints

- Auth / Users
  - POST `/api/users/register` - register user (multipart/form-data for sellers)
  - POST `/api/users/login` - login, returns JWT token and user data
  - GET `/api/users/profile` - get profile (protected)

- Products
  - GET `/api/products` - list products (public)
  - GET `/api/products/:productId` - get product details
  - POST `/api/products/add-product` - add product (seller, protected)
  - GET `/api/products/inventory` - seller inventory (protected)

- Orders
  - POST `/api/orders` - create order (customer)
  - GET `/api/orders/my-orders` - get user orders (protected)
  - GET `/api/orders/seller` - get seller orders (protected)
  - PATCH `/api/orders/:orderId/accept` - accept order (seller)
  - PATCH `/api/orders/:orderId/reject` - reject order (seller/admin)

- Reviews
  - POST `/api/reviews` - create review (protected)
  - GET `/api/reviews/product/:productId` - product reviews

---

## Notes

- Uploaded files are served from `/uploads` via `express.static`.
- Database initialization creates an admin user using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.
- For local device testing, set the backend IP in `frontend/api.js` and ensure both devices are on same network.


