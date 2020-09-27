import Discord from 'discord.js';
// import { CustomReaction, TextReaction } from './logic';

export const Reaction: {
	[key: string]: (msg: Discord.Message) => string | void;
} = {
	// example: (msg: Discord.Message) =>
	// 	new CustomReaction(msg).execute(example, msg),
};
