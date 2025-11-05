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
- GET `/services` - Get services list (private, Bearer token)

### Module Transaction
- GET `/balance` - Get balance user (private)
- POST `/topup` - Top up balance (private)
- POST `/transaction` - Create transaction/payment (private)
- GET `/transaction/history` - Get transaction history (private)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup database:
- Buat database MySQL
- Import schema dari `database/schema.sql`

3. Setup environment variables:
Buat file `.env` berdasarkan `.env.example`:
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

## Database Schema

Database schema dapat ditemukan di `database/schema.sql`

## Deployment ke Railway

1. Push ke GitHub
- Inisialisasi Git dan push ke repo GitHub Anda.

2. Buat project di Railway
- Masuk `railway.app` → New Project → Deploy from GitHub → pilih repo ini

3. Tambahkan MySQL
- Opsi A: Tambah plugin Database MySQL di Railway → dapatkan kredensial (HOST/USER/PASSWORD/DB_NAME)
- Opsi B: Gunakan MySQL eksternal (isi env sesuai server Anda)

4. Set Environment Variables (Project → Variables)
```
PORT=3000
JWT_SECRET=<isi rahasia>
BASE_URL=https://<subdomain-railway-anda>.up.railway.app
DB_HOST=<host mysql>
DB_USER=<user mysql>
DB_PASSWORD=<password mysql>
DB_NAME=<nama database>
```

5. Import schema
- Import `database/schema.sql` ke database MySQL yang digunakan (Railway DB atau eksternal)

6. Deploy & verifikasi
- Railway akan menjalankan `web: node server.js` (Procfile tersedia)
- Cek Logs → pastikan server running
- Uji endpoint (perlu token untuk route private)

Catatan: Penyimpanan file `uploads/` pada Railway bersifat ephemeral. Untuk produksi, gunakan object storage (mis. S3) jika butuh persistensi file.

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

