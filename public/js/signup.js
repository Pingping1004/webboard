import { authenticateUser } from './role.js'

const signupForm = document.querySelector("#signupform");
const signupBtn = document.querySelector('.signup-btn');

  if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const users = {
        username: formData.get("username"),
        password: formData.get("password"),
        role: formData.get("role") || 'user',
        profilePicture: formData.get("profilePicture") || null,
        googleId: formData.get("googleId") || "",
      };

      console.log('Users object before signup:', users);
      signupUser(users);
    });
  }

  function validateForm(users) {
    if (!users.username || !users.password) {
      alert("Username and password are required");
      return false;
    }
    return true;
  }

  async function signupUser(users) {
    if (!validateForm(users)) return;
    try {
      const response = await fetch("http://localhost:3000/user/signup", {
        method: "POST",
        body: JSON.stringify(users),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Signup failed:', error);
        alert(`Signup failed: ${error.message || 'Unknown Error'}`);
      }

      const data = await response.json();
      console.log('User data from API:', data);
      authenticateUser(data);
      console.log("Signup successful:", data);
    } catch (error) {
        console.error("Error:", error.message);
        alert("An error occurred during signup. Please try again.");
    }
  }