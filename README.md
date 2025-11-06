# Nutech Test API

REST API untuk **Nutech Integration Test** menggunakan **Express.js** dan **MySQL**.  
Aplikasi ini dikembangkan berdasarkan dokumentasi Swagger resmi dari Nutech Integrasi.

---

## Deployment

- **Base URL API:** [https://nutech-test-production-ecab.up.railway.app](https://nutech-test-production-ecab.up.railway.app)
- **API Documentation (Swagger):** [https://api-doc-tht.nutech-integrasi.com](https://api-doc-tht.nutech-integrasi.com)
- **GitHub Repository:** [https://github.com/lavenderika/nutech-test](https://github.com/lavenderika/nutech-test)

---

## Fitur API

### Module Membership
| Method | Endpoint | Deskripsi |
|---------|-----------|-----------|
| POST | `/registration` | Registrasi user baru |
| POST | `/login` | Login user |
| GET | `/profile` | Ambil data profil user |
| PUT | `/profile/update` | Update data profil user |
| PUT | `/profile/image` | Update foto profil user |

### Module Information
| Method | Endpoint | Deskripsi |
|---------|-----------|-----------|
| GET | `/banner` | Ambil daftar banner (public) |
| GET | `/services` | Ambil daftar layanan (private, JWT) |

### Module Transaction
| Method | Endpoint | Deskripsi |
|---------|-----------|-----------|
| GET | `/balance` | Ambil saldo user |
| POST | `/topup` | Top up saldo |
| POST | `/transaction` | Buat transaksi pembayaran |
| GET | `/transaction/history` | Lihat riwayat transaksi |

---

## Database Schema

Struktur database tersedia di file:  
📄 [`database/schema.sql`](database/schema.sql)

Contoh struktur tabel utama:
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  profile_image VARCHAR(255),
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('topup','payment') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
