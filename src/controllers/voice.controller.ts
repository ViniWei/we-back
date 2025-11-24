import { Request, Response } from "express";
import { handleVoiceCommand } from "../services/voice.service";
import errorHelper from "../helper/error.helper";

export const processVoiceCommand = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { text, user_id, group_id } = req.body;

    if (!text || text.trim() === "") {
      return res
        .status(400)
        .json(
          errorHelper.buildStandardResponse(
            "Text is required.",
            "missing-required-text"
          )
        );
    }

    if (!user_id || !group_id) {
      return res
        .status(400)
        .json(
          errorHelper.buildStandardResponse(
            "User ID and Group ID are required.",
            "missing-required-ids"
          )
        );
    }

    const result = await handleVoiceCommand(text, user_id, group_id);

    if (result.intentNotRecognized) {
      return res.status(404).json({
        success: false,
        intentNotRecognized: true,
        message:
          result.message || "Não foi possível identificar a solicitação.",
      });
    }

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error processing voice command:", error.message || error);
    return res
      .status(500)
      .json(
        errorHelper.buildStandardResponse(
          "Error processing voice command.",
          "error-voice-processing",
          error
        )
      );
  }
};
