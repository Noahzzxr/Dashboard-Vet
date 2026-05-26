const connection = require('../database/connection');

exports.listarVeterinarios = (req, res) => {
  const sql = 'SELECT * FROM veterinarios';

  connection.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({ erro: 'Erro ao listar veterinários' });
    }

    res.json(results);
  });
};

exports.criarVeterinario = (req, res) => {
  const { nome, crmv, especialidade, email, telefone } = req.body;

  const sql = `
    INSERT INTO veterinarios (nome, crmv, especialidade, email, telefone)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(sql, [nome, crmv, especialidade, email, telefone], (error, result) => {
    if (error) {
      return res.status(500).json({ erro: 'Erro ao cadastrar veterinário' });
    }

    res.status(201).json({
      mensagem: 'Veterinário cadastrado com sucesso!',
      id: result.insertId
    });
  });
};

exports.atualizarVeterinario = (req, res) => {
  const { id } = req.params;
  const { nome, crmv, especialidade, email, telefone } = req.body;

  const sql = `
    UPDATE veterinarios
    SET nome = ?, crmv = ?, especialidade = ?, email = ?, telefone = ?
    WHERE id = ?
  `;

  connection.query(sql, [nome, crmv, especialidade, email, telefone, id], (error) => {
    if (error) {
      return res.status(500).json({ erro: 'Erro ao atualizar veterinário' });
    }

    res.json({ mensagem: 'Veterinário atualizado com sucesso!' });
  });
};

exports.excluirVeterinario = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM veterinarios WHERE id = ?';

  connection.query(sql, [id], (error) => {
    if (error) {
      return res.status(500).json({
        erro: 'Erro ao excluir veterinário. Verifique se ele possui consultas cadastradas.'
      });
    }

    res.json({ mensagem: 'Veterinário excluído com sucesso!' });
  });
};
