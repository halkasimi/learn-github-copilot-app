import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

describe('Task API', () => {
  it('GET /health returns ok', async () => {
    const res = await request(createApp()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('creates and then lists a task', async () => {
    const app = createApp();

    const created = await request(app).post('/tasks').send({ title: 'Demo task' });
    expect(created.status).toBe(201);
    expect(created.body.title).toBe('Demo task');
    expect(created.body.completed).toBe(false);

    const list = await request(app).get('/tasks');
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
  });

  it('marks a task completed via PATCH', async () => {
    const app = createApp();
    const created = await request(app).post('/tasks').send({ title: 'Finish slides' });

    const patched = await request(app)
      .patch(`/tasks/${created.body.id}`)
      .send({ completed: true });

    expect(patched.status).toBe(200);
    expect(patched.body.completed).toBe(true);
  });

  it('lists only completed tasks when filtered', async () => {
    const app = createApp();
    const completed = await request(app).post('/tasks').send({ title: 'Done' });
    await request(app).post('/tasks').send({ title: 'Not done' });
    await request(app).patch(`/tasks/${completed.body.id}`).send({ completed: true });

    const res = await request(app).get('/tasks?completed=true');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Done');
  });

  it('rejects an invalid completed filter', async () => {
    const res = await request(createApp()).get('/tasks?completed=maybe');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("completed must be 'true' or 'false'");
  });

  it('returns 404 for an unknown task', async () => {
    const res = await request(createApp()).get('/tasks/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('rejects a missing title with 400 and does not create a task', async () => {
    const app = createApp();

    const res = await request(app).post('/tasks').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();

    const list = await request(app).get('/tasks');
    expect(list.body).toHaveLength(0);
  });

  it('rejects a non-string title with 400 and does not create a task', async () => {
    const app = createApp();

    const res = await request(app).post('/tasks').send({ title: 42 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();

    const list = await request(app).get('/tasks');
    expect(list.body).toHaveLength(0);
  });

  it('rejects a whitespace-only title with 400 and does not create a task', async () => {
    const app = createApp();

    const res = await request(app).post('/tasks').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();

    const list = await request(app).get('/tasks');
    expect(list.body).toHaveLength(0);
  });
});
