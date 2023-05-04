document.addEventListener('DOMContentLoaded', async () => {
    const statusMessage = document.getElementById('status-message');


    if (localStorage.getItem('token')) {
        try {
            const user = await getUserData(localStorage.getItem('token'));
            statusMessage.innerText = `You are logged in as ${user}`;

        } catch (error) {
            console.error(error);
            statusMessage.innerText = 'Failed to retrieve user data';
        }
    } else {
        statusMessage.innerText = 'You are not logged in';
    }
});

async function getUserData(token) {
    const query = `
        query {
            user
        }
    `;

    const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authentication': token
        },
        body: JSON.stringify({ query })
    });

    const result = await response.json();

    if (result.errors) {
        throw new Error(result.errors[0].message);
    }

    return result.data.user;
}
