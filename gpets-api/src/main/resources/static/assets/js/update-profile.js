import { auth } from "/assets/js/firebaseConfiguration.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { showMessage } from '/assets/js/showMessage.js';

console.log("🚀 UPDATE-PROFILE CARGADO");

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
// CARGAR DATOS DEL PERFIL (GET /api/owners/me)
// ============================================
async function loadProfileData(user) {
  console.log('🔄 Cargando datos del perfil...');
  
  // ===== DATOS NO MODIFICABLES (desde Firebase Auth) =====
  const displayNameInput = document.getElementById('displayName');
  const emailInput = document.getElementById('email');
  const profileAvatarIcon = document.getElementById('profileAvatarIcon');
  const profileAvatarImage = document.getElementById('profileAvatarImage');
  
  if (displayNameInput) {
    displayNameInput.value = user.displayName || 'Usuario';
  }
  
  if (emailInput) {
    emailInput.value = user.email || '';
  }
  
  if (user.photoURL && profileAvatarImage) {
    profileAvatarImage.src = user.photoURL;
    profileAvatarImage.classList.remove('hidden');
    profileAvatarIcon.classList.add('hidden');
  }

  // ===== CARGAR DATOS MODIFICABLES DESDE EL BACKEND =====
  try {
    const token = await user.getIdToken();
    
    const response = await fetch('/api/owners/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Datos cargados desde backend:', userData);
      
      // ===== SETEAR TODOS LOS CAMPOS DEL FORMULARIO =====
      // Teléfono
      const telefonoInput = document.getElementById('telefono');
      if (telefonoInput) telefonoInput.value = userData.telefono || '';
      
      // Fecha de Nacimiento
      const fechaNacimientoInput = document.getElementById('fechaNacimiento');
      if (fechaNacimientoInput) fechaNacimientoInput.value = userData.fechaNacimiento || '';
      
      // Dirección
      const direccionInput = document.getElementById('direccion');
      if (direccionInput) direccionInput.value = userData.direccion || '';
      
      // Ciudad
      const ciudadInput = document.getElementById('ciudad');
      if (ciudadInput) ciudadInput.value = userData.ciudad || '';
      
      // País
      const paisSelect = document.getElementById('pais');
      if (paisSelect && userData.pais) {
        paisSelect.value = userData.pais;
      }
      
      // Código Postal
      const codigoPostalInput = document.getElementById('codigoPostal');
      if (codigoPostalInput) codigoPostalInput.value = userData.codigoPostal || '';
      
      // ===== PREFERENCIAS =====
      const emailNotificationsCheck = document.getElementById('emailNotifications');
      if (emailNotificationsCheck) emailNotificationsCheck.checked = userData.emailNotifications || false;
      
      const smsNotificationsCheck = document.getElementById('smsNotifications');
      if (smsNotificationsCheck) smsNotificationsCheck.checked = userData.smsNotifications || false;
      
      const promoEmailsCheck = document.getElementById('promoEmails');
      if (promoEmailsCheck) promoEmailsCheck.checked = userData.promoEmails || false;
      
      console.log('✅ Formulario actualizado con datos del usuario');
      
    } else if (response.status === 404) {
      console.log('ℹ️ Perfil no encontrado, se creará al guardar');
      // Dejar campos vacíos para que el usuario los complete
    } else {
      console.error('❌ Error cargando perfil:', await response.text());
      showMessage('Error al cargar tus datos', 'error');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    showMessage('Error de conexión con el servidor', 'error');
  }
}

// ============================================
// GUARDAR DATOS - POST /api/owners
// ============================================
async function handleSaveProfile(e) {
  e.preventDefault();
  
  const saveBtn = document.getElementById('saveProfileBtn');
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
    const user = auth.currentUser;
    const token = await user.getIdToken();
    
    const ownerDto = {
      displayName: user.displayName,
      email: user.email,
      fotoUrl: user.photoURL,
      telefono: document.getElementById('telefono')?.value || '',
      fechaNacimiento: document.getElementById('fechaNacimiento')?.value || '',
      direccion: document.getElementById('direccion')?.value || '',
      ciudad: document.getElementById('ciudad')?.value || '',
      pais: document.getElementById('pais')?.value || '',
      codigoPostal: document.getElementById('codigoPostal')?.value || '',
      emailNotifications: document.getElementById('emailNotifications')?.checked || false,
      smsNotifications: document.getElementById('smsNotifications')?.checked || false,
      promoEmails: document.getElementById('promoEmails')?.checked || false
    };
    
    console.log('📝 Enviando OwnerDto:', ownerDto);
    
    const response = await fetch('/api/owners', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ownerDto)
    });
    
    const result = await response.json();
    
    if(response.ok) {
      showMessage('✅ Perfil actualizado correctamente', 'success');
      // 👇 Esperar 1.5 segundos para que se vea el mensaje
      setTimeout(() => {
        window.location.href = '/assets/html/dashboard.html';
      }, 1500);
    }else {
      showMessage(result.error || 'Error al guardar los cambios', 'error');
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
// INICIALIZACIÓN - CARGA AUTOMÁTICA AL ENTRAR
// ============================================
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('✅ Usuario autenticado:', user.email);
    loadNavbarData(user);
    loadProfileData(user); // 🚀 CARGA AUTOMÁTICA DE TODOS LOS DATOS
  } else {
    window.location.href = '/index.html';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Update Profile inicializado');
  
  setupUserMenu();
  
  const logoutBtn = document.getElementById('logoutDropdownBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  const form = document.getElementById('updateProfileForm');
  if (form) form.addEventListener('submit', handleSaveProfile);
});