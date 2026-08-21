# Web Dark Store - Full-Stack E-Commerce

Full-stack web store dengan admin panel yang lengkap. Semua data bisa diatur 100% dari admin panel tanpa sentuh code.

## Features

✅ Landing page, katalog produk, cart, checkout, order tracking
✅ Admin panel lengkap (tambah/edit/hapus produk, kelola kategori, order status)
✅ Upload gambar produk otomatis
✅ Pengaturan kedai (logo, banner, nama, tema warna)
✅ JWT authentication untuk admin
✅ SQLite database
✅ Payment gateway placeholder (COD, Bank Transfer)
✅ Mobile-first design dengan Tailwind CSS

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run init-db
```

### 3. Start Server
```bash
npm start
```

Untuk development dengan auto-reload:
```bash
npm run dev
```

## Access

- **Frontend Store**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Admin Default Login**:
  - Username: `admin`
  - Password: `admin123`

## Struktur Folder

```
web-dark/
├── server/                  # Backend (Express)
│   ├── index.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── orders.js
│   │   ├── settings.js
│   │   └── admin.js
│   └── utils/
│       └── initDb.js
├── public/                  # Frontend Store
│   ├── index.html
│   ├── styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── cart.js
│   │   └── api.js
│   └── uploads/            # Lokasi simpan gambar produk
├── admin/                   # Admin Panel
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── dashboard.js
│       ├── products.js
│       ├── categories.js
│       ├── orders.js
│       └── settings.js
├── data/                    # SQLite database
├── .env
└── package.json
```

## Database Tables

- `users` - Admin users
- `products` - Produk
- `categories` - Kategori produk
- `orders` - Pesanan
- `order_items` - Item dalam pesanan
- `settings` - Pengaturan kedai

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite3
- **Frontend**: HTML5 + Tailwind CSS + Vanilla JavaScript
- **Auth**: JWT
- **File Upload**: Express-fileupload

## API Endpoints

### Public
- `GET /api/products` - Daftar produk
- `GET /api/products/:id` - Detail produk
- `GET /api/categories` - Daftar kategori
- `GET /api/settings` - Pengaturan kedai
- `POST /api/orders` - Buat pesanan baru
- `GET /api/orders/:id` - Tracking pesanan

### Admin (Perlu JWT)
- `POST /api/admin/login` - Login admin
- `POST /api/admin/products` - Tambah produk
- `PUT /api/admin/products/:id` - Edit produk
- `DELETE /api/admin/products/:id` - Hapus produk
- `POST /api/admin/categories` - Tambah kategori
- `PUT /api/admin/categories/:id` - Edit kategori
- `DELETE /api/admin/categories/:id` - Hapus kategori
- `GET /api/admin/orders` - Daftar semua pesanan
- `PUT /api/admin/orders/:id` - Update status pesanan
- `PUT /api/admin/settings` - Update pengaturan kedai
- `POST /api/admin/upload` - Upload gambar produk

## Lisensi

MIT
