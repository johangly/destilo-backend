-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 21, 2025 at 08:17 PM
-- Server version: 10.6.21-MariaDB-cll-lve-log
-- PHP Version: 8.3.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dEstilo_plus_test`
--
CREATE DATABASE IF NOT EXISTS `dEstilo_plus_test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `dEstilo_plus_test`;

-- --------------------------------------------------------

--
-- Table structure for table `activation_tokens`
--

CREATE TABLE `activation_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expiration` datetime NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `cliente` varchar(100) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `empresa` varchar(100) DEFAULT NULL,
  `fechaRegistro` varchar(50) NOT NULL,
  `nrocasa` varchar(50) DEFAULT NULL,
  `pais` varchar(100) NOT NULL,
  `provincia` varchar(100) NOT NULL,
  `rif` varchar(20) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `direcciones_proveedores`
--

CREATE TABLE `direcciones_proveedores` (
  `id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `calle` varchar(100) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `pais` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expiration` datetime NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productos_vendidos`
--

CREATE TABLE `productos_vendidos` (
  `id` int(11) NOT NULL,
  `sell_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha` varchar(50) NOT NULL,
  `producto_id` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precioTotal` decimal(10,2) NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `service_id` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `fechaRegistro` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `productos` varchar(255) DEFAULT NULL,
  `razonSocial` varchar(100) NOT NULL,
  `rif` varchar(20) NOT NULL,
  `servicios` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `webrrss` varchar(100) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sells`
--

CREATE TABLE `sells` (
  `id` int(11) NOT NULL,
  `fecha` varchar(50) NOT NULL,
  `id_factura` bigint(20) NOT NULL,
  `customer_id` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `servicio` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `servicios_vendidos`
--

CREATE TABLE `servicios_vendidos` (
  `id` int(11) NOT NULL,
  `sell_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha` varchar(50) NOT NULL,
  `service_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precioTotal` decimal(10,2) NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `id` int(11) NOT NULL,
  `cantidad` varchar(20) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `precioUnitario` varchar(20) NOT NULL,
  `producto` varchar(100) NOT NULL,
  `proveedor_id` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','employee') NOT NULL DEFAULT 'employee',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','validated') NOT NULL DEFAULT 'pending',
  `email` varchar(255) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `createdAt`, `status`, `email`) VALUES
(1, 'admin', '$2b$10$gMDK6izQsu0SqFUGuPk2RepRamNtOPDujtk.LCrKc.sQ2yvm4ZaxC', 'admin', '2025-03-04 21:59:58', 'validated', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activation_tokens`
--
ALTER TABLE `activation_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `direcciones_proveedores`
--
ALTER TABLE `direcciones_proveedores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proveedor_id` (`proveedor_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `productos_vendidos`
--
ALTER TABLE `productos_vendidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sell_id` (`sell_id`),
  ADD KEY `fk_service_id` (`service_id`);

--
-- Indexes for table `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `sells`
--
ALTER TABLE `sells`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_customer` (`customer_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `servicios_vendidos`
--
ALTER TABLE `servicios_vendidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sell_id` (`sell_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_stocks_proveedor` (`proveedor_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activation_tokens`
--
ALTER TABLE `activation_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `direcciones_proveedores`
--
ALTER TABLE `direcciones_proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `productos_vendidos`
--
ALTER TABLE `productos_vendidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sells`
--
ALTER TABLE `sells`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `servicios_vendidos`
--
ALTER TABLE `servicios_vendidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
