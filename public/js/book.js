import {bookFetchById} from './utility.js';
document.addEventListener('DOMContentLoaded', async () => {
    const url = new URL(window.location.href);
    const bid = url.pathname.split('/')[2].split('.')[0];

    bookFetchById(bid)
    .then(res => {
        if (res.data.get_book_google_api){
            document.getElementById('title').innerHTML = res.data.get_book_google_api.title;
            document.getElementById('cover-img').src = res.data.get_book_google_api.cover;
            document.getElementById('cover-img').alt = res.data.get_book_google_api.title;
            res.data.get_book_google_api.author.forEach(a => {
                let author_element = document.createElement('a');
                author_element.innerHTML = a;
                author_element.href = `/books/inauthor:${a}`;
                document.getElementById('author').appendChild(author_element);
                let space_element = document.createElement('span');
                space_element.innerHTML = "&nbsp&nbsp";
                document.getElementById('author').appendChild(space_element);
            });
            res.data.get_book_google_api.genre.forEach(g => {
                let genre_element = document.createElement('a');
                genre_element.innerHTML = g;
                genre_element.href = `/books/subject:${g}`;
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
        }
    });
});