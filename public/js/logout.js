document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        logout();
      });
    }
  });
  
function logout() {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    // Redirect the user to the login page
    window.location.href = '/user/login.html';
}
  