import intent from "../modules/voice/intent";
import financesModule from "../modules/voice/finances.module";
import tripsModule from "../modules/voice/trips.module";
import activitiesModule from "../modules/voice/activities.module";
import placesModule from "../modules/voice/places.module";

async function handleVoiceCommand(
  text: string,
  user_id: number,
  group_id: number
) {
  try {
    if (!text || text.trim() === "") {
      return { error: "Comando de texto vazio." };
    }

    const { module, action } = intent.detect(text);

    if (!module) {
      return {
        intentNotRecognized: true,
        message: "Não foi possível identificar a solicitação.",
      };
    }

    switch (module) {
      case "finances":
        return await financesModule.execute(text, user_id, group_id);

      case "trips":
        return await tripsModule.execute(text, user_id, group_id);
      case "activities":
        return await activitiesModule.execute(text, user_id, group_id);

      case "places":
        return await placesModule.execute(text, user_id, group_id);

      default:
        return { message: "Módulo não reconhecido." };
    }
  } catch (error: any) {
    return { error: "Erro interno ao processar comando de voz." };
  }
}

export { handleVoiceCommand };
