export function genericController(pool, tableName, fields) {
  return {
    listar: async (req, res) => {
      try {
        const [rows] = await pool.query(`SELECT ${fields.join(', ')} FROM ${tableName}`);
        res.json(rows);
      } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar dados no banco' });
      }
    },

    obterPorId: async (req, res) => {
      const id = parseInt(req.params.id);
      try {
        const [rows] = await pool.query(
          `SELECT ${fields.join(', ')} FROM ${tableName} WHERE id = ?`,
          [id]
        );
        if (rows.length === 0) return res.status(404).json({ erro: 'Registro não encontrado' });
        res.json(rows[0]);
      } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar registro no banco' });
      }
    },

    criar: async (req, res) => {
      try {
        const insertFields = Object.keys(req.body);
        const insertValues = Object.values(req.body);

        if (insertFields.length === 0) return res.status(400).json({ erro: 'Nenhum dado para inserir' });

        const placeholders = insertFields.map(() => '?').join(', ');

        const sql = `INSERT INTO ${tableName} (${insertFields.join(', ')}) VALUES (${placeholders})`;

        const [result] = await pool.query(sql, insertValues);

        const [novoRegistro] = await pool.query(
          `SELECT ${fields.join(', ')} FROM ${tableName} WHERE id = ?`,
          [result.insertId]
        );

        res.status(201).json({
          mensagem: 'Registro criado com sucesso',
          registro: novoRegistro[0]
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao criar registro no banco' });
      }
    },

    atualizar: async (req, res) => {
      const id = parseInt(req.params.id);
      try {
        const updateFields = Object.keys(req.body);
        const updateValues = Object.values(req.body);

        if (updateFields.length === 0) return res.status(400).json({ erro: 'Nenhum dado para atualizar' });

        const setString = updateFields.map(field => `${field} = ?`).join(', ');

        const sql = `UPDATE ${tableName} SET ${setString} WHERE id = ?`;

        const [result] = await pool.query(sql, [...updateValues, id]);

        if (result.affectedRows === 0) return res.status(404).json({ erro: 'Registro não encontrado' });

        const [registroAtualizado] = await pool.query(
          `SELECT ${fields.join(', ')} FROM ${tableName} WHERE id = ?`,
          [id]
        );

        res.json({
          mensagem: 'Registro atualizado com sucesso',
          registro: registroAtualizado[0]
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar registro no banco' });
      }
    },

    deletar: async (req, res) => {
      const id = parseInt(req.params.id);
      try {
        const [registroAntes] = await pool.query(
          `SELECT ${fields.join(', ')} FROM ${tableName} WHERE id = ?`,
          [id]
        );

        if (registroAntes.length === 0) {
          return res.status(404).json({ erro: 'Registro não encontrado' });
        }

        const [result] = await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);

        res.json({
          mensagem: 'O seguinte registro foi deletado:',
          registro: registroAntes[0]
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao deletar registro no banco' });
      }
    }
  };
}
