import {bookFetchByPopular} from './utility.js';
const loadBook = async () => {

    bookFetchByPopular()
    .then(res => {
        console.log(res.data);
        if (res.data){
            let books = document.getElementById("books");
            let num_line = Math.ceil(res.data.recommend_books.length / 4);
            for (let i = 0; i < num_line; i++) {
                let row = document.createElement('div');
                row.classList.add("book-row");
                for (let j = 0; j < 4; j++) {
                    if (i * 4 + j >= res.data.recommend_books.length) {
                        break;
                    }
                    let entry = document.createElement('div');
                    entry.classList.add("book-column");
                    let image = document.createElement('img');
                    image.src = res.data.recommend_books[i * 4 + j].cover;
                    image.alt = res.data.recommend_books[i * 4 + j].title;
                    let title = document.createElement("a");
                    title.innerHTML = res.data.recommend_books[i * 4 + j].title;
                    title.href = `/book/${res.data.recommend_books[i * 4 + j].book_id}.html`;
                    entry.appendChild(image);
                    entry.appendChild(title);
                    row.appendChild(entry);
                }
                books.appendChild(row);
            }
        }
    });
}
await loadBook();