'use strict';
const fs = require('fs');
const express = require('express');
const { MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');


const MONGO_CONFIG_FILE = './config/mongo.json';

class Database{
    async _connect(configFile){
        let config = {};
        try {
            const data = fs.readFileSync(configFile);
            config = JSON.parse(data);
        } catch (err) {
            console.error(`Failed to read config file: ${err.message}`);
            process.exit(2);
        }
        config.host = config.host || 'localhost';
        config.port = config.port || '27017';
        config.db = config.db || 'ee547_hw';
        config.opts = config.opts || {
            useUnifiedTopology: true
        };
        const uri = `mongodb://${config.host}:${config.port}`;
        //console.log(uri);
        this.client = new MongoClient(uri, config.opts);
        try{
            await this.client.connect();
            this.db = this.client.db(config.db);
        }
        catch(err){
            console.error(err);
            process.exit(5);
        }
    }
    async _disconnect() {
        if (this.client) {
            await this.client.close();
        }
    }

    //Login
    async userValidate(username, password){
        //takes inputs for username and password, validates from collection: user_data
        //throws error when invalid username/password
        try{
            let collection = this.db.collection('user_data');
            let user = await collection.findOne({ username: username });
            if(user.password==password){
                //correct password to username
                return user._id;
            }
            else{
                return null;
            }
        }
        catch(err){
            console.log(err);
            return null;
        }
    }
    async userCreate(username, password){
        //allows user to input username and password and create document
        //ensure new username
        //does not allow spaces in username or password
        try{
            let collection = this.db.collection('user_data');
            let user = await collection.findOne({ username: username });
            if(user){
                //user already exists
                return 2;
            }
            else if(username.includes(' ')){
                //invalid username
                return 3;
            }
            else{
                //check collection exists
                const check =await this.db.listCollections({ name: 'user_data' }).toArray();
                if (check.length<=0) {
                    // Create the 'user_data' collection if it does not exist
                    await this.db.createCollection('user_data');
                }
                let collection = this.db.collection('user_data');
                const { insertedId: uid } = await collection.insertOne({_id: new ObjectId(), username: username, password:password});
                if (!uid) {
                    throw new Error(`Error inserting user -- data:${data}`);
                }
                return 1;
            }
        }
        catch(err){
            console.log(err)
            return null;
        }
    }
    //get users
    async getUsers(){
        //get all users
        try{
            let collection = this.db.collection('user_data');
            let users = await collection.find({}).toArray();
            var new_users = [];
            for(let i=0; i<users.length;i++){
                let temp_user = users[i];
                var reformed_user = {user_id:temp_user._id, 
                                     username: temp_user.username,
                                     password: temp_user.password};
                new_users.push(reformed_user);
            }
            new_users.sort((a, b) => a.username.localeCompare(b.username));
            return new_users;
        }
        catch(err){
            console.error(err);
            return [];
        }
    }

}

const app = express();
const interact_db = new Database();
interact_db._connect(MONGO_CONFIG_FILE);

const schema = buildSchema(`
    type Query{
        user_validate(
            username: String!
            password: String! 
        ) : ID

        fetch_user_booklist(
			user_id: ID!
            is_read: Boolean
		) : [Book]!
		
		search_book_google_api(
			keyword: String
		) : [Book]!

		recommend_books(
			user_id: ID!
		) : [Book]!

		popular_books : [Book]!

        get_all_users: [User]!
    }
    type Mutation{
        user_create(
            username: String!
            password: String!
        ): Int

		add_to_booklist(
			book_id: ID! 
			user_id: ID!
		): ID

		finish_reading(
			book_id: ID! 
			user_id: ID!
		): ID
		
		custom_cover(
			book_id: ID!
			user_id: ID!
			file: String!
		): ID
    }

	type Book{
		book_id: ID!
		title: String!
		author: [String]!
		genre: [String]!
		is_read: Boolean!
		cover: String!
		description: String!
		page_count: Int!
	}

	type User{
		user_id: ID!
		username: String!
		password: String!
		
	}
`);


const rootValue = {
    user_validate: async ({username,password})=>{
        try{
            const uid = interact_db.userValidate(username,password);
            return uid;
        }
        catch(err){
            console.error(err);
            throw new Error('Failed to validate user');
        }
    },
    user_create: async({username,password})=>{
        try{
            const code = interact_db.userCreate(username,password);
            return code;
        }
        catch{
            console.error(err);
            throw new Error('Failed to create user');
        }
    },
    get_all_users: async()=>{
        try{
            const users = interact_db.getUsers();
            return users;
        }
        catch(err){
            console.error(err);
            throw new Error('Failed to get users');
        }   
    },

};

app.use(express.static('public'))

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: rootValue,
    graphiql: true
}));

const server = app.listen(8000);


//only disconnect from mongodb after server shut down
process.on('SIGINT', () => Shutdown(server, interact_db));
process.on('SIGTERM', () => Shutdown(server, interact_db));

function Shutdown(server, interact_db) {
    server.close(() => {
        console.log('Server closed');
        interact_db._disconnect();
        process.exit(0);
    });
}