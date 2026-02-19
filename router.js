/**
 * ======================================================
 * PRONTO SPECS CLOUD ENGINE | VERSION 3.0 (ECOSYSTEM)
 * ======================================================
 * Разработчик: Тимур
 * Назначение: Управление логикой приложения, рендеринг,
 * портал экосистемы и генерация HD документов.
 * ======================================================
 */

// ======================================================
// 1. ИНИЦИАЛИЗАЦИЯ И ЖИВАЯ СИНХРОНИЗАЦИЯ
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("[System] Запуск ядра...");

    // Таймер безопасности: если интернет медленный, лоадер исчезнет через 3 сек
    setTimeout(hideLoader, 3000);

    // Подключение к базе данных в реальном времени
    db.ref('settings').on('value', (snapshot) => {
        const cloudData = snapshot.val();

        if (cloudData) {
            console.log("[Firebase] Данные успешно загружены.");
            // Обновляем глобальную конфигурацию данными из облака
            APP_CONFIG = cloudData;

            // Если пользователь уже на странице ТЗ, обновляем списки на лету
            if (document.getElementById('equipment_select')) {
                populateSelects();
            }
        } else {
            console.warn("[Firebase] База пуста. Инициализация...");
            // Если база чистая, отправляем туда данные из config.js
            db.ref('settings').set(APP_CONFIG);
        }

        // Данные получены — скрываем экран загрузки
        hideLoader();
    });

    // Применяем тему оформления при старте
    applyTheme();
    
    // Загружаем ПОРТАЛ при старте (изменено с home на portal)
    navigate('portal');
});

/**
 * Функция скрытия загрузочного экрана с анимацией
 */
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader && loader.style.display !== 'none') {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

// ======================================================
// 2. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И ХРАНИЛИЩЕ
// ======================================================

let uploadedImageBase64 = null; // Для хранения фото в Base64
let currentManageKey = null;    // Для редактирования списков

// Получение архива из локальной памяти браузера
const getArchive = () => {
    const data = localStorage.getItem('pronto_archive');
    return data ? JSON.parse(data) : [];
};

// Получение настроек пользователя
const getSettings = () => {
    const data = localStorage.getItem('pronto_settings');
    return data ? JSON.parse(data) : { role: "participant", theme: "light" };
};

// ======================================================
// 3. СИСТЕМНЫЕ ФУНКЦИИ И НАВИГАЦИЯ
// ======================================================

function applyTheme() {
    const settings = getSettings();
    if (settings.theme === 'dark') {
        document.body.className = 'dark-theme';
    } else {
        document.body.className = '';
    }
}

function syncToCloud() {
    db.ref('settings').set(APP_CONFIG)
        .then(() => console.log("Синхронизация успешна"))
        .catch((err) => console.error("Ошибка сети:", err));
}

// Главный роутер (переключатель страниц)
// --- ОБНОВЛЕННАЯ НАВИГАЦИЯ ---
function navigate(view) {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = ''; 

    if (view === 'portal') {
        app.innerHTML = portalView();
    } else if (view === 'login') {
        app.innerHTML = loginView();
    } else if (view === 'register') {
        app.innerHTML = registerView(); // Добавили экран регистрации
    } else if (view === 'home') {
        app.innerHTML = homeView();
    } else if (view === 'settings') {
        app.innerHTML = settingsView();
    } else if (view === 'template') {
        app.innerHTML = templateView();
    } else {
        app.innerHTML = portalView();
    }

    if (view === 'template') {
        populateSelects();
        checkDualTemp();
    }
    
    window.scrollTo(0, 0);
}
// ======================================================
// 4. ЛОГИКА АДМИНИСТРАТОРА
// ======================================================

function openManageMenu(key, selectId) {
    if (getSettings().role !== 'admin') return;
    
    currentManageKey = key;
    renderManageList();
    document.getElementById('manageModal').style.display = 'flex';
}

function renderManageList() {
    const modalSelect = document.getElementById('manageListSelect');
    if (!modalSelect) return;
    
    modalSelect.innerHTML = '';
    const list = APP_CONFIG[currentManageKey] || [];
    
    list.forEach(item => {
        const opt = new Option(item, item);
        modalSelect.add(opt);
    });
}

function manAdd() {
    const val = prompt("Введите название нового пункта:");
    if (val && val.trim()) {
        APP_CONFIG[currentManageKey].push(val.trim());
        refreshAfterChange();
    }
}

function manEdit() {
    const modalSelect = document.getElementById('manageListSelect');
    const oldVal = modalSelect.value;
    if (!oldVal) return;
    
    const newVal = prompt("Изменить название:", oldVal);
    if (newVal && newVal.trim() && newVal !== oldVal) {
        const idx = APP_CONFIG[currentManageKey].indexOf(oldVal);
        APP_CONFIG[currentManageKey][idx] = newVal.trim();
        refreshAfterChange();
    }
}

function manDel() {
    const modalSelect = document.getElementById('manageListSelect');
    if (confirm(`Вы уверены, что хотите удалить "${modalSelect.value}"?`)) {
        APP_CONFIG[currentManageKey] = APP_CONFIG[currentManageKey].filter(v => v !== modalSelect.value);
        refreshAfterChange();
    }
}

function refreshAfterChange() {
    renderManageList();
    if (document.getElementById('equipment_select')) {
        populateSelects();
    }
    syncToCloud();
}

function renderSelect(id, configKey) {
    const isAdmin = getSettings().role === 'admin';
    let btnHTML = '';
    
    if (isAdmin) {
        btnHTML = `
            <button 
                onclick="openManageMenu('${configKey}', '${id}')" 
                class="admin-add-btn no-print" 
                style="margin-left:5px; background:#10b981; color:white; border:none; border-radius:8px; width:32px; height:36px; font-weight:bold; cursor:pointer;"
            >
                +
            </button>`;
    }
    
    return `
        <div style="display:flex; align-items:center; width:100%;">
            <select id="${id}" style="flex-grow:1;"></select>
            ${btnHTML}
        </div>`;
}

// ======================================================
// 5. HTML ШАБЛОНЫ (VIEWS)
// ======================================================

const modalsHTML = `
    <div id="loginModal" class="modal" style="display:none">
        <div class="modal-content">
            <h3 style="color:var(--pronto); margin-top:0;">ВХОД АДМИНИСТРАТОРА</h3>
            <input type="password" id="inputPassword" placeholder="Пароль" style="width:100%; padding:12px; margin-bottom:20px; border-radius:10px; border:1px solid #ccc;">
            <div style="display:flex; gap:10px;">
                <button onclick="closeModals()" class="btn btn-secondary" style="flex:1;">ОТМЕНА</button>
                <button onclick="checkLogin()" class="btn" style="flex:1;">ВОЙТИ</button>
            </div>
        </div>
    </div>

    <div id="changePassModal" class="modal" style="display:none">
        <div class="modal-content">
            <h3>СМЕНА ПАРОЛЯ</h3>
            <input type="password" id="newPassword" placeholder="Новый пароль" style="width:100%; padding:12px; margin-bottom:20px; border-radius:10px; border:1px solid #ccc;">
            <div style="display:flex; gap:10px;">
                <button onclick="closeModals()" class="btn btn-secondary" style="flex:1;">ОТМЕНА</button>
                <button onclick="saveNewCredentials()" class="btn" style="flex:1; background:orange;">СОХРАНИТЬ</button>
            </div>
        </div>
    </div>

    <div id="manageModal" class="modal" style="display:none">
        <div class="modal-content" style="width:450px;">
            <h3>РЕДАКТОР СПИСКА</h3>
            <select id="manageListSelect" style="width:100%; padding:10px; margin-bottom:20px; border-radius:10px; font-weight:bold;"></select>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <button onclick="manAdd()" class="btn btn-success">➕ ДОБАВИТЬ</button>
                <button onclick="manEdit()" class="btn btn-warning">✏️ ИЗМЕНИТЬ</button>
                <button onclick="manDel()" class="btn btn-danger">🗑️ УДАЛИТЬ</button>
                <button onclick="closeModals()" class="btn btn-secondary">ЗАКРЫТЬ</button>
            </div>
        </div>
    </div>
`;

// --- АРХИВ ПРОЕКТОВ (Внутри приложения PRODUCTION SPECS) ---
const homeView = () => {
    const archive = getArchive();
    
    return `
    <div class="home-card fade-in">
        <h1 class="main-title">PRODUCTION</h1>
        <div class="subtitle">SPECS</div>
        <div style="font-size:16px; font-weight:bold; color:var(--pronto); margin-top:-10px; margin-bottom:20px; text-transform:uppercase;">(fridge)</div>
        
        <div style="text-align:left; background:#f8fafc; padding:25px; border-radius:15px; margin:25px 0; border-left:6px solid var(--pronto); color:#475569; font-size:14px; line-height:1.6;">
            <p><strong>PRODUCTION SPECS (fridge)</strong> — цифровой модуль компании PRONTO.</p>
            <p>Система предназначена для мгновенной синхронизации технических заданий на холодильное оборудование между всеми подразделениями производства.</p>
        </div>

        <button onclick="createNewTZ()" class="btn" style="height:85px; width:100%; font-size:22px; margin-bottom:20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            + СОЗДАТЬ ТЗ
        </button>
        
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <button onclick="navigate('settings')" class="btn btn-secondary" style="flex:1;">НАСТРОЙКИ СИСТЕМЫ</button>
            <button onclick="navigate('portal')" class="btn btn-secondary" style="background:#64748b; border:none; color:white;">НА ПОРТАЛ</button>
        </div>
        
        <div style="margin-top:70px; text-align:left;">
            <h4 style="border-bottom:3px solid var(--border); padding-bottom:15px; color:var(--pronto); font-weight:900;">ПОСЛЕДНИЕ ПРОЕКТЫ</h4>
            
            ${archive.length > 0 ? archive.map((item, i) => `
                <div class="archive-item">
                    <div class="archive-content" style="display:flex; align-items:center; gap:15px; width:100%;">
                        ${item.image ? 
                            `<img src="${item.image}" class="archive-thumb">` : 
                            `<div class="archive-thumb" style="display:flex; align-items:center; justify-content:center; color:#ccc;">📷</div>`
                        }
                        <div style="flex:1;">
                            <b style="font-size:18px; color:var(--pronto);">№ ${item.tz_no}</b>
                            <div style="font-size:14px; margin-top:5px; font-weight:bold;">${item.eq}</div>
                            <div style="font-size:12px; color:#64748b; margin-top:3px;">Менеджер: ${item.manager || '—'} | ${item.date}</div>
                        </div>
                    </div>
                    
                    <div class="archive-actions" style="margin-top:15px; display:flex; justify-content:flex-end; gap:8px;">
                        <button onclick="editFromArchive(${i})" class="btn-mini" style="background:#10b981;" title="Открыть">📂</button>
                        <button onclick="alert('Генерация PDF из архива...')" class="btn-mini" style="background:#3b82f6;" title="PDF">📄</button>
                        <button onclick="alert('Печать из архива...')" class="btn-mini" style="background:#64748b;" title="Печать">🖨️</button>
                        <button onclick="sendFromArchive(${i})" class="btn-mini" style="background:#8b5cf6;" title="Отправить">📤</button>
                        <button onclick="deleteFromArchive(${i})" class="btn-mini" style="background:#ef4444;" title="Удалить">🗑️</button>
                    </div>
                </div>
            `).join('') : '<p style="text-align:center; color:#94a3b8; padding:40px;">Архив пуст</p>'}
        </div>
    </div>`;
};
// --- ЭКРАН ВХОДА (Если аккаунт есть) ---
const loginView = () => `
    <div class="home-card fade-in" style="max-width: 400px; text-align: center;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <button onclick="navigate('portal')" class="btn-mini" style="background:#cbd5e1; color:#0f172a;">🡠 Назад</button>
            <h2 style="margin:0; color:var(--pronto);">ВХОД</h2>
            <div style="width:50px;"></div>
        </div>
        
        <p style="color:#64748b; font-size:14px; margin-bottom:20px;">Войдите, если у вас уже есть аккаунт.</p>

        <div style="text-align: left;">
            <label style="font-weight:bold; font-size:12px; color:#64748b;">ЛОГИН:</label>
            <input type="text" id="auth_login" placeholder="Ваш логин" style="width:100%; padding:12px; margin-bottom:15px; border:2px solid #e2e8f0; border-radius:8px;">
            
            <label style="font-weight:bold; font-size:12px; color:#64748b;">ПАРОЛЬ:</label>
            <input type="password" id="auth_pass" placeholder="Ваш пароль" style="width:100%; padding:12px; margin-bottom:25px; border:2px solid #e2e8f0; border-radius:8px;">
            
            <button onclick="mockLogin()" class="btn" style="width:100%; margin-bottom:15px; background:#10b981;">ВОЙТИ</button>
            
            <div style="text-align:center; margin-top:10px;">
                <span style="color:#64748b; font-size:14px;">Нет аккаунта? </span>
                <a href="#" onclick="navigate('register')" style="color:var(--pronto); font-weight:bold; text-decoration:none;">Зарегистрироваться</a>
            </div>
        </div>
    </div>
`;

// --- ЭКРАН РЕГИСТРАЦИИ (Если аккаунта нет) ---
const registerView = () => `
    <div class="home-card fade-in" style="max-width: 400px; text-align: center;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <button onclick="navigate('portal')" class="btn-mini" style="background:#cbd5e1; color:#0f172a;">🡠 Назад</button>
            <h2 style="margin:0; color:var(--pronto);">РЕГИСТРАЦИЯ</h2>
            <div style="width:50px;"></div>
        </div>
        
        <p style="color:#64748b; font-size:14px; margin-bottom:20px;">Создайте новый аккаунт (потребуется одобрение).</p>

        <div style="text-align: left;">
            <label style="font-weight:bold; font-size:12px; color:#64748b;">ПРИДУМАЙТЕ ЛОГИН:</label>
            <input type="text" id="reg_login" placeholder="Новый логин" style="width:100%; padding:12px; margin-bottom:15px; border:2px solid #e2e8f0; border-radius:8px;">
            
            <label style="font-weight:bold; font-size:12px; color:#64748b;">ПРИДУМАЙТЕ ПАРОЛЬ:</label>
            <input type="password" id="reg_pass" placeholder="Новый пароль" style="width:100%; padding:12px; margin-bottom:25px; border:2px solid #e2e8f0; border-radius:8px;">
            
            <button onclick="mockRegister()" class="btn" style="width:100%; margin-bottom:15px; background:#3b82f6;">ЗАРЕГИСТРИРОВАТЬСЯ</button>
            
            <div style="text-align:center; margin-top:10px;">
                <span style="color:#64748b; font-size:14px;">Уже есть аккаунт? </span>
                <a href="#" onclick="navigate('login')" style="color:var(--pronto); font-weight:bold; text-decoration:none;">Войти</a>
            </div>
        </div>
    </div>
`;

// --- ОБНОВЛЕННАЯ ЛОГИКА КНОПОК ---
function mockLogin() {
    const login = document.getElementById('auth_login').value;
    if(login.trim() === '') {
        alert("Введите логин!");
        return;
    }
    // Временно пускаем всех для теста дизайна
    alert("Успешный вход!");
    navigate('home'); // Пускаем в приложение SPECS
}

function mockRegister() {
    const login = document.getElementById('reg_login').value;
    if(login.trim() === '') {
        alert("Придумайте логин для регистрации!");
        return;
    }
    alert("Заявка на регистрацию отправлена администратору! (Тестовый режим)");
    navigate('portal'); // Возвращаем на главную после заявки
}

// --- АРХИВ ПРОЕКТОВ (Бывшая главная) ---
const homeView = () => {
    const archive = getArchive();
    
    return `
    <div class="home-card fade-in">
        <h1 class="main-title">PRONTO</h1>
        <div class="subtitle">SPECS</div>
        
        <div style="text-align:left; background:#f8fafc; padding:25px; border-radius:15px; margin:25px 0; border-left:6px solid var(--pronto); color:#475569; font-size:14px; line-height:1.6;">
            <p><strong>PRODUCTION SPECS</strong> — цифровая экосистема компании PRONTO.</p>
            <p>Система предназначена для мгновенной синхронизации технических заданий между всеми подразделениями производства в режиме реального времени.</p>
        </div>

        <button onclick="createNewTZ()" class="btn" style="height:85px; width:100%; font-size:22px; margin-bottom:20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            + СОЗДАТЬ ТЗ
        </button>
        
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <button onclick="navigate('settings')" class="btn btn-secondary" style="flex:1;">НАСТРОЙКИ СИСТЕМЫ</button>
            <button onclick="navigate('portal')" class="btn btn-secondary" style="background:#64748b; border:none; color:white;">НА ПОРТАЛ</button>
        </div>
        
        <div style="margin-top:70px; text-align:left;">
            <h4 style="border-bottom:3px solid var(--border); padding-bottom:15px; color:var(--pronto); font-weight:900;">ПОСЛЕДНИЕ ПРОЕКТЫ</h4>
            
            ${archive.length > 0 ? archive.map((item, i) => `
                <div class="archive-item">
                    <div class="archive-content" style="display:flex; align-items:center; gap:15px; width:100%;">
                        ${item.image ? 
                            `<img src="${item.image}" class="archive-thumb">` : 
                            `<div class="archive-thumb" style="display:flex; align-items:center; justify-content:center; color:#ccc;">📷</div>`
                        }
                        <div style="flex:1;">
                            <b style="font-size:18px; color:var(--pronto);">№ ${item.tz_no}</b>
                            <div style="font-size:14px; margin-top:5px; font-weight:bold;">${item.eq}</div>
                            <div style="font-size:12px; color:#64748b; margin-top:3px;">Менеджер: ${item.manager || '—'} | ${item.date}</div>
                        </div>
                    </div>
                    
                    <div class="archive-actions" style="margin-top:15px; display:flex; justify-content:flex-end; gap:8px;">
                        <button onclick="editFromArchive(${i})" class="btn-mini" style="background:#10b981;" title="Открыть">📂</button>
                        <button onclick="alert('Печать...')" class="btn-mini" style="background:#3b82f6;" title="PDF">📄</button>
                        <button onclick="alert('Печать...')" class="btn-mini" style="background:#64748b;" title="Печать">🖨️</button>
                        <button onclick="editFromArchive(${i})" class="btn-mini" style="background:#f59e0b;" title="Редактировать">✏️</button>
                        <button onclick="deleteFromArchive(${i})" class="btn-mini" style="background:#ef4444;" title="Удалить">🗑️</button>
                    </div>
                </div>
            `).join('') : '<p style="text-align:center; color:#94a3b8; padding:40px;">Архив пуст</p>'}
        </div>
    </div>`;
};

// Страница: НАСТРОЙКИ (SETTINGS)
const settingsView = () => {
    const s = getSettings();
    const isAdmin = s.role === 'admin';
    
    return `
    <div class="home-card fade-in">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
            <h1 style="margin:0; font-weight:900;">НАСТРОЙКИ</h1>
            <button onclick="navigate('home')" class="close-x">✕</button>
        </div>
        
        <div style="text-align:left; max-width:600px; margin:0 auto;">
            <div style="margin-bottom:30px;">
                <label style="font-weight:bold; display:block; margin-bottom:10px;">ТЕМА ОФОРМЛЕНИЯ:</label>
                <select id="theme_select" style="width:100%;">
                    <option value="light" ${s.theme==='light'?'selected':''}>Светлая тема</option>
                    <option value="dark" ${s.theme==='dark'?'selected':''}>Темная тема</option>
                </select>
            </div>

            <div style="margin-bottom:30px;">
                <label style="font-weight:bold; display:block; margin-bottom:10px;">РОЛЬ ПОЛЬЗОВАТЕЛЯ:</label>
                <select id="role_select" onchange="handleRole(this)" style="width:100%;">
                    <option value="participant" ${!isAdmin?'selected':''}>Участник</option>
                    <option value="admin" ${isAdmin?'selected':''}>Администратор</option>
                </select>
            </div>

            ${isAdmin ? `
                <div style="background:rgba(255,255,255,0.5); padding:20px; border:2px solid var(--pronto); border-radius:15px; margin-bottom:30px; text-align:center;">
                    <h4 style="margin-top:0;">БЕЗОПАСНОСТЬ</h4>
                    <button onclick="document.getElementById('changePassModal').style.display='flex'" class="btn" style="background:orange; width:100%;">СМЕНИТЬ ПАРОЛЬ</button>
                </div>
            ` : ''}
            
            <button onclick="saveSettings()" class="btn btn-secondary" style="width:100%; height:60px; font-size:18px;">СОХРАНИТЬ</button>
        </div>
        ${modalsHTML}
    </div>`;
};

// --- ШАБЛОН ТАБЛИЦЫ ---
const templateView = () => `
    <div class="document-sheet fade-in" id="print-root">
        <div class="doc-header">
            <div style="flex-grow:1;">
         <div style="display:flex; align-items:center;">
                    <span style="font-weight:900; color:var(--pronto); font-size:32px; margin-right:15px;">SPECS №</span>
                    <input type="text" id="tz_no" style="width:250px; font-size:32px; border:none; font-weight:900;" placeholder="000-00">
                    <span id="tz_no_text" style="display:none; width:250px; font-size:32px; font-weight:900;"></span>
                </div>
                <div style="margin-top:10px;">
                    <b style="font-size:16px;">МЕНЕДЖЕР:</b> 
                    <input type="text" id="manager_name" style="border:none; border-bottom:2px solid #ccc; width:250px; font-size:16px; font-weight:bold;" placeholder="Фамилия">
                </div>
            </div>
            <button onclick="navigate('home')" class="close-x no-print">✕</button>
        </div>
        
        <div class="top-info-grid">
            <div><label style="font-size:11px; font-weight:bold; color:#64748b; display:block;">ОБОРУДОВАНИЕ</label>${renderSelect('equipment_select', 'equipment')}</div>
            <div><label style="font-size:11px; font-weight:bold; color:#64748b; display:block;">ЕД. ИЗМ.</label><select id="unit"><option>шт.</option><option>компл.</option></select></div>
            <div><label style="font-size:11px; font-weight:bold; color:#64748b; display:block;">КОЛ-ВО</label><input type="number" id="qty" value="1"></div>
        </div>

        <table class="spec-table">
            <thead><tr><th width="45">№</th><th>ПАРАМЕТР</th><th>ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ</th></tr></thead>
            <tbody>
                <tr class="section-title"><td colspan="3">1. ГАБАРИТНЫЕ РАЗМЕРЫ (мм)</td></tr>
                <tr><td>1.1</td><td>Высота (H)</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="h" value="850" style="width:70px; text-align:center;"> <span>мм</span></div></td></tr>
                <tr><td>1.2</td><td>Ширина (W)</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="w" value="1200" style="width:70px; text-align:center;"> <span>мм</span></div></td></tr>
                <tr><td>1.3</td><td>Глубина (D)</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="d" value="700" style="width:70px; text-align:center;"> <span>мм</span></div></td></tr>
                <tr><td>1.4</td><td>Допуск</td><td><div style="display:flex; align-items:center; gap:5px;"><span>±</span><input type="number" id="val_1_4" value="5" style="width:50px; text-align:center;"> <span>мм</span></div></td></tr>
                
                <tr class="section-title"><td colspan="3">2. ИСПОЛНЕНИЕ</td></tr>
                <tr><td>2.1</td><td>Материал</td><td>${renderSelect('mat', 'materials')}</td></tr>
                <tr><td>2.2</td><td>Конструкция</td><td>${renderSelect('con', 'constructions')}</td></tr>
                
                <tr class="section-title"><td colspan="3">3. ОХЛАЖДЕНИЕ</td></tr>
                <tr><td>3.1</td><td>Система</td><td>${renderSelect('cool', 'coolingMethods')}</td></tr>
                
                <tr class="section-title"><td colspan="3">4. КОМПЛЕКТАЦИЯ</td></tr>
                <tr><td>4.1</td><td>Столешница</td><td><div style="display:flex; gap:10px;">${renderSelect('val_4_1', 'tabletops')}${renderSelect('val_4_1_mat', 'tabletopMaterials')}</div></td></tr>
                <tr><td>4.2</td><td>Гастроёмкости</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_2', 'gnTypes')} <span>глуб:</span> <input type="number" id="val_4_2" value="150" style="width:60px; text-align:center;"> <span>мм</span></div></td></tr>
                <tr><td>4.3</td><td>Количество GN</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="val_4_3" value="0" style="width:60px; text-align:center;"> <span>шт.</span></div></td></tr>
                <tr><td>4.4</td><td>Двери</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_4', 'doorTypes')} <input type="number" id="val_4_4" value="2" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
                <tr><td>4.5</td><td>Ящики / Салазки</td><td><div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px;">${renderSelect('sel_4_5', 'drawerTypes')}${renderSelect('val_4_5_slides', 'slideTypes')}</div></td></tr>
                <tr><td>4.6</td><td>Полки</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_6', 'shelfTypes')} <input type="number" id="val_4_6" value="2" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
                <tr><td>4.7</td><td>Нагрузка</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="val_4_7" value="40" style="width:60px; text-align:center;"> <span>кг</span></div></td></tr>
                <tr><td>4.8</td><td>Подсветка</td><td>${renderSelect('val_4_8', 'lighting')}</td></tr>
                <tr><td>4.9</td><td>Ножки</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_9', 'legs')} <input type="number" id="val_4_9" value="4" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
<tr id="row_4_10"><td>4.10</td><td>Колеса (торм.)</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_10', 'wheels')} <input type="number" id="val_4_10" value="2" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
                
                <tr id="row_4_11" class="page-break-row"><td>4.11</td><td>Колеса (б/торм)</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_11', 'wheels')} <input type="number" id="val_4_11" value="2" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
                <tr><td>4.12</td><td>Вентиляция</td><td>${renderSelect('val_4_12', 'ventilation')}</td></tr>
                
                <tr class="section-title"><td colspan="3">5. ТЕМПЕРАТУРА</td></tr>
                <tr><td>5.1</td><td>Режим</td><td><div style="display:flex; align-items:center; gap:10px;"><span>t° :</span> <input type="text" id="val_5_1" value="+2...+8" style="width:90px; text-align:center;"> <div id="dual_temp_zone" style="display:none; align-items:center; gap:5px;"><span>/ t° :</span> <input type="text" id="val_5_1_2" value="-18" style="width:90px; text-align:center;"></div></div></td></tr>
                
                <tr class="section-title"><td colspan="3">6. СРЕДА</td></tr>
                <tr><td>6.1</td><td>Условия</td><td><div style="display:flex; align-items:center; gap:5px;"><span>+</span> <input type="number" id="val_6_1" value="32" style="width:50px; text-align:center;"> <span>/</span> <input type="number" id="val_6_2" value="60" style="width:50px; text-align:center;"> <span>%</span></div></td></tr>

                <tr class="section-title"><td colspan="3">7. ГАРАНТИЯ</td></tr>
                <tr><td>7.1</td><td>Срок гарантии</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="val_7_1" value="12" style="width:60px; text-align:center; font-weight:bold;"> <span>мес.</span></div></td></tr>

                <tr class="section-title"><td colspan="3">8. СРОК СЛУЖБЫ</td></tr>
                <tr><td>8.1</td><td>Расчетный срок</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="val_8_1" value="5" style="width:60px; text-align:center; font-weight:bold;"> <span>лет</span></div></td></tr>
                
                <tr class="section-title"><td colspan="3">9. ЭСКИЗ И ПРИМЕЧАНИЯ</td></tr>
                <tr><td colspan="3">
                    <div style="display:grid; grid-template-columns: 1fr 300px; gap:20px; min-height:250px;">
                        <textarea id="val_9_1" style="width:100%; resize:none; padding:10px; border:1px solid #cbd5e1; border-radius:10px;" placeholder="Примечание..."></textarea>
                        <div style="border:3px dashed #cbd5e1; border-radius:15px; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="document.getElementById('file_input').click()" id="upload_zone">
                            <img id="preview_img" style="display:none; max-width:100%; max-height:100%; object-fit:contain;">
                            <div id="img_text" style="text-align:center; color:#94a3b8; font-weight:bold;">📷 ФОТО</div>
                            <input type="file" id="file_input" style="display:none;" onchange="handleFile(this)">
                        </div>
                    </div>
                </td></tr>
</tbody>
        </table>

        <div class="footer-btns no-print" style="display:flex; gap:10px; margin-top:20px;">
            <button class="btn" onclick="saveToArchive()" style="background:#10b981; color:white; font-weight:bold; flex:1;">В АРХИВ</button>
            <button class="btn btn-secondary" onclick="handlePrint()" style="flex:1;">ПЕЧАТЬ</button>
            <button class="btn" onclick="genPDF()" style="background:#2b6cb0; color:white; flex:1;">PDF</button>
            <button class="btn" onclick="sendTZ()" style="background:#8b5cf6; color:white; font-weight:bold; flex:1;">ОТПРАВИТЬ</button>
        </div>
        
        ${modalsHTML}
    </div>`; // <--- ВАЖНО: Вот этот закрывающий div и кавычка спасают код!

// ======================================================
// 10. ОБРАБОТЧИКИ СОБЫТИЙ И ЛОГИКА
// ======================================================

function populateSelects() {
    const map = { 
        'equipment_select': 'equipment', 'mat': 'materials', 'con': 'constructions', 'cool': 'coolingMethods', 
        'val_4_1': 'tabletops', 'val_4_1_mat': 'tabletopMaterials', 'sel_4_2': 'gnTypes', 
        'sel_4_4': 'doorTypes', 'sel_4_5': 'drawerTypes', 'val_4_5_slides': 'slideTypes', 
        'sel_4_6': 'shelfTypes', 'val_4_8': 'lighting', 'sel_4_9': 'legs', 'sel_4_10': 'wheels', 
        'sel_4_11': 'wheels', 'val_4_12': 'ventilation' 
    };
    
    for (let id in map) {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = '<option disabled selected>-- Выбор --</option>';
            const list = APP_CONFIG[map[id]] || [];
            list.forEach(v => el.add(new Option(v, v)));
        }
    }
}

function checkDualTemp() {
    const el = document.getElementById('equipment_select'); 
    if (el) {
        const zone = document.getElementById('dual_temp_zone');
        if (zone) {
            zone.style.display = el.value.toLowerCase().includes('комби') ? 'flex' : 'none';
        }
    }
}

function handleRole(el) { 
    if (el.value === 'admin') {
        document.getElementById('loginModal').style.display = 'flex'; 
    }
}

function closeModals() { 
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); 
}

function checkLogin() {
    if (document.getElementById('inputPassword').value === APP_CONFIG.adminPassword) {
        localStorage.setItem('pronto_settings', JSON.stringify({role: 'admin', theme: getSettings().theme}));
        closeModals(); 
        navigate('settings');
    } else {
        alert("Неверно!");
    }
}

function saveNewCredentials() {
    const p = document.getElementById('newPassword').value;
    if (p.length < 3) return alert("Пароль слишком короткий!");
    APP_CONFIG.adminPassword = p; 
    syncToCloud(); 
    closeModals(); 
    alert("Пароль обновлен");
}

function saveSettings() {
    const r = document.getElementById('role_select').value;
    const t = document.getElementById('theme_select').value;
    localStorage.setItem('pronto_settings', JSON.stringify({role: r, theme: t}));
    applyTheme(); 
    navigate('home');
}

function handleFile(input) {
    const f = input.files[0];
    if (f) {
        const r = new FileReader();
        r.onload = e => {
            uploadedImageBase64 = e.target.result;
            const img = document.getElementById('preview_img');
            img.src = e.target.result; 
            img.style.display = 'block';
            document.getElementById('img_text').style.display = 'none';
        };
        r.readAsDataURL(f);
    }
}

// --- ИСПРАВЛЕННАЯ ПЕЧАТЬ С ЗАДЕРЖКОЙ ---
function handlePrint() {
    prepareForPrint(true); // Меняем "Выбор" на "Нет"
    
    // Даем браузеру 100 миллисекунд на обновление экрана перед печатью
    setTimeout(() => {
        window.print();
        setTimeout(() => prepareForPrint(false), 500); // Возвращаем всё обратно
    }, 100);
}

// --- ХИТРЫЙ ГЕНЕРАТОР PDF (С БЕЛОЙ ЗОНОЙ ДЛЯ РАЗРЕЗА) ---
function genPDF() {
    const el = document.querySelector('.document-sheet');
    const footer = document.querySelector('.footer-btns');
    const closeBtn = document.querySelector('.close-x');
    const row411 = document.getElementById('row_4_11'); // Находим строку 4.11
    
    prepareForPrint(true);
    if (footer) footer.style.display = 'none';
    if (closeBtn) closeBtn.style.display = 'none';

    // ХИТРОСТЬ: Делаем отступ 50px сверху у строки 4.11, чтобы линия разреза прошла по пустоте
    if (row411) {
        Array.from(row411.children).forEach(td => td.style.paddingTop = '50px');
    }

    setTimeout(async () => {
        try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 190;
            const pageHeight = 297; 
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 10; 
            const sliceHeight = pageHeight - 20; // Стандартный вырез

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= sliceHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 10; 
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position - 20, imgWidth, imgHeight); 
                heightLeft -= sliceHeight;
            }

            pdf.save(`TZ_${document.getElementById('tz_no').value || 'DOC'}.pdf`);

        } catch (err) { 
            alert("Ошибка при создании PDF."); 
        } finally { 
            // Возвращаем всё как было
            if (footer) footer.style.display = 'flex'; 
            if (closeBtn) closeBtn.style.display = 'block';
            if (row411) {
                Array.from(row411.children).forEach(td => td.style.paddingTop = ''); // Убираем отступ
            }
            prepareForPrint(false);
        }
    }, 150); 
}
// --- УМНАЯ ПОДГОТОВКА (С ФИКСОМ УПЛЫВАЮЩЕГО НОМЕРА) ---
function prepareForPrint(enable) {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    // Элементы номера ТЗ
    const tzInp = document.getElementById('tz_no');
    const tzTxt = document.getElementById('tz_no_text');

    inputs.forEach(el => {
        if(enable) {
            if(el.tagName === 'SELECT' && el.options && el.selectedIndex >= 0) {
                if(!el.dataset.originalText) el.dataset.originalText = el.options[el.selectedIndex].text;
                if(el.value.includes('Выбор') || el.value === '' || el.value.includes('--')) {
                    el.options[el.selectedIndex].text = 'Нет';
                }
            }
        } else {
            if(el.tagName === 'SELECT' && el.dataset.originalText && el.options && el.selectedIndex >= 0) {
                el.options[el.selectedIndex].text = el.dataset.originalText;
                delete el.dataset.originalText;
            }
        }
    });

    // Меняем поле ввода на текст, чтобы номер не уплывал в PDF
    if(enable) {
        if(tzInp && tzTxt) {
            tzTxt.innerText = tzInp.value || '000-00'; // Копируем текст
            tzInp.style.display = 'none';              // Прячем поле
            tzTxt.style.display = 'inline-block';      // Показываем ровный текст
        }
    } else {
        if(tzInp && tzTxt) {
            tzInp.style.display = 'inline-block';      // Возвращаем поле обратно
            tzTxt.style.display = 'none';              // Прячем текст
        }
    }

    const imgText = document.getElementById('img_text');
    if(imgText) imgText.style.display = enable ? 'none' : (uploadedImageBase64 ? 'none' : 'block');
    
    const upZone = document.getElementById('upload_zone');
    if(upZone) upZone.style.border = enable ? 'none' : '3px dashed #cbd5e1';
}

function deleteFromArchive(i) {
    if(confirm("Удалить проект из архива?")) {
        const arc = getArchive(); 
        arc.splice(i,1);
        localStorage.setItem('pronto_archive', JSON.stringify(arc)); 
        navigate('home');
    }
}

function editFromArchive(i) {
    const d = getArchive()[i]; 
    navigate('template');
    setTimeout(() => {
        document.getElementById('tz_no').value = d.tz_no;
        document.getElementById('equipment_select').value = d.eq;
        document.getElementById('manager_name').value = d.manager || '';
        if(d.image) {
            uploadedImageBase64 = d.image;
            document.getElementById('preview_img').src = d.image;
            document.getElementById('preview_img').style.display = 'block';
            document.getElementById('img_text').style.display = 'none';
        }
    }, 100);
}

function createNewTZ() { 
    uploadedImageBase64 = null; 
    navigate('template'); 
}

// --- МАГИЯ ОТПРАВКИ В МЕССЕНДЖЕРЫ (Web Share API) ---
async function sendTZ() {
    const tzNo = document.getElementById('tz_no').value || "DOC";
    const fileName = `TZ_${tzNo}.pdf`;
    
    const el = document.querySelector('.document-sheet');
    const footer = document.querySelector('.footer-btns');
    const closeBtn = document.querySelector('.close-x');
    
    // Прячем лишнее перед созданием PDF
    prepareForPrint(true);
    if (footer) footer.style.display = 'none';
    if (closeBtn) closeBtn.style.display = 'none';

    // Даем паузу, чтобы спрятались кнопки
    setTimeout(async () => {
        try {
            // 1. Создаем PDF (точно так же, как при сохранении)
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 190;
            const pageHeight = 297; 
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 10; 
            const sliceHeight = pageHeight - 28; 

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= sliceHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 10; 
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position - 28, imgWidth, imgHeight); 
                heightLeft -= sliceHeight;
            }

            // 2. ПРЕВРАЩАЕМ PDF В ФАЙЛ ДЛЯ ОТПРАВКИ (Без скачивания)
            const pdfBlob = pdf.output('blob'); 
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            // 3. ВЫЗЫВАЕМ МЕНЮ "ПОДЕЛИТЬСЯ" (Telegram, WhatsApp и т.д.)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Техническое задание №${tzNo}`,
                    text: `Отправляю ТЗ №${tzNo} из PRONTO SPECS.`
                });
            } else {
                // Если браузер старый или это компьютер без поддержки Share
                alert("На этом устройстве нет меню 'Поделиться'. Файл будет просто скачан.");
                pdf.save(fileName);
            }

        } catch (err) { 
            // Если пользователь просто отменил отправку, ошибку не показываем
            if (err.name !== 'AbortError') {
                alert("Ошибка при отправке: " + err); 
            }
        } finally { 
            // Возвращаем кнопки обратно
            if (footer) footer.style.display = 'flex'; 
            if (closeBtn) closeBtn.style.display = 'block';
            prepareForPrint(false);
        }
    }, 150);
}

function sendFromArchive(index) {
    // Безопасный способ: просим пользователя открыть ТЗ для генерации
    alert("Чтобы отправить ТЗ в мессенджер, сначала откройте его (зеленая кнопка 📂), а затем нажмите 'ОТПРАВИТЬ' внутри документа.");
}

// --- ВРЕМЕННЫЕ ФУНКЦИИ ВХОДА (ДЛЯ ПОРТАЛА) ---
function mockLogin() {
    const login = document.getElementById('auth_login').value;
    if(login.trim() === '') {
        alert("Введите логин!");
        return;
    }
    // Временно пускаем всех для теста дизайна
    alert("Успешный вход!");
    navigate('home'); // Пускаем в приложение SPECS
}

function mockRegister() {
    const login = document.getElementById('auth_login').value;
    if(login.trim() === '') {
        alert("Придумайте логин для регистрации!");
        return;
    }
    alert("Заявка на регистрацию отправлена администратору! (Тестовый режим)");
}
















