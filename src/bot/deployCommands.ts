import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = [
  new SlashCommandBuilder().setName('pull').setDescription('Pull the rope (reward, but consequences!)'),
  new SlashCommandBuilder().setName('hold').setDescription('Hold the rope (no reward)'),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log('Deployment of the commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
      { body: commands },
    );
    console.log('Commands deployed!');
  } catch (err) {
    console.error(err);
  }
})();
