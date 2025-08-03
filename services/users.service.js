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

function signin(user) {
    const payload = {
        id: user.id,
        email: user.email,
        couple_id: user.couple_id
    };

    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: "15d" });

    return {
        payload,
        accessToken,
        refreshToken
    };
}

export default {
    verifyEmailFormat,
    encryptPassword,
    signin
};
