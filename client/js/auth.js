const BASE_URL = 'http://localhost:5000/api';

// Shared Helpers
function getToken() {
  return localStorage.getItem('token');
}

function isLoggedIn() {
  return !!getToken();
}

function getAuthHeaders() {
  return {
    'Authorization': 'Bearer ' + getToken(),
    'Content-Type': 'application/json'
  };
}

// Redirect logged in users away from login page
if (window.location.pathname.includes('login.html') && isLoggedIn()) {
  window.location.href = 'index.html';
}

function switchTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const errorMsg = document.getElementById('errorMsg');

  errorMsg.classList.add('hidden');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    loginTab.classList.add('border-green-600', 'text-green-600');
    loginTab.classList.remove('border-transparent', 'text-gray-500');
    registerTab.classList.remove('border-green-600', 'text-green-600');
    registerTab.classList.add('border-transparent', 'text-gray-500');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    registerTab.classList.add('border-green-600', 'text-green-600');
    registerTab.classList.remove('border-transparent', 'text-gray-500');
    loginTab.classList.remove('border-green-600', 'text-green-600');
    loginTab.classList.add('border-transparent', 'text-gray-500');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorMsg = document.getElementById('errorMsg');

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('userName', data.data.name);
      window.location.href = 'index.html';
    } else {
      errorMsg.textContent = data.message || 'Login failed';
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    errorMsg.textContent = 'Network error. Please try again later.';
    errorMsg.classList.remove('hidden');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const errorMsg = document.getElementById('errorMsg');

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('userName', data.data.name);
      window.location.href = 'index.html';
    } else {
      errorMsg.textContent = data.message || 'Registration failed';
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    errorMsg.textContent = 'Network error. Please try again later.';
    errorMsg.classList.remove('hidden');
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  window.location.reload();
}
