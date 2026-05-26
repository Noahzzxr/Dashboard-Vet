CREATE DATABASE IF NOT EXISTS clinica_veterinaria
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE clinica_veterinaria;

CREATE TABLE IF NOT EXISTS tutores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    endereco VARCHAR(150),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(80),
    idade INT,
    sexo ENUM('Macho', 'Fêmea') NOT NULL,
    tutor_id INT NOT NULL,
    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS veterinarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    crmv VARCHAR(30) NOT NULL,
    especialidade VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS consultas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    veterinario_id INT NOT NULL,
    data_consulta DATE NOT NULL,
    hora_consulta TIME NOT NULL,
    motivo VARCHAR(150) NOT NULL,
    diagnostico TEXT,
    status ENUM('Agendada', 'Realizada', 'Cancelada') DEFAULT 'Agendada',
    FOREIGN KEY (pet_id) REFERENCES pets(id),
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tutores (nome, email, telefone, endereco)
VALUES
('João Silva', 'joao@email.com', '11999999999', 'Rua A, 123'),
('Maria Oliveira', 'maria@email.com', '11888888888', 'Rua B, 456');

INSERT INTO pets (nome, especie, raca, idade, sexo, tutor_id)
VALUES
('Rex', 'Cachorro', 'Labrador', 4, 'Macho', 1),
('Mimi', 'Gato', 'Siamês', 2, 'Fêmea', 2);

INSERT INTO veterinarios (nome, crmv, especialidade, email, telefone)
VALUES
('Dra. Ana Costa', 'CRMV-SP 12345', 'Clínica Geral', 'ana@vetcare.com', '11777777777'),
('Dr. Lucas Lima', 'CRMV-SP 67890', 'Cirurgia', 'lucas@vetcare.com', '11666666666');

INSERT INTO consultas (pet_id, veterinario_id, data_consulta, hora_consulta, motivo, diagnostico, status)
VALUES
(1, 1, '2026-05-30', '14:00:00', 'Vacinação', 'Consulta agendada para vacinação anual.', 'Agendada'),
(2, 2, '2026-06-02', '10:30:00', 'Avaliação', 'Avaliação inicial do pet.', 'Agendada');
