USE nutech_db;

-- Seed banners
INSERT INTO banners (banner_name, banner_image, description, is_active) VALUES
('Banner 1', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 1),
('Banner 2', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 1),
('Banner 3', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 1),
('Banner 4', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 1),
('Banner 5', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 1),
('Banner 6', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 1);

-- Seed services
INSERT INTO services (service_code, service_name, service_icon, service_tariff, is_active) VALUES
('PAJAK','Pajak PBB','https://nutech-integrasi.app/dummy.jpg',40000,1),
('PLN','Listrik','https://nutech-integrasi.app/dummy.jpg',10000,1),
('PDAM','PDAM Berlangganan','https://nutech-integrasi.app/dummy.jpg',40000,1),
('PULSA','Pulsa','https://nutech-integrasi.app/dummy.jpg',40000,1),
('PGN','PGN Berlangganan','https://nutech-integrasi.app/dummy.jpg',50000,1),
('MUSIK','Musik Berlangganan','https://nutech-integrasi.app/dummy.jpg',50000,1),
('TV','TV Berlangganan','https://nutech-integrasi.app/dummy.jpg',50000,1),
('PAKET_DATA','Paket data','https://nutech-integrasi.app/dummy.jpg',50000,1),
('VOUCHER_GAME','Voucher Game','https://nutech-integrasi.app/dummy.jpg',100000,1),
('VOUCHER_MAKANAN','Voucher Makanan','https://nutech-integrasi.app/dummy.jpg',100000,1),
('QURBAN','Qurban','https://nutech-integrasi.app/dummy.jpg',200000,1),
('ZAKAT','Zakat','https://nutech-integrasi.app/dummy.jpg',300000,1);
