import {
  ITrip,
  ITripWithPhotos,
  ITripCreateRequest,
  ITripUpdateRequest,
} from "../types/database";

function validateEstimatedBudget(estimated?: string): boolean {
  if (!estimated) return true;

  const cleanBudget = estimated.replace(/[R$\s.,]/g, "");
  const budget = parseFloat(cleanBudget);

  return !isNaN(budget) && budget >= 0;
}

function validateTripDates(
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return start <= end;
}

function validateTripStatus(status: string): boolean {
  const validStatuses = ["pending", "canceled", "done"];
  return validStatuses.includes(status);
}

function validateBudget(estimated?: string): boolean {
  if (!estimated) return true; // Budget is optional

  // Remove currency symbols and check if it's a valid number
  const cleanBudget = estimated.replace(/[R$\s.,]/g, "");
  const budget = parseFloat(cleanBudget);

  return !isNaN(budget) && budget >= 0;
}

function validateTripCreateRequest(request: ITripCreateRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.city || request.city.trim().length === 0) {
    errors.push("City is required and cannot be empty");
  }

  if (!request.startDate) {
    errors.push("Start date is required");
  }

  if (!request.endDate) {
    errors.push("End date is required");
  }

  if (!request.status) {
    errors.push("Status is required");
  }

  if (
    request.startDate &&
    request.endDate &&
    !validateTripDates(request.startDate, request.endDate)
  ) {
    errors.push("Start date must be before or equal to end date");
  }

  if (request.status && !validateTripStatus(request.status)) {
    errors.push("Invalid status. Must be one of: pending, canceled, done");
  }

  if (request.estimated && !validateBudget(request.estimated)) {
    errors.push("Invalid budget format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateTripUpdateRequest(request: ITripUpdateRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (
    request.city !== undefined &&
    (!request.city || request.city.trim().length === 0)
  ) {
    errors.push("City cannot be empty");
  }

  if (
    request.startDate &&
    request.endDate &&
    !validateTripDates(request.startDate, request.endDate)
  ) {
    errors.push("Start date must be before or equal to end date");
  }

  if (request.status && !validateTripStatus(request.status)) {
    errors.push("Invalid status. Must be one of: pending, canceled, done");
  }

  if (request.estimated && !validateBudget(request.estimated)) {
    errors.push("Invalid budget format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function formatTripResponse(trip: ITripWithPhotos): ITripWithPhotos {
  return {
    ...trip,
    // Ensure dates are properly formatted
    start_date: new Date(trip.start_date),
    end_date: new Date(trip.end_date),
    // Ensure photos array is always present
    photos: trip.photos || [],
  };
}

function calculateTripDuration(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

function formatBudgetDisplay(budget?: number): string {
  if (!budget) return "N/A";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(budget);
}

function getTripStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: "#f1c40f", // yellow
    canceled: "#e74c3c", // red
    done: "#2ecc71", // green
  };

  return statusColors[status] || "#6b7280"; // gray as default
}

export default {
  validateTripCreateRequest,
  validateTripUpdateRequest,
  validateTripDates,
  validateTripStatus,
  validateBudget,
  formatTripResponse,
  calculateTripDuration,
  formatBudgetDisplay,
  getTripStatusColor,
};
