import errorHelper from "../helper/error.helper.js";

function verifySession(req, res, next) {
    if (!req.session.user) {
        return res.status(400).send(errorHelper.buildStandardResponse("Invalid session.", "invalid-session"));
    }

    next();
}

export default {
    verifySession
};
