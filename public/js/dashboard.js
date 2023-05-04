document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
      window.location.href = '/user/login.html';
    }
  });
  