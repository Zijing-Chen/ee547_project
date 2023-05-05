# ee547_project

Below are the list of files, folders and their usage:

Mongo dabase scheme:
Database structure:
-Database name: books_project
	-Collection name: user_data
		_id: ID
		username: String
		password: String
		wantToRead: [String] <-Array of book id
		currentlyReading: [String]
        read: [String]
		
		



config/mongo
Connection to mongoDB, alter this file based on your own local environment

main.js
Main file for backend connections. Running on port 8000. Run main.js.

views
    pages
        - book.ejs: dynamic html for single book information
        - books.ejs: dynamic html for book list by search
        - dashboard.ejs: dynamic html for dashboard
        - layout.ejs: overall layout including navigation
        - login.ejs: dynamic html for login page
        - my-books.ejs: book listing page
        - recommended.ejs: discovery page for popular books
    partials
        - flash-message.ejs: flash message 
        - nav-bar.ejs: navigation bar
        - search-bar.ejs: search bar in navigation to look up books

public
    css
        - book.css: style book page
        - books.css: style books page
        - dashboard.css: style dashboard
        - flash-message.css: style flash messages
        - layout.css: style overall layout
        - login.css: style login page
        - my-book.css: style personal book list page
    js
        - book.js: js script for book page
        - books.js: js script for books page
        - dashboard.js: js script for dashboard page
        - login.js: js script for login page
        - logout.js: js script for logout button when user is logged in
        - my-books.js: js script for personal book list page
        - nav-bar.js: js script for navigation bar 
        - recommended.js: js script for discover page
        - search-bar.js: js script for search bar
        - utility.js: some functions used in other js files
    popular_books.json: json file holding list of popular books.







