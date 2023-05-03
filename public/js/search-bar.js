document.addEventListener('DOMContentLoaded', async function ()  {
    document.getElementById('search-box').addEventListener('keyup', async function (event)  {
        const searchQuery = event.target.value;
        window.location.href = `/books/${searchQuery}.html`; 
    });
});