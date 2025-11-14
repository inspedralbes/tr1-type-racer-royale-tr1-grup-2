-- ======================================================
-- CONFIGURACIÓN DE BASE DE DATOS
-- ======================================================
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS tr1_typebet
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tr1_typebet;

-- ======================================================
-- CREACIÓN DE TABLA
-- ======================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(500), -- recordar hashear
    imagen VARCHAR(500)
);
