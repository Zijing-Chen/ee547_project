// get button
const loginButton = document.querySelector('#login-link-container button');

// check if the user logged in
const userIsLoggedIn = localStorage.getItem('token') !== null;

// update button text
if (userIsLoggedIn) {
  loginButton.textContent = "Logout";
} else {
  loginButton.textContent = "Login/Create User";
}

loginButton.addEventListener('click', handleButtonClick);


function handleButtonClick(event) {

  event.preventDefault();

  if (userIsLoggedIn) {
    // logout the user
    logoutUser();
    window.location.href = '/user/login.html';
  } else {
    // go to the login page
    window.location.href = "/user/login.html";
  }
}

//logout function
function logoutUser() {
  localStorage.removeItem('token');
  loginButton.textContent = "Login/Create User";
  window.location.reload();
}
