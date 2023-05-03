export const bookFetch = async (keyword, count, start) => {
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