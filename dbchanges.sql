-- Tabla de preguntas de seguridad
CREATE TABLE `security_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `question_text` varchar(255) NOT NULL,
  `question_order` tinyint(4) NOT NULL COMMENT '1, 2, 3 para el orden de preguntas',
  `is_custom` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=predeterminada, 1=personalizada',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_order` (`user_id`,`question_order`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Tabla de respuestas de seguridad
CREATE TABLE `security_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `answer_hash` varchar(255) NOT NULL COMMENT 'Hash de la respuesta (bcrypt)',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;