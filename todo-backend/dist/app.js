"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts 파일 내용 (이전 답변에서 제공된 Node.js 백엔드 코드)
const express_1 = __importDefault(require("express"));
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));
app.use(express_1.default.json());
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
function initializeDb() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield pool.getConnection();
            yield connection.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      )
    `);
            console.log('Todos table checked/created successfully.');
            connection.release();
        }
        catch (err) {
            console.error('Error initializing database:', err);
        }
    });
}
app.get('/todos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield pool.execute('SELECT * FROM todos');
        res.json(rows);
    }
    catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
}));
app.post('/todos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    if (!description) {
        return res.status(400).json({ error: 'Description is required' });
    }
    try {
        const [result] = yield pool.execute('INSERT INTO todos (description) VALUES (?)', [description]);
        const newTodo = { id: result.insertId, description, completed: false };
        res.status(201).json(newTodo);
    }
    catch (err) {
        console.error('Error adding todo:', err);
        res.status(500).json({ error: 'Failed to add todo' });
    }
}));
app.put('/todos/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { description, completed } = req.body;
    if (description === undefined && completed === undefined) {
        return res.status(400).json({ error: 'At least description or completed is required' });
    }
    let query = 'UPDATE todos SET ';
    const params = [];
    const updates = [];
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
        const [result] = yield pool.execute(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json({ message: 'Todo updated' });
    }
    catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ error: 'Failed to update todo' });
    }
}));
app.delete('/todos/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [result] = yield pool.execute('DELETE FROM todos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(204).send();
    }
    catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
}));
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    yield initializeDb();
    console.log(`Server running on http://localhost:${port}`);
}));
