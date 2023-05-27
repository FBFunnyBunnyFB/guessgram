<h1 align="center">Guessgram</h1>

<div align="center">

Telegram bot as engaging mini-game where users guess the authors of different messages, testing their knowledge and competing for high scores.

[![TeleBunny Version](https://img.shields.io/badge/TeleBunny-v0.8.0-darkviolet)](https://www.npmjs.com/package/telebunny)

</div>

## 🏎 Getting started

To use this bot you should configure [config.json](configs/config.json) file first.

```json
{
    "bot_token": "<YOUR_BOT_TOKEN_HERE>",
    "chat_whitelist": [1234567890],
    "session_update_frequency": 5000,
    "session_answer_duration": 15000,
    "session_leaderboard_delay": 5000,
    "button_row_length": 2,
    "data_file_path": "data/result.json",
    "data_sender_whitelist": ["User 1", "User 2", "User 3"],
    "data_sender_override": {
        "User 1": "Ethan",
        "User 2": "Olivia",
        "User 3": "Mason"
    }
}
```

- Provide your bot token  given from **@BotFather** in bot_token
- If you want to work only with certain chats set **chat_whitelist**
- **session_update_frequency** sets game menu update frequency in ms
- **session_answer_duration** sets round duration in ms
- **session_leaderboard_delay** sets leaderboard menu show duration in ms
- **button_row_length** sets answer buttons row length
- Provide your data file path in **data_file_path**
- If you want to work only with certain senders set **data_sender_whitelist**
- If you want to override usernames from file set **data_sender_override**

**Data file should have valid structure.** The easiest way to generete it is to make [Telegram export](https://telegram.org/blog/export-and-more) in JSON format.

[Data file](data/result.json) structure example:

```json
{
    "messages": [
        {
            "from": "User 1",
            "text": "Hi there"
        },
        {
            "from": "User 2",
            "text": "Bye"
        }
    ]
}
```

## 🧠 Usage

To start bot process simply run this command:
```sh
npm start
```

To launch new game session use this commands in conversation:
- **/start**
- **/start@<YOUR_BOT_USERNAME>**

To stop game session use this commands in conversation:
- **/stop**
- **/stop@<YOUR_BOT_USERNAME>**

## 📝 Game rules

Each player should guess who sent message which is displayed by clicking on buttons below this message. User identifies as a player only when button pressed. 

If player fails - he/she loses **15** points. Otherwise, gaining score calculated by answer time **(0-100)**.

After each round the leaderboard shows where you can see game leaders.

Game ends when someone send stop command.

## 🔑 License

**The MIT License (MIT)**

Copyright © 2023 Funny Bunny