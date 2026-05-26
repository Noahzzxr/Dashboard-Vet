const connection = require('../database/connection');

const logSqlError = (operation, error) => {
    console.error(`Erro SQL em ${operation}:`, error.message);
};

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
        ORDER BY consultas.data_consulta DESC, consultas.hora_consulta DESC
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            logSqlError('GET /consultas', error);
            return res.status(500).json({ erro: 'Erro ao listar consultas', detalhes: error.message });
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

    if (!pet_id || !veterinario_id || !data_consulta || !hora_consulta || !motivo) {
        return res.status(400).json({
            erro: 'Pet, veterinário, data, hora e motivo são obrigatórios.'
        });
    }

    const sql = `
        INSERT INTO consultas
        (pet_id, veterinario_id, data_consulta, hora_consulta, motivo, diagnostico, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [
            Number(pet_id),
            Number(veterinario_id),
            data_consulta,
            hora_consulta,
            motivo,
            diagnostico || null,
            status || 'Agendada'
        ],
        (error, result) => {
            if (error) {
                logSqlError('POST /consultas', error);
                return res.status(500).json({ erro: 'Erro ao cadastrar consulta', detalhes: error.message });
            }

            console.log('Registro inserido com sucesso em consultas:', result.insertId);

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

    if (!pet_id || !veterinario_id || !data_consulta || !hora_consulta || !motivo) {
        return res.status(400).json({
            erro: 'Pet, veterinário, data, hora e motivo são obrigatórios.'
        });
    }

    const sql = `
        UPDATE consultas
        SET pet_id = ?, veterinario_id = ?, data_consulta = ?, hora_consulta = ?, motivo = ?, diagnostico = ?, status = ?
        WHERE id = ?
    `;

    connection.query(
        sql,
        [
            Number(pet_id),
            Number(veterinario_id),
            data_consulta,
            hora_consulta,
            motivo,
            diagnostico || null,
            status || 'Agendada',
            id
        ],
        (error, result) => {
            if (error) {
                logSqlError('PUT /consultas/:id', error);
                return res.status(500).json({ erro: 'Erro ao atualizar consulta', detalhes: error.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ erro: 'Consulta não encontrada' });
            }

            console.log('Registro atualizado com sucesso em consultas:', id);
            res.json({ mensagem: 'Consulta atualizada com sucesso!' });
        }
    );
};

exports.excluirConsulta = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM consultas WHERE id = ?';

    connection.query(sql, [id], (error, result) => {
        if (error) {
            logSqlError('DELETE /consultas/:id', error);
            return res.status(500).json({ erro: 'Erro ao excluir consulta', detalhes: error.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Consulta não encontrada' });
        }

        console.log('Registro excluído com sucesso em consultas:', id);
        res.json({ mensagem: 'Consulta excluída com sucesso!' });
    });
};
