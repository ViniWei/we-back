import bcrypt from "bcryptjs";

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
        nome: req.body.nome,
        email: req.body.email,
        senha: usersService.encryptPassword(req.body.senha),
        id_casal: req.body.casalId
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

    try {
        await usersRepository.create(user);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while creating user.", "error-db-create-user", error));
    }

    res.send("New user created.");
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
        return res.send(errorHelper.buildStandardResponse("Error while removing user.", "error-db-remove-user", error)); 
    }

    res.send("User deleted.");
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

    res.send(usersService.signin(storedUser));
}
