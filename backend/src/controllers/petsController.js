const connection = require('../database/connection');

exports.listarPets = (req, res) => {
    const sql = `
    SELECT 
      pets.id,
      pets.nome,
      pets.especie,
      pets.raca,
      pets.idade,
      pets.sexo,
      pets.tutor_id,
      tutores.nome AS nome_tutor
    FROM pets
    INNER JOIN tutores ON pets.tutor_id = tutores.id
  `;

    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ erro: 'Erro ao listar pets' });
        }

        res.json(results);
    });
};

exports.criarPet = (req, res) => {
    const { nome, especie, raca, idade, sexo, tutor_id } = req.body;

    const sql = `
    INSERT INTO pets (nome, especie, raca, idade, sexo, tutor_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    connection.query(sql, [nome, especie, raca, idade, sexo, tutor_id], (error, result) => {
        if (error) {
            return res.status(500).json({ erro: 'Erro ao cadastrar pet' });
        }

        res.status(201).json({
            mensagem: 'Pet cadastrado com sucesso!',
            id: result.insertId
        });
    });
};

exports.atualizarPet = (req, res) => {
    const { id } = req.params;
    const { nome, especie, raca, idade, sexo, tutor_id } = req.body;

    const sql = `
    UPDATE pets
    SET nome = ?, especie = ?, raca = ?, idade = ?, sexo = ?, tutor_id = ?
    WHERE id = ?
  `;

    connection.query(sql, [nome, especie, raca, idade, sexo, tutor_id, id], (error) => {
        if (error) {
            return res.status(500).json({ erro: 'Erro ao atualizar pet' });
        }

        res.json({ mensagem: 'Pet atualizado com sucesso!' });
    });
};

exports.excluirPet = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM pets WHERE id = ?';

    connection.query(sql, [id], (error) => {
        if (error) {
            return res.status(500).json({
                erro: 'Erro ao excluir pet. Verifique se ele possui consultas cadastradas.'
            });
        }

        res.json({ mensagem: 'Pet excluído com sucesso!' });
    });
};