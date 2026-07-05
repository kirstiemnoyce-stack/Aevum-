const request = require('supertest');
const app = require('../src/index');
const db = require('../src/db');

afterAll(async () => {
  await db.end();
});

beforeEach(async () => {
  await db.query('TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE');
});

describe('GET /', () => {
  it('returns welcome payload', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Welcome to Aevum! 🚀');
    expect(res.body).toHaveProperty('version', '1.0.0');
  });
});

describe('GET /health', () => {
  it('returns OK when database is reachable', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.database).toBe('connected');
  });
});

describe('Tasks API', () => {
  it('GET /api/tasks returns empty list initially', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  it('POST /api/tasks creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Learn PostgreSQL', description: 'Set up database' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Learn PostgreSQL');
    expect(res.body.completed).toBe(false);
  });

  it('POST /api/tasks rejects missing title', async () => {
    const res = await request(app).post('/api/tasks').send({ description: 'No title' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it('POST /api/tasks trims whitespace from title and description', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: '  Trimmed  ', description: '  Desc  ' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Trimmed');
    expect(res.body.description).toBe('Desc');
  });

  it('GET /api/tasks/:id returns a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Task' });
    const res = await request(app).get(`/api/tasks/${created.body.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it('GET /api/tasks/:id returns 404 for unknown task', async () => {
    const res = await request(app).get('/api/tasks/9999');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/tasks/:id returns 400 for invalid id', async () => {
    const res = await request(app).get('/api/tasks/not-an-id');
    expect(res.statusCode).toBe(400);
  });

  it('PUT /api/tasks/:id updates a task partially', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Old' });
    const res = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Old');
    expect(res.body.completed).toBe(true);
  });

  it('PUT /api/tasks/:id rejects invalid completed type', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Task' });
    const res = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ completed: 'yes' });
    expect(res.statusCode).toBe(400);
  });

  it('DELETE /api/tasks/:id removes a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Delete me' });
    const res = await request(app).delete(`/api/tasks/${created.body.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('DELETE /api/tasks/:id returns 404 for unknown task', async () => {
    const res = await request(app).delete('/api/tasks/9999');
    expect(res.statusCode).toBe(404);
  });
});

describe('Users API', () => {
  it('GET /api/users returns empty list initially', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(res.body.users).toEqual([]);
  });

  it('POST /api/users creates a user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Kirstie', email: 'kirstie@aevum.app' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Kirstie');
    expect(res.body.email).toBe('kirstie@aevum.app');
  });

  it('POST /api/users rejects missing fields', async () => {
    const res = await request(app).post('/api/users').send({ name: 'Kirstie' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/users rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Kirstie', email: 'not-an-email' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/users normalizes email to lowercase', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Kirstie', email: 'Kirstie@Aevum.APP' });
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe('kirstie@aevum.app');
  });

  it('POST /api/users returns 409 for duplicate email', async () => {
    await request(app).post('/api/users').send({ name: 'Kirstie', email: 'kirstie@aevum.app' });
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Kirstie2', email: 'kirstie@aevum.app' });
    expect(res.statusCode).toBe(409);
  });
});

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/route not found/i);
  });
});
