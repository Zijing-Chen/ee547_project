# ee547_project

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






