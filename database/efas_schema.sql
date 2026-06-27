-- ============================================================
--  E.F.A.S. — Electronic Feedback and Accountability System
--  Solano, Nueva Vizcaya
--  DATABASE SCHEMA v1.0
--  Import this file in Navicat:
--  Right-click database → Run SQL File → piliin ito
-- ============================================================

CREATE DATABASE IF NOT EXISTS efas_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE efas_db;

-- ============================================================
-- TABLE 1: users
-- Lahat ng accounts (superadmin, admin, driver, passenger)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('superadmin','admin','driver','passenger') NOT NULL,
  is_active     TINYINT(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: drivers
-- Profile ng bawat driver (linked sa users table)
-- ============================================================
CREATE TABLE IF NOT EXISTS drivers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  driver_code     VARCHAR(20) NOT NULL UNIQUE,   -- e.g. DRV-2024-001
  plate_number    VARCHAR(20) NOT NULL UNIQUE,   -- e.g. TRK-001
  body_number     VARCHAR(20) NOT NULL UNIQUE,   -- e.g. BDY-001
  ltfrb_license   VARCHAR(50) NOT NULL,          -- e.g. LIC-2024-00142
  contact_number  VARCHAR(20),
  assigned_route  VARCHAR(200),
  status          ENUM('active','inactive','suspended') DEFAULT 'active',
  qr_code         VARCHAR(100) UNIQUE,           -- e.g. EFAS-DRV-2024-001
  date_enrolled   DATE,
  enrolled_by     INT,                           -- admin user_id
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (enrolled_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 3: routes
-- Mga authorized na ruta sa Solano
-- ============================================================
CREATE TABLE IF NOT EXISTS routes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  route_name  VARCHAR(200) NOT NULL,
  origin      VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  waypoints   JSON,             -- array ng mga intermediate stops
  is_active   TINYINT(1) DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 4: trips
-- Bawat biyahe ng driver (nagsisimula pag na-scan ng passenger)
-- NOTE: Hindi nag-iimbak ng real-time GPS — para lang sa trip record
-- ============================================================
CREATE TABLE IF NOT EXISTS trips (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  driver_id       INT NOT NULL,
  passenger_token VARCHAR(100),                  -- anonymous token ng passenger
  route_id        INT,
  origin          VARCHAR(100),
  destination     VARCHAR(100),
  status          ENUM('active','completed','cancelled') DEFAULT 'active',
  started_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at        TIMESTAMP NULL,

  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (route_id)  REFERENCES routes(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 5: complaints
-- Mga reklamo ng pasahero laban sa driver
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  driver_id        INT NOT NULL,
  trip_id          INT,
  complaint_type   ENUM(
                     'rude_behavior',
                     'wrong_route',
                     'overcharging',
                     'unsafe_driving',
                     'other'
                   ) NOT NULL,
  description      TEXT NOT NULL,
  incident_date    DATE NOT NULL,
  incident_time    TIME,
  contact_number   VARCHAR(20),                  -- opsyonal ng passenger
  status           ENUM('new','under_review','resolved','dismissed') DEFAULT 'new',
  resolution_notes TEXT,
  resolved_by      INT,                          -- admin user_id
  resolved_at      TIMESTAMP NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (driver_id)   REFERENCES drivers(id),
  FOREIGN KEY (trip_id)     REFERENCES trips(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 6: ratings
-- Star ratings ng pasahero pagkatapos ng biyahe
-- ============================================================
CREATE TABLE IF NOT EXISTS ratings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  driver_id       INT NOT NULL,
  trip_id         INT,
  stars           TINYINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment         TEXT,
  passenger_token VARCHAR(100),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (trip_id)   REFERENCES trips(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 7: qr_scans
-- Log ng lahat ng QR scans (para sa audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS qr_scans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  driver_id   INT NOT NULL,
  scanned_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  device_info VARCHAR(255),

  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- ============================================================
-- SAMPLE DATA — Para sa testing
-- ============================================================

-- Super Admin
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Juan dela Cruz',  'superadmin@efas.gov.ph', '$2b$10$PLACEHOLDER_HASH_SUPERADMIN', 'superadmin');

-- Admins
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Maria Santos',    'admin1@efas.gov.ph',     '$2b$10$PLACEHOLDER_HASH_ADMIN1',     'admin'),
('Jose Reyes',      'admin2@efas.gov.ph',     '$2b$10$PLACEHOLDER_HASH_ADMIN2',     'admin');

-- Driver accounts (sa users table)
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Roberto Manalang',  'roberto@efas.gov.ph', '$2b$10$PLACEHOLDER_HASH_DRV1', 'driver'),
('Andres Lacuesta',   'andres@efas.gov.ph',  '$2b$10$PLACEHOLDER_HASH_DRV2', 'driver'),
('Pedro Bautista',    'pedro@efas.gov.ph',   '$2b$10$PLACEHOLDER_HASH_DRV3', 'driver');

-- Driver profiles
INSERT INTO drivers
  (user_id, driver_code, plate_number, body_number, ltfrb_license, contact_number, assigned_route, status, qr_code, date_enrolled, enrolled_by)
VALUES
(4, 'DRV-2024-001', 'TRK-001', 'BDY-001', 'LIC-2024-00142', '09123456789', 'Solano Town Center – Maharlika Hwy', 'active',    'EFAS-DRV-2024-001', '2024-01-15', 2),
(5, 'DRV-2024-002', 'TRK-002', 'BDY-002', 'LIC-2024-00198', '09187654321', 'Solano – Bambang Junction',           'active',    'EFAS-DRV-2024-002', '2024-02-01', 2),
(6, 'DRV-2024-015', 'TRK-015', 'BDY-015', 'LIC-2024-00301', '09156781234', 'Barrio Loop – Solano Terminal',       'suspended', 'EFAS-DRV-2024-015', '2024-03-10', 2);

-- Routes
INSERT INTO routes (route_name, origin, destination, waypoints) VALUES
('Solano Center – Maharlika Hwy', 'Solano Town Center', 'Maharlika Highway',
 '["Solano Junction","Purok 3","Maharlika Highway"]'),
('Solano – Bambang Junction', 'Solano Terminal', 'Bambang Junction',
 '["Mabini St","National Highway","Bambang Junction"]'),
('Solano Market – Solano Hospital', 'Solano Public Market', 'Solano District Hospital',
 '["Rizal Ave","Hospital Road"]'),
('Barrio Loop – Solano Terminal', 'Barangay Loop', 'Solano Terminal',
 '["Purok 5","Barangay Hall","Solano Terminal"]');

-- Sample ratings para kay Roberto
INSERT INTO ratings (driver_id, stars, comment, passenger_token) VALUES
(1, 5, 'Magalang at maayos. Sinunod ang tamang ruta.', 'anon-001'),
(1, 5, 'Mabilis at maingat.',                          'anon-002'),
(1, 4, 'Ok naman pero medyo mabagal.',                 'anon-003');

-- Sample complaint
INSERT INTO complaints
  (driver_id, complaint_type, description, incident_date, incident_time, status)
VALUES
(3, 'rude_behavior', 'Sumigaw sa pasahero nang humingi ng sukli. Hindi nagbigay ng resibo.', '2026-06-26', '10:32:00', 'under_review'),
(2, 'wrong_route',   'Lumayo sa tamang ruta para makapag-charge ng mas malaki.',             '2026-06-25', '14:15:00', 'under_review');

-- ============================================================
-- USEFUL VIEWS (para madali ang pagkuha ng data)
-- ============================================================

-- View: Driver kasama ang average rating at bilang ng complaints
CREATE OR REPLACE VIEW v_driver_summary AS
SELECT
  d.id              AS driver_id,
  u.full_name,
  d.driver_code,
  d.plate_number,
  d.body_number,
  d.ltfrb_license,
  d.contact_number,
  d.assigned_route,
  d.status,
  d.qr_code,
  d.date_enrolled,
  ROUND(COALESCE(AVG(r.stars), 0), 1) AS avg_rating,
  COUNT(DISTINCT r.id)                AS total_ratings,
  COUNT(DISTINCT c.id)                AS total_complaints
FROM drivers d
JOIN users u ON u.id = d.user_id
LEFT JOIN ratings   r ON r.driver_id = d.id
LEFT JOIN complaints c ON c.driver_id = d.id AND c.status != 'dismissed'
GROUP BY d.id;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
