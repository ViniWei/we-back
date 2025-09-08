import expensesRepository from "../repository/expenses.repository.js";
import errorHelper from "../helper/error.helper.js";

export async function findExpenseById(req, res) {
    let expense;
    try {
        expense = await expensesRepository.getById(req.params.id);
    } catch (error) {
        res.status(500).send(errorHelper.buildStandardResponse("Error while fetching expense.", "error-db-fetch-expense", error));
    }

    if (!expense) {
        return res.status(404).json(errorHelper.buildStandardResponse("No expenses found for this couple", "expense-not-found"));
    }

    res.json(expense);
};

export async function getExpensesByCoupleId(req, res) {
    const { couple_id } = req.session.user;

    try {
        const expenses = await expensesRepository.getAllByCouple(couple_id);
        if (!expenses || expenses.length === 0) {
            return res.status(404).json({ message: "No expenses found for this couple" });
        }
        res.json(expenses);
    } catch (error) {
        res.status(500).send(errorHelper.buildStandardResponse("Error while fetching expenses.", "error-db-fetch-expenses", error));
    }
};

export async function createExpense(req, res) {
    const { description, amount, type, created_by } = req.body;
    const { couple_id } = req.session.user;

    if (!couple_id || !description || !amount || !type || !created_by) {
        return res.status(400).json({ message: "Missing required fields: couple_id, description, amount, type and created_by" });
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
        const newExpense = await expensesRepository.create(payload);
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).send(errorHelper.buildStandardResponse("Error while creating expense.", "error-db-create-expense", error));
    }
};

export async function updateExpense(req, res) {
    try {
        await expensesRepository.update(req.params.id, req.body);
        res.json({ message: "Expense updated successfully" });
    } catch (error) {
        res.status(500).send(errorHelper.buildStandardResponse("Error while updating expense.", "error-db-update-expense", error));
    }
};

export async function deleteExpense(req, res) {
    try {
        await expensesRepository.remove(req.params.id);
        
        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).send(errorHelper.buildStandardResponse("Error while removing expense from list.", "error-db-remove-expense-from-list", error));
    }
};
