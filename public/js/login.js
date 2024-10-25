import { authenticateUser } from './role.js';

const loginForm = document.querySelector('#loginform');
const logoutBtn = document.querySelector('.logout-btn');

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const users = {
      username: formData.get('username'),
      password: formData.get('password'),
      role: formData.get("role"),
    };

    loginUser(users);
  });
} else {
  console.error('Login form not found');
}

export async function loginUser(users) {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(users),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login failed:', errorText);
      throw new Error('Login failed');
    }

    const data = await response.json();
    console.log('User data from API:', data);
    authenticateUser(data);
    console.log('Login successful:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Logout response:', data);
        console.log('Cookie after logout', document.cookie);
        window.location.href = '/login'; // Redirect to login page
      } else {
        console.error('Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  });
}