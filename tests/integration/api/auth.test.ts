import request from 'supertest';
import { app } from '../server'; // Assurez-vous que le fichier server.ts exporte bien l'application Express

describe("Tests d'authentification", () => {
  it("devrait se connecter avec des identifiants valides", async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'User123!'
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('token');
  });

  it("devrait échouer pour des identifiants invalides", async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@test.com',
        password: 'wrongpassword'
      });
    expect(response.statusCode).toEqual(401);
  });
}); 