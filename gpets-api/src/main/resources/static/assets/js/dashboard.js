import { auth } from "/assets/js/firebaseConfiguration.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { showMessage } from '/assets/js/showMessage.js';

// ============================================
// CONFIGURACIÓN DEL MENÚ DESPLEGABLE
// ============================================

console.log("QUEEE");

function setupUserMenu() {
  const menuButton = document.getElementById('userMenuButton');
  const dropdown = document.getElementById('userDropdown');
  
  if (!menuButton || !dropdown) {
    console.error('❌ Elementos del menú no encontrados');
    return;
  }
  
  // Toggle del menú
  menuButton.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });
  
  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', function(e) {
    if (!menuButton.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
  
  // Cerrar menú con tecla ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !dropdown.classList.contains('hidden')) {
      dropdown.classList.add('hidden');
    }
  });
}

// ============================================
// CARGAR DATOS DEL USUARIO
// ============================================

function loadUserData(user) {
  // Elementos del navbar
  const navUserName = document.getElementById('navUserName');
  const navUserEmail = document.getElementById('navUserEmail');
  const dropdownUserName = document.getElementById('dropdownUserName');
  const dropdownUserEmail = document.getElementById('dropdownUserEmail');
  const avatarIcon = document.getElementById('userAvatarIcon');
  const avatarImage = document.getElementById('userAvatarImage');
  
  if (!navUserName || !navUserEmail || !dropdownUserName || !dropdownUserEmail) {
    console.error('❌ Elementos de usuario no encontrados');
    return;
  }
  
  // Actualizar nombre y email
  const displayName = user.displayName || 'Usuario';
  const email = user.email || '';
  
  navUserName.textContent = displayName.split(' ')[0]; // Solo primer nombre
  navUserEmail.textContent = email;
  dropdownUserName.textContent = displayName;
  dropdownUserEmail.textContent = email;
  
  // Actualizar avatar
  if (user.photoURL) {
    avatarImage.src = user.photoURL;
    avatarImage.classList.remove('hidden');
    avatarIcon.classList.add('hidden');
  } else {
    avatarImage.classList.add('hidden');
    avatarIcon.classList.remove('hidden');
  }
  
  console.log('✅ Datos de usuario cargados:', email);
}

// ============================================
// CERRAR SESIÓN
// ============================================

async function handleLogout() {
  try {
    const logoutBtn = document.getElementById('logoutDropdownBtn');
    const originalText = logoutBtn.innerHTML;
    
    // Deshabilitar botón
    logoutBtn.disabled = true;
    logoutBtn.innerHTML = `
      <svg class="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Cerrando sesión...
    `;
    
    await signOut(auth);
    showMessage('👋 ¡Hasta pronto! Sesión cerrada', 'success');
    
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1500);
    
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    showMessage('Error al cerrar sesión', 'error');
    
    // Restaurar botón
    const logoutBtn = document.getElementById('logoutDropdownBtn');
    logoutBtn.disabled = false;
    logoutBtn.innerHTML = `
      <i class="fas fa-sign-out-alt w-5"></i>
      <span class="text-sm font-medium">Cerrar Sesión</span>
    `;
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Escuchar cambios en la autenticación
auth.onAuthStateChanged((user) => {
  if (user) {
    loadUserData(user);
  } else {
    // No hay usuario autenticado, redirigir al login
    window.location.href = '/index.html';
  }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Dashboard inicializado');
  
  // Configurar menú
  setupUserMenu();
  
  // Agregar event listener al botón de logout
  const logoutBtn = document.getElementById('logoutDropdownBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Cerrar dropdown al hacer click en un enlace
  const dropdownLinks = document.querySelectorAll('#userDropdown a');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('userDropdown')?.classList.add('hidden');
    });
  });
});

// ============================================
// UTILIDADES
// ============================================

// Agregar clase animate-spin si no existe en Tailwind
const style = document.createElement('style');
style.textContent = `
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);