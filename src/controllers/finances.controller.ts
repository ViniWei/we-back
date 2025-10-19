import { Request, Response } from "express";

import financesRepository from "../repository/finances.repository";
import errorHelper from "../helper/error.helper";
import { IFinances } from "../types/database";

const financeTypeMap: { [key: number]: string } = {
  1: "Alimentação",
  2: "Transporte",
  3: "Acomodação",
  4: "Entretenimento",
  5: "Compras",
  6: "Contas",
  7: "Saúde",
  8: "Outros",
};

const financeTypeReverseMap: { [key: string]: number } = {
  Alimentação: 1,
  Transporte: 2,
  Acomodação: 3,
  Entretenimento: 4,
  Compras: 5,
  Contas: 6,
  Saúde: 7,
  Outros: 8,
};

function convertToFrontendFinance(finance: IFinances) {
  const converted = {
    id: finance.id?.toString() || "0",
    descricao: finance.description,
    valor: finance.amount,
    categoria: financeTypeMap[finance.type_id] || "Outros",
    data: finance.created_at
      ? new Date(finance.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    groupId: finance.group_id?.toString(),
  };

  return converted;
}

export const findFinanceById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const finance = await financesRepository.getById(Number(req.params.id));
    if (!finance) {
      return res
        .status(404)
        .json(
          errorHelper.buildStandardResponse(
            "No finances found for this group",
            "finance-not-found"
          )
        );
    }
    return res.json(convertToFrontendFinance(finance));
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching finance.",
          "error-db-fetch-finance",
          error
        )
      );
  }
};

export const getFinancesByGroupId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { group_id } = (req as any).user;

  if (!group_id) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "User has no group assigned.",
          "no-group-assigned"
        )
      );
  }

  try {
    const finances = await financesRepository.getByGroupId(group_id);

    if (!finances || finances.length === 0) {
      return res.json([]);
    }

    const convertedFinances = finances.map(convertToFrontendFinance);
    return res.json(convertedFinances);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching finances.",
          "error-db-fetch-finances",
          error
        )
      );
  }
};

export const createFinance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const financeData = req.body;
  const { group_id, id: user_id } = (req as any).user;

  if (!group_id) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "Você precisa se vincular a um grupo antes de criar despesas. Vá para a tela de vínculo para gerar ou usar um código.",
          "no-group-assigned"
        )
      );
  }

  try {
    const typeId = financeTypeReverseMap[financeData.categoria] || 8;

    const finance = {
      group_id,
      description: financeData.descricao,
      amount: financeData.valor,
      type_id: typeId,
      created_by: user_id,
      created_at: new Date(),
      modified_at: new Date(),
    };

    const newFinance = await financesRepository.create(finance);

    const responseData = convertToFrontendFinance(newFinance);

    return res.status(201).json(responseData);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while creating finance.",
          "error-db-create-finance",
          error
        )
      );
  }
};

export const updateFinance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const updateData = req.body;
  const { id: user_id } = (req as any).user;

  try {
    const existingFinance = await financesRepository.getById(Number(id));
    if (!existingFinance) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Finance not found.",
            "finance-not-found"
          )
        );
    }

    // Converter dados do frontend para o formato do backend
    const financeUpdateData: Partial<IFinances> = {};

    if (updateData.descricao)
      financeUpdateData.description = updateData.descricao;
    if (updateData.valor) financeUpdateData.amount = updateData.valor;
    if (updateData.categoria)
      financeUpdateData.type_id =
        financeTypeReverseMap[updateData.categoria] || existingFinance.type_id;

    financeUpdateData.modified_by = user_id;
    financeUpdateData.modified_at = new Date();

    await financesRepository.update(Number(id), financeUpdateData);

    const updatedFinance = await financesRepository.getById(Number(id));
    return res.json(convertToFrontendFinance(updatedFinance!));
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while updating finance.",
          "error-db-update-finance",
          error
        )
      );
  }
};

export const deleteFinance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const existingFinance = await financesRepository.getById(Number(id));
    if (!existingFinance) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Finance not found.",
            "finance-not-found"
          )
        );
    }

    await financesRepository.deleteById(Number(id));
    return res.json({ message: "Finance deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while deleting finance.",
          "error-db-delete-finance",
          error
        )
      );
  }
};
