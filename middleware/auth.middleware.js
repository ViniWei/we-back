import jwt from "jsonwebtoken";
import errorHelper from "../helper/error.helper.js";

function verificarToken(req, res, next) {
    const auth = req.headers.authorization;
    const token = auth?.split(" ")[1];

    try {
        jwt.verify(token, process.env.SECRET_KEY);
    } catch {
        return res.status(400).send(errorHelper.gerarRetorno("Token invalido.", "token-invalido"));
    }

    next();
}

export default {
    verificarToken
};
