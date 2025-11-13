-- ======================================================
-- CONFIGURACIÓN DE BASE DE DATOS
-- ======================================================
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS Proyecto1
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON Proyecto1.* TO 'usuari';
FLUSH PRIVILEGES;

USE Proyecto1;

-- ======================================================
-- CREACIÓN DE TABLA
-- ======================================================
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(500),
    imagen LONGTEXT
);

