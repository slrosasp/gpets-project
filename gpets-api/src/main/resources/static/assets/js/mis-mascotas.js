import { auth } from "/assets/js/firebaseConfiguration.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { showMessage } from '/assets/js/showMessage.js';

console.log("🚀 MIS-MASCOTAS CARGADO");

// ============================================
// VARIABLES GLOBALES
// ============================================
let currentUser = null;
let pets = [];

// ============================================
// CONFIGURACIÓN DEL MENÚ DESPLEGABLE
// ============================================
function setupUserMenu() {
  const menuButton = document.getElementById('userMenuButton');
  const dropdown = document.getElementById('userDropdown');
  
  if (!menuButton || !dropdown) return;
  
  menuButton.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });
  
  document.addEventListener('click', function(e) {
    if (!menuButton.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

// ============================================
// CARGAR DATOS DEL USUARIO EN NAVBAR
// ============================================
function loadNavbarData(user) {
  const navUserName = document.getElementById('navUserName');
  const navUserEmail = document.getElementById('navUserEmail');
  const dropdownUserName = document.getElementById('dropdownUserName');
  const dropdownUserEmail = document.getElementById('dropdownUserEmail');
  const avatarIcon = document.getElementById('userAvatarIcon');
  const avatarImage = document.getElementById('userAvatarImage');
  
  if (!navUserName || !navUserEmail) return;
  
  const displayName = user.displayName || 'Usuario';
  const email = user.email || '';
  
  navUserName.textContent = displayName.split(' ')[0];
  navUserEmail.textContent = email;
  if (dropdownUserName) dropdownUserName.textContent = displayName;
  if (dropdownUserEmail) dropdownUserEmail.textContent = email;
  
  if (user.photoURL && avatarImage) {
    avatarImage.src = user.photoURL;
    avatarImage.classList.remove('hidden');
    avatarIcon.classList.add('hidden');
  }
}

// ============================================
// CARGAR MASCOTAS DESDE EL BACKEND
// ============================================
async function loadPets() {
  try {
    const token = await auth.currentUser.getIdToken();
    const ownerId = auth.currentUser.uid;
    
    const response = await fetch(`/api/pets?ownerId=${ownerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      pets = await response.json();
      renderPetsTable();
      console.log('✅ Mascotas cargadas:', pets.length);
    } else {
      console.error('❌ Error cargando mascotas:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    showMessage('Error al cargar tus mascotas', 'error');
  }
}

// ============================================
// RENDERIZAR TABLA DE MASCOTAS (CORREGIDO)
// ============================================
function renderPetsTable() {
  const tbody = document.getElementById('petsTableBody');
  const emptyRow = document.getElementById('emptyPetsRow');
  const petsCount = document.getElementById('petsCount');
  
  if (!tbody) return;
  
  // Actualizar contador
  petsCount.textContent = `${pets.length} ${pets.length === 1 ? 'mascota' : 'mascotas'}`;
  
  // 🔥 SIEMPRE limpiar el tbody primero
  tbody.innerHTML = '';
  
  if (pets.length === 0) {
    // Mostrar fila vacía
    if (emptyRow) {
      emptyRow.style.display = 'table-row';
      tbody.appendChild(emptyRow); // Asegurar que esté en el tbody
    }
    return;
  }
  
  // Ocultar fila vacía
  if (emptyRow) emptyRow.style.display = 'none';
  
  // Renderizar mascotas
  pets.forEach(pet => {
    const row = document.createElement('tr');
    row.className = 'bg-white hover:bg-gray-50 transition-all rounded-xl shadow-sm';
    
    const especieIcon = getEspecieIcon(pet.especie);
    
    row.innerHTML = `
      <td class="px-6 py-4 rounded-l-xl">
        <div class="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center overflow-hidden">
          ${pet.fotoUrl ? 
            `<img src="${pet.fotoUrl}" alt="${pet.nombre}" class="w-full h-full object-cover">` : 
            `<i class="fas ${especieIcon} text-white text-xl"></i>`
          }
        </div>
      </td>
      <td class="px-6 py-4 font-semibold text-gray-900">${pet.nombre || 'Sin nombre'}</td>
      <td class="px-6 py-4 text-gray-700 capitalize">${pet.especie || 'No especificada'}</td>
      <td class="px-6 py-4 text-gray-700">${pet.raza || '-'}</td>
      <td class="px-6 py-4 text-gray-700">${pet.edad ? pet.edad + ' años' : '-'}</td>
      <td class="px-6 py-4 text-gray-700">${pet.color || '-'}</td>
      <td class="px-6 py-4 text-gray-700">${pet.peso ? pet.peso + ' kg' : '-'}</td>
      <td class="px-6 py-4 rounded-r-xl">
        <div class="flex items-center gap-2">
          <button onclick="window.editarMascota('${pet.id}')" class="text-teal-600 hover:text-teal-800 transition-all p-2 hover:bg-teal-50 rounded-lg">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="window.eliminarMascota('${pet.id}', false)" class="text-red-600 hover:text-red-800 transition-all p-2 hover:bg-red-50 rounded-lg">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// ============================================
// OBTENER ICONO SEGÚN ESPECIE
// ============================================
function getEspecieIcon(especie) {
  switch(especie?.toLowerCase()) {
    case 'perro': return 'fa-dog';
    case 'gato': return 'fa-cat';
    case 'ave': return 'fa-dove';
    case 'conejo': return 'fa-rabbit';
    case 'hamster': return 'fa-rat';
    case 'pez': return 'fa-fish';
    case 'reptil': return 'fa-lizard';
    default: return 'fa-paw';
  }
}

// ============================================
// REGISTRAR NUEVA MASCOTA
// ============================================
async function handleRegisterPet(e) {
  e.preventDefault();
  
  const saveBtn = document.getElementById('savePetBtn');
  const originalHTML = saveBtn.innerHTML;
  
  saveBtn.disabled = true;
  saveBtn.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Guardando...
  `;
  
  try {
    const token = await auth.currentUser.getIdToken();
    const ownerId = auth.currentUser.uid;
    
    // Crear PetDto
    const petDto = {
      ownerId: ownerId,
      nombre: document.getElementById('petNombre')?.value || '',
      especie: document.getElementById('petEspecie')?.value || '',
      raza: document.getElementById('petRaza')?.value || '',
      edad: document.getElementById('petEdad')?.value ? parseInt(document.getElementById('petEdad').value) : null,
      color: document.getElementById('petColor')?.value || '',
      peso: document.getElementById('petPeso')?.value ? parseFloat(document.getElementById('petPeso').value) : null,
      fotoUrl: document.getElementById('petFotoUrl')?.value || '',
      latitud: document.getElementById('petLatitud')?.value ? parseFloat(document.getElementById('petLatitud').value) : null,
      longitud: document.getElementById('petLongitud')?.value ? parseFloat(document.getElementById('petLongitud').value) : null
    };
    
    console.log('📝 Registrando mascota:', petDto);
    
    const response = await fetch('/api/pets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(petDto)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showMessage('✅ Mascota registrada exitosamente', 'success');
      
      // Limpiar formulario
      document.getElementById('registerPetForm').reset();
      
      // Ocultar formulario
      document.getElementById('petFormContainer').classList.add('hidden');
      
      // Recargar mascotas
      await loadPets();
    } else {
      showMessage(result.error || 'Error al registrar mascota', 'error');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    showMessage('Error de conexión con el servidor', 'error');
  } finally {
    setTimeout(() => {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalHTML;
    }, 1500);
  }
}

// ============================================
// 🗑️ ELIMINAR MASCOTA - VERSIÓN ÚNICA Y DEFINITIVA
// ============================================
window.eliminarMascota = async function(petId, deberiaCerrarModal = false) {
  console.log('🗑️ Eliminando mascota:', petId);
  
  if (!confirm('¿Estás seguro de eliminar esta mascota? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await fetch(`/api/pets/${petId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      showMessage('✅ Mascota eliminada correctamente', 'success');
      
      // Cerrar modal solo si viene del modal de edición
      if (deberiaCerrarModal) {
        const modal = document.getElementById('editPetModal');
        if (modal && modal.classList.contains('active')) {
          modal.classList.remove('active');
          document.getElementById('editPetForm')?.reset();
        }
      }
      
      // ✅ FORZAR RECARGA DE LA TABLA
      await loadPets();
      console.log('🔄 Tabla recargada después de eliminar');
      
    } else {
      const error = await response.json();
      showMessage(error.error || 'Error al eliminar mascota', 'error');
    }
    
  } catch (error) {
    console.error('❌ Error al eliminar:', error);
    showMessage('Error de conexión con el servidor', 'error');
  }
};


// ============================================
// ✏️ EDITAR MASCOTA - ABRE MODAL CON FORMULARIO EDITABLE
// ============================================
window.editarMascota = async function(petId) {
  console.log('✏️ Abriendo modal de edición para mascota:', petId);
  
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await fetch(`/api/pets/${petId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const pet = await response.json();
      console.log('✅ Datos de mascota para editar:', pet);
      
      // ===== FOTO DE LA MASCOTA =====
      const editAvatarIcon = document.getElementById('editAvatarIcon');
      const editAvatarImage = document.getElementById('editAvatarImage');
      
      if (editAvatarIcon && editAvatarImage) {
        if (pet.fotoUrl) {
          editAvatarImage.src = pet.fotoUrl;
          editAvatarImage.classList.remove('hidden');
          editAvatarIcon.classList.add('hidden');
        } else {
          editAvatarImage.classList.add('hidden');
          editAvatarIcon.classList.remove('hidden');
          editAvatarIcon.className = `fas ${getEspecieIcon(pet.especie)} text-white text-6xl`;
        }
      }
      
      // ===== TÍTULO DEL MODAL =====
      const editPetName = document.getElementById('editPetName');
      if (editPetName) {
        editPetName.textContent = `Editar: ${pet.nombre || 'Mascota'}`;
      }
      
      // ===== CARGAR DATOS EN EL FORMULARIO =====
      document.getElementById('editPetId').value = pet.id || petId;
      document.getElementById('editNombre').value = pet.nombre || '';
      document.getElementById('editEspecie').value = pet.especie || '';
      document.getElementById('editRaza').value = pet.raza || '';
      document.getElementById('editEdad').value = pet.edad || '';
      document.getElementById('editColor').value = pet.color || '';
      document.getElementById('editPeso').value = pet.peso || '';
      document.getElementById('editFotoUrl').value = pet.fotoUrl || '';
      
      // 🔵🟢 CARGAR LATITUD Y LONGITUD - NUEVOS CAMPOS
      document.getElementById('editLatitud').value = pet.latitud || '';
      document.getElementById('editLongitud').value = pet.longitud || '';
      
      const deleteFromEditBtn = document.getElementById('deleteFromEditBtn');
      if (deleteFromEditBtn) {
        // ✅ IMPORTANTE: Eliminar cualquier onclick anterior
        deleteFromEditBtn.onclick = null;
    
        // ✅ Asignar el nuevo onclick
        deleteFromEditBtn.onclick = function() {
          window.eliminarMascota(pet.id, true); // true = cerrar modal
        };
      }
      
      // ===== MOSTRAR MODAL =====
      const modal = document.getElementById('editPetModal');
      if (modal) {
        modal.classList.add('active');
      }
      
    } else {
      showMessage('Error al cargar los datos de la mascota', 'error');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    showMessage('Error de conexión', 'error');
  }
};



// ============================================
// 🔄 ACTUALIZAR MASCOTA - PUT /api/pets/{id}
// ============================================
async function handleUpdatePet(e) {
  e.preventDefault();
  
  const updateBtn = document.getElementById('updatePetBtn');
  const originalHTML = updateBtn.innerHTML;
  
  updateBtn.disabled = true;
  updateBtn.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Actualizando...
  `;
  
  try {
    const token = await auth.currentUser.getIdToken();
    const petId = document.getElementById('editPetId').value;
    
    const petDto = {
      nombre: document.getElementById('editNombre')?.value || '',
      especie: document.getElementById('editEspecie')?.value || '',
      raza: document.getElementById('editRaza')?.value || '',
      edad: document.getElementById('editEdad')?.value ? parseInt(document.getElementById('editEdad').value) : null,
      color: document.getElementById('editColor')?.value || '',
      peso: document.getElementById('editPeso')?.value ? parseFloat(document.getElementById('editPeso').value) : null,
      fotoUrl: document.getElementById('editFotoUrl')?.value || '',
      // 🔵🟢 AGREGAR LATITUD Y LONGITUD
      latitud: document.getElementById('editLatitud')?.value ? parseFloat(document.getElementById('editLatitud').value) : null,
      longitud: document.getElementById('editLongitud')?.value ? parseFloat(document.getElementById('editLongitud').value) : null
    };
    
    console.log('📝 Actualizando mascota:', petId, petDto);
    
    const response = await fetch(`/api/pets/${petId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(petDto)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showMessage('✅ Mascota actualizada exitosamente', 'success');
      cerrarEditModal();
      await loadPets();
    } else {
      showMessage(result.error || 'Error al actualizar mascota', 'error');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    showMessage('Error de conexión con el servidor', 'error');
  } finally {
    setTimeout(() => {
      updateBtn.disabled = false;
      updateBtn.innerHTML = originalHTML;
    }, 1500);
  }
}

// ============================================
// ❌ CERRAR MODAL DE EDICIÓN
// ============================================
window.cerrarEditModal = function() {
  document.getElementById('editPetModal').classList.remove('active');
  document.getElementById('editPetForm').reset();
};

// ============================================
// 🗑️ ELIMINAR MASCOTA (ACTUALIZADO PARA CERRAR MODAL)
// ============================================
window.eliminarMascota = async function(petId) {
  if (!confirm('¿Estás seguro de eliminar esta mascota? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await fetch(`/api/pets/${petId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      showMessage('✅ Mascota eliminada', 'success');
      cerrarEditModal(); // Cerrar modal si está abierto
      await loadPets(); // Recargar lista
    } else {
      showMessage('Error al eliminar mascota', 'error');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    showMessage('Error de conexión', 'error');
  }
};






// ============================================
// TOGGLE FORMULARIO
// ============================================
function setupFormToggle() {
  const toggleBtn = document.getElementById('toggleFormBtn');
  const formContainer = document.getElementById('petFormContainer');
  const cancelBtn = document.getElementById('cancelFormBtn');
  
  if (toggleBtn && formContainer) {
    toggleBtn.addEventListener('click', () => {
      formContainer.classList.toggle('hidden');
    });
  }
  
  if (cancelBtn && formContainer) {
    cancelBtn.addEventListener('click', () => {
      formContainer.classList.add('hidden');
      document.getElementById('registerPetForm').reset();
    });
  }
}

// ============================================
// CERRAR SESIÓN
// ============================================
async function handleLogout() {
  try {
    await signOut(auth);
    showMessage('👋 Sesión cerrada', 'success');
    setTimeout(() => window.location.href = '/index.html', 1500);
  } catch (error) {
    showMessage('Error al cerrar sesión', 'error');
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadNavbarData(user);
    loadPets(); // Cargar mascotas al iniciar
  } else {
    window.location.href = '/index.html';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Mis Mascotas inicializado');
  
  setupUserMenu();
  setupFormToggle();
  
  // Botón de logout
  const logoutBtn = document.getElementById('logoutDropdownBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  // Formulario de registro
  const form = document.getElementById('registerPetForm');
  if (form) form.addEventListener('submit', handleRegisterPet);

  // Formulario de edición
  const editForm = document.getElementById('editPetForm');
  if (editForm) editForm.addEventListener('submit', handleUpdatePet);

  // Botón cancelar del modal de edición
  const cancelEditBtn = document.querySelector('#editPetModal button[onclick="cerrarEditModal()"]');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', cerrarEditModal);
  }

  // Cerrar modal al hacer clic fuera
  const editModal = document.getElementById('editPetModal');
  if (editModal) {
    editModal.addEventListener('click', function(e) {
      if (e.target === editModal) {
        cerrarEditModal();
      }
    });
    }
  });