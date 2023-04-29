# ee547_project

Some specifications to graphql schema:
user_create outputs an integer code:
1 for success
2 for username already exists
3 for invalid username (cannot contain spaces)
null when failed for any other reason

user_validate outputs:
user ID as objectID on success
null on failure 

added a get_all_users query for debugging purposes

Binarydata type does not work in schema. Has been changed to string (to be resolved)

Below are the list of files, folders and their usage:

Mongo dabase scheme:
Database structure:
-Database name: books_project
	-Collection name: user_data
		_id: ID
		username: String
		password: String
		read_booklist: [book_id]
		unread_booklist: [book_id]
		custom_covers: {book_id: Binarydata}
		reading_goal: {genre: String
					   length: Int}
		booklist_genres: [String] //all genres from most to least
		



config/mongo
Connection to mongoDB, alter this file based on your own local environment

main.js
Main file for backend connections. Running on port 8000

views/pages:
- login.ejs: login page
-

public: add css files + more






