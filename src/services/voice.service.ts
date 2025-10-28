import intent from "../voice_client/intent";
import financesModule from "../voice_client/modules/finances.module";
import tripsModule from "../voice_client/modules/trips.module";
import activitiesModule from "../voice_client/modules/activities.module";
import placesModule from "../voice_client/modules/places.module";

class VoiceService {
  async handleVoiceCommand(text: string, token: string) {
    try {
      if (!text || text.trim() === "") {
        return { error: "Comando de texto vazio." };
      }

      const { module, action } = intent.detect(text);

      if (!module) {
        return { message: "Nenhuma intenção reconhecida a partir do comando de voz." };
      }

      switch (module) {
        case "finances":
          return await financesModule.execute(text, token);

        case "trips":
          return await tripsModule.execute(text, token);

        case "activities":
          return await activitiesModule.execute(text, token);

        case "places":
          return await placesModule.execute(text, token);

        default:
          return { message: "Módulo não reconhecido." };
      }
    } catch (error: any) {
      return { error: "Erro interno ao processar comando de voz." };
    }
  }
}

export default new VoiceService();
