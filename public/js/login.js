const updateCountryFetch = async (username, password) => {
    const query = JSON.stringify({
      query: `mutation {
            login(
              username: "${username}", password: "${password}")
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
    return responseJson.data;
  };

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('user-form');
    form.addEventListener('submit', (event) => {
        if (document.activeElement.value == "login") {
            console.log("here");
            updateCountryFetch(document.getElementById("username").value, document.getElementById("password").value)
            .then(res => {
                localStorage.setItem("token", res.login);
            });
        }
    });
});