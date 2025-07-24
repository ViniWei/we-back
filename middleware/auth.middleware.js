import jwt from "jsonwebtoken";
import errorHelper from "../helper/error.helper.js";

function verifyToken(req, res, next) {
    const auth = req.headers.authorization;
    const token = auth?.split(" ")[1];

    try {
        jwt.verify(token, process.env.SECRET_KEY);
    } catch {
        return res.status(400).send(errorHelper.buildStandardResponse("Invalid token.", "invalid-token"));
    }

    next();
}

export default {
    verifyToken
};
