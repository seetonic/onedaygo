// Relies on auth.js
let map;

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
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

// Called by Google Maps script
window.initMap = async function() {
  let start = { name: "Deurumpitiya", lat: 6.8476, lng: 80.3647 };
  try {
    const res = await fetch(`${BASE_URL}/settings/starting-point`);
    const data = await res.json();
    if (data.success && data.data) {
      start = data.data;
    }
  } catch (err) {
    console.error('Failed to fetch starting point', err);
  }

  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: start.lat, lng: start.lng },
    zoom: 12
  });

  // Start Marker
  const startMarker = new google.maps.Marker({
    position: { lat: start.lat, lng: start.lng },
    map,
    title: start.name,
    label: {
      text: 'START',
      color: 'black',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    icon: {
      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      labelOrigin: new google.maps.Point(15, -10)
    }
  });

  const startInfoWindow = new google.maps.InfoWindow();
  startMarker.addListener('click', () => {
    startInfoWindow.setContent(`<div class="p-2 font-bold text-gray-800">${start.name} (Starting Point)</div>`);
    startInfoWindow.open(map, startMarker);
  });

  try {
    const res = await fetch(`${BASE_URL}/places`);
    const data = await res.json();
    if (data.success && data.data) {
      addMarkers(data.data);
    }
  } catch (err) {
    console.error('Failed to fetch places for map', err);
  }
};

function getCategoryLabel(category) {
  switch(category) {
    case 'Religious': return 'R';
    case 'Nature': return 'N';
    case 'Heritage': return 'H';
    case 'Leisure': return 'L';
    default: return 'P';
  }
}

function addMarkers(places) {
  const infoWindow = new google.maps.InfoWindow();

  places.forEach(place => {
    if (!place.coordinates || !place.coordinates.coordinates) return;
    
    const [lng, lat] = place.coordinates.coordinates;

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: place.name,
      label: {
        text: getCategoryLabel(place.category),
        color: 'white',
        fontWeight: 'bold'
      },
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    marker.addListener('click', () => {
      const content = `
        <div class="p-1 min-w-[150px]">
          <h3 class="font-bold text-lg mb-1">${place.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${place.category}</p>
          <a href="place-detail.html?id=${place._id}" class="text-green-600 hover:text-green-800 font-medium text-sm">View Details &rarr;</a>
        </div>
      `;
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
    });
  });
}
