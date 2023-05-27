class Player {
    _id = 0;
    _name = 0;
    _score = 0;
    _voted = false;
    _scored = 0;
    _joined = Math.round(Date.now() * 0.001);
    constructor(player_id, player_name) {
        if(typeof player_id !== "number") throw TypeError(`Input value should be number type! Got ${typeof player_id}`);
        if(typeof player_name !== "string") throw TypeError(`Input value should be string type! Got ${typeof player_name}`);
        this._id = player_id;
        this._name = player_name;
    }
    set score(value) {
        if(typeof value !== "number") throw TypeError(`Input value should be number type! Got ${typeof value}`);
        this._score = value;
    }
    set scored(value) {
        if(typeof value !== "number") throw TypeError(`Input value should be number type! Got ${typeof value}`);
        this._scored = value;
    }
    set voted(value) {
        if(typeof value !== "boolean") throw TypeError(`Input value should be boolean type! Got ${typeof value}`);
        this._voted = value;
    }
    get joined() { return this._joined; }
    get scored() { return this._scored; }
    get voted() { return this._voted; }
    get score() { return this._score; }
    get name() { return this._name; }
    get id() { return this._id; }
}

class GameSession {
    _id = 0;
    _chat = 0;
    _menu_id = 0;
    _players = [];
    _options = {};
    _running = true;
    _quote = "~<Quote>~";
    _created = Date.now();
    _round_duration = 0;
    _round_updated = Date.now();
    constructor(chat_id, answers, round_duration = 1e4) {
        if(typeof chat_id !== "number") throw TypeError(`Input value should be number type! Got ${typeof chat_id}`);
        if(typeof round_duration !== "number") throw TypeError(`Input value should be number type! Got ${typeof round_duration}`);
        if(!Array.isArray(answers)) throw TypeError(`Input value should be Array type! Got ${typeof answers}`);
        if(answers.length > 8) throw RangeError(`Too many answer options! ${answers.length} out of 8`);
        this._id = this._genereteID();
        this._chat = chat_id;
        this._round_duration = round_duration;
        answers.forEach(entry => {
            if(typeof entry !== "string") throw TypeError(`Array must contain string type only! Got ${typeof entry}`);
            if(Buffer.from(entry).byteLength > 32) throw RangeError(`Array element is too long! ${entry.length} characters out of 32`);
            this._options[entry] = { votes: 0, is_answer: false }
        });
    }
    _genereteID() {
        return Date.now() * (Math.floor(Math.random() * 10) + 1)
    }
    _calcScore() {
        const score = Math.ceil(((Date.now() - this._round_updated) * 0.001) * (100/(this._round_duration * -1e-3))) + 100;
        return Math.min(Math.max(score, -15), 100);
    }
    addPlayer(player) {
        if(!(player instanceof Player)) throw TypeError(`Player value should be instance of Player! Got ${player}`);
        if(this.getPlayer(player.id)) throw Error(`Each player id must be unique!`);
        this._players.push(player);
        return player;
    }
    addVote(player_id, player_name, label) {
        const player = this.getPlayer(player_id) || this.addPlayer( new Player(player_id, player_name) );
        if(!this._options.hasOwnProperty(label) || player.voted) return false;
        this._options[label].votes++;
        player.voted = true;
        if(this._options[label].is_answer) {
            player.scored = this._calcScore();
        } else {
            player.scored = -15;
        }
        player.score += player.scored;
        player.score = Math.max(player.score, 0);
        return true;
    }
    newQuote(quote, answer) {
        if(typeof quote !== "string") throw TypeError(`Input value should be string type! Got ${typeof quote}`);
        if(typeof answer !== "string") throw TypeError(`Input value should be string type! Got ${typeof answer}`);
        if(!this._options.hasOwnProperty(answer)) throw TypeError(`Input value is not one of the answer options! Possible values: ${Object.keys(this._options).join(" | ")}`);
        Object.keys(this._options).forEach(key => {
            this._options[key].votes = 0; 
            this._options[key].is_answer = key === answer;
        });
        this._players.forEach(player => {
            player.voted = false;
            player.scored = 0;
        });
        this._round_updated = Date.now();
        this._quote = quote;
    }
    getPlayer(player_id) {
        if(typeof player_id !== "number") throw TypeError(`Input value should be number type! Got ${typeof player_id}`);
        return this._players.find(player => player.id === player_id);
    }
    getPlayers() {
        return this._players;
    }
    getVoteOptions() {
        return Object.keys(this._options);
    }
    getVotesCount(option) {
        if(typeof option !== "string") throw TypeError(`Input value should be string type! Got ${typeof option}`);
        return this._options[option].votes;
    }
    getAnswer() {
        return Object.keys(this._options).find(key => this._options[key].is_answer);
    }
    stop() { this._running = false; }
    resume() { this._running = true; }
    set menu(value) {
        if(typeof value !== "number") throw TypeError(`Input value should be number type! Got ${typeof value}`);
        this._menu_id = value;
    }
    get menu() { return this._menu_id; }
    get id() { return this._id; }
    get chat() { return this._chat; }
    get updated() { return this._round_updated; }
    get quote() { return this._quote; }
    get running() { return this._running; }
    get created() { return this._created; }
}

class GuessSenderGameEngine {
    _sessions = [];
    constructor() {
        this._sessions = [];
    }
    newGame(chat_id, options) {
        if((new Set(options)).size !== options.length) throw TypeError(`Options must not have duplicate values!`);
        if(this.findGameByChatId(chat_id)) return false;
        const session = new GameSession(chat_id, options);
        this._sessions.push(session);
        return session;
    }
    stopGame(chat_id) {
        if(typeof chat_id !== "number") throw TypeError(`Input value should be number type! Got ${typeof chat_id}`);
        for (let i = 0; i < this._sessions.length; i++) {
            const session = this._sessions[i];
            if(session.chat === chat_id) {
                session.stop();
                this._sessions.splice(i, 1);
                return session;
            }
        }
        return false;
    }
    findGameById(session_id) {
        if(typeof session_id !== "number") throw TypeError(`Input value should be number type! Got ${typeof session_id}`);
        return this._sessions.find(session => session.id === session_id);
    }
    findGameByChatId(chat_id) {
        if(typeof chat_id !== "number") throw TypeError(`Input value should be number type! Got ${typeof chat_id}`);
        return this._sessions.find(session => session.chat === chat_id);
    }
}

export default GuessSenderGameEngine;
export { GuessSenderGameEngine, GameSession, Player };