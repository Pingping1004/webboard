const titleInput = document.querySelector("#title-input");
const contentInput = document.querySelector("#content-input");
const postPictureInput = document.querySelector('#post-picture-input');
const createPostBtn = document.querySelector("#create-post-btn");
const mainFeed = document.querySelector(".main-content");
const editPostBtn = document.querySelectorAll(".edit-post-btn");
const signUpLoginBtn = document.querySelector('.signup-login-btn');
const logoutBtn = document.querySelector('.logout-btn');

let articles = [];
let edittingIndex = null;
let loggedInUserId = null;
let postId = null;
let loggedInUserRole = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchAllPosts();
});

async function fetchAllPosts() {
    try {
        const response = await fetch('/post/feed');

        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        let { posts, userId, role } = data;

        articles = posts;
        loggedInUserId = userId;
        loggedInUserRole = role;

        console.log('All render posts:', articles);
        renderPosts();
    } catch (error) {
        console.error('Error fetching all posts:', error.message);
    }
}

async function addPost() {
    const currentDate = new Date();
    const formData = new FormData();

    if (titleInput.value === '') {
        alert(`You can't post with no post title`);
        return;
    }

    formData.append('title', titleInput.value);
    formData.append('content', contentInput.value);
    formData.append('date', currentDate.toISOString());

    for (let i = 0; i < postPicture.files.length; i ++) {
        formData.append('pictures', postPicture.files[i]);
    }

    try {
        const response = await fetch('post/create', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const newPost = await response.json();
            articles.push(newPost);
            console.log('New created post', newPost);
            await fetchAllPosts();
            clearInput();
        } else {
            const errorResponse = await response.json();
            console.error('Failed to create post:', errorResponse);
            alert('Failed to create post:', errorResponse.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error creating post:', error.message);
        alert('An error occurred while creating the post');
    }
}

createPostBtn.addEventListener("click", addPost);

function clearInput() {
  titleInput.value = "";
  contentInput.value = "";
  postPictureInput.value = "";
}

async function renderPosts() {
    mainFeed.innerHTML = '';

    articles.forEach((article) => {
        const mainFeedList = document.createElement('div');
        mainFeedList.classList.add('main-feed-list');

        mainFeedList.id = `post-${article.postId}`;

        mainFeedList.innerHTML = `
        <div id="post-${article.postId}">
            <h3 class="article-title" id="title-input-${article.postId}">${article.title}</h3>
            <p class="article-content" id="content-input-${article.postId}">${article.content}</p>
            <p class="post-author-id">Author ID: ${article.author.id}</p>
            <p class="post-id">Post ID: ${article.postId}</p>
            <p class="login-user-id">Login ID: ${loggedInUserId}</p>
            <div class="post-pictures">
                ${
                article.pictures && article.pictures.length > 0
                ? article.pictures.map(picture => `<img src="${picture.pictureUrl || 'placeholder.jpg'}" alt="Post picture"/>`).join('')
                : '<p>No pictures</p>' // Fallback message
                }
            </div>
            ${article.author.userId === loggedInUserId
            ? `<button id="edit-btn-${article.postId}" class="edit-post-btn btn btn-secondary" data-post-id="${article.postId}">Edit</button>
            <button id="delete-btn-${article.postId}" class="delete-post-btn btn btn-danger" data-post-id="${article.postId}">Delete</button>`
            : ''}
            ${loggedInUserRole === 'admin' && article.author.id !== loggedInUserId
                ? `<button id="delete-btn-${article.postId}" class="delete-post-btn btn btn-danger" data-post-id="${article.postId}">Delete</button>`
            : ''}
            ${article.author.userId === loggedInUserId && loggedInUserRole === 'admin' ? '' : ''}
        </div>`;

        if (article.author.userId === loggedInUserId || loggedInUserRole === 'admin') {
            const editBtn = mainFeedList.querySelector('.edit-post-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (event) => {
                    const postId = event.target.getAttribute('data-post-id');
                    console.log(`Edit mode activated for postId: ${postId}`);
                    editPost(postId, editBtn);
                });
            }

            const deleteBtn = mainFeedList.querySelector('.delete-post-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (event) => {
                    const postId = event.target.getAttribute('data-post-id');
                    deletePost(postId);
                });
            }
        }

        mainFeed.append(mainFeedList);
    });
}

function editPost(postId) {
    const postElement = document.querySelector(`#post-${postId}`);
    const editBtn= postElement.querySelector(`#edit-btn-${postId}`);
    const titleElement = postElement.querySelector('.article-title');
    const contentElement = postElement.querySelector('.article-content');
    const isEditing = editBtn.textContent === 'Save';

    console.log('Edit mode activated on the postId:', postId);

    if (isEditing) {
        savePost(postId);
    } else {
        editBtn.textContent = 'Save';
        editBtn.classList.remove('btn-secondary');
        editBtn.classList.add('btn-primary');

        titleElement.contentEditable = true;
        contentElement.contentEditable = true;
    }
}

async function savePost(postId) {
    const postElement = document.querySelector(`#post-${postId}`);
    const titleElement = postElement.querySelector('.article-title');
    const contentElement = postElement.querySelector('.article-content');
    const editBtn = postElement.querySelector(`#edit-btn-${postId}`);
  
    const newTitle = titleElement.textContent;
    const newContent = contentElement.textContent;
  
    if (!newTitle) {
      alert("You can't post with an empty title");
      return;
    }
  
    const updatedPost = {
      title: newTitle,
      content: newContent,
    };

    try {
        const response = await fetch(`/post/update/${postId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPost),
        });

        if (response.ok) {
            const updatedPostData = await response.json();
            console.log('Update post successfully', updatedPostData);

            titleElement.textContent = updatedPost.title;
            contentElement.textContent = updatedPost.content;

            editBtn.textContent = 'Edit';
            editBtn.classList.remove('btn-primary');
            editBtn.classList.add('btn-secondary');

            titleElement.contentEditable = false;
            contentElement.contentEditable = false;
            clearInput();
        } else {
            throw new Error('Failed to update post:', response.statusText);
        }
    } catch (error) {
        console.error('Error saving post:', error.message);
    }
}

window.deletePost = async function deletePost(postId) {
    try {
        console.log('postId to delete:',  postId);
        const response = await fetch(`/post/delete/${postId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            const postElement = document.getElementById(`post-${postId}`);
            if (postElement) {
                postElement.remove();
            } else {
                console.error(`Post element with ID post-${postId} not found in DOM`);
            }

            const deletedPost = await response.json();
            console.log('Deleted post:', deletedPost);

            articles = articles.filter(article => article.postId !== parseInt(postId, 10));
            console.log('Post deleted successfully');
            renderPosts();
        } else {
            const result = await response.json();
            alert('Failed to remove post' + result.message);
            console.error('Failed to remove post:', result.message);
        }
    } catch (error) {
        console.error('Failed to delete post', error.message);
    }
}