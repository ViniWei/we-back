import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

function verificarEmail(email) {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
}

function criptografarSenha(senha) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(senha, salt);
}

function logar(usuario) {
    const payload = {
        email: usuario.email,
        id_casal: usuario.id_casal
    }

    return jwt.sign(payload, process.env.SECRET_KEY)
}

export default {
    verificarEmail,
    criptografarSenha,
    logar
};
