const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = 'Aevum';
const APP_VERSION = '1.0.0';

app.use(express.json());

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  // Simple email shape check; avoids ReDoS by rejecting very long input early
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id parameter' });
  }
  req.params.id = id;
  next();
}

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json({ tasks: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET single task
app.get('/api/tasks/:id', validateIdParam, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// CREATE task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!isNonEmptyString(title)) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }
    const safeDescription = isNonEmptyString(description) ? description.trim() : '';
    const result = await db.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title.trim(), safeDescription]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// UPDATE task
app.put('/api/tasks/:id', validateIdParam, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    if (title !== undefined && !isNonEmptyString(title)) {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean' });
    }

    const safeTitle = title === undefined ? undefined : title.trim();
    const safeDescription = description === undefined ? undefined : description.trim();

    const result = await db.query(
      'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), completed = COALESCE($3, completed), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [safeTitle, safeDescription, completed, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
app.delete('/api/tasks/:id', validateIdParam, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully', task: result.rows[0] });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// CREATE user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    const result = await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at',
      [name.trim(), email.trim().toLowerCase()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: `Welcome to ${APP_NAME}! 🚀`,
    version: APP_VERSION,
    description: 'A powerful application for managing time and tasks',
    database: 'PostgreSQL',
    endpoints: { tasks: '/api/tasks', users: '/api/users', health: '/health' }
  });
});

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT NOW()');
    res.json({ status: 'OK', timestamp: new Date().toISOString(), database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'ERROR', timestamp: new Date().toISOString(), database: 'disconnected', error: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 ${APP_NAME} v${APP_VERSION} running on http://localhost:${PORT}`);
    console.log(`📝 Database: PostgreSQL`);
  });
}

module.exports = app;
