function genereteMenuText(time_left) {
    const title = "📝 *Game has started!*\n\n";
    if(time_left > 0) {
        return title.concat("⏱ *", time_left, "s* left");
    } else {
        return title.concat("⏱ *Wait*");
    }
}

function generateLeaderboard(session) {
    function getIcon(index, scored, places_total) {
        if(places_total > 3) {
            const top_emoji = ["🥇", "🥈", "🥉"];
            if(index === places_total - 1) return "💩";
            return top_emoji[index] || (scored === 0 || !session.running ? "🔸" : scored > 0 ? "🔺" : "🔻");
        } else {
            return scored === 0 || !session.running ? "🔸" : scored > 0 ? "🔺" : "🔻";
        }
    }
    let result = "";
    if(session.running) {
        result += "🗣 *" + session.getAnswer() + "*:" + "\n\n" + session.quote + "\n\n";
    } else {
        result += "🚩 *Game ended & lasted "+(((Date.now() - session.created)/1000)/60).toFixed(2)+"min*\n\n";
    }
    const players = session.getPlayers();
    if(players.length > 0) {
        result += "🏆 *Leaderboard*" + "\n\n";
        players.slice(0, 10).sort((a, b) => b.score - a.score).forEach((player, i) => {
            result += getIcon(i, player.scored, session.getPlayers().length);
            result += ` *${player.name}*: ${player.score};`;
            if(session.running) {
                result += ` \`[${player.scored > 0 ? '+' : ''}${player.scored}]\``;
            }
            result += "\n"
        });
    }
    return result;
}

function generateKeyboard(session) {
    const options = session.getVoteOptions().map((option) => {
        let result_label_text = option;
        if(session.getVotesCount(option) > 0) {
            result_label_text += ` (${session.getVotesCount(option)})`;
        }
        return { text: result_label_text, callback_data: `vote:${session.id}:${option}`}
    });
    let result = []
    for (let i = 0; i < options.length; i += process.env_config.button_row_length) {
        result.push(options.slice(i, i + process.env_config.button_row_length));
    }
    return result;
}

export { genereteMenuText, generateLeaderboard, generateKeyboard };