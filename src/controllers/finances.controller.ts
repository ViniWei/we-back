import { Request, Response } from "express";

import financesRepository from "../repository/finances.repository";
import errorHelper from "../helper/error.helper";

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
    return res.json(finance);
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
  const { group_id } = req.session.user!;

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
      return res
        .status(404)
        .json(
          errorHelper.buildStandardResponse(
            "No finances found for this group",
            "finance-not-found"
          )
        );
    }
    return res.json(finances);
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
  const { group_id } = req.session.user!;

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
    const finance = {
      ...financeData,
      group_id,
    };

    const newFinance = await financesRepository.create(finance);
    return res.status(201).json(newFinance);
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

    await financesRepository.update(Number(id), updateData);
    return res.json({ message: "Finance updated successfully." });
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
