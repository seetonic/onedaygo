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
  
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const placesRes = await fetch(`${BASE_URL}/places/all`, { headers: getAdminHeaders() });
    const placesData = await placesRes.json();
    
    const rateRes = await fetch(`${BASE_URL}/settings/exchange-rate`);
    const rateData = await rateRes.json();
    
    if (placesData.success && rateData.success) {
      renderStats(placesData.data, rateData.data);
      renderRecentTable(placesData.data);
    }
  } catch (err) {
    console.error('Failed to load dashboard data', err);
  }
}

function renderStats(places, rateSetting) {
  document.getElementById('statTotalPlaces').textContent = places.length;
  
  const publishedCount = places.filter(p => p.isPublished).length;
  document.getElementById('statPublishedPlaces').textContent = publishedCount;
  
  if (rateSetting && rateSetting.value) {
    document.getElementById('statExchangeRate').textContent = `1 LKR = ${rateSetting.value} USD`;
  }
}

function renderRecentTable(places) {
  const table = document.getElementById('recentPlacesTable');
  
  const recent = [...places].slice(0, 5); // Controller already sorts by lastUpdated -1
  
  if (recent.length === 0) {
    table.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No places found.</td></tr>';
    return;
  }
  
  table.innerHTML = recent.map(place => {
    const publishedBadge = place.isPublished 
      ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">Yes</span>'
      : '<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">No</span>';
      
    const date = place.lastUpdated ? new Date(place.lastUpdated).toLocaleDateString() : 'N/A';
      
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 font-medium text-gray-900">${place.name}</td>
        <td class="px-6 py-4 text-gray-500">${place.category}</td>
        <td class="px-6 py-4 text-gray-500">${place.distanceFromBase} km</td>
        <td class="px-6 py-4">${publishedBadge}</td>
        <td class="px-6 py-4 text-gray-500">${date}</td>
      </tr>
    `;
  }).join('');
}
