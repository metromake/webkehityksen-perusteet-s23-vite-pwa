import {fetchData} from './functions';
import {UpdateResult} from './interfaces/UpdateResult';
import {UploadResult} from './interfaces/UploadResult';
import {LoginUser, UpdateUser, User} from './interfaces/User';
import {apiUrl, uploadUrl} from './variables';

// PWA code

// select forms from the DOM
const loginForm = document.querySelector('#login-form');
const profileForm = document.querySelector('#profile-form');
const avatarForm = document.querySelector('#avatar-form');

// select inputs from the DOM
const usernameInput = document.querySelector('#username') as HTMLInputElement;
const passwordInput = document.querySelector('#password') as HTMLInputElement;

const profileUsernameInput = document.querySelector(
  '#profile-username'
) as HTMLInputElement;
const profileEmailInput = document.querySelector(
  '#profile-email'
) as HTMLInputElement;

const avatarInput = document.querySelector('#avatar') as HTMLInputElement;

// select profile elements from the DOM
const usernameTarget = document.querySelector('#username-target');
const emailTarget = document.querySelector('#email-target');
const avatarTarget = document.querySelector<HTMLImageElement>('#avatar-target');

// TODO: function to login
const login = async (): Promise<LoginUser> => {
  const loginResponse = await fetchData<LoginUser>(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: usernameInput.value,
      password: passwordInput.value,
    }),
  });
  return loginResponse;
};

// TODO: function to update user data
const updateUserData = async (
  user: UpdateUser,
  token: string
): Promise<UpdateResult> => {
  const updateUserDataResponse = await fetchData<UpdateResult>(
    `${apiUrl}/users`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    }
  );
  return updateUserDataResponse;
};

const uploadAvatar = async (
  avatar: File,
  token: string
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('avatar', avatar);
  const uploadAvatarResponse = await fetchData<UploadResult>(
    `${apiUrl}/users/avatar`,
    {
      method: 'POST',
      headers: {
        contentType: 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
  return uploadAvatarResponse;
};

// TODO: function to add userdata (email, username and avatar image) to the
// Profile DOM and Edit Profile Form
const addUserDataToDom = (user: User): void => {
  if (usernameTarget) usernameTarget.textContent = user.username;
  if (emailTarget) emailTarget.textContent = user.email;
  if (avatarTarget) avatarTarget.src = `${uploadUrl}${user.avatar}`;
  profileUsernameInput.value = user.username;
  profileEmailInput.value = user.email;
};

// function to get userdata from API using token
const getUserData = async (token: string): Promise<User> => {
  const userDataResponse = await fetchData<User>(`${apiUrl}/users/token`, {
    headers: {
      contentType: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return userDataResponse;
};

// TODO: function to check local storage for token and if it exists fetch
// userdata with getUserData then update the DOM with addUserDataToDom
const checkToken = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (token) {
    const user = await getUserData(token);
    addUserDataToDom(user);
  }
};

// call checkToken on page load to check if token exists and update the DOM
checkToken();

// TODO: login form event listener
// event listener should call login function and save token to local storage
// then call addUserDataToDom to update the DOM with the user data
loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const user = await login();
  localStorage.setItem('token', user.token);
  addUserDataToDom(user.data);
});

// TODO: profile form event listener
// event listener should call updateUserData function and update the DOM with
// the user data by calling addUserDataToDom or checkToken
profileForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const token = localStorage.getItem('token');
  if (token) {
    const user = await updateUserData(
      {
        username: profileUsernameInput.value,
        email: profileEmailInput.value,
      },
      token
    );
    addUserDataToDom(user.data);
  }
});

// TODO: avatar form event listener
// event listener should call uploadAvatar function and update the DOM with
// the user data by calling addUserDataToDom or checkToken
avatarForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const token = localStorage.getItem('token');
  if (token && avatarInput.files) {
    await uploadAvatar(avatarInput.files[0], token);
    checkToken();
  }
});
