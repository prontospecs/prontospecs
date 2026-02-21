// ==========================================
// BUSINESS PROPOSAL ENGINE | LOGIN & ROUTING
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const settings = localStorage.getItem('pronto_settings');
    if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.username) {
            navigate('home'); 
            return;
        }
    }
    navigate('login');
});

function navigate(view) {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = ''; 
    if (view === 'login') app.innerHTML = loginView();
    else if (view === 'home') app.innerHTML = homeView();
}

const loginView = () => `
    <div class="home-card fade-in" style="max-width: 400px; margin-top: 10vh;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 30px;">
            <button onclick="window.location.href='../index.html'" class="btn-mini">🡠 На портал</button>
            <h2 style="margin:0; color:var(--pronto);">ВХОД В КП</h2>
            <div style="width:80px;"></div>
        </div>
        
        <div style="text-align: left;">
            <label style="font-weight:bold; font-size:12px; color:#64748b;">ЛОГИН:</label>
            <input type="text" id="auth_login" placeholder="Ваш логин">
            
            <label style="font-weight:bold; font-size:12px; color:#64748b;">ПАРОЛЬ:</label>
            <div style="position:relative; margin-bottom:10px;">
                <input type="password" id="auth_pass" placeholder="Ваш пароль">
            </div>
            
            <button onclick="checkLogin()" class="btn">ВОЙТИ</button>
        </div>
    </div>
`;

const homeView = () => {
    const s = JSON.parse(localStorage.getItem('pronto_settings') || '{}');
    return `
    <div class="home-card fade-in" style="max-width: 800px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <div style="text-align: left;">
                <h1 style="margin:0; font-size: 32px; color: var(--pronto);">BUSINESS PROPOSAL</h1>
                <p style="margin:0; color:#64748b; font-weight:bold;">Пользователь: ${s.username || 'Admin'}</p>
            </div>
            <button onclick="logout()" class="btn-mini" style="background: #ef4444; color: white;">ВЫЙТИ</button>
        </div>
        
        <div style="margin-top: 50px; padding: 50px; border: 2px dashed #cbd5e1; border-radius: 15px; color: #64748b;">
            <h2>База данных товаров скоро появится здесь...</h2>
            <p>Мы будем загружать сюда фото и формировать КП.</p>
        </div>
    </div>
    `;
};

function checkLogin() {
    const login = document.getElementById('auth_login').value.trim();
    const pass = document.getElementById('auth_pass').value.trim();
    if (login === '' || pass === '') return alert("Введите логин и пароль!");

    if (login === 'admin' && pass === '777') {
        localStorage.setItem('pronto_settings', JSON.stringify({ role: 'admin', username: 'SuperAdmin' }));
        return navigate('home'); 
    }

    if (typeof db === 'undefined') {
        return alert("Ошибка: База данных не подключена. Проверьте config.js");
    }

    const safeLogin = login.replace(/[.#$\[\]]/g, '_');

    db.ref('users/' + safeLogin).once('value').then((snapshot) => {
        if (!snapshot.exists()) return alert("Такого пользователя не существует!");
        
        const user = snapshot.val();
        if (user.password !== pass) return alert("Неверный пароль!");
        if (user.status !== 'approved') return alert("Ваш аккаунт еще не одобрен!");

        localStorage.setItem('pronto_settings', JSON.stringify({ role: user.role, username: safeLogin }));
        navigate('home'); 
    }).catch((err) => alert("Ошибка при входе: " + err.message));
}

function logout() {
    localStorage.removeItem('pronto_settings');
    navigate('login');
}
