import { GameEngine, bot } from "./init.js";
import { generateKeyboard } from "./utils.js";

export default (data) => {
    const [action, session_id, option] = data.data.split(":");
    if(action === "vote") {
        const session = GameEngine.findGameById(parseInt(session_id));
        if(session) {
            const voted = session.addVote(data.from.id, data.from.first_name, option);
            if(!voted) return bot.answerCallbackQuery(data.id, { text: "✋ You're already voted!", show_alert: false });
            bot.editMessageReplyMarkup({
                chat_id: session.chat,
                message_id: data.message.message_id,
                reply_markup: {
                    inline_keyboard: generateKeyboard(session)
                }
            });
        } else {
            return bot.answerCallbackQuery(data.id, { text: "⌛️ Seems like this game session is expired", show_alert: true });
        }
    }
    bot.answerCallbackQuery(data.id);
}