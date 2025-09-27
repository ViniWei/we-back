import financesRepository from "../repository/finances.repository.js";
import errorHelper from "../helper/error.helper.js";

export async function findFinanceById(req, res) {
  let finance;
  try {
    finance = await financesRepository.getById(req.params.id);
  } catch (error) {
    res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching finance.",
          "error-db-fetch-finance",
          error
        )
      );
  }

  if (!finance) {
    return res
      .status(404)
      .json(
        errorHelper.buildStandardResponse(
          "No finances found for this couple",
          "finance-not-found"
        )
      );
  }

  res.json(finance);
}

export async function getFinancesByCoupleId(req, res) {
  const { couple_id } = req.session.user;

  try {
    const finances = await financesRepository.getAllByCouple(couple_id);
    if (!finances || finances.length === 0) {
      return res
        .status(404)
        .json({ message: "No finances found for this couple" });
    }
    res.json(finances);
  } catch (error) {
    res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching finances.",
          "error-db-fetch-finances",
          error
        )
      );
  }
}

export async function createFinance(req, res) {
  const { description, amount, type, created_by } = req.body;
  const { couple_id } = req.session.user;

  if (!couple_id || !description || !amount || !type || !created_by) {
    return res
      .status(400)
      .json({
        message:
          "Missing required fields: couple_id, description, amount, type and created_by",
      });
  }

  const payload = {
    couple_id,
    description,
    amount,
    type,
    created_by,
    created_at: new Date(),
    updated_by: created_by,
    updated_at: new Date(),
  };

  try {
    const newFinance = await financesRepository.create(payload);
    res.status(201).json(newFinance);
  } catch (error) {
    res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while creating finance.",
          "error-db-create-finance",
          error
        )
      );
  }
}

export async function updateFinance(req, res) {
  try {
    await financesRepository.update(req.params.id, req.body);
    res.json({ message: "Finance updated successfully" });
  } catch (error) {
    res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while updating finance.",
          "error-db-update-finance",
          error
        )
      );
  }
}

export async function deleteFinance(req, res) {
  try {
    await financesRepository.remove(req.params.id);

    res.json({ message: "Finance deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while removing finance from list.",
          "error-db-remove-finance-from-list",
          error
        )
      );
  }
}
