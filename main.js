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
    async validation(){
        //takes inputs for username and password, validates from collection: user_data
        //throws error when invalid username/password
    }

    async userCreate(){
        //allows user to input username and password and create document
        //ensure new username
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


    }
    type Mutation{
        user_create(
            username: String!
            password: String!
        ): ID

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
			file: Binarydata!
		): ID
    }

	type Book{
		book_id: ID!
		title: String!
		author: [String]!
		genre: [String]!
		is_read: Boolean!
		cover: Binarydata!
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