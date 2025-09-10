import bcrypt from "bcryptjs";

function verifyEmailFormat(email) {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
}

function encryptPassword(password) {
    const rounds = 10;
    const salt = bcrypt.genSaltSync(rounds);

    return bcrypt.hashSync(password, salt);
}

export default {
    verifyEmailFormat,
    encryptPassword
};
