import { GameEngine, ExportData, bot } from "./init.js";
import { genereteMenuText, generateLeaderboard, generateKeyboard } from "./utils.js";

function newRound(session) {
    const [round_duration, update_frequency, leaderboard_delay] = [
        process.env_config.session_answer_duration || 1000,
        process.env_config.session_update_frequency || 1000,
        process.env_config.session_leaderboard_delay || 1000
    ];
    const quote = ExportData.getQuote();
    session.newQuote(quote.text, quote.from);
    bot.sendMessage(session.chat, session.quote, {
        reply_markup: {
            inline_keyboard: generateKeyboard(session)
        }
    }).then(quote_msg => {
        const update_interval = setInterval(() => {
            if(!session.running) {
                clearInterval(update_interval);
                updateMenu(
                    session.chat, 
                    session.menu, 
                    generateLeaderboard(session)
                ).catch(e => e);
                bot.deleteMessage(session.chat, quote_msg.message_id).catch(e => e);
                return;
            } 
            if((Date.now() - session.updated) > round_duration) {
                clearInterval(update_interval);
                bot.editMessageText({
                    parse_mode: "Markdown",
                    chat_id: session.chat,
                    message_id: quote_msg.message_id,
                    text: generateLeaderboard(session)
                }).catch(e => e).finally(() => {
                    setTimeout(() => {
                        bot.deleteMessage(session.chat, quote_msg.message_id).catch(e => e);
                        newRound(session);
                    }, leaderboard_delay);
                })
            }
            updateMenuTimer(session).catch(error => {
                clearInterval(update_interval);
                GameEngine.stopGame(session.chat);
            });
        }, update_frequency);
        updateMenuTimer(session).catch(error => {
            clearInterval(update_interval);
            GameEngine.stopGame(session.chat);
        });
    }).catch(error => {
        GameEngine.stopGame(session.chat);
    });
}

function updateMenuTimer(session) {
    const round_duration = process.env_config.session_answer_duration || 1000;
    const seconds_left = Math.round((round_duration - (Date.now() - session.updated))*1e-3)
    return bot.editMessageText({
        parse_mode: "Markdown",
        chat_id: session.chat,
        message_id: session.menu,
        text: genereteMenuText(seconds_left)
    })
}

function updateMenu(chat_id, message_id, text) {
    return bot.editMessageText({
        parse_mode: "Markdown",
        chat_id: chat_id,
        message_id: message_id,
        text: text
    });
}

function createNewGame(chat_id) {
    const session = GameEngine.newGame(
        chat_id,
        ExportData.senders,
        process.env_config.session_answer_duration || 1000
    );
    if(session) {
        bot.sendMessage(chat_id, "🚀 *Launching game session...*", {
            parse_mode: "Markdown",
        }).then((sent_msg) => {
            session.menu = sent_msg.message_id;
            return bot.pinChatMessage(chat_id, sent_msg.message_id).finally(() => newRound(session))
        }).catch((e) => {
            GameEngine.stopGame(chat_id);
        });
    } else {
        bot.sendMessage(chat_id, "🔍 *Seems like there is another game session running in this chat*", { parse_mode: "Markdown" }).catch(e => e);
    }
}

function stopGame(chat_id) {
    const deleted = GameEngine.stopGame(chat_id);
    if(deleted) {
        bot.sendMessage(chat_id, "⛔️ *Stopping game...*", { 
            allow_sending_without_reply: true,
            reply_to_message_id: deleted.menu,
            parse_mode: "Markdown" 
        }).then(sent_msg => {
            setTimeout(() => {
                bot.deleteMessage(chat_id, sent_msg.message_id).catch(e => e);
            }, process.env_config.session_update_frequency || 1000);
        }).catch(e => e);
    } else {
        bot.sendMessage(chat_id, "🔍 *Seems like there is no any game session running in this chat*", { parse_mode: "Markdown" }).catch(e => e);
    }
}

function processMessageRequest(msg, bot_username) {
    switch(msg.text) {
        case "/start@"+bot_username:
        case "/start":
            createNewGame(msg.chat.id);
        break;
        case "/stop@"+bot_username:
        case "/stop":
            stopGame(msg.chat.id);
        break;
    }
}

export default msg => {
    const { chat_whitelist } = process.env_config;
    if(chat_whitelist && !chat_whitelist.includes(msg.chat.id)) return;
    bot.getMe().then(me => {
        if(msg.pinned_message && msg.from.id === me.id) {
            bot.deleteMessage(msg.chat.id, msg.message_id).catch(e => e);
        } else {
            processMessageRequest(msg, me.username);
        }
    });
}