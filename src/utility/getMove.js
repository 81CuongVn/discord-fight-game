const Discord = require('discord.js');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.User} player1 
 * @param {Discord.Message} message
 */
module.exports = function (player1, message, timeout) {
    return new Promise(async (resolve) => {
        const that = this;

        message.channel.send({ content: `${player1.toString()} check your DM to choose your move.` }).then(x => setTimeout(() => {
            message.channel.messages.delete(x);
        }, 3000));

        const msg = await player1.send({ embeds: [{ color: "AQUA", title: `Choose your move, ${player1.username}` }], components: await getComponents.bind(that)(timeout) });

        const collector = msg.createMessageComponentCollector({ filter: (i) => i.message.id === msg.id && i.customId.endsWith("_fight_game") && i.user.id === player1.id, time: 30000 });

        collector.on('collect', (interaction) => {
            const move = parseInt(interaction.customId[0]);
            interaction.reply({ content: "Move selected successfully", ephemeral: true });
            collector.stop(move);
        });

        collector.on('end', (shit, reason) => {
            if (reason === "time") {
                msg.edit({ embeds: [{ color: "RED", title: player1.username + ", You took way to much time to respond so game is ended" }], components: [] })
                message.channel.send({ embeds: [{ color: "GREEN", title: that.options.timeEndMessage.replace(/{user}/g, player1.username) }] })

                return resolve("end");
            } else if (reason === 4) {
                msg.edit({ embeds: [{ color: "GREEN", title: "Game ended successfully" }], components: [] })
                message.channel.send({ embeds: [{ color: "GREEN", title: that.options.forceEndMessage.replace(/{user}/g, player1.username) }] })

                return resolve("end");
            } else {
                msg.edit({ components: [] })
                resolve(reason);
            }
        })
    })
}

function getComponents(timeout) {
    const rows = [new Discord.MessageActionRow()];
    let one = new Discord.MessageButton().setLabel(this.oneName || "\u200b").setDisabled(timeout.includes("one")).setStyle(timeout.includes("one") ? "DANGER" : "PRIMARY").setCustomId("1_fight_game")
    let two = new Discord.MessageButton().setLabel(this.twoName || "\u200b").setDisabled(timeout.includes("two")).setStyle(timeout.includes("two") ? "DANGER" : "PRIMARY").setCustomId("2_fight_game")
    let three = new Discord.MessageButton().setLabel(this.threeName || "\u200b").setDisabled(timeout.includes("three")).setStyle(timeout.includes("three") ? "DANGER" : "PRIMARY").setCustomId("3_fight_game")
    let four = new Discord.MessageButton().setLabel(this.endName || "\u200b").setDisabled(false).setStyle("DANGER").setCustomId("4_fight_game")

    if (this.options.oneEmoji) one.setEmoji(this.options.oneEmoji);
    if (this.options.twoEmoji) two.setEmoji(this.options.twoEmoji);
    if (this.options.threeEmoji) three.setEmoji(this.options.threeEmoji);
    if (this.options.endEmoji) four.setEmoji(this.options.endEmoji);

    rows[0].addComponents([one, two, three, four]);

    return rows;
}