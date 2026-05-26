const connection = require('../database/connection');

exports.listarTutores = (req, res) => {
    const sql = 'SELECT * FROM tutores';

    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ erro: 'Erro ao listar tutores' });
        }

        res.json(results);
    });
};

exports.criarTutor = (req, res) => {
    const { nome, email, telefone, endereco } = req.body;

    const sql = `
    INSERT INTO tutores (nome, email, telefone, endereco)
    VALUES (?, ?, ?, ?)
  `;

    connection.query(sql, [nome, email, telefone, endereco], (error, result) => {
        if (error) {
            return res.status(500).json({ erro: 'Erro ao cadastrar tutor' });
        }

        res.status(201).json({
            mensagem: 'Tutor cadastrado com sucesso!',
            id: result.insertId
        });
    });
};

exports.atualizarTutor = (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, endereco } = req.body;

    const sql = `
    UPDATE tutores
    SET nome = ?, email = ?, telefone = ?, endereco = ?
    WHERE id = ?
  `;

    connection.query(sql, [nome, email, telefone, endereco, id], (error) => {
        if (error) {
            return res.status(500).json({ erro: 'Erro ao atualizar tutor' });
        }

        res.json({ mensagem: 'Tutor atualizado com sucesso!' });
    });
};

exports.excluirTutor = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM tutores WHERE id = ?';

    connection.query(sql, [id], (error) => {
        if (error) {
            return res.status(500).json({
                erro: 'Erro ao excluir tutor. Verifique se ele possui pets cadastrados.'
            });
        }

        res.json({ mensagem: 'Tutor excluído com sucesso!' });
    });
};