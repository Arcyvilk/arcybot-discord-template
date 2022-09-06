import Discord from 'discord.js';
import { TextCommand, EmbedCommand } from './commands/logic';
import { Reaction } from './commands/reactions';
import { getKeyword, getCommandSymbol } from './helpers';
import {
	handleUserNotInDatabase,
	handlePossibleMembershipRole,
} from './events';
import { happensWithAChanceOf } from './rng';
import { Command } from './commands/list';
import { IReactionDetails } from './types/reaction';

import {
	findCommandByKeyword,
	// findReactionsById,
	findAllReactionsInMessage,
} from './storage/db';

// LOGIC

const isUserAdmin = (msg: Discord.Message): boolean =>
	msg.member?.hasPermission('ADMINISTRATOR') ?? false;
const isChannelDM = (msg: Discord.Message) => msg.author.id === msg.channel.id;
const isUserBot = (msg: Discord.Message) => msg.author.bot;
const messageStartsWithCommandSymbol = async (msg: Discord.Message) => {
	const sym = await getCommandSymbol();
	return sym !== undefined && msg.content.startsWith(sym);
};

const answer = (msg: Discord.Message, answer: string) =>
	msg.channel.send(answer);
const answerCommand = async (msg: Discord.Message) => {
	const command = await findCommandByKeyword(getKeyword(msg));
	if (command === undefined) {
		await msg.react('❓');
		return;
	}

	if (command.text !== undefined) {
		new TextCommand(command, msg).execute(command.text);
		return;
	}

	if (command.embed !== undefined) {
		new EmbedCommand(command, msg).execute(command.embed, msg.author.username);
		return;
	}
	if (Command[getKeyword(msg)]) {
		Command[getKeyword(msg)](command, msg);
		return;
	}

	await msg.react('❓');
};

const checkForReactionTriggers = async (msg: Discord.Message) => {
	const reactions = await findAllReactionsInMessage(msg.content);

	// EXAMPLE OF CUSTOM REACTION
	// const reactions = isThisFunctionalReactionExample(msg)
	// 	? await findReactionsById('function_reaction')
	// 	: await findAllReactionsInMessage(msg.content);
	// END OF EXAMPLE

	if (reactions.length === 0) {
		return;
	}

	reactions.map(reaction => {
		const chosenReaction = reaction.reactionList.find(
			(reaction: IReactionDetails) => happensWithAChanceOf(reaction.chance),
		);
		if (chosenReaction) {
			chosenReaction.emoji && msg.react(chosenReaction.emoji);
			chosenReaction.response && msg.channel.send(chosenReaction.response);
			chosenReaction.function &&
				Reaction[chosenReaction.function] &&
				Reaction[chosenReaction.function](msg);
		}
	});
};

// MAIN FUNCTION

const classifyMessage = async (msg: Discord.Message): Promise<void> => {
	if (isUserBot(msg)) {
		return;
	}
	if (isChannelDM(msg)) {
		answer(msg, 'You cannot speak to me in private.');
		return;
	}

	await handleUserNotInDatabase(msg.member, msg);
	await handlePossibleMembershipRole(msg);

	if (await messageStartsWithCommandSymbol(msg)) {
		answerCommand(msg);
		return;
	}
	await checkForReactionTriggers(msg);
};

export { classifyMessage, isUserAdmin };
