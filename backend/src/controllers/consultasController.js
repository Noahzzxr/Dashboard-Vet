const connection = require('../database/connection');

exports.listarConsultas = (req, res) => {
    const sql = `
    SELECT 
      consultas.id,
      consultas.pet_id,
      consultas.veterinario_id,
      pets.nome AS nome_pet,
      tutores.nome AS nome_tutor,
      veterinarios.nome AS nome_veterinario,
      consultas.data_consulta,
      consultas.hora_consulta,
      consultas.motivo,
      consultas.diagnostico,
      consultas.status
    FROM consultas
    INNER JOIN pets ON consultas.pet_id = pets.id
    INNER JOIN tutores ON pets.tutor_id = tutores.id
    INNER JOIN veterinarios ON consultas.veterinario_id = veterinarios.id
  `;

    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ erro: 'Erro ao listar consultas' });
        }

        res.json(results);
    });
};

exports.criarConsulta = (req, res) => {
    const {
        pet_id,
        veterinario_id,
        data_consulta,
        hora_consulta,
        motivo,
        diagnostico,
        status
    } = req.body;

    const sql = `
    INSERT INTO consultas 
    (pet_id, veterinario_id, data_consulta, hora_consulta, motivo, diagnostico, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    connection.query(
        sql,
        [pet_id, veterinario_id, data_consulta, hora_consulta, motivo, diagnostico, status],
        (error, result) => {
            if (error) {
                return res.status(500).json({ erro: 'Erro ao cadastrar consulta' });
            }

            res.status(201).json({
                mensagem: 'Consulta cadastrada com sucesso!',
                id: result.insertId
            });
        }
    );
};

exports.atualizarConsulta = (req, res) => {
    const { id } = req.params;

    const {
        pet_id,
        veterinario_id,
        data_consulta,
        hora_consulta,
        motivo,
        diagnostico,
        status
    } = req.body;

    const sql = `
    UPDATE consultas
    SET pet_id = ?, veterinario_id = ?, data_consulta = ?, hora_consulta = ?, motivo = ?, diagnostico = ?, status = ?
    WHERE id = ?
  `;

    connection.query(
        sql,
        [pet_id, veterinario_id, data_consulta, hora_consulta, motivo, diagnostico, status, id],
        (error) => {
            if (error) {
                return res.status(500).json({ erro: 'Erro ao atualizar consulta' });
            }

            res.json({ mensagem: 'Consulta atualizada com sucesso!' });
        }
    );
};

exports.excluirConsulta = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM consultas WHERE id = ?';

    connection.query(sql, [id], (error) => {
        if (error) {
            return res.status(500).json({ erro: 'Erro ao excluir consulta' });
        }

        res.json({ mensagem: 'Consulta excluída com sucesso!' });
    });
};