const BASE_URL = 'http://localhost:5000/api';
let allPlaces = [];

function getAdminHeaders(isFormData = false) {
  const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
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
  loadPlaces();
});

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

async function loadPlaces() {
  try {
    const res = await fetch(`${BASE_URL}/places/all`, { headers: getAdminHeaders() });
    const data = await res.json();
    if (data.success) {
      allPlaces = data.data;
      renderTable();
    }
  } catch (err) {
    console.error('Failed to load places', err);
  }
}

function renderTable() {
  const tbody = document.getElementById('placesTableBody');
  
  if (allPlaces.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No places found. Add one!</td></tr>';
    return;
  }

  tbody.innerHTML = allPlaces.map(place => {
    const photoUrl = place.photos && place.photos.length > 0 
      ? `http://localhost:5000/${place.photos[0]}` 
      : 'https://via.placeholder.com/50?text=No+Img';
      
    const publishedBadge = place.isPublished 
      ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">Yes</span>'
      : '<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">No</span>';

    return `
      <tr class="hover:bg-gray-50 border-b border-gray-100 last:border-0">
        <td class="px-6 py-4">
          <img src="${photoUrl}" alt="${place.name}" class="h-10 w-10 rounded object-cover border border-gray-200">
        </td>
        <td class="px-6 py-4 font-medium text-gray-900">${place.name}</td>
        <td class="px-6 py-4 text-gray-500">${place.category}</td>
        <td class="px-6 py-4 text-gray-500">${place.distanceFromBase} km</td>
        <td class="px-6 py-4">${publishedBadge}</td>
        <td class="px-6 py-4 text-right space-x-2">
          <button onclick="openModal('${place._id}')" class="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
          <button onclick="handleDelete('${place._id}')" class="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openModal(id = null) {
  document.getElementById('placeForm').reset();
  document.getElementById('placeId').value = '';
  document.getElementById('modalTitle').textContent = 'Add New Place';
  
  if (id) {
    const place = allPlaces.find(p => p._id === id);
    if (place) {
      document.getElementById('modalTitle').textContent = 'Edit Place';
      document.getElementById('placeId').value = place._id;
      document.getElementById('name').value = place.name;
      document.getElementById('category').value = place.category;
      document.getElementById('description').value = place.description;
      if (place.coordinates && place.coordinates.coordinates) {
        document.getElementById('lng').value = place.coordinates.coordinates[0];
        document.getElementById('lat').value = place.coordinates.coordinates[1];
      }
      document.getElementById('distanceFromBase').value = place.distanceFromBase;
      document.getElementById('bestVisitTime').value = place.bestVisitTime || '';
      document.getElementById('openingHours').value = place.openingHours || '';
      document.getElementById('isPublished').checked = place.isPublished;
      
      if (place.entranceFee) {
        document.getElementById('feeLkr').value = place.entranceFee.LKR || '';
        document.getElementById('feeNote').value = place.entranceFee.note || '';
      }
      
      document.getElementById('travelTips').value = (place.travelTips || []).join('\n');
      document.getElementById('safetyWarnings').value = (place.safetyWarnings || []).join('\n');
    }
  }
  
  document.getElementById('placeModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('placeModal').classList.add('hidden');
}

async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append('photo', file);
  
  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: getAdminHeaders(true),
    body: formData
  });
  
  const data = await res.json();
  if (data.success) {
    return data.data.path;
  }
  throw new Error(data.message || 'Photo upload failed');
}

async function handleSavePlace(e) {
  e.preventDefault();
  
  const btn = document.getElementById('saveBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;
  
  try {
    const placeId = document.getElementById('placeId').value;
    const isEdit = !!placeId;
    
    // Upload photo first if selected
    const photoInput = document.getElementById('photoUpload');
    let photosArray = [];
    if (photoInput.files.length > 0) {
      const path = await uploadPhoto(photoInput.files[0]);
      photosArray.push(path);
    } else if (isEdit) {
      // Keep existing photos if no new photo uploaded
      const existingPlace = allPlaces.find(p => p._id === placeId);
      if (existingPlace && existingPlace.photos) {
        photosArray = existingPlace.photos;
      }
    }
    
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    
    const placeData = {
      name: document.getElementById('name').value,
      category: document.getElementById('category').value,
      description: document.getElementById('description').value,
      coordinates: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      distanceFromBase: parseFloat(document.getElementById('distanceFromBase').value),
      bestVisitTime: document.getElementById('bestVisitTime').value,
      openingHours: document.getElementById('openingHours').value,
      isPublished: document.getElementById('isPublished').checked,
      entranceFee: {
        LKR: parseInt(document.getElementById('feeLkr').value) || 0,
        note: document.getElementById('feeNote').value
      },
      travelTips: document.getElementById('travelTips').value.split('\n').map(s => s.trim()).filter(s => s),
      safetyWarnings: document.getElementById('safetyWarnings').value.split('\n').map(s => s.trim()).filter(s => s),
      photos: photosArray
    };
    
    const url = isEdit ? `${BASE_URL}/places/${placeId}` : `${BASE_URL}/places`;
    const method = isEdit ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: getAdminHeaders(),
      body: JSON.stringify(placeData)
    });
    
    const data = await res.json();
    if (data.success) {
      showToast('Place saved successfully');
      closeModal();
      loadPlaces();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Error saving place. Check console.');
  } finally {
    btn.textContent = 'Save Place';
    btn.disabled = false;
  }
}

async function handleDelete(id) {
  if (confirm('Are you sure you want to delete this place?')) {
    try {
      const res = await fetch(`${BASE_URL}/places/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast('Place deleted successfully');
        loadPlaces();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  }
}
