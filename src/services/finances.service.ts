import { IFinance } from "../repositories/finances.repository";

// 🔹 Category mapping (matches `finance_type` table)
const financeTypeMap: Record<number, string> = {
  1: "Alimentação",
  2: "Transporte",
  3: "Acomodação",
  4: "Entretenimento",
  5: "Compras",
  6: "Contas",
  7: "Saúde",
  8: "Outros",
};

const financeTypeReverseMap: Record<string, number> = {
  Alimentação: 1,
  Transporte: 2,
  Acomodação: 3,
  Entretenimento: 4,
  Compras: 5,
  Contas: 6,
  Saúde: 7,
  Outros: 8,
};

// ========================================================
// 🔹 Utility functions
// ========================================================

function isValidAmount(value: any): boolean {
  if (value === null || value === undefined) return false;
  const number = parseFloat(value);
  return !isNaN(number) && number >= 0;
}

function isValidCategory(category: string): boolean {
  return !!financeTypeReverseMap[category];
}

// ========================================================
// 🔹 Validations
// ========================================================

function validateFinanceCreateRequest(finance: Partial<IFinance>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!finance.description || finance.description.trim().length === 0) {
    errors.push("Description is required");
  }

  if (finance.amount === undefined || !isValidAmount(finance.amount)) {
    errors.push("Invalid or missing amount");
  }

  if (finance.type_id && !financeTypeMap[finance.type_id]) {
    errors.push("Invalid category");
  }

  if (!finance.group_id) {
    errors.push("Group ID is required");
  }

  return { isValid: errors.length === 0, errors };
}

function validateFinanceUpdateRequest(finance: Partial<IFinance>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (
    finance.description !== undefined &&
    finance.description.trim().length === 0
  ) {
    errors.push("Description cannot be empty");
  }

  if (finance.amount !== undefined && !isValidAmount(finance.amount)) {
    errors.push("Invalid amount");
  }

  if (finance.type_id !== undefined && !financeTypeMap[finance.type_id]) {
    errors.push("Invalid category");
  }

  return { isValid: errors.length === 0, errors };
}

// ========================================================
// 🔹 Format conversions
// ========================================================

function convertToFrontend(finance: IFinance) {
  return {
    id: finance.id?.toString() || "0",
    descricao: finance.description || "",
    valor: finance.amount || 0,
    categoria: financeTypeMap[finance.type_id || 8] || "Outros",
    data: finance.created_at
      ? new Date(finance.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    groupId: (finance.group_id || 0).toString(),
    instalments: finance.instalments ?? 1,
  };
}

function convertToBackend(
  financeData: any,
  userId: number,
  groupId: number
): Partial<IFinance> {
  const typeId =
    financeTypeReverseMap[financeData.categoria] ||
    financeData.type_id ||
    8;

  return {
    group_id: groupId,
    description: financeData.descricao,
    amount: parseFloat(financeData.valor),
    type_id: typeId,
    instalments: financeData.instalments ?? 1,
    created_by: userId,
    modified_by: userId,
    created_at: new Date(),
    modified_at: new Date(),
  };
}

// ========================================================
// 🔹 Currency formatting
// ========================================================

function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}



function summarizeFinance(finances: IFinance[]) {
  const total = finances.reduce((sum, f) => sum + (f.amount || 0), 0);
  const summaryByCategory: Record<string, number> = {};

  finances.forEach((f) => {
    const category = financeTypeMap[f.type_id || 8];
    summaryByCategory[category] =
      (summaryByCategory[category] || 0) + (f.amount || 0);
  });

  return {
    total,
    totalFormatted: formatCurrency(total),
    byCategory: Object.entries(summaryByCategory).map(([cat, val]) => ({
      categoria: cat,
      total: val,
      totalFormatted: formatCurrency(val),
    })),
  };
}


export default {
  validateFinanceCreateRequest,
  validateFinanceUpdateRequest,
  convertToFrontend,
  convertToBackend,
  formatCurrency,
  summarizeFinance,
};
