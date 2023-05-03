export const bookFetchByKeyword = async (keyword, count, start) => {
    const query = JSON.stringify({
        query: `query {
            search_book_google_api(
                keyword: "${keyword}", count: ${count}, start : ${start}) {
                    cover,
                    book_id,
                    title
                }
            }
        `,
        variables: null
    });
    const response = await fetch('/graphql', {
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: query,
    });

    const responseJson = await response.json();
    return responseJson;
};

export const bookFetchById = async (bid) => {
    const query = JSON.stringify({
        query: `query {
            get_book_google_api(
                bid: "${bid}") {
                    title,
                    author,
                    genre,
                    cover,
                    description,
                    page_count
                }
            }
        `,
        variables: null
    });
    const response = await fetch('/graphql', {
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: query,
    });

    const responseJson = await response.json();
    return responseJson;
};

export const addToBooklist = async (bid, booklist, token) => {
    const query = JSON.stringify({
        query: `mutation {
            add_to_booklist(
                bid: "${bid}", booklist: "${booklist}")
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
};

export const deleteFromBooklist = async (bid, booklist, token) => {
    const query = JSON.stringify({
        query: `mutation {
            delete_from_booklist(
                bid: "${bid}", booklist: "${booklist}")
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
};