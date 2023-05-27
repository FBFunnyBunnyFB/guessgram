import { GuessSenderGameEngine } from "./game.js";
import { DataParser } from "./parser.js";
import { TeleBunny } from "telebunny";
import { readFileSync } from "fs";
import { join as fspath } from "path";

function validateConfigData(process_config) {
    if(typeof process_config.bot_token !== "string") 
        throw TypeError(`Config: bot_token should be string type! Got ${typeof process_config.bot_token}`);
    if(process_config.bot_token.length < 36) 
        throw RangeError(`Config: bot_token is too short!`);
    
    if(process_config.chat_whitelist) {
        if(!Array.isArray(process_config.chat_whitelist))
            throw TypeError(`Config: chat_whitelist should be Array type! Got ${typeof process_config.chat_whitelist}`);
        process_config.chat_whitelist.forEach(id => {
            if(typeof id !== "number")
                throw TypeError(`Config: chat_whitelist element should be number type! Got ${typeof id}`);
        });
    }

    if(process_config.data_sender_whitelist) {
        if(!Array.isArray(process_config.data_sender_whitelist))
            throw TypeError(`Config: data_sender_whitelist should be Array type! Got ${typeof process_config.data_sender_whitelist}`);
        process_config.data_sender_whitelist.forEach(username => {
            if(typeof username !== "string")
                throw TypeError(`Config: data_sender_whitelist element should be string type! Got ${typeof id}`);
        });
    }

    if(typeof process_config.button_row_length !== "number") 
        throw TypeError(`Config: button_row_length should be number type! Got ${typeof process_config.button_row_length}`);
    if(process_config.button_row_length < 1 || process_config.button_row_length > 8)
        throw RangeError(`Config: button_row_length value should be in range from 1 to 8! Got ${process_config.button_row_length}`);
    
    if(typeof process_config.session_update_frequency !== "number") 
        throw TypeError(`Config: session_update_frequency should be number type! Got ${typeof process_config.session_update_frequency}`);
    if(process_config.session_update_frequency < 1000)
        throw RangeError(`Config: session_update_frequency value should be greater than 1000! Got ${process_config.session_update_frequency}`);

    if(typeof process_config.session_answer_duration !== "number") 
        throw TypeError(`Config: session_answer_duration should be number type! Got ${typeof process_config.session_answer_duration}`);
    if(process_config.session_answer_duration < 3000)
        throw RangeError(`Config: session_answer_duration value should be greater than 3000! Got ${process_config.session_answer_duration}`);

    if(typeof process_config.session_leaderboard_delay !== "number") 
        throw TypeError(`Config: session_leaderboard_delay should be number type! Got ${typeof process_config.session_leaderboard_delay}`);
    if(process_config.session_leaderboard_delay < 3000)
        throw RangeError(`Config: session_leaderboard_delay value should be greater than 3000! Got ${process_config.session_leaderboard_delay}`);
    
    if(typeof process_config.data_file_path !== "string") 
        throw TypeError(`Config: data_file_path should be string type! Got ${typeof process_config.data_file_path}`);

    if(process_config.data_sender_override) {
        if(
            typeof process_config.data_sender_override !== 'object' ||
            Array.isArray(process_config.data_sender_override) ||
            process_config.data_sender_override === null
        ) throw TypeError(`Config: data_sender_override should be object type! Got ${typeof process_config.data_sender_override}`);
    }
    return process_config;
}

try {
    const data = readFileSync(fspath("configs", "config.json"));
    process.env_config = validateConfigData(
        Object.assign({}, JSON.parse(data))
    );
} catch (error) {
    throw error;
}

const GameEngine = new GuessSenderGameEngine();
const ExportData = new DataParser();
const bot = new TeleBunny(process.env_config.bot_token, { 
    polling: true,
    interval: 2000,
    timeout: 3000,
    allowed_updates: ["message", "callback_query"]
});

export { GameEngine, ExportData, bot };
export default bot;