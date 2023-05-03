const loginFetch = async (username, password) => {
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
    return responseJson;
  };

const registerFetch = async (username, password) => {
    const query = JSON.stringify({
        query: `mutation {
            user_create(
                username: "${username}", password: "${password}") {
                    username
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

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('user-form');
    document.getElementById('flash').style.display = 'none';
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (document.activeElement.value == "login") {
            if (localStorage.getItem("token")) {
                document.getElementById('flash').innerHTML = "Already logged in.";
                document.getElementById('flash').style.display = 'block';
                document.getElementById('flash').style.color = "red";
            }
            else {
                loginFetch(document.getElementById("username").value, document.getElementById("password").value)
                .then(res => {
                    if (!res.data){
                        document.getElementById('flash').innerHTML = "Login failed.";
                        document.getElementById('flash').style.display = 'block';
                        document.getElementById('flash').style.color = "red";
                    }
                    else {
                        document.getElementById('flash').innerHTML = "Login succeeded.";
                        document.getElementById('flash').style.display = 'block';
                        document.getElementById('flash').style.color = "black";
                        localStorage.setItem("token", res.data.login);
                    }
                });
            }
        }
        else if (document.activeElement.value == "register") {
            registerFetch(document.getElementById("username").value, document.getElementById("password").value)
            .then(res => {
                if (!res.data) {
                    document.getElementById('flash').innerHTML = "Registration failed.";
                    document.getElementById('flash').style.display = 'block';
                    document.getElementById('flash').style.color = "red";
                }
                else {
                    document.getElementById('flash').innerHTML = "Registration succeeded";
                    document.getElementById('flash').style.display = 'block';
                    document.getElementById('flash').style.color = "black";
                }
            })
        }
    });
});