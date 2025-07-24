import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function verifyEmailFormat(email) {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
}

function encryptPassword(password) {
    const rounds = 10;
    const salt = bcrypt.genSaltSync(rounds);

    return bcrypt.hashSync(password, salt);
}

function signin(usuario) {
    const payload = {
        email: usuario.email,
        id_casal: usuario.id_casal
    };

    return jwt.sign(payload, process.env.SECRET_KEY);
}

export default {
    verifyEmailFormat,
    encryptPassword,
    signin
};
