const BASE_URL = 'http://localhost:5000/api';

function getAdminHeaders() {
  return {
    'Authorization': 'Bearer ' + localStorage.getItem('adminToken'),
    'Content-Type': 'application/json'
  };
}

function handleAdminLogout() {
  localStorage.removeItem('adminToken');
  window.location.href = 'admin-login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('adminToken')) {
    window.location.href = 'admin-login.html';
    return;
  }
  loadSettings();
  loadStartingPoint();
});

async function loadSettings() {
  try {
    const res = await fetch(`${BASE_URL}/settings/exchange-rate`);
    const data = await res.json();
    if (data.success && data.data) {
      document.getElementById('currentRateDisplay').textContent = `1 LKR = ${data.data.value} USD`;
      document.getElementById('exchangeRate').value = data.data.value;
    }
  } catch (err) {
    console.error('Failed to load settings', err);
    document.getElementById('currentRateDisplay').textContent = 'Error loading rate';
  }
}

async function handleSaveSettings(e) {
  e.preventDefault();
  
  const btn = document.getElementById('saveBtn');
  const successMsg = document.getElementById('successMsg');
  const errorMsg = document.getElementById('errorMsg');
  
  btn.textContent = 'Saving...';
  btn.disabled = true;
  successMsg.classList.add('hidden');
  errorMsg.classList.add('hidden');
  
  try {
    const newRate = parseFloat(document.getElementById('exchangeRate').value);
    
    const res = await fetch(`${BASE_URL}/settings/exchange-rate`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ value: newRate })
    });
    
    const data = await res.json();
    
    if (data.success) {
      successMsg.textContent = 'Exchange rate updated successfully';
      successMsg.classList.remove('hidden');
      loadSettings(); // Reload to update current rate display
    } else {
      errorMsg.textContent = data.message || 'Failed to update settings';
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = 'Network error. Please try again.';
    errorMsg.classList.remove('hidden');
  } finally {
    btn.textContent = 'Save Settings';
    btn.disabled = false;
  }
}

async function loadStartingPoint() {
  try {
    const res = await fetch(`${BASE_URL}/settings/starting-point`);
    const data = await res.json();
    if (data.success && data.data) {
      document.getElementById('spName').value = data.data.name;
      document.getElementById('spLat').value = data.data.lat;
      document.getElementById('spLng').value = data.data.lng;
    }
  } catch (err) {
    console.error('Failed to load starting point', err);
  }
}

async function handleSaveStartingPoint(e) {
  e.preventDefault();
  
  const btn = document.getElementById('spSaveBtn');
  const successMsg = document.getElementById('spSuccessMsg');
  const errorMsg = document.getElementById('spErrorMsg');
  
  btn.textContent = 'Saving...';
  btn.disabled = true;
  successMsg.classList.add('hidden');
  errorMsg.classList.add('hidden');
  
  try {
    const name = document.getElementById('spName').value;
    const lat = parseFloat(document.getElementById('spLat').value);
    const lng = parseFloat(document.getElementById('spLng').value);
    
    const res = await fetch(`${BASE_URL}/settings/starting-point`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ name, lat, lng })
    });
    
    const data = await res.json();
    
    if (data.success) {
      successMsg.textContent = 'Starting point updated successfully';
      successMsg.classList.remove('hidden');
      loadStartingPoint();
    } else {
      errorMsg.textContent = data.message || 'Failed to update starting point';
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = 'Network error. Please try again.';
    errorMsg.classList.remove('hidden');
  } finally {
    btn.textContent = 'Save Starting Point';
    btn.disabled = false;
  }
}
