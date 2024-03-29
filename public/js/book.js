import {bookFetchById, addToBooklist, deleteFromBooklist} from './utility.js';

const addBookListListener = async (bid, title) => {

    const bookListButtons = Object.values(document.getElementsByClassName("add-to-list"));
    bookListButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const response = await addToBooklist(bid, button.value, localStorage.getItem("token"));
            console.log(response);
            if (response.errors) {
                document.getElementById('flash').innerHTML = "Login to add book to your book list."
                document.getElementById('flash').style.display = 'block';
                document.getElementById('flash').style.color = "red";
            }
            else {
                await deleteFromBooklist(event.target.form.firstChild.name, "read", localStorage.getItem("token"));
            await deleteFromBooklist(event.target.form.firstChild.name, "currentlyReading", localStorage.getItem("token"));
            await deleteFromBooklist(event.target.form.firstChild.name, "wantToRead", localStorage.getItem("token"));
                document.getElementById('flash').innerHTML = `Book ${title} added to your book list.`
                document.getElementById('flash').style.display = 'block';
                document.getElementById('flash').style.color = "black";
            }
            
        });
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    const url = new URL(window.location.href);
    const bid = url.pathname.split('/')[2].split('.')[0];
    document.getElementById('flash').style.display = 'none';
    bookFetchById(bid)
    .then(async (res) => {
        if (res.data.get_book_google_api){
            document.getElementById('title').innerHTML = "<pre>" + res.data.get_book_google_api.title + "</pre>";
            console.log(res.data.get_book_google_api.title);
            document.getElementById('cover-img').src = res.data.get_book_google_api.cover;
            document.getElementById('cover-img').alt = res.data.get_book_google_api.title;
            res.data.get_book_google_api.author.forEach(a => {
                let author_element = document.createElement('a');
                author_element.innerHTML = a;
                author_element.href = `/books/inauthor:${encodeURIComponent(a)}.html`;
                document.getElementById('author').appendChild(author_element);
                let space_element = document.createElement('span');
                space_element.innerHTML = "&nbsp&nbsp";
                document.getElementById('author').appendChild(space_element);
            });
            res.data.get_book_google_api.genre.forEach(g => {
                let genre_element = document.createElement('a');
                genre_element.innerHTML = g;
                genre_element.href = `/books/subject:${encodeURIComponent(g)}.html`;
                document.getElementById('genre').appendChild(genre_element);
                let space_element = document.createElement('span');
                space_element.innerHTML = "&nbsp&nbsp";
                document.getElementById('genre').appendChild(space_element);
            });
            let page_count_element = document.createElement('span');
            page_count_element.innerHTML = res.data.get_book_google_api.page_count;
            document.getElementById('page-count').appendChild(page_count_element);
            let description_element = document.createElement('span');
            description_element.innerHTML = res.data.get_book_google_api.description;
            document.getElementById('description-content').appendChild(description_element);
            await addBookListListener(bid, res.data.get_book_google_api.title);
        }
    });
});