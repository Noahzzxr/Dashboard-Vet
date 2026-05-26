const connection = require('../database/connection');

const logSqlError = (operation, error) => {
    console.error(`Erro SQL em ${operation}:`, error.message);
};

exports.listarVeterinarios = (req, res) => {
    const sql = 'SELECT * FROM veterinarios ORDER BY id DESC';

    connection.query(sql, (error, results) => {
        if (error) {
            logSqlError('GET /veterinarios', error);
            return res.status(500).json({ erro: 'Erro ao listar veterinários', detalhes: error.message });
        }

        res.json(results);
    });
};

exports.criarVeterinario = (req, res) => {
    const { nome, crmv, especialidade, email, telefone } = req.body;

    if (!nome || !crmv) {
        return res.status(400).json({ erro: 'Nome e CRMV são obrigatórios.' });
    }

    const sql = `
        INSERT INTO veterinarios (nome, crmv, especialidade, email, telefone)
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(sql, [nome, crmv, especialidade || null, email || null, telefone || null], (error, result) => {
        if (error) {
            logSqlError('POST /veterinarios', error);
            return res.status(500).json({ erro: 'Erro ao cadastrar veterinário', detalhes: error.message });
        }

        console.log('Registro inserido com sucesso em veterinarios:', result.insertId);

        res.status(201).json({
            mensagem: 'Veterinário cadastrado com sucesso!',
            id: result.insertId
        });
    });
};

exports.atualizarVeterinario = (req, res) => {
    const { id } = req.params;
    const { nome, crmv, especialidade, email, telefone } = req.body;

    if (!nome || !crmv) {
        return res.status(400).json({ erro: 'Nome e CRMV são obrigatórios.' });
    }

    const sql = `
        UPDATE veterinarios
        SET nome = ?, crmv = ?, especialidade = ?, email = ?, telefone = ?
        WHERE id = ?
    `;

    connection.query(sql, [nome, crmv, especialidade || null, email || null, telefone || null, id], (error, result) => {
        if (error) {
            logSqlError('PUT /veterinarios/:id', error);
            return res.status(500).json({ erro: 'Erro ao atualizar veterinário', detalhes: error.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Veterinário não encontrado' });
        }

        console.log('Registro atualizado com sucesso em veterinarios:', id);
        res.json({ mensagem: 'Veterinário atualizado com sucesso!' });
    });
};

exports.excluirVeterinario = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM veterinarios WHERE id = ?';

    connection.query(sql, [id], (error, result) => {
        if (error) {
            logSqlError('DELETE /veterinarios/:id', error);
            return res.status(500).json({
                erro: 'Erro ao excluir veterinário. Verifique se ele possui consultas cadastradas.',
                detalhes: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Veterinário não encontrado' });
        }

        console.log('Registro excluído com sucesso em veterinarios:', id);
        res.json({ mensagem: 'Veterinário excluído com sucesso!' });
    });
};
