import bcrypt from "bcryptjs";

import usuarioRepository from "../repository/usuario.repository.js";
import usuarioService from "../services/usuario.service.js";
import errorHelper from "../helper/error.helper.js";

export async function listar(_req, res) {
    try {
        const users = await usuarioRepository.listarTodos();
        res.json(users);
    } catch (error) {
        return res.status(500).send(errorHelper.gerarRetorno("Erro ao buscar usuário.", "erro-obter-usuario", error));
    }
}

export async function obterPorId(req, res) {
    const { id } = req.params;

    let usuario;
    try {
        usuario = await usuarioRepository.obterPorId(id);
    } catch (error) {
        return res.status(500).send(errorHelper.gerarRetorno("Falha ao buscar usuário.", "erro-obter-usuario", error));
    }

    if (!usuario) {
        return res.status(404).send(errorHelper.gerarRetorno("Usuário não encontrado.", "usuario-nao-encontrado"));
    }

    res.json(usuario);
}

export async function criar(req, res) {
    const usuario = {
        nome: req.body.nome,
        email: req.body.email,
        senha: usuarioService.criptografarSenha(req.body.senha),
        id_casal: req.body.casalId
    };

    if (!usuarioService.verificarEmail(usuario.email)) {
        return res.status(400).send(errorHelper.gerarRetorno("Email inválido.", "email-invalido"));
    }

    let usuarioExiste;
    try {
        usuarioExiste = await usuarioRepository.obterPorEmail(usuario.email);
    } catch (error) {
        return res.status(500).send(errorHelper.gerarRetorno("Erro ao buscar usuário.", "erro-obter-usuario", error));
    }

    if (usuarioExiste) {
        return res.status(409).send(errorHelper.gerarRetorno("Usuário já existe.", "usuario-ja-existe"));
    }

    try {
        await usuarioRepository.criar(usuario);
    } catch (e) {
        return res.status(500).send(errorHelper.gerarRetorno("Erro ao criar usuário.", "erro-criar-usuario", e));
    }

    res.send("Usuário criado com sucesso");
}

export async function deletar(req, res) {
    const { id } = req.params;

    let usuarioExiste;
    try {
        usuarioExiste = await usuarioRepository.obterPorId(id);
    } catch (error) {
        return res.status(500).send(errorHelper.gerarRetorno("Erro ao buscar usuário.", "erro-obter-usuario", error));
    }

    if (!usuarioExiste) {
        return res.status(409).send(errorHelper.gerarRetorno("Usuário não encontrado.", "usuario-nao-encontrado"));
    }

    try {
        await usuarioRepository.deletarPorId(id);
    } catch (error) {
        return res.send(errorHelper.gerarRetorno("Erro ao obter usuário.", "erro-obter-usuario", error)); 
    }

    res.send("Usuário deletado com sucesso.");
}

export async function login(req, res) {
    const { email, senha } = req.body;

    let usuario;
    try {
        usuario = await usuarioRepository.obterPorEmail(email);
    } catch (error) {
        return res.status(500).send(errorHelper.gerarRetorno("Erro ao buscar usuário.", "erro-obter-usuario", error));
    }

    if (!usuario) {
        return res.status(409).send(errorHelper.gerarRetorno("Usuário não encontrado.", "usuario-nao-encontrado"));
    }

    const mesmaSenha = await bcrypt.compare(senha, usuario.senha);
    if (!mesmaSenha) {
        return res.status(409).send(errorHelper.gerarRetorno("Senha inválida.", "senha-invalida"));
    }

    res.send(usuarioService.logar(usuario))
}
