import { expect } from 'chai';
import { hashPassword } from '../src/utils/authPassword.js';
describe('hashPassword', () => {
    it('Должен возвращать захэшированную строку', async () => {
        const password = 'anyPassword';
        const hashedPassword = await hashPassword(password);
        expect(hashedPassword).to.be.a('string');
        expect(hashedPassword).to.not.equal(password);
    });
});
