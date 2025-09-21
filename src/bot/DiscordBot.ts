import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('clientReady', () => {
    console.log(`Bot logged in as ${client.user?.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
