import { expect } from 'chai';
import { hashPassword, comparePasswords } from '../utils/authPassword.js';

describe('Хеширование и проверка пароля', () => {
  it('успешные хеширование и проверка пароля', async () => {
    const password = 'mysecurepassword';
    const hashed = await hashPassword(password);
    expect(hashed).to.be.a('string');
    const isValid = await comparePasswords(password, hashed);
    expect(isValid).to.be.true;
  });

  it('должна вылезти ошибка при неверно введеном пароле', async () => {
    const password = '123456';
    const wrong = 'wrongpassword';
    const hashed = await hashPassword(password);
    const isValid = await comparePasswords(wrong, hashed);
    expect(isValid).to.be.false;
  });
});
