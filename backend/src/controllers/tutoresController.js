const connection = require('../database/connection');

const logSqlError = (operation, error) => {
    console.error(`Erro SQL em ${operation}:`, error.message);
};

exports.listarTutores = (req, res) => {
    const sql = 'SELECT * FROM tutores ORDER BY id DESC';

    connection.query(sql, (error, results) => {
        if (error) {
            logSqlError('GET /tutores', error);
            return res.status(500).json({ erro: 'Erro ao listar tutores', detalhes: error.message });
        }

        res.json(results);
    });
};

exports.criarTutor = (req, res) => {
    const { nome, email, telefone, endereco } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios.' });
    }

    const sql = `
        INSERT INTO tutores (nome, email, telefone, endereco)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(sql, [nome, email, telefone || null, endereco || null], (error, result) => {
        if (error) {
            logSqlError('POST /tutores', error);
            return res.status(500).json({ erro: 'Erro ao cadastrar tutor', detalhes: error.message });
        }

        console.log('Registro inserido com sucesso em tutores:', result.insertId);

        res.status(201).json({
            mensagem: 'Tutor cadastrado com sucesso!',
            id: result.insertId
        });
    });
};

exports.atualizarTutor = (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, endereco } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios.' });
    }

    const sql = `
        UPDATE tutores
        SET nome = ?, email = ?, telefone = ?, endereco = ?
        WHERE id = ?
    `;

    connection.query(sql, [nome, email, telefone || null, endereco || null, id], (error, result) => {
        if (error) {
            logSqlError('PUT /tutores/:id', error);
            return res.status(500).json({ erro: 'Erro ao atualizar tutor', detalhes: error.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado' });
        }

        console.log('Registro atualizado com sucesso em tutores:', id);
        res.json({ mensagem: 'Tutor atualizado com sucesso!' });
    });
};

exports.excluirTutor = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tutores WHERE id = ?';

    connection.query(sql, [id], (error, result) => {
        if (error) {
            logSqlError('DELETE /tutores/:id', error);
            return res.status(500).json({
                erro: 'Erro ao excluir tutor. Verifique se ele possui pets cadastrados.',
                detalhes: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado' });
        }

        console.log('Registro excluído com sucesso em tutores:', id);
        res.json({ mensagem: 'Tutor excluído com sucesso!' });
    });
};
