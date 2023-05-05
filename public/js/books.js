import {bookFetchByKeyword} from './utility.js';
const loadMoreBook = async (page_num) => {
    const url = new URL(window.location.href);
    const keyword = decodeURIComponent(url.pathname.split('/')[2]);
    bookFetchByKeyword(keyword, 20, page_num * 20)
    .then(res => {
        if (res.data){
            let books = document.getElementById("books");
            let num_line = Math.ceil(res.data.search_book_google_api.length / 4);
            for (let i = 0; i < num_line; i++) {
                let row = document.createElement('div');
                row.classList.add("book-row");
                for (let j = 0; j < 4; j++) {
                    if (i * 4 + j >= res.data.search_book_google_api.length) {
                        break;
                    }
                    let entry = document.createElement('div');
                    entry.classList.add("book-column");
                    let image = document.createElement('img');
                    image.src = res.data.search_book_google_api[i * 4 + j].cover;
                    image.alt = res.data.search_book_google_api[i * 4 + j].title;
                    let title = document.createElement("a");
                    title.innerHTML = res.data.search_book_google_api[i * 4 + j].title;
                    title.href = `/book/${res.data.search_book_google_api[i * 4 + j].book_id}.html`;
                    entry.appendChild(image);
                    entry.appendChild(title);
                    row.appendChild(entry);
                }
                books.appendChild(row);
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    await loadMoreBook(0);
    let page_number = 1;
    document.getElementById('loadMore').addEventListener('click', async function (event)  {
        console.log(page_number);
        event.preventDefault();
        await loadMoreBook(page_number);
        page_number++;
    });
});
