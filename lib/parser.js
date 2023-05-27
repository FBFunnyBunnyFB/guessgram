import { readFileSync } from "fs";

class Quote {
    _from;
    _text;
    constructor(from, text) {
        if(typeof from !== "string") throw TypeError(`Input value should be string type! Got ${typeof from}`);
        if(typeof text !== "string") throw TypeError(`Input value should be string type! Got ${typeof text}`);
        this._from = from;
        this._text = text;
    }
    get from() { return this._from; }
    get text() { return this._text; }
}

class DataParser {
    _senders = [];
    _quotes = [];
    constructor() {
        let [senders, quotes] = [[], []];
        const [path, whitelist, override] = [
            process.env_config.data_file_path || "",
            process.env_config.data_sender_whitelist || false,
            process.env_config.data_sender_override || {}
        ];
        try {
            const { messages: file_data } = JSON.parse(readFileSync(path));
            file_data?.forEach(msg => {
                if(
                    typeof msg.from === "string" && 
                    typeof msg.text === "string" && msg.text
                ) {    
                    if(whitelist && !whitelist.includes(msg.from)) return; 
                    const sender_label = override.hasOwnProperty(msg.from) ? override[msg.from] : msg.from;
                    if(!senders.includes(sender_label)) senders.push(sender_label);
                    quotes.push(new Quote(sender_label, msg.text.replace(/\*|\_|\[|\`/g, (match) => `\\${match}`)));
                }
            });
            if(senders.length <= 0 || quotes.length <= 0) {
                throw Error("Output data length cannot be zero!");
            }
            this._senders = senders;
            this._quotes = quotes;
            console.info(`\x1b[36m✔️ Data file successfully parsed\x1b[0m\n\x1b[30m Senders (${this._senders.length}): ${this._senders.join(', ')}\n Messages (${this._quotes.length}): ${this._quotes.map(q => q.text).slice(0, 10).join(', ')}${this._quotes.length > 10 ? "..." : ""}\x1b[0m\n`);
        } catch (error) {
            throw Error(`Cannot parse input file (${path}):\n${error}`)
        }
    }
    _chooseFrom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    getQuote() {
        return this._chooseFrom(this._quotes);
    }
    get senders() { return this._senders; }
    get quotes() { return this._quotes; }
}

export default DataParser;
export { DataParser };