// src/app.ts 파일 내용 (이전 답변에서 제공된 Node.js 백엔드 코드)
import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initializeDb() {
  try {
    const connection = await pool.getConnection();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Todos table checked/created successfully.');
    connection.release();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

app.get('/todos', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM todos');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/todos', async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO todos (description) VALUES (?)',
      [description]
    );
    const newTodo = { id: (result as mysql.ResultSetHeader).insertId, description, completed: false };
    res.status(201).json(newTodo);
  } catch (err) {
    console.error('Error adding todo:', err);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { description, completed } = req.body;
  if (description === undefined && completed === undefined) {
    return res.status(400).json({ error: 'At least description or completed is required' });
  }

  let query = 'UPDATE todos SET ';
  const params: (string | boolean)[] = [];
  const updates: string[] = [];

  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description);
  }
  if (completed !== undefined) {
    updates.push('completed = ?');
    params.push(completed);
  }

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(id);

  try {
    const [result] = await pool.execute(query, params);
    if ((result as mysql.ResultSetHeader).affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo updated' });
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM todos WHERE id = ?', [id]);
    if ((result as mysql.ResultSetHeader).affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

app.listen(port, async () => {
  await initializeDb();
  console.log(`Server running on http://localhost:${port}`);
});