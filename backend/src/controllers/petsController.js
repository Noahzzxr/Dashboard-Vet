const connection = require('../database/connection');

const logSqlError = (operation, error) => {
    console.error(`Erro SQL em ${operation}:`, error.message);
};

const normalizarSexo = (sexo) => {
    const valor = String(sexo || '').trim();

    if (valor === 'Macho') return 'Macho';
    if (['Fêmea', 'Femea', 'FÃªmea'].includes(valor)) return 'Fêmea';

    return valor;
};

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
        LEFT JOIN tutores ON pets.tutor_id = tutores.id
        ORDER BY pets.id DESC
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            logSqlError('GET /pets', error);
            return res.status(500).json({ erro: 'Erro ao listar pets', detalhes: error.message });
        }

        res.json(results);
    });
};

exports.criarPet = (req, res) => {
    const { nome, especie, raca, idade, tutor_id } = req.body;
    const sexo = normalizarSexo(req.body.sexo);

    if (!nome || !especie || !sexo || !tutor_id) {
        return res.status(400).json({ erro: 'Nome, espécie, sexo e tutor são obrigatórios.' });
    }

    const sql = `
        INSERT INTO pets (nome, especie, raca, idade, sexo, tutor_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [nome, especie, raca || null, idade === undefined || idade === '' ? null : Number(idade), sexo, Number(tutor_id)],
        (error, result) => {
            if (error) {
                logSqlError('POST /pets', error);
                return res.status(500).json({ erro: 'Erro ao cadastrar pet', detalhes: error.message });
            }

            console.log('Registro inserido com sucesso em pets:', result.insertId);

            res.status(201).json({
                mensagem: 'Pet cadastrado com sucesso!',
                id: result.insertId
            });
        }
    );
};

exports.atualizarPet = (req, res) => {
    const { id } = req.params;
    const { nome, especie, raca, idade, tutor_id } = req.body;
    const sexo = normalizarSexo(req.body.sexo);

    if (!nome || !especie || !sexo || !tutor_id) {
        return res.status(400).json({ erro: 'Nome, espécie, sexo e tutor são obrigatórios.' });
    }

    const sql = `
        UPDATE pets
        SET nome = ?, especie = ?, raca = ?, idade = ?, sexo = ?, tutor_id = ?
        WHERE id = ?
    `;

    connection.query(
        sql,
        [nome, especie, raca || null, idade === undefined || idade === '' ? null : Number(idade), sexo, Number(tutor_id), id],
        (error, result) => {
            if (error) {
                logSqlError('PUT /pets/:id', error);
                return res.status(500).json({ erro: 'Erro ao atualizar pet', detalhes: error.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ erro: 'Pet não encontrado' });
            }

            console.log('Registro atualizado com sucesso em pets:', id);
            res.json({ mensagem: 'Pet atualizado com sucesso!' });
        }
    );
};

exports.excluirPet = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM pets WHERE id = ?';

    connection.query(sql, [id], (error, result) => {
        if (error) {
            logSqlError('DELETE /pets/:id', error);
            return res.status(500).json({
                erro: 'Erro ao excluir pet. Verifique se ele possui consultas cadastradas.',
                detalhes: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Pet não encontrado' });
        }

        console.log('Registro excluído com sucesso em pets:', id);
        res.json({ mensagem: 'Pet excluído com sucesso!' });
    });
};
