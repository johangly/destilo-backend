CREATE TABLE `activation_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `expiration` datetime NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_activation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `expiration` datetime NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `sells` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` varchar(50) NOT NULL,
  `id_factura` bigint NOT NULL,
  `customer_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_customer` (`customer_id`),
  CONSTRAINT `fk_sells_client` FOREIGN KEY (`customer_id`) REFERENCES `clientes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `productos_vendidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sell_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `fecha` varchar(50) NOT NULL,
  `producto_id` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precioTotal` decimal(10,2) NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `service_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sell_id` (`sell_id`),
  KEY `fk_service_id` (`service_id`),
  CONSTRAINT `fk_product_sell` FOREIGN KEY (`sell_id`) REFERENCES `sells` (`id`),
  CONSTRAINT `fk_product_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `servicios_vendidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sell_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `fecha` varchar(50) NOT NULL,
  `service_id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precioTotal` decimal(10,2) NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sell_id` (`sell_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `fk_service_sell` FOREIGN KEY (`sell_id`) REFERENCES `sells` (`id`),
  CONSTRAINT `fk_service_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `security_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `question_text` varchar(255) NOT NULL,
  `question_order` tinyint NOT NULL COMMENT '1, 2, 3 para el orden de preguntas',
  `is_custom` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0=predeterminada, 1=personalizada',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_order` (`user_id`,`question_order`),
  CONSTRAINT `fk_sec_question_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `security_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `answer_hash` varchar(255) NOT NULL COMMENT 'Hash de la respuesta (bcrypt)',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `fk_sec_answer_question` FOREIGN KEY (`question_id`) REFERENCES `security_questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `direcciones_proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proveedor_id` int NOT NULL,
  `calle` varchar(100) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `pais` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `fk_direccion_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `stocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cantidad` varchar(20) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `precioUnitario` varchar(20) NOT NULL,
  `producto` varchar(100) NOT NULL,
  `proveedor_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_stocks_proveedor` (`proveedor_id`),
  CONSTRAINT `fk_stocks_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
