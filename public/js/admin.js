const userTableElement = document.querySelector('.user-table-element');
let users = [], role, userId, adminName;

document.addEventListener('DOMContentLoaded', () => {
  fetchAllUsers();
});

async function fetchAllUsers() {
  try {
    console.log('fetchAllUsers function is activated for dashboard page');
    const response = await fetch(`/admin/dashboard/users`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Response error:', errorData);
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    console.log('Raw data from server:', data);

    if (!data.users) {
      throw new Error('Users not found in response');
    }

    let { users, role, userId } = data;
    console.log('All render users:', users);
    renderUsers(users);
  } catch (error) {
    console.error('Error fetching all users for admin', error.message);
  }
}

function renderUsers(users) {
  const userTableBody = document.querySelector('.user-table tbody');

  // Clear existing table rows
  userTableBody.innerHTML = '';

  // Loop through the users array and create table rows
  users.forEach((user) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td class="role-cell" data-user-id="${user.id}">${user.role}</td>
      <td>
        <button class="edit-user-btn btn btn-secondary" data-user-id="${user.id}" data-editing="false">Edit</button>
        ${user.role !== 'admin'
          ?
          `<button class="delete-user-btn btn btn-danger" data-user-id="${user.id}">Delete</button>`
        : ''}
      </td>
    `;

    const editUserBtn = row.querySelector('.edit-user-btn');
    const deleteUserBtn = row.querySelector('.delete-user-btn');

    if (editUserBtn) {
      editUserBtn.addEventListener('click', (event) => {
        const userId = event.target.getAttribute('data-user-id');
        updateUsers(userId);
      });
    }

    if (user.role !== 'admin') {
      if (deleteUserBtn) {
        deleteUserBtn.addEventListener('click', (event) => {
          const userId = event.target.getAttribute('data-user-id');
          deleteUsers(userId);
        });
      }
    }

    userTableBody.appendChild(row);
  });
}

async function updateUsers(userId) {
  console.log(`Updating user with ID: ${userId}`)
  const editUserBtn = document.querySelector(`.edit-user-btn[data-user-id="${userId}"]`);
  const roleCell = document.querySelector(`.role-cell[data-user-id="${userId}"]`);
  let isEditing = editUserBtn.getAttribute('data-editing') === 'true';
  // let isEditing = false;

  if (isEditing) {
    // Save button is clicked
    const dropdownElement = roleCell.querySelector('.role-dropdown');
    const selectedRole = dropdownElement.value;
    await  saveUpdate(userId, selectedRole);

    editUserBtn.textContent = 'Edit';
    editUserBtn.classList.remove('btn-primary');
    editUserBtn.classList.add('btn-secondary');
    roleCell.textContent = selectedRole;

    // isEditing = false;
    editUserBtn.setAttribute('data-editing', 'false');
  } else {
    // Edit button is clicked
    let currentRole = roleCell.textContent.trim();
    console.log('CurrentRole value is', currentRole);

    const dropdownElement = document.createElement('select');
    dropdownElement.classList.add('role-dropdown');

    roleCell.textContent = '';
    ['user', 'admin'].forEach((role) => {
      const option = document.createElement('option');
      option.value = role;
      option.textContent = role;
      if (role === currentRole) {
        option.selected = true;
      }
      dropdownElement.appendChild(option);
    });

    roleCell.appendChild(dropdownElement);

    editUserBtn.textContent = 'Save';
    editUserBtn.classList.remove('btn-secondary');
    editUserBtn.classList.add('btn-primary');
      
    editUserBtn.setAttribute('data-editing', 'true');
  }
}

async function saveUpdate(userId, updatedRole) {
  try {
    const updatedUser = {
      role: updatedRole,
    };

    const response = await fetch(`/admin/update/${userId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    });

    if (response.ok) {
      const updatedUserData = await response.json();
      console.log(`Updated user's role successfully`, updatedUserData);
      fetchAllUsers();
    } else {
      throw new Error('Failed to update role: ' + response.statusText);
    }
  } catch (error) {
    console.error('Error updating role', error.message);
  }
}

window.deleteUsers = async function deleteUsers(userId) {
  try {
    console.log(`Deleting user with ID: ${userId}`);
    const response = await fetch(`/admin/delete/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
      const deletedUser = await response.json();
      console.log('Delete user successfully', deletedUser);
      fetchAllUsers();
    } else {
      const result = await response.json();
      console.error('Failed to remove user', result.message);
    }
  } catch (error) {
    console.error('Failed to delete user', error.message);
  }
}
