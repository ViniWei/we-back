import { IStandardResponse } from "../types/database";

function buildStandardResponse(
  message: string,
  code?: string,
  error?: any
): IStandardResponse {
  return {
    message,
    code,
    error,
  };
}

export default {
  buildStandardResponse,
};
