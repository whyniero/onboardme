import bcrypt from "bcrypt";
const SALT_ROUNDS = 10;
export async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}
export async function comparePasswords(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}
