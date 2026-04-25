// Relies on auth.js being loaded before this file
let currentCategory = '';
let currentDistance = '';

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  fetchPlaces();
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

async function fetchPlaces() {
  const grid = document.getElementById('placesGrid');

  // Show spinner
  grid.innerHTML = `
    <div class="col-span-full flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
    </div>
  `;

  let url = `${BASE_URL}/places?`;
  if (currentCategory) url += `category=${currentCategory}&`;
  if (currentDistance) url += `distance=${currentDistance}&`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      renderCards(data.data);
    } else {
      grid.innerHTML = '<p class="col-span-full text-center text-red-600 py-10">Failed to load places. Please try again.</p>';
    }
  } catch (err) {
    console.error('Error fetching places:', err);
    grid.innerHTML = '<p class="col-span-full text-center text-red-600 py-10">Failed to load places. Please try again.</p>';
  }
}

function setCategory(cat) {
  currentCategory = cat;
  updateFilterStyles('category', cat);
  fetchPlaces();
}

function setDistance(dist) {
  currentDistance = dist;
  updateFilterStyles('distance', dist);
  fetchPlaces();
}

function updateFilterStyles(type, value) {
  const buttons = document.querySelectorAll(`.${type}-filter`);
  buttons.forEach(btn => {
    if (btn.dataset.value === value) {
      btn.classList.add('bg-green-600', 'text-white');
      btn.classList.remove('bg-gray-200', 'text-gray-700');
    } else {
      btn.classList.remove('bg-green-600', 'text-white');
      btn.classList.add('bg-gray-200', 'text-gray-700');
    }
  });
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

function renderCards(places) {
  const grid = document.getElementById('placesGrid');
  grid.innerHTML = '';

  if (places.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16">
        <p class="text-4xl mb-4">🗺️</p>
        <p class="text-gray-600 font-medium">No places found for this filter.</p>
        <p class="text-gray-400 text-sm mt-1">Try a different category.</p>
      </div>
    `;
    return;
  }

  places.forEach(place => {
    const photoUrl = place.photos && place.photos.length > 0 
      ? `http://localhost:5000/${place.photos[0]}` 
      : 'https://via.placeholder.com/400x250?text=No+Image';

    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col';
    
    card.innerHTML = `
      <img src="${photoUrl}" alt="${place.name}" class="w-full h-48 object-cover">
      <div class="p-4 flex flex-col flex-grow">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-xl font-semibold text-gray-800">${place.name}</h3>
          <span class="text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(place.category)}">
            ${place.category}
          </span>
        </div>
        <p class="text-gray-600 text-sm mb-2"><i class="fas fa-map-marker-alt"></i> ${place.distanceFromBase} km from Deurumpitiya</p>
        <p class="text-gray-600 text-sm mb-4 flex-grow"><i class="far fa-clock"></i> ${place.openingHours || 'Not specified'}</p>
        <a href="place-detail.html?id=${place._id}" class="block text-center w-full bg-green-50 text-green-700 font-medium py-2 rounded hover:bg-green-100 transition mt-auto">View Details</a>
      </div>
    `;
    grid.appendChild(card);
  });
}
