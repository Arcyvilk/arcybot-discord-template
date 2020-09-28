Welcome to the Arcybot Template! It provides you with fully working skeleton for the NodeJS Discord Bot with the database setup on which you can later build.
The template includes:

- support for commands,
- support for reactions,
- support for logging Discord events in designated rooms (user joining/leaving the server, user editing message, user deleting message).
  After the initial set-up, you can start instantly by adding your own commands, reactions etc! Follow the tutorial below to be able to get going.

---

# Table of contents

* TOC 
{:toc}

---

# Setting up

Before you can get bot up and running, you have to do three things:

- use this template to generate your bot,
- set up a MongoDB database,
- register your new bot on Discord Developer portal.

Then you can invite the bot to your server and voila!

## Cloning this template

- navigate to the [bot's template repository](https://github.com/Arcyvilk/bot-arcytemplate)
- click the green `Use this template` button

![](https://github.com/Arcyvilk/arcybot-template/blob/gh-pages/imgs/usetemplate.png)
- when prompted, choose your bot's repository name, uncheck the `Include all branches` checkbox, then click the `Create repository from template` button

![](https://github.com/Arcyvilk/arcybot-template/blob/gh-pages/imgs/createrepo.png)
- you should get redirected to your new repository. Now [clone it](https://docs.github.com/en/enterprise/2.13/user/articles/cloning-a-repository)!
- open your local copy of the repository and navigate to the `config` folder
- clone the `config.example.json` file and name the duplicate `config.json`

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

After installing and preparing the Administrator account, I recommend to create a secondary account for the bot. This allows you to track what the bot does in the database, and also secures your database in case your bot's credentials get leaked.

To do this, do the following:

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

## Creating a Discord Bot application

First, navigate to [Discord Developer](https://discord.com/developers/applications) website. Click the "New application" button in the top right corner. You will be prompted to enter the name of your new bot. Call them something nice (◡‿◡✿)

After confirming your new bot's name, you will be redirected to its website. What you should do now is to navigate to "Bot" tab on the left sidebar. Once you're there, click the "Add bot" button on the right. When you get asked if you are sure that want to do it, confirm.

![](https://github.com/Arcyvilk/arcybot-template/blob/gh-pages/imgs/addabot.png)

Your bot's name and (default) avatar should appear, and just under them there is a "Token" section. Click the "Copy" button to click it.

![](https://github.com/Arcyvilk/arcybot-template/blob/gh-pages/imgs/copytoken.png)

Now navigate back to the bot's code. Find the `config.json` file that you created in the first step, and put the copied token in the `DISCORD_TOKEN` field.

Permissions that your bot should have:

- General permissions: Manage roles
- Text permissions: Send messages, Embed links, Use external emojis, Add reactions

## Inviting the bot to your server

Simply copy the link below, replace the `CLIENT_ID` with the Client ID of your bot application and the invite link is ready.
The `permissions` flag gives the bot by default the permissions listed above. If you want you can insert a different permissions string here.

https://discord.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot&permissions=268716096

You're all set! You can run the bot now.

## Running the bot

After completing all the previous steps, enter the bot's directory and open a shell there, then enter the following commands:

- `yarn`
- `yarn run build`
- `yarn start`

It's alive now!

# Working with the template

WIP

## Adding new commands

WIP

### Text commands

WIP

### Embed commands

WIP

### Custom commands

WIP

## Adding new reactions

WIP

## Logging events

WIP

### Setting up rooms

WIP
