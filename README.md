# Nutech Test API

REST API untuk Nutech Integration Test menggunakan Express.js

## Fitur

### Module Membership
- POST `/registration` - Registrasi user baru
- POST `/login` - Login user
- GET `/profile` - Get profile user
- PUT `/profile/update` - Update profile user
- PUT `/profile/image` - Update profile image

### Module Information
- GET `/banner` - Get banner list (public)
- GET `/services` - Get services list (private, JWT)

### Module Transaction
- GET `/balance` - Get balance user (JWT)
- POST `/topup` - Top up balance (JWT)
- POST `/transaction` - Create transaction/payment (JWT)
- GET `/transaction/history` - Get transaction history (JWT)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup database:
- Buat database MySQL
- Import schema dari `database/schema.sql`
- Opsional: isi data contoh `database/seed.sql`

3. Setup environment variables:
Buat `.env` dari `.env.example` dan sesuaikan nilai:
```
PORT=3000
BASE_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=nutech_db
```

4. Run application:
```bash
npm start
```
atau untuk development:
```bash
npm run dev
```

## Database Schema

Database schema dapat ditemukan di `database/schema.sql` (DDL). Seed tersedia di `database/seed.sql`.

## Deploy ke Railway

1. Push repo ke GitHub (sudah): pastikan `.gitignore` mengecualikan `.env`.
2. Railway: buat project → Deploy from GitHub → pilih repo ini.
3. Tambahkan Environment Variables di Railway Service:
   - `PORT`: 3000 (opsional, Railway set otomatis)
   - `BASE_URL`: `https://<subdomain>.railway.app`
   - `JWT_SECRET`: rahasia JWT
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: kredensial MySQL (Railway DB atau eksternal)
4. Jika pakai Railway MySQL: tambahkan plugin Database → salin kredensial → set ke env di Service → import `database/schema.sql` (dan `database/seed.sql` opsional) ke DB tersebut.
5. Deploy akan menjalankan `npm start`. Cek Logs sampai muncul "Server is running on port ...".
6. Uji endpoint (gunakan domain Railway).

Catatan: penyimpanan file uploads di hosting stateless bisa hilang setelah redeploy. Untuk profile image persistence di production, pertimbangkan storage eksternal (S3/GCS) dan ganti `BASE_URL`/upload path.

## API Documentation

### POST /registration

Registrasi user baru.

**Request Body:**
```json
{
  "email": "user@nutech-integrasi.com",
  "first_name": "User",
  "last_name": "Nutech",
  "password": "abcdef1234"
}
```

**Response Success (200):**
```json
{
  "status": 0,
  "message": "Registrasi berhasil silahkan login",
  "data": null
}
```

**Response Error (400):**
```json
{
  "status": 102,
  "message": "Paramter email tidak sesuai format",
  "data": null
}
```

## Teknologi

- Node.js
- Express.js
- MySQL2 (dengan prepared statements)
- bcrypt (untuk password hashing)

