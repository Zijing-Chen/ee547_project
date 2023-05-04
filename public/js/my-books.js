import {addToBooklist, deleteFromBooklist} from './utility.js';
const fetchBooklist = async (booklist, token) => {
    const query = JSON.stringify({
        query: `query {
            fetch_user_booklist(
                booklist: "${booklist}") {
                    cover,
                    title,
                    author,
                    book_id
                }
            }
        `,
        variables: null
    });
    const response = await fetch('/graphql', {
        headers: {
            'content-type': 'application/json',
            'authentication': token
        },
        method: 'POST',
        body: query,
    });

    const responseJson = await response.json();
    return responseJson;
    
}

const addBookListListener = async () => {

    const bookListButtons = Object.values(document.getElementsByClassName("booklist-action-button"));
    bookListButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const options = ["read", "currentlyReading", "wantToRead", "delete"];
            const url = new URL(window.location.href);
            const cur_booklist = url.pathname.split('/')[3].split('.')[0];
            const new_booklist = options[event.target.form[0].options.selectedIndex];
            if (cur_booklist == "all") {
                await deleteFromBooklist(event.target.form.firstChild.name, "read", localStorage.getItem("token"));
                await deleteFromBooklist(event.target.form.firstChild.name, "currentlyReading", localStorage.getItem("token"));
                await deleteFromBooklist(event.target.form.firstChild.name, "wantToRead", localStorage.getItem("token"));
            } 
            else {
                await deleteFromBooklist(event.target.form.firstChild.name, cur_booklist, localStorage.getItem("token"));
            }
            if (new_booklist != "delete") {
                await addToBooklist(event.target.form.firstChild.name, new_booklist, localStorage.getItem("token"));
            }
            window.location.href = url;
        });
    });

}
document.addEventListener('DOMContentLoaded', async function ()  {
    const book_table = document.getElementById('books');
    const url = new URL(window.location.href);
    const booklist = url.pathname.split('/')[3].split('.')[0]; 
    fetchBooklist(booklist, localStorage.getItem("token"))
    .then(async (res) => {
        if (res.data.fetch_user_booklist){
            res.data.fetch_user_booklist.forEach(book => {
                let row = document.createElement('tr');
                let cover_td = document.createElement('td');
                let cover = document.createElement('img');
                cover.src = book.cover;
                cover.alt = book.title;
                cover.classList.add("cover-img");
                cover_td.appendChild(cover);
                row.appendChild(cover_td);

                let title_td = document.createElement('td');
                let title = document.createElement('a');
                title.innerHTML = book.title;
                title.href = `/book/${book.book_id}.html`;
                title.classList.add("title");
                title_td.appendChild(title);
                row.appendChild(title_td);

                let author_td = document.createElement('td');
                book.author.forEach(a => {
                    let author = document.createElement('a');
                    author.classList.add("author");
                    author.innerHTML = a;
                    author.href = `/books/inauthor:${a}`;
                    author_td.appendChild(author);
                    let space_element = document.createElement('span');
                    space_element.innerHTML = "&nbsp&nbsp";
                    author_td.appendChild(space_element);
                });
                row.appendChild(author_td);

                let action_td = document.createElement('td');
                let form_element = document.createElement('form');
                let select_element = document.createElement('select');
                select_element.name = book.book_id;
                let option_element1 = document.createElement('option');
                option_element1.value = "read";
                option_element1.innerHTML = "read";
                select_element.appendChild(option_element1);

                let option_element2 = document.createElement('option');
                option_element2.value = "currentlyReading";
                option_element2.innerHTML = "currently reading"
                select_element.appendChild(option_element2);

                let option_element3 = document.createElement('option');
                option_element3.value = "wantToRead";
                option_element3.innerHTML = "want to read";
                select_element.appendChild(option_element3);

                let option_element4 = document.createElement('option');
                option_element4.value = "delete";
                option_element4.innerHTML = "delete";
                select_element.appendChild(option_element4);
                form_element.appendChild(select_element);
                let button_element = document.createElement('button');
                button_element.type = "submit";
                button_element.innerHTML = "submit";
                button_element.classList.add("booklist-action-button")
                form_element.appendChild(button_element);
                form_element.classList.add("booklist-action-form");
                action_td.appendChild(form_element);

                row.appendChild(action_td);
                book_table.appendChild(row);
            });
        }
    })
    .then(() => {
        addBookListListener();
    });
    
});