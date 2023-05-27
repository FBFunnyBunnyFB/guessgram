import bot from "./lib/init.js";
import message_listener from "./lib/listener.js";
import callback_query_listener from "./lib/callback_query.js";

bot.on("message", message_listener);
bot.on("callback_query", callback_query_listener);