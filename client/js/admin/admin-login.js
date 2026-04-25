const BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('adminToken')) {
    window.location.href = 'dashboard.html';
  }
});

async function handleAdminLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorMsg = document.getElementById('errorMsg');
  
  try {
    const res = await fetch(`${BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem('adminToken', data.data.token);
      window.location.href = 'dashboard.html';
    } else {
      errorMsg.textContent = data.message || 'Login failed';
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    errorMsg.textContent = 'Network error. Please try again later.';
    errorMsg.classList.remove('hidden');
  }
}
