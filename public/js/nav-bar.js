// get the button element
const loginButton = document.querySelector('#login-link-container button');

// check if the user is logged in
const userIsLoggedIn = localStorage.getItem('token') !== null;

// update the button text based on whether the user is logged in or not
if (userIsLoggedIn) {
  loginButton.textContent = "Logout";
} else {
  loginButton.textContent = "Login/Create User";
}

// add a click event listener to the button
loginButton.addEventListener('click', handleButtonClick);

// define the button click handler function
function handleButtonClick(event) {
  // prevent the button from submitting the form
  event.preventDefault();

  // check if the user is logged in
  if (userIsLoggedIn) {
    // logout the user
    logoutUser();
    // redirect to the login page after logout
    window.location.href = '/user/login.html';
  } else {
    // go to the login page
    window.location.href = "/user/login.html";
  }
}

// define the logout function
function logoutUser() {
  // remove the token from localStorage
  localStorage.removeItem('token');

  // update the button text
  loginButton.textContent = "Login/Create User";
  window.location.reload();
}
