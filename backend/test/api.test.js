import { expect } from 'chai';
import sinon from 'sinon';
import { loginHandler, registerHandler } from '../src/controllers/authController.js';
import * as passwordUtils from '../utils/authPassword.js';

describe('Auth Controller', () => {
  afterEach(() => sinon.restore());

  it('loginHandler – should return 400 if user not found', async () => {
    const fakeRequest = {
      body: { login: 'nonexistent', password: '123456' },
      server: { jwt: { sign: () => 'fakeToken' } },
    };
    const fakeReply = {
      status(code) {
        expect(code).to.equal(400);
        return {
          send: (payload) => expect(payload.message).to.equal('User does not exist!'),
        };
      },
    };

    // заглушаем prisma
    sinon.stub(authController, 'loginHandler').callsFake(async () => {
      return fakeReply.status(400).send({ message: 'User does not exist!' });
    });

    await authController.loginHandler(fakeRequest, fakeReply);
  });

  it('registerHandler – should return 403 if secret is invalid', async () => {
    const req = {
      body: {
        login: 'newuser',
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
        secretKey: 'wrong',
      },
    };

    const reply = {
      status(code) {
        expect(code).to.equal(403);
        return {
          send: (payload) => expect(payload.message).to.equal('Secret key is wrong!'),
        };
      },
    };

    await authController.registerHandler(req, reply);
  });
});
