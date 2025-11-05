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
- GET `/banner` - Get banner list
- GET `/services` - Get services list

### Module Transaction
- GET `/balance` - Get balance user
- POST `/topup` - Top up balance
- POST `/transaction` - Create transaction
- GET `/transaction/history` - Get transaction history

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup database:
- Buat database MySQL
- Import schema dari `database/schema.sql`

3. Setup environment variables:
```bash
cp .env.example .env
```
Edit file `.env` dengan konfigurasi database Anda

4. Run application:
```bash
npm start
```
atau untuk development:
```bash
npm run dev
```

## Database Schema

Database schema dapat ditemukan di `database/schema.sql`

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

