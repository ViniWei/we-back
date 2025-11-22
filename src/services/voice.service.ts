import intent from "../voice_client/intent";
import financesModule from "../voice_client/modules/finances.module";
import tripsModule from "../voice_client/modules/trips.module";
import activitiesModule from "../voice_client/modules/activities.module";
import placesModule from "../voice_client/modules/places.module";
import datesModule from "../voice_client/modules/dates.module";

class VoiceService {
  async handleVoiceCommand(
    text: string,
    userId: number,
    groupId: number,
    token?: string
  ) {
    try {
      if (!text || text.trim() === "") {
        return { error: "Comando de texto vazio." };
      }

      const { module, action } = intent.detect(text);
      console.log("Intent detectado →", { module, action });

      if (!module) {
        return {
          message: "Nenhuma intenção reconhecida a partir do comando de voz.",
        };
      }

      const params = { userId, groupId, token };

      switch (module) {
        case "finances":
          return await financesModule.execute(text, params);

        case "trips":
          return await tripsModule.execute(text, params);

        case "activities":
          return await activitiesModule.execute(text, params);

        case "places":
          return await placesModule.execute(text, params);

        case "dates":
          return await datesModule.execute(text, params);

        default:
          return { message: "Módulo não reconhecido." };
      }
    } catch (error: any) {
      console.error("Erro em VoiceService.handleVoiceCommand:", error);
      return { error: "Erro interno ao processar comando de voz." };
    }
  }
}

export default new VoiceService();
