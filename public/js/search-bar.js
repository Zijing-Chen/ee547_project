document.addEventListener('DOMContentLoaded', async function () {
    document.getElementById('search-box').addEventListener('keydown', async function (event) {
      if (event.key === 'Enter') {
        const searchQuery = event.target.value;
        window.location.href = `/books/${searchQuery}.html`;
      }
    });
});
  
