import bcrypt from "bcryptjs";
import crypto from "crypto";

import usersRepository from "../repository/users.repository.js";
import usersService from "../services/users.service.js";
import errorHelper from "../helper/error.helper.js";

export async function getAll(_req, res) {
    try {
        const users = await usersRepository.getAll();
        res.json(users);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching user.", "error-db-get-user", error));
    }
}

export async function get(req, res) {
    const { id } = req.params;

    let user;
    try {
        user = await usersRepository.getById(id);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching user.", "error-db-get-user", error));
    }

    if (!user) {
        return res.status(404).send(errorHelper.buildStandardResponse("User not found.", "user-not-found"));
    }

    res.json(user);
}

export async function create(req, res) {
    const user = {
        name: req.body.name,
        email: req.body.email,
        password: usersService.encryptPassword(req.body.password),
        couple_id: 1
    };

    if (!usersService.verifyEmailFormat(user.email)) {
        return res.status(400).send(errorHelper.buildStandardResponse("Invalid email format.", "email-invalid-format"));
    }

    let isUserStored;
    try {
        isUserStored = await usersRepository.getByEmail(user.email);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching user.", "error-db-get-user", error));
    }

    if (isUserStored) {
        return res.status(409).send(errorHelper.buildStandardResponse("User already exists.", "user-already-exists"));
    }

    const { verificationCode, expiresAt } = generateVerificationCode();

    user.verification_code = verificationCode;
    user.verification_expires = expiresAt;

    try {
        await usersRepository.create(user);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while creating user.", "error-db-create-user", error));
    }

    res.json("New user created.");
}

export async function remove(req, res) {
    const { id } = req.params;

    let isUserStored;
    try {
        isUserStored = await usersRepository.getById(id);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching user.", "error-db-get-user", error));
    }

    if (!isUserStored) {
        return res.status(409).send(errorHelper.buildStandardResponse("User not found.", "user-not-found"));
    }

    try {
        await usersRepository.deleteAllById(id);
    } catch (error) {
        return res.json(errorHelper.buildStandardResponse("Error while removing user.", "error-db-remove-user", error)); 
    }

    res.json("User deleted.");
}

export async function update(req, res) {
    const payload = req.body;
    const id = req.params.id;

    let isUserStored;
    try {
        isUserStored = await usersRepository.getById(id);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching user.", "error-db-get-user", error));
    }

    if (!isUserStored) {
        return res.status(409).send(errorHelper.buildStandardResponse("User not found.", "user-not-found"));
    }

    try {
        await usersRepository.update("id", id, payload);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while updating user.", "error-db-user", error)); 
    }

    res.json("User updated.");
}

export async function changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    const id = req.params.id;

    let user;
    try {
        user = await usersRepository.getById(id);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching user.", "error-db-get-user", error));
    }
    if (!user) {
        return res.status(409).send(errorHelper.buildStandardResponse("User not found.", "user-not-found"));
    }
    
    const isSamePassword = await bcrypt.compare(oldPassword, user.senha);
    if (!isSamePassword) {
        return res.status(403).send(errorHelper.buildStandardResponse("Invalid password.", "invalid-password"));
    }

    const fieldsToUpdate = {
        senha: usersService.encryptPassword(newPassword)
    };
    try {
        await usersRepository.update("id", id, fieldsToUpdate);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while updating user.", "error-db-user", error)); 
    }

    res.json("Changed password.");
}

export async function login(req, res) {
    const { email, password } = req.body;

    let storedUser;
    try {
        storedUser = await usersRepository.getByEmail(email);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching user.", "error-db-get-user", error));
    }

    if (!storedUser) {
        return res.status(404).send(errorHelper.buildStandardResponse("User not found.", "user-not-found"));
    }

    const isTheSamePassword = await bcrypt.compare(password, storedUser.senha);
    if (!isTheSamePassword) {
        return res.status(409).send(errorHelper.buildStandardResponse("Invalid password.", "invalid-password"));
    }

    res.json(usersService.signin(storedUser));
}

function generateVerificationCode() {
    const verificationCode = crypto.randomInt(0, 100000).toString().padStart(5, "0");
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    const data = {
        verificationCode,
        expiresAt
    };

    return data;
}

export async function sendVerificationCode(req, res) {
    const { email } = req.body;

    let storedUser;
    try {
        storedUser = await usersRepository.getByEmail(email);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching user.", "error-db-get-user", error));
    }

    if (!storedUser) {
        return res.status(404).send(errorHelper.buildStandardResponse("User not found.", "user-not-found"));
    }

    const { verificationCode, expiresAt } = generateVerificationCode();

    try {
        
        const fieldsToUpdate = {
            verification_code: verificationCode,
            verification_expires: expiresAt
        }

        await usersRepository.update("id", storedUser.id, fieldsToUpdate);
        await usersService.sendVerificationEmail(email, verificationCode);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while sending verification code.", "error-send-verification-code", error));
    }

    res.json("Verification code sent.");
}

export async function verifyEmailCode(req, res) {
    const { email, verification_code } = req.body;

    let storedUser;
    try {
        storedUser = await usersRepository.getByEmail(email);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching user.", "error-db-get-user", error));
    }

    if (!storedUser) {
        return res.status(404).send(errorHelper.buildStandardResponse("User not found.", "user-not-found"));
    }

    if (storedUser.verification_code !== verification_code) {
        return res.status(403).send(errorHelper.buildStandardResponse("Invalid verification code.", "invalid-verification-code"));
    }

    res.json("Email verified successfully.");
}
