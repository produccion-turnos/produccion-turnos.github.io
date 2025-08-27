class App {
  constructor() {
    this.currentUser = null;
    this.isLoginMode = true;
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkExistingSession();
  }

  bindEvents() {

    const goToLoginBtn = document.getElementById('goToLoginBtn');
    const goToRegisterBtn = document.getElementById('goToRegisterBtn');
    const authSwitchLink = document.getElementById('authSwitchLink');
    const logoutBtn = document.getElementById('logoutBtn');

    if (goToLoginBtn) goToLoginBtn.onclick = () => this.showAuth(true);
    if (goToRegisterBtn) goToRegisterBtn.onclick = () => this.showAuth(false);
    if (authSwitchLink) authSwitchLink.onclick = (e) => {
      e.preventDefault();
      this.toggleAuthMode();
    };
    if (logoutBtn) logoutBtn.onclick = () => this.logout();

    const authForm = document.getElementById('authForm');
    if (authForm) authForm.onsubmit = (e) => this.handleAuth(e);

    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) changePasswordForm.onsubmit = (e) => this.handleChangePassword(e);
  }

  showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');
  }

  showAuth(loginMode = true) {
    this.isLoginMode = loginMode;
    this.updateAuthUI();
    this.showPage('authPage');
  }

  toggleAuthMode() {
    this.isLoginMode = !this.isLoginMode;
    this.updateAuthUI();
    this.clearMessage();
    const authForm = document.getElementById('authForm');
    if (authForm) authForm.reset();
  }

  updateAuthUI() {
    const elements = {
      title: document.getElementById('authTitle'),
      subtitle: document.getElementById('authSubtitle'),
      nameGroup: document.getElementById('nameGroup'),
      nameInput: document.getElementById('name'),
      submitBtn: document.getElementById('authSubmitBtn'),
      switchPrompt: document.getElementById('authSwitchPrompt'),
      switchLink: document.getElementById('authSwitchLink')
    };

    if (!elements.title || !elements.subtitle || !elements.nameGroup || !elements.nameInput || !elements.submitBtn) return;

    if (this.isLoginMode) {
      elements.title.textContent = 'Iniciar Sesión';
      elements.subtitle.textContent = 'Accede a tu cuenta para continuar';
      elements.nameGroup.style.display = 'none';
      elements.nameInput.required = false;
      elements.submitBtn.textContent = 'Iniciar Sesión';
      elements.switchPrompt.textContent = '¿No tienes una cuenta?';
      elements.switchLink.textContent = 'Regístrate';
    } else {
      elements.title.textContent = 'Crear Cuenta';
      elements.subtitle.textContent = 'Únete a nuestro sistema de gestión';
      elements.nameGroup.style.display = 'block';
      elements.nameInput.required = true;
      elements.submitBtn.textContent = 'Registrarse';
      elements.switchPrompt.textContent = '¿Ya tienes una cuenta?';
      elements.switchLink.textContent = 'Inicia sesión';
    }
  }

  handleAuth(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password')
    };

    if (this.isLoginMode) {
      this.login(data);
    } else {
      this.register(data);
    }
  }

  getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  register(data) {
    const users = this.getUsers();
    if (users.find(user => user.email === data.email)) {
      this.showMessage('Este correo ya está registrado.', 'error');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      password: data.password
    };

    users.push(newUser);
    this.saveUsers(users);
    this.showMessage('¡Registro exitoso! Cambiando a inicio de sesión...', 'success');

    setTimeout(() => this.toggleAuthMode(), 1500);
  }

  login(data) {
    const users = this.getUsers();
    const user = users.find(u => u.email === data.email && u.password === data.password);

    if (!user) {
      this.showMessage('Correo o contraseña incorrectos.', 'error');
      return;
    }

    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.showMessage(`¡Bienvenido, ${user.name}!`, 'success');
    this.showPage('dashboardPage'); 
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.showAuth(true);
  }

  checkExistingSession() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      this.currentUser = user;
      this.showPage('dashboardPage'); // CORREGIDO
    } else {
      this.showAuth(true);
    }
  }

  showMessage(msg, type = 'info') {
    const msgEl = document.getElementById('authMessage');
    if (!msgEl) return;
    msgEl.textContent = msg;
    msgEl.className = type;
    setTimeout(() => this.clearMessage(), 3000);
  }

  clearMessage() {
    const msgEl = document.getElementById('authMessage');
    if (!msgEl) return;
    msgEl.textContent = '';
    msgEl.className = '';
  }

  handleChangePassword(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');

    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === oldPassword);

    if (!user) {
      this.showMessage('Correo o contraseña actual incorrecta.', 'error');
      return;
    }

    user.password = newPassword;
    this.saveUsers(users);
    this.showMessage('Contraseña actualizada con éxito.', 'success');
    e.target.reset();
  }
}

window.addEventListener('DOMContentLoaded', () => new App());