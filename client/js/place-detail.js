// Relies on auth.js
const urlParams = new URLSearchParams(window.location.search);
const placeId = urlParams.get('id');
let currentPlace = null;
let exchangeRate = 0.0033;

document.addEventListener('DOMContentLoaded', () => {
  if (!placeId) {
    document.body.innerHTML = '<div class="text-center mt-10 text-red-500">Invalid Place ID</div>';
    return;
  }
  updateNavbar();
  fetchExchangeRate().then(() => fetchPlaceDetails());
});

function updateNavbar() {
  const authSection = document.getElementById('authSection');
  const authSectionMobile = document.getElementById('authSectionMobile');
  
  let desktopHtml = '';
  let mobileHtml = '';
  
  if (isLoggedIn()) {
    const name = localStorage.getItem('userName') || 'User';
    desktopHtml = `
      <span class="text-gray-700 mr-4">Hi, ${name}</span>
      <button onclick="handleLogout()" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Logout</button>
    `;
    mobileHtml = `
      <div class="px-3 py-2 text-base font-medium text-gray-700">Hi, ${name}</div>
      <button onclick="handleLogout()" class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50">Logout</button>
    `;
  } else {
    desktopHtml = `
      <a href="login.html" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Login</a>
    `;
    mobileHtml = `
      <a href="login.html" class="block px-3 py-2 rounded-md text-base font-medium text-green-700 hover:bg-gray-50">Login</a>
    `;
  }
  
  if (authSection) authSection.innerHTML = desktopHtml;
  if (authSectionMobile) authSectionMobile.innerHTML = mobileHtml;
}

async function fetchExchangeRate() {
  try {
    const res = await fetch(`${BASE_URL}/settings/exchange-rate`);
    const data = await res.json();
    if (data.success && data.data && data.data.value) {
      exchangeRate = data.data.value;
    }
  } catch (err) {
    console.error('Failed to fetch exchange rate', err);
  }
}

async function fetchPlaceDetails() {
  try {
    const res = await fetch(`${BASE_URL}/places/${placeId}`);
    const data = await res.json();
    if (data.success && data.data) {
      currentPlace = data.data;
      renderPlace(currentPlace);
    } else {
      document.getElementById('contentArea').innerHTML = '<div class="text-center mt-10 text-red-500">Place not found.</div>';
    }
  } catch (err) {
    console.error('Error fetching place:', err);
  }
}

function getCategoryColor(category) {
  switch(category) {
    case 'Religious': return 'bg-yellow-100 text-yellow-800';
    case 'Nature': return 'bg-green-100 text-green-800';
    case 'Heritage': return 'bg-orange-100 text-orange-800';
    case 'Leisure': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function renderPlace(place) {
  document.getElementById('placeName').textContent = place.name;
  
  const catBadge = document.getElementById('categoryBadge');
  catBadge.textContent = place.category;
  catBadge.className = `px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(place.category)}`;
  
  document.getElementById('distanceBadge').textContent = `${place.distanceFromBase} km from Deurumpitiya`;
  
  const photoGallery = document.getElementById('photoGallery');
  if (place.photos && place.photos.length > 0) {
    photoGallery.innerHTML = place.photos.map(photo => 
      `<img src="http://localhost:5000/${photo}" alt="${place.name}" class="h-64 w-auto object-cover rounded shadow flex-shrink-0">`
    ).join('');
  } else {
    photoGallery.innerHTML = `<div class="h-64 w-full bg-gray-200 rounded flex items-center justify-center text-gray-500">No photos available</div>`;
  }
  
  document.getElementById('description').textContent = place.description;
  
  const tipsList = document.getElementById('travelTips');
  if (place.travelTips && place.travelTips.length > 0) {
    tipsList.innerHTML = place.travelTips.map(tip => `<li>${tip}</li>`).join('');
  } else {
    tipsList.innerHTML = '<li>No specific tips.</li>';
  }
  
  const safetySection = document.getElementById('safetySection');
  if (place.safetyWarnings && place.safetyWarnings.length > 0) {
    safetySection.classList.remove('hidden');
    document.getElementById('safetyWarnings').innerHTML = place.safetyWarnings.map(warning => `<li>${warning}</li>`).join('');
  }
  
  document.getElementById('openingHours').textContent = place.openingHours || 'Not specified';
  
  const lkrFee = place.entranceFee && place.entranceFee.LKR ? place.entranceFee.LKR : 0;
  const usdFee = (lkrFee * exchangeRate).toFixed(2);
  const note = place.entranceFee && place.entranceFee.note ? ` (${place.entranceFee.note})` : '';
  
  document.getElementById('feeLKR').textContent = lkrFee === 0 ? 'Free' : `LKR ${lkrFee}${note}`;
  if (lkrFee > 0) {
    document.getElementById('feeUSD').textContent = `~ USD ${usdFee}`;
    document.getElementById('feeUSD').classList.remove('hidden');
  }
  
  document.getElementById('bestVisitTime').textContent = place.bestVisitTime || 'Anytime';
  
  if (place.lastUpdated) {
    const d = new Date(place.lastUpdated);
    document.getElementById('lastUpdated').textContent = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

function handleAddToItinerary() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  
  let draft = JSON.parse(localStorage.getItem('itineraryDraft')) || [];
  
  if (draft.some(p => p.id === placeId)) {
    showMsg('Already in your itinerary', 'red');
    return;
  }
  
  if (draft.length >= 6) {
    showMsg('You have reached the 6 place limit', 'red');
    return;
  }
  
  draft.push({
    id: placeId,
    name: currentPlace.name,
    category: currentPlace.category
  });
  
  localStorage.setItem('itineraryDraft', JSON.stringify(draft));
  showMsg('Added to your itinerary plan', 'green');
}

function showMsg(text, color) {
  const msgDiv = document.getElementById('actionMsg');
  msgDiv.textContent = text;
  msgDiv.className = color === 'green' 
    ? 'mt-4 p-3 rounded text-center text-green-700 bg-green-100' 
    : 'mt-4 p-3 rounded text-center text-red-700 bg-red-100';
  msgDiv.classList.remove('hidden');
  setTimeout(() => msgDiv.classList.add('hidden'), 3000);
}
