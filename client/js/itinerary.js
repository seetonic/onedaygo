// Relies on auth.js
let draftPlan = [];

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  
  if (!isLoggedIn()) {
    document.getElementById('mainContent').innerHTML = `
      <div class="text-center py-16">
        <h2 class="text-2xl font-semibold mb-4">Please login to view your itinerary</h2>
        <a href="login.html" class="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition font-medium">Login Now</a>
      </div>
    `;
    return;
  }
  
  loadDraft();
  loadSavedPlan();
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

function loadDraft() {
  draftPlan = JSON.parse(localStorage.getItem('itineraryDraft')) || [];
  renderDraft();
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

function renderDraft() {
  const list = document.getElementById('draftList');
  list.innerHTML = '';
  
  if (draftPlan.length === 0) {
    list.innerHTML = '<li class="text-gray-500 text-center py-4">No places added yet. Go to <a href="index.html" class="text-green-600 hover:underline">Home</a> to add places.</li>';
    document.getElementById('saveDraftBtn').disabled = true;
    document.getElementById('saveDraftBtn').classList.add('opacity-50', 'cursor-not-allowed');
    return;
  }
  
  document.getElementById('saveDraftBtn').disabled = false;
  document.getElementById('saveDraftBtn').classList.remove('opacity-50', 'cursor-not-allowed');

  draftPlan.forEach((place, index) => {
    const li = document.createElement('li');
    li.className = 'bg-white p-4 rounded shadow-sm border border-gray-100 mb-2 flex justify-between items-center cursor-move';
    li.draggable = true;
    li.dataset.index = index;
    
    li.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="text-gray-400"><i class="fas fa-grip-lines"></i></span>
        <span class="font-medium text-gray-800">${place.name}</span>
        <span class="text-xs px-2 py-0.5 rounded-full ${getCategoryColor(place.category)}">${place.category}</span>
      </div>
      <button onclick="removeFromDraft(${index})" class="text-red-500 hover:text-red-700 px-2 py-1 font-bold text-lg">
        &times;
      </button>
    `;
    
    list.appendChild(li);
  });
  
  enableDragAndDrop();
}

function removeFromDraft(index) {
  draftPlan.splice(index, 1);
  localStorage.setItem('itineraryDraft', JSON.stringify(draftPlan));
  renderDraft();
}

let dragSrcEl = null;

function enableDragAndDrop() {
  const items = document.querySelectorAll('#draftList li');
  
  items.forEach(item => {
    item.addEventListener('dragstart', function(e) {
      dragSrcEl = this;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);
      this.classList.add('opacity-50');
    });
    
    item.addEventListener('dragover', function(e) {
      if (e.preventDefault) e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      return false;
    });
    
    item.addEventListener('dragenter', function(e) {
      this.classList.add('border-green-500');
    });
    
    item.addEventListener('dragleave', function(e) {
      this.classList.remove('border-green-500');
    });
    
    item.addEventListener('drop', function(e) {
      if (e.stopPropagation) e.stopPropagation();
      if (dragSrcEl !== this) {
        const srcIndex = parseInt(dragSrcEl.dataset.index);
        const destIndex = parseInt(this.dataset.index);
        
        const temp = draftPlan[srcIndex];
        draftPlan[srcIndex] = draftPlan[destIndex];
        draftPlan[destIndex] = temp;
        
        localStorage.setItem('itineraryDraft', JSON.stringify(draftPlan));
        renderDraft(); 
      }
      return false;
    });
    
    item.addEventListener('dragend', function(e) {
      this.classList.remove('opacity-50');
      items.forEach(item => item.classList.remove('border-green-500'));
    });
  });
}

async function handleSave() {
  if (draftPlan.length === 0) return;
  
  const btn = document.getElementById('saveDraftBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;
  
  const payload = {
    places: draftPlan.map((p, idx) => ({ placeId: p.id, sequenceIndex: idx + 1 }))
  };
  
  try {
    const res = await fetch(`${BASE_URL}/itinerary`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (data.success) {
      alert('Itinerary saved successfully!');
      loadSavedPlan();
    } else {
      alert(data.message || 'Failed to save itinerary');
    }
  } catch (err) {
    console.error('Save error', err);
    alert('Error saving itinerary');
  } finally {
    btn.textContent = 'Save & Calculate Travel Times';
    btn.disabled = false;
  }
}

async function loadSavedPlan() {
  const container = document.getElementById('savedPlanContainer');
  container.innerHTML = '<p class="text-gray-500">Loading saved plan...</p>';
  
  try {
    const res = await fetch(`${BASE_URL}/itinerary`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    
    if (data.success && data.data && data.data.places && data.data.places.length > 0) {
      renderSavedPlan(data.data);
    } else {
      container.innerHTML = '<p class="text-gray-500 bg-white p-6 rounded shadow-sm border border-gray-100">No saved plan yet. Add places and save your draft to generate a travel plan.</p>';
    }
  } catch (err) {
    console.error('Load saved error', err);
    container.innerHTML = '<p class="text-red-500 bg-white p-6 rounded shadow-sm border border-red-100">Failed to load saved plan.</p>';
  }
}

function renderSavedPlan(itinerary) {
  const container = document.getElementById('savedPlanContainer');
  
  let html = `
    <div class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div class="bg-gray-50 p-4 border-b">
        <h3 class="font-semibold text-gray-800">Your Route</h3>
      </div>
      <ul class="divide-y divide-gray-200">
  `;
  
  // Add Start point
  html += `
    <li class="p-4 flex items-start">
      <div class="flex-shrink-0 bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">S</div>
      <div>
        <h4 class="font-bold text-gray-900">Deurumpitiya</h4>
        <p class="text-sm text-gray-500">Starting Point</p>
      </div>
    </li>
  `;
  
  itinerary.places.forEach((stop, idx) => {
    html += `
      <li class="p-4 flex items-start">
        <div class="flex-shrink-0 bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">${idx + 1}</div>
        <div class="flex-grow">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-bold text-gray-900">${stop.placeId.name}</h4>
              <p class="text-sm text-gray-500 mb-1">${stop.placeId.category}</p>
            </div>
            <span class="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">Travel: ~${stop.estimatedTravelTime} mins</span>
          </div>
        </div>
      </li>
    `;
  });
  
  html += `
      </ul>
      <div class="bg-gray-50 p-4 border-t flex justify-between items-center">
        <span class="font-medium text-gray-600">Total Travel Time:</span>
        <span class="font-bold text-lg text-green-700">~${itinerary.totalTravelTime} mins</span>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}
