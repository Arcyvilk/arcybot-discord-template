import { MongoClient, Db } from 'mongodb';
import type { GuildMember, Guild } from 'discord.js';
import assert from 'assert';
import { log } from '../log';
import { IEmbed } from '../types/command';
import * as Config from '../config';

let db: Db;

export const connectToDb = async (url: string): Promise<void> => {
	const client = await MongoClient.connect(url);
	db = client.db(Config.get('DATABASE_NAME'));
};

export async function upsertOne<T>(
	name: string,
	filter: any,
	object: T,
): Promise<void> {
	assert.ok(
		db !== undefined,
		'Have not connected to the database - make sure connectToDb() is called at least once',
	);
	await db
		.collection<T>(name)
		.updateOne(filter, { $set: object }, { upsert: true });
}
export async function insertMany<T>(
	name: string,
	object: any[],
): Promise<void> {
	assert.ok(
		db !== undefined,
		'Have not connected to the database - make sure connectToDb() is called at least once',
	);
	await db.collection<T>(name).insertMany(object);
}

export interface User {
	id: string;
	discordId: string;
	updated: number;
	punished: boolean;
	description: string | undefined;
	membership: {
		serverId: string;
		messageCount: number;
		joined: number;
		firstMessage: number;
	}[];
}

export async function upsertUser(id: string, user: User): Promise<void> {
	// TODO this throws cyclic dependency error - FIX IT!
	await upsertOne('users', { discordId: id }, user);
}

export async function isKnownMember(member: GuildMember): Promise<boolean> {
	return findUserByDiscordId(member.id) !== undefined;
}

export async function findUserByDiscordId(
	id?: string,
): Promise<User | undefined> {
	if (!id) return;
	const user = await db.collection('users').findOne({ discordId: id });
	return user;
}

export async function findAllGuildMembers(
	guild?: Guild | null,
): Promise<User[] | void> {
	if (!guild) return;
	const results = db.collection('users').find({
		membership: {
			$elemMatch: {
				serverId: guild.id,
			},
		},
	});

	return await results.toArray();
}

interface Option<T> {
	value: T;
}

interface Options {
	assignableRoles: string[];
	roomRoles: {
		id: string;
		guild: string;
	}[];
	modRoles: string[];
	membershipRoles: {
		name: string;
	}[];
	jokeRoles: string[];

	topMembers: number;

	roomLogMsgs: {
		guild: string;
		id: string;
	}[];
	roomLogUsers: {
		guild: string;
		id: string;
	}[];
	roomGlobal: string;

	commandSymbol: string;
}

export async function findOption<K extends keyof Options>(
	name: K,
): Promise<Options[K] | undefined> {
	type T = Option<Options[K]>;
	const opt = await db.collection('options').findOne<T>({ option: name });
	return opt?.value;
}

export interface Command {
	keyword: string;
	isModOnly: boolean;
	description?: string;
	text?: string;
	embed?: IEmbed;
}

export async function findModCommands(): Promise<Command[]> {
	const r = db.collection('commands').find({
		isModOnly: true,
	});

	return await r.toArray();
}

export async function findUserCommands(): Promise<Command[]> {
	const r = db.collection('commands').find({
		isModOnly: false,
	});

	return await r.toArray();
}

export async function findCommandByKeyword(
	keyword: string,
): Promise<Command | undefined> {
	const c = db.collection('commands');
	return (await c.findOne({ keyword })) ?? undefined;
}

export interface Reaction {
	id: string;
	keywords: string[];
	reactionList: any[];
}

export async function findReactionsById(id: string): Promise<Reaction[]> {
	return await db.collection('reactions').find({ id }).toArray();
}

export async function findAllReactionsInMessage(
	msg: string,
): Promise<Reaction[]> {
	const content = msg.toLowerCase().split(' ');
	// This could probably be much quicker with a lookup table - it will slow down quite a bit as more reactions get added
	const reactions = await db.collection('reactions').find({}).toArray();
	return reactions.filter((r: Reaction) => {
		const words = r.keywords.filter(keyword => content.includes(keyword));
		// all of the keywords must be present in the sentence at once
		return words.length === r.keywords.length;
	});
}

export async function completeDb(): Promise<void> {
	const fillOptions = () => {
		const options = [
			{ option: 'commandSymbol', value: '!' },
			{ option: 'assignableRoles', value: [] },
			{ option: 'jokeRoles', value: [] },
			{ option: 'modRoles', value: [] },
			{ option: 'membershipRoles', value: [] },
			{ option: 'topMembers', value: 10 },
			{ option: 'room_log_msgs', value: [{ id: 0, guild: 0 }] },
			{ option: 'room_log_users', value: [{ id: 0, guild: 0 }] },
		];
		insertMany('options', options);
	};
	const fillCommands = () => {
		const commands = [
			{
				keyword: 'help',
				isDisabled: false,
				isProtected: false,
				isModOnly: false,
				refusal: 'No.',
				category: 'basic',
			},
			{
				keyword: 'h',
				isDisabled: false,
				isProtected: false,
				isModOnly: false,
				refusal: 'No.',
				category: 'basic',
			},
			{
				keyword: 'hmod',
				isDisabled: false,
				isProtected: false,
				isModOnly: true,
				description: 'returns the list of all moderator commands',
				refusal: 'No.',
				category: 'basic',
			},
		];
		insertMany('commands', commands);
	};
	const fillReactions = () => {
		const reactions = [
			{
				keywords: ['text_reaction'],
				reaction_list: [
					{
						chance: 100,
						response:
							"This reaction will cause the bot to react with this sentence when it detects 'text_reaction' keyword text",
					},
				],
			},
			{
				keywords: ['emoji_reaction'],
				reaction_list: [
					{
						chance: 100,
						emoji: '🍿',
					},
				],
			},
			{
				id: 'function_reaction',
				keywords: [],
				reaction_list: [
					{
						chance: 100,
						response: `This is more complicated reaction - 
							bot looks for the condition from isThisFunctionalReactionExample 
							function (lib/message.ts), and if it's fulfilled, reacts. 
							It does not take keywords into consideration.`,
					},
				],
			},
		];
		insertMany('reactions', reactions);
	};
	await db
		.createCollection('options')
		.then(() => {
			fillOptions();
			log.INFO('Missing collection OPTIONS created!');
		})
		.catch(() => log.INFO('Collection OPTIONS already exists.'));
	await db
		.createCollection('commands')
		.then(() => {
			fillCommands();
			log.INFO('Missing collection COMMANDS created!');
		})
		.catch(() => log.INFO('Collection COMMANDS already exists.'));
	await db
		.createCollection('reactions')
		.then(() => {
			fillReactions();
			log.INFO('Missing collection REACTIONS created!');
		})
		.catch(() => log.INFO('Collection REACTIONS already exists.'));
	await db
		.createCollection('users')
		.then(() => log.INFO('Missing collection USERS created!'))
		.catch(() => log.INFO('Collection USERS already exists.'));
}
