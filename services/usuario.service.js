import bcrypt from "bcryptjs";

function verificarEmail(email) {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
}

function criptografarSenha(senha) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(senha, salt);
}

async function compararSenha(senha, hashArmazenado) {
    return await bcrypt.compare(senha, hashArmazenado)
}

export default {
    verificarEmail,
    criptografarSenha,
    compararSenha
};
