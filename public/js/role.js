export function authenticateUser(data) {
    const users = {
      username: data.username,
      role: data.role,
      profilePicture: data.profilePicture,
      token: data.token,
    };

    localStorage.setItem("user", JSON.stringify(users));

    // Check if userId exists in the data before redirecting
    if (!data.userId) {
      console.error('User ID is missing in the response data.');
      return;
    }
    
    if (users.role === "admin") {
      window.location.href = `/auth/admin/index/${data.userId}`;
    } else {
      window.location.href = `/auth/index/${data.userId}`;
    }
    console.log('Redirecting to:', users.role === 'admin'? `/auth/admin/index/${data.userId}`: `/auth/index/${data.userId}`);
  }