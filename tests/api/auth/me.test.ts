import request from 'supertest';
import { app } from '../server';

describe("Tests de l'endpoint GET /api/auth/me", () => {
  let token: string;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'User123!'
      });
    token = response.body.token;
  });

  it("devrait renvoyer les informations de l'utilisateur authentifié", async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('email');
  });
}); 