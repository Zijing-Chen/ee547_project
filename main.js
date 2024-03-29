'use strict';
const fs = require('fs');
const express = require('express');
const { MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const DataLoader = require('dataloader');
const { request } = require('http');
const GOOGLE_BOOK_API_KEY = "AIzaSyDzos4mIE59l9vvt3whhRBeNp4fncYDGtI";
const SECRET = "sdfglkjdnglewbgwpgkihipq2iu;liusher;";
const TOKEN_EXPIRE_IN = "1d";
const MONGO_CONFIG_FILE = './config/mongo.json';
const bodyParser = require('body-parser');
const util = require('util');

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
            if (!user) {
                return null;
            }
            else if(user.password == password){
                //correct password to username
                return user;
            }
            else{
                return null;
            }
        }
        catch(err){
            console.error(err);
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
                return [2, null];
            }
            else if(username.includes(' ')){
                //invalid username
                return [3, null];
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
                    return new Error(`Error inserting user -- data:${data}`);
                }
                return [1, uid.toString()];
            }
        }
        catch(err){
            console.error(err)
            return null;
        }
    }
    //get users
    async getUsers(filter = {}){
        //get all users
        try{
            let collection = this.db.collection('user_data');
            let users = await collection.find(filter).toArray();
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
    async getPopularBook() {
        // Make google api get request.
        // See https://developers.google.com/books/docs/v1/using#WorkingVolumes and https://cloud.google.com/docs/authentication/api-keys#using for implementationd details.
        try {
            const popularBooks = JSON.parse(fs.readFileSync('./public/popular_books.json'));
            const allResults = [];
            for (const book of popularBooks) {
                const query = `${book.title} by ${book.author}`;
                const { body, _ } = await this.request("get",`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1&key=${GOOGLE_BOOK_API_KEY}`);
                if (body.items && body.items.length > 0) {
                    const book = await this.makeBookResponseFromGoogleBookApiResponse(body.items[0]);
                    allResults.push(book);
                }
            }
            return allResults;
        }
        catch (err) {
            console.error(err);
            return [];
        }
    }
    
    async getBooksFromGoogleBookApi(keyword, count, start) {
        // Make google api get request.
        // See https://developers.google.com/books/docs/v1/using#WorkingVolumes and https://cloud.google.com/docs/authentication/api-keys#using for implementationd details.
        try {
            const { body, _ } = await this.request("get", "https://www.googleapis.com/books/v1/volumes?q=" + keyword + "&maxResults=" + count + "&startIndex=" + start +"&key=" + GOOGLE_BOOK_API_KEY);
            let result = await Promise.all(body.items.map(item => this.makeBookResponseFromGoogleBookApiResponse(item)));
            return result;
        }
        catch (err) {
            console.error(err);
            return [];
        }
    }
    async getBookFromGoogleBookApiById(bid) {
        const { body, _ } = await this.request("get", "https://www.googleapis.com/books/v1/volumes/" + bid);
        let result = await this.makeBookResponseFromGoogleBookApiResponse(body);
        return result;
    }

    async makeBookResponseFromGoogleBookApiResponse(item) {
        // Parse google api get request response.
        let book = {
            book_id: item.id,
            title: item.volumeInfo.subtitle ? item.volumeInfo.title + "\n" + item.volumeInfo.subtitle : item.volumeInfo.title,
            author: item.volumeInfo.authors,
            genre: item.volumeInfo.categories, 
            cover: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : "https://upload.wikimedia.org/wikipedia/commons/b/b9/No_Cover.jpg",
            description: item.volumeInfo.description,
            page_count: item.volumeInfo.pageCount
        }
        return book;
    }
    async request(method, url, body = null, axiosOpts = {}) {
        axiosOpts = {
          ...this.defaultAxiosOpts,
          ...axiosOpts,
          headers: {},
          method,
          url
        };
    
        if (body) {
          axiosOpts.data = JSON.stringify(body);
          axiosOpts.headers['Content-Type'] = 'application/json';
        }
    
        const res = await axios(axiosOpts);
    
        return { body: res.data, headers: res.headers, status: res.status };
    }

    async AddToUserBookList(uid, bid, booklist) {
        try{
            await this.db.collection('user_data').updateOne(
                {_id : new ObjectId(uid)},
                {$addToSet: { [booklist]: bid }}
            );
            return true;
        }
        catch (err) {
            return false;
        }
    }

    async DeleteFromUserBookList(uid, bid, booklist) {
        try{
            if (booklist === "all") {
                await this.db.collection('user_data').updateOne(
                    {_id : new ObjectId(uid)},
                    {$pull: { read: bid }}
                );
                await this.db.collection('user_data').updateOne(
                    {_id : new ObjectId(uid)},
                    {$pull: { currentlyReading: bid }}
                );
                await this.db.collection('user_data').updateOne(
                    {_id : new ObjectId(uid)},
                    {$pull: { wantToRead: bid }}
                );
            }
            else {
                await this.db.collection('user_data').updateOne(
                    {_id : new ObjectId(uid)},
                    {$pull: { [booklist]: bid }}
                );
            }
            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }

    async getBookList(uid, booklist) {
        try {
            const user = await this.db.collection('user_data').findOne({_id : new ObjectId(uid)});
            if (booklist === "all") {
                let books = user.read ? user.read : [];
                books = user.currentlyReading ? books.concat(user.currentlyReading) : books;
                books = user.wantToRead ? books.concat(user.wantToRead) : books;
                books = [...new Set(books)];
                return books;
            }
            else {
                return user[booklist] ? user[booklist] : [];
            }
        }
        catch (err) {
            console.error(err);
            return [];
        }
    }
}

async function getUsers(db, keys) {
    keys = keys.map(key => new ObjectId(key));
    let users = await db.getUsers({_id : {$in : keys}});
    return keys.map(key => users.find(user => user.user_id == key.toString()) || new Error(`User ${key} doesn't exist`));
}

async function getBooks(db, keys) {
    let books = await Promise.all(keys.map(key => db.getBookFromGoogleBookApiById(key)));
    return keys.map(key => books.find(book => book.book_id == key) || new Error(`Book ${key} doesn't exist`));
}

const app = express();
const interact_db = new Database();
interact_db._connect(MONGO_CONFIG_FILE);

const schema = buildSchema(`
    type Query{
        user: String

        fetch_user_booklist(
            booklist: String!
		) : [Book]
		
		search_book_google_api(
            keyword: String
            count: Int
            start: Int
		) : [Book]!

		recommend_books : [Book]!


        get_all_users: [User]!

        get_book_google_api(
            bid : ID!
        ) : Book
    }
    type Mutation{
        user_create(
            username: String!
            password: String!
        ): User!

        login(
            username: String!
            password: String! 
        ) : String!

		add_to_booklist(
			bid: ID! 
            booklist: String!
		): ID

		delete_from_booklist(
			bid: ID! 
            booklist: String!
		): ID
		
    }

	type Book{
		book_id: String!
		title: String!
		author: [String]!
		genre: [String]!
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
    user(args, context) {
        return context.user.user.username;
    },

    login: async ({username,password})=>{

        try{
            const user = await interact_db.userValidate(username,password);

            if (user) {
                const token = await jwt.sign(
                    {
                        user: user
                    },
                    SECRET,
                    {expiresIn: TOKEN_EXPIRE_IN}
                );
                return token;
            }
            else {
                return new Error('Failed to validate user');
            }
        }
        catch(err){
            console.error(err);
            return new Error('Failed to validate user');
        }
    },
    user_create: async({username,password}, context)=>{
        try{
            const result = await interact_db.userCreate(username,password);
            if (result[0] == 2) {
                return new Error(`Username ${username} already exists`);
            }
            else if (result[0] == 3) {
                return new Error("Username should not contain space")
            }
            else {
                return context.loaders.user.load(result[1]);
            }
        }
        catch{
            console.error(err);
            return new Error('Failed to create user');
        }
    },
    get_all_users: async()=>{
        try{
            const users = interact_db.getUsers();
            return users;
        }
        catch(err){
            console.error(err);
            return new Error('Failed to get users');
        }   
    },

    search_book_google_api: async ({keyword, count, start}) => {
        try {

            const books = await interact_db.getBooksFromGoogleBookApi(keyword, count? count : 20, start? start : 0);

            return books;
        }
        catch(err) {
            console.error(err);
            return new Error(`Google book api search with q=${keyword} failed.`);
        }
    },
    recommend_books: async(args,context) => {
        try {
            /*if (!context.user) {
                return new Error("Login required");
            }
            else {*/
                //const books = await interact_db.getBooksFromGoogleBookApi("key", count? count : 20, start? start : 0);
                const books = await interact_db.getPopularBook();
                return books;
            //}
        }
        catch(err) {
            console.error(err);
            return new Error("Failed generate recommended booklist");
        }
    },

    add_to_booklist: async({bid, booklist}, context) => {
        try {
            if (!context.user) {
                return new Error("Login required");
            }
            else {
                await interact_db.AddToUserBookList(context.user.user._id, bid, booklist);
                return bid;
            }
        }
        catch(err) {
            console.error(err);
            return new Error("Failed to add to booklist");
        }
    },

    delete_from_booklist: async({bid, booklist}, context) => {
        try {
            if (!context.user) {
                return new Error("Login required");
            }
            else {
                await interact_db.DeleteFromUserBookList(context.user.user._id, bid, booklist);
                return bid;
            }
        }
        catch(err) {
            console.error(err);
            return new Error("Failed to add to booklist");
        }
    },

    get_book_google_api: async({bid}, context) => {
        try {
            return context.loaders.book.load(bid);
        }
        catch (err) {
            return new Error(`Failed to get book ${bid} from Google Book Api`);
        }
    },

    fetch_user_booklist: async({booklist}, context) => {
        try {
            if (!context.user) {
                return new Error("Login required");
            }
            else {
                let books = await interact_db.getBookList(context.user.user._id, booklist);
                books = books.map(book => context.loaders.book.load(book));
                return books;
            }
        }
        catch(err) {
            console.error(err);
            return new Error(`Failed to fetch book list ${booklist}`);
        }
    }

};

app.use(express.static('public'));
app.set("view engine", "ejs");
app.set('views', [__dirname + '/views',
    __dirname + '/views/pages/'
]);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use('/graphql', async (req, res) => {
    const token = await req.headers["authentication"];
    let user;
    try {
      user = await jwt.verify(token, SECRET);
    } catch (error) {
      console.error(`${error.message} caught`);
    }
    graphqlHTTP({
        schema: schema,
        rootValue: rootValue,
        graphiql: true,
        context : {
            loaders : {
                user: new DataLoader(keys => getUsers(interact_db, keys)),
                book: new DataLoader(keys => getBooks(interact_db, keys))
            },
            user: user
    }})(req, res);
});

app.get('/user/login.html', async function (req, res) {
    const render = util.promisify(res.render).bind(res);
    res.locals.title = "Log in";
    res.render('layout', {
        body: await render("login")
    });
});

app.get('/books/:keyword.html', async function (req, res) {
    const render = util.promisify(res.render).bind(res);
    res.locals.title = "Books";
    res.render('layout', {
        body: await render("books")
    });

});

app.get('/book/:bid.html', async function (req, res) {
    const render = util.promisify(res.render).bind(res);
    res.locals.title = "Book";
    res.render('layout', {
        body: await render("book")
    });

});

app.get('/dashboard.html', async (req, res) => {
    const render = util.promisify(res.render).bind(res);
    res.locals.title = "Dashboard";
    res.render('layout', {
        body: await render("dashboard")
    });
});
app.get('/user/books/:booklist.html', async (req, res) => {
    const render = util.promisify(res.render).bind(res);
    res.locals.title = "my-books";
    res.render('layout', {
        body: await render("my-books")
    });
});
app.get('/user/recommend.html', async (req, res) => {
    const render = util.promisify(res.render).bind(res);
    res.locals.title = "recommend";
    res.render('layout', {
        body: await render("recommend")
    });
});

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