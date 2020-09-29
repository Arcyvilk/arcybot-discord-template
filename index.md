Welcome to the Arcybot Template! It provides you with fully working skeleton for the NodeJS Discord Bot with the database setup on which you can later build.
The template includes:

- support for commands,
- support for reactions,
- support for logging Discord events in designated rooms (user joining/leaving the server, user editing message, user deleting message).
  After the initial set-up, you can start instantly by adding your own commands, reactions etc! Follow the tutorial below to be able to get going.

---

# Table of contents

- TOC
  {:toc}

---

# Tutorial: Setting up

Before you can get bot up and running, you have to do three things:

- use this template to generate your bot,
- set up a MongoDB database,
- register your new bot on Discord Developer portal.

Then you can invite the bot to your server and voila!

---

## Cloning this template

- navigate to the [bot's template repository](https://github.com/Arcyvilk/bot-arcytemplate)
- click the green `Use this template` button

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-template/gh-pages/imgs/usetemplate.png)

- when prompted, choose your bot's repository name, uncheck the `Include all branches` checkbox, then click the `Create repository from template` button

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-template/gh-pages/imgs/createrepo.png)

- you should get redirected to your new repository. Now [clone it](https://docs.github.com/en/enterprise/2.13/user/articles/cloning-a-repository)!
- open your local copy of the repository and navigate to the `config` folder
- clone the `config.example.json` file and name the duplicate `config.json`

---

## Setting up MongoDB

Install the MongoDB on your server/PC following [this tutorial](https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials).

After it's installed, you need to run a Mongo Daemon so it keeps working in the background. Mongo runs on port `27017` by default, but its worth to choose some other port to protect your database from the attacks that scan for unprotected default database ports. Decide on a port you want to run your database on or stay with the default 27017.

To start the Mongo Daemon, use the following command:

```
mongod --auth --fork --port YOUR_MONGO_PORT --bind_ip 0.0.0.0 --dbpath /var/lib/mongodb --logpath /var/lib/mongod.log
```

The `--bind_ip 0.0.0.0` allows the remote clients to connect to your database. It is useful if your database runs on different machine than your bot. You can remove that part if you host both the bot and the database on the same machine.

### Securing your database

You can skip this section if you want to inevitably get hacked.

Mongo database is created without any authentication method, therefore to keep your database secure you should start from creating an administrator account.

The Administrator should be added to the `admin` database. To do so, use the following commands:

- `mongo --port YOUR_MONGO_PORT`
- `use admin` (this switches you to `admin` database)
- ```
  db.createUser(
      {
          user: "YOUR_ADMIN_USERNAME",
          pwd: "YOUR_ADMIN_PASSWORD",
          roles: [ "root" ]
      }
  )
  ```

Voila! Your database now has an admin account. Now whenever you want to perform any administrative actions, you have to use the following command beforehand:

`db.auth({"login": "YOUR_ADMIN_USERNAME", "pwd": "YOUR_ADMIN_PASSWORD"})`

### Creating a MongoDB account for your bot

After installing and preparing the Administrator account, I recommend creating a secondary account for the bot with less permissions. This allows you to track what the bot does in the database, and also secures your database in case your bot's credentials get leaked.

To do this, use the following commands in the shell:

- `mongo --port YOUR_PORT_HERE`
- `use admin`
- `db.auth({"user":"YOUR_ADMIN_LOGIN", pwd:"YOUR_ADMIN_PASSWORD"})`
- `db.createUser({"user":"YOUR_BOT_LOGIN", pwd:"YOUR_BOT_PASSWORD", roles: [{ "role":"readWrite", "db": "YOUR_BOT_DATABASE_NAME"}]})`

You need to remember `YOUR_BOT_LOGIN` and `YOUR_BOT_PASSWORD` so you can fill them in the next step into bot's configuration.

### Connecting the bot to its MongoDB account

- navigate to the `config.json` file you've created earlier
- find the `DATABASE_URL` field
- paste this into the `DATABASE_URL` field:

```
"mongodb://YOUR_BOT_LOGIN:YOUR_BOT_PASSWORD@DATABASE_HOST:DATABASE_PORT/YOUR_BOT_DATABASE_NAME?authSource=admin"
```

Don't forget to edit that URL to reflect your data!

### Using your database

To view and edit your database's contents you can either use shell commands, or a GUI. I recommend using GUI because it makes your life much easier. A very good and free MongoDB GUI is [MongoDB Compass](https://www.mongodb.com/try/download/compass) - just navigate to the website and follow the instructions to download and install it.

After the installation open the MongoDB Compass. You should see this screen:

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-discord-template/gh-pages/imgs/compass1.png)

I recommend clicking the `Fill in connection fields individually` option. Once you do it, you should see this screen:

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-discord-template/gh-pages/imgs/compass2.png)

If you see less fields than on the attached screenshot, you need to change the Authentication method from `None` to `Username / Password`. Fill the fields accordingly to the screenshot above using your Administrator credentials that we created earlier and click "Connect". You should be able to see your database now. It is empty for now, but it will get filled automatically when we run the bot for the first time.

---

## Setting the bot

We have the code as the local copy and the database set up. Now we need to make Discord acknowledge out new bot.

### Creating a Discord Bot application

First, navigate to [Discord Developer](https://discord.com/developers/applications) website. Click the "New application" button in the top right corner. You will be prompted to enter the name of your new bot. Call it something nice (◡‿◡✿)

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-discord-template/gh-pages/imgs/newapp.png)

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-discord-template/gh-pages/imgs/addabot2.png)

After confirming your new bot's name you will be redirected to its page. What you should do now is to navigate to `Bot` tab on the left sidebar. Once you're there, click the `Add bot` button on the right. At the next prompt click `Confirm`.

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-template/gh-pages/imgs/addabot.png)

Your bot's name and (default) avatar should appear, and just under them there is a `Token` section. You will need to copy it.

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-template/gh-pages/imgs/copytoken.png)

Now navigate back to the bot's code. Find the `config.json` file that you created in the first step, and put the copied token in the `DISCORD_TOKEN` field.

Permissions that your bot should have:

- **General permissions**: Manage roles
- **Text permissions**: Send messages, Embed links, Use external emojis, Add reactions

### Inviting the bot to your server

Navigate to the `General Information` tab and copy the bot's Client ID:

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-discord-template/gh-pages/imgs/clientid.png)

Now take the link below, and after replacing the `CLIENT_ID` with the Client ID of your bot application your invite link is ready! The `permissions` flag gives the bot by default the permissions listed above. If you want you can insert a different permissions string here.

```
https://discord.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot&permissions=268716096
```

Click the link and add the bot to your server.

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-discord-template/gh-pages/imgs/invbot.png)

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-discord-template/gh-pages/imgs/invbot2.png)

### Running the bot

After completing all the previous steps, enter the bot's directory and open a shell there, then enter the following commands:

- `yarn`
- `yarn run build`
- `yarn start`

🎉 It's alive now!

---

# Tutorial: Bot's first steps

WIP

---

## Adding new commands

There are three types of commands that you can add to the bot - text command, embed command and a custom command.

Text command makes bot return a given string. Embed command allows you to wrap bot's answer in an embed, and a custom command is fully customizable and allows the bot to do whatever you want it to!

The basic object for a command (stored in the database, collection `commands`) looks like that:

```
{
  keyword: string,       // this is a keyword you use to invoke the command
  isDisabled: boolean,   // if set to true, command cannot be used
  isProtected: boolean,  // currently doesn't do anything
  isModOnly: boolean,    // if set to true, only users with ADMINISTRATOR role can use this command
  refusal: string,       // custom text returned by bot when it refuses to execute a command
  category: string,      // allows to segregate the commands to categories in help
  description?: string,  // describes the command in help. If this field is not present, the command won't appear in help
}

```

All commands, no matter if text, embed or custom ones, share those fields.

### Text commands

To add a text command, simply add a new document to the `commands` collection and fill it accordingly to the basic command object above, then add a `text` field to it and fill it with the response that the bot should return.

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-discord-template/gh-pages/imgs/insertdoc.png)

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-discord-template/gh-pages/imgs/insertdoc2.png)

This is what the command looks like in use:

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-discord-template/gh-pages/imgs/textcmd.png)

### Embed commands

Example of an embed command in use:

![](https://raw.githubusercontent.com/Arcyvilk/arcybot-discord-template/gh-pages/imgs/embedcmd.png)

### Custom commands

WIP

---

## Adding new reactions

WIP

---

## Logging events

WIP

### Setting up rooms

WIP
