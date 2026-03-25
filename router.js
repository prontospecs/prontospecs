// ======================================================
// 1. ИНИЦИАЛИЗАЦИЯ И СИСТЕМНЫЕ ФУНКЦИИ
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(hideLoader, 3000); 

    if (typeof db !== 'undefined') {
        db.ref('settings').on('value', (snapshot) => {
            const cloudData = snapshot.val();
            if (cloudData) {
                window.APP_CONFIG = cloudData;
                if (document.getElementById('equipment_select')) populateSelects();
            } else {
                db.ref('settings').set(window.APP_CONFIG || {});
            }
            hideLoader();
        });
    } else {
        hideLoader(); 
    }

    applyTheme();
    navigate('portal'); 
});

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader && loader.style.display !== 'none') {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
}

let uploadedImageBase64 = null; 
let currentManageKey = null;    

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ГЕТАРХИВ
const getArchive = () => {
    try {
        const data = localStorage.getItem('pronto_archive');
        const parsed = data ? JSON.parse(data) : [];
        // - Защита: всегда возвращаем массив
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

// НОВОЕ: Функции для корзины
const getTrash = () => {
    try {
        const data = localStorage.getItem('pronto_trash');
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

const cleanupTrash = (trashArray) => {
    const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return trashArray.filter(item => (now - (item.deletedAt || 0)) < fifteenDaysInMs);
};

const getSettings = () => {
    const data = localStorage.getItem('pronto_settings');
    return data ? JSON.parse(data) : { role: "participant", theme: "light" };
};

function applyTheme() {
    const settings = getSettings();
    document.body.className = settings.theme === 'dark' ? 'dark-theme' : '';
}

function syncToCloud() {
    if (typeof db !== 'undefined' && window.APP_CONFIG) {
        db.ref('settings').set(window.APP_CONFIG);
    }
}

function navigate(view) {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = ''; 

    // Сначала определяем основной шаблон
    let mainContent = '';
    if (view === 'portal') mainContent = portalView();
    else if (view === 'login') mainContent = loginView();
    else if (view === 'register') mainContent = registerView();
    else if (view === 'home') mainContent = homeView();
    else if (view === 'settings') mainContent = settingsView();
    else if (view === 'template') mainContent = templateView();
    else if (view === 'trash') mainContent = trashView();
    else if (view === 'admin_trash') mainContent = adminTrashView();
    else mainContent = portalView();

    // ВАЖНО: Сначала собираем ВЕСЬ HTML (шаблон + модалки)
    app.innerHTML = mainContent + modalsHTML;

    // И ТОЛЬКО ПОТОМ запускаем функции, которые ищут элементы на экране
    if (view === 'admin_trash') {
        loadAllTrashForAdmin(); // Теперь она найдет "живой" блок
    }

    if (view === 'template') {
        setTimeout(() => {
            populateSelects();
            checkDualTemp();
        }, 50);
    }
    
    window.scrollTo(0, 0);
}
// ======================================================
// 2. АДМИНКА И СПИСКИ (НАСТРОЙКИ СЕЛЕКТОРОВ)
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
    
    if (window.APP_CONFIG && window.APP_CONFIG[currentManageKey]) {
        const list = window.APP_CONFIG[currentManageKey];
        list.forEach(item => modalSelect.add(new Option(item, item)));
    }
}

function manAdd() {
    const val = prompt("Введите название нового пункта:");
    if (val && val.trim()) {
        if (!window.APP_CONFIG[currentManageKey]) window.APP_CONFIG[currentManageKey] = [];
        window.APP_CONFIG[currentManageKey].push(val.trim());
        refreshAfterChange();
    }
}

function manEdit() {
    const modalSelect = document.getElementById('manageListSelect');
    const oldVal = modalSelect.value;
    if (!oldVal) return;
    const newVal = prompt("Изменить название:", oldVal);
    if (newVal && newVal.trim() && newVal !== oldVal) {
        const idx = window.APP_CONFIG[currentManageKey].indexOf(oldVal);
        window.APP_CONFIG[currentManageKey][idx] = newVal.trim();
        refreshAfterChange();
    }
}

function manDel() {
    const modalSelect = document.getElementById('manageListSelect');
    if (confirm(`Удалить "${modalSelect.value}"?`)) {
        window.APP_CONFIG[currentManageKey] = window.APP_CONFIG[currentManageKey].filter(v => v !== modalSelect.value);
        refreshAfterChange();
    }
}

function refreshAfterChange() {
    renderManageList();
    if (document.getElementById('equipment_select')) populateSelects();
    syncToCloud();
}

function renderSelect(id, configKey) {
    const isAdmin = getSettings().role === 'admin';
    let btnHTML = isAdmin ? `<button onclick="openManageMenu('${configKey}', '${id}')" class="admin-add-btn no-print" style="margin-left:5px; background:#10b981; color:white; border:none; border-radius:8px; width:32px; height:36px; font-weight:bold; cursor:pointer;">+</button>` : '';
    return `<div style="display:flex; align-items:center; width:100%;"><select id="${id}" style="flex-grow:1;"></select>${btnHTML}</div>`;
}

// ======================================================
// 3. HTML ШАБЛОНЫ (ВИЗУАЛ)
// ======================================================

const modalsHTML = `
    <div id="loginModal" class="modal" style="display:none">
        <div class="modal-content">
            <h3 style="color:var(--pronto); margin-top:0;">ВХОД (СИСТЕМНЫЙ)</h3>
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

    <div id="printReminderModal" class="modal" style="display:none; z-index: 1000;">
        <div class="modal-content" style="border: 3px solid var(--pronto); box-shadow: 0 0 50px rgba(0,0,0,0.5);">
            <h2 style="color:red; font-weight:900; margin-top:0;">⚠️ ВНИМАНИЕ!</h2>
            <p style="font-size:18px; font-weight:bold; margin:20px 0;">
                В открывшемся окне печати ОБЯЗАТЕЛЬНО установите:<br>
                <span style="background:yellow; padding:5px; font-size:24px; color:black;">МАСШТАБ: 80%</span>
            </p>
            <div style="display:flex; gap:10px;">
                <button onclick="closeModals()" class="btn btn-secondary" style="flex:1; background:#64748b;">ОТМЕНА</button>
                <button onclick="startFinalPrint()" class="btn" style="flex:1; background:#10b981; font-size:18px;">ПЕЧАТАТЬ</button>
            </div>
        </div>
    </div>
`;

const portalView = () => `
    <div class="home-card fade-in" style="max-width: 800px; text-align: center;">
        <h1 class="main-title" style="font-size: 48px;">PRONTO</h1>
        <div class="subtitle" style="font-size: 24px; margin-bottom: 5px;">SPECS</div>
        <p style="color:#64748b; margin-bottom: 40px;">Единая платформа для всех сервисов компании</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; text-align: left;">
            
            <div style="border:2px solid #cbd5e1; border-radius:15px; padding:25px; cursor:pointer; transition:0.3s; background: white;" 
                 onmouseover="this.style.borderColor='var(--pronto)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.1)'" 
                 onmouseout="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none'" 
                 onclick="navigate('login')">
                <div style="color:var(--pronto); margin-bottom:15px;">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="5" y1="9" x2="19" y2="9"></line>
                        <line x1="9" y1="4.5" x2="9" y2="6.5"></line>
                        <line x1="9" y1="12" x2="9" y2="15"></line>
                    </svg>
                </div>
              <h3 class="fridge-title" style="margin:0 0 5px 0; color:var(--text); font-size:22px;">PRODUCTION SPECS</h3>
                <div style="font-size:14px; font-weight:bold; color:var(--pronto); margin-bottom:10px;">(fridge)</div>
                <p style="font-size:13px; color:#64748b; margin:0;">Генератор технических заданий.</p>
            </div>

            <div style="border:2px solid #cbd5e1; border-radius:15px; padding:25px; cursor:pointer; transition:0.3s; background: white;" 
                 onmouseover="this.style.borderColor='#eab308'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.1)'" 
                 onmouseout="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none'" 
                 onclick="window.location.href='./kp-app/index.html'">
                
                <div style="margin-bottom:15px;">
                    <div style="width:55px; height:55px; background: radial-gradient(circle, #fef08a 0%, #eab308 70%, #ca8a04 100%); border-radius:50%; display:flex; align-items:center; justify-content:center; border: 3px solid #a16207; box-shadow: inset 0 0 8px rgba(255,255,255,0.8), 0 5px 10px rgba(0,0,0,0.15);">
                        <span style="color:#854d0e; font-weight:900; font-size:32px; font-family:sans-serif; text-shadow: 1px 1px 0px rgba(255,255,255,0.5);">$</span>
                    </div>
                </div>

                <h3 style="margin:0 0 5px 0; color:var(--text); font-size:22px;">BUSINESS PROPOSAL</h3>
                <div style="font-size:14px; font-weight:bold; color:#eab308; margin-bottom:10px;">(commercial)</div>
                <p style="font-size:13px; color:#64748b; margin:0;">Конструктор коммерческих предложений и база товаров.</p>
            </div>

        </div>
    </div>
`;

const loginView = () => {
    // Достаем сохраненный логин и пароль
    const savedLogin = localStorage.getItem('pronto_saved_login') || '';
    const savedPass = localStorage.getItem('pronto_saved_pass') || '';
    
    return `
    <div class="home-card fade-in" style="max-width: 400px; text-align: center;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <button onclick="navigate('portal')" class="btn-mini" style="background:#cbd5e1; color:#0f172a;">🡠 Назад</button>
            <h2 style="margin:0; color:var(--pronto);">ВХОД</h2>
            <div style="width:50px;"></div>
        </div>
        <div style="text-align: left;">
            <label style="font-weight:bold; font-size:12px; color:#64748b;">ЛОГИН:</label>
            <input type="text" id="auth_login" placeholder="Ваш логин" value="${savedLogin}" style="width:100%; padding:12px; margin-bottom:15px; border:2px solid #e2e8f0; border-radius:8px;">
            
            <label style="font-weight:bold; font-size:12px; color:#64748b;">ПАРОЛЬ:</label>
            <div style="position:relative; margin-bottom:15px;">
                <input type="password" id="auth_pass" placeholder="Ваш пароль" value="${savedPass}" style="width:100%; padding:12px; border:2px solid #e2e8f0; border-radius:8px; padding-right:40px;">
                <span onclick="document.getElementById('auth_pass').type = document.getElementById('auth_pass').type === 'password' ? 'text' : 'password'" style="position:absolute; right:15px; top:12px; cursor:pointer; font-size:18px;">👁️</span>
            </div>
            
            <div style="margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                <input type="checkbox" id="remember_login" ${savedLogin ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
                <label for="remember_login" style="font-size:14px; color:#64748b; cursor:pointer; user-select:none;">Запомнить меня</label>
            </div>
            
            <button onclick="mockLogin()" class="btn" style="width:100%; margin-bottom:15px; background:#10b981;">ВОЙТИ</button>
            <div style="text-align:center; margin-top:10px;">
                <span style="color:#64748b; font-size:14px;">Нет аккаунта? </span>
                <a href="#" onclick="navigate('register')" style="color:var(--pronto); font-weight:bold; text-decoration:none;">Зарегистрироваться</a>
            </div>
        </div>
    </div>
    `;
};

const homeView = () => {
    const s = getSettings();
    const archive = getArchive();
    
    return `
    <div class="home-card fade-in">
        <h1 class="main-title">PRODUCTION</h1>
        <div class="subtitle">SPECS</div>
        <div style="font-size:16px; font-weight:bold; color:var(--pronto); margin-top:-10px; margin-bottom:20px; text-transform:uppercase;">(fridge)</div>
        
        <button onclick="createNewTZ()" class="btn" style="height:85px; width:100%; font-size:22px; margin-bottom:20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">+ СОЗДАТЬ ТЗ</button>
        
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <button onclick="navigate('settings')" class="btn btn-secondary" style="flex:1;">НАСТРОЙКИ СИСТЕМЫ</button>
            <button onclick="navigate('portal')" class="btn btn-secondary" style="background:#64748b; border:none; color:white;">НА ПОРТАЛ</button>
        </div>
        
        <div style="margin-top:70px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid var(--border); padding-bottom:15px; margin-bottom:15px;">
                <h4 style="margin:0; color:var(--pronto); font-weight:900;">ПОСЛЕДНИЕ ПРОЕКТЫ</h4>
                <button onclick="navigate('trash')" class="btn-mini" style="background:#ef4444; border:none; color:white; padding:8px 15px; font-size:12px; border-radius:10px; cursor:pointer; font-weight:bold;">🗑️ КОРЗИНА</button>
            </div>

            ${archive.length > 0 ? archive.map((item, i) => `
                <div class="archive-item">
                    <div class="archive-content" style="display:flex; align-items:center; gap:15px; width:100%;">
                        ${item.image ? `<img src="${item.image}" class="archive-thumb">` : `<div class="archive-thumb" style="display:flex; align-items:center; justify-content:center; color:#ccc;">📷</div>`}
                        <div style="flex:1;">
                            <b style="font-size:18px; color:var(--pronto);">№ ${item.tz_no}</b>
                            <div style="font-size:14px; margin-top:5px; font-weight:bold;">${item.eq}</div>
                            <div style="font-size:12px; color:#64748b; margin-top:3px;">Менеджер: ${item.manager || '—'} | ${item.date}</div>
                        </div>
                    </div>
                    <div class="archive-actions" style="margin-top:15px; display:flex; justify-content:flex-end; gap:8px;">
                        <button onclick="editFromArchive(${i})" class="btn-mini" style="background:#10b981;" title="Открыть">📂</button>
                        <button onclick="pdfFromArchive(${i})" class="btn-mini" style="background:#3b82f6;" title="PDF">📄</button>
                        <button onclick="printFromArchive(${i})" class="btn-mini" style="background:#64748b;" title="Печать">🖨️</button>
                        <button onclick="sendFromArchiveBtn(${i})" class="btn-mini" style="background:#8b5cf6;" title="Отправить">📤</button>
                        <button onclick="deleteFromArchive(${i})" class="btn-mini" style="background:#ef4444;" title="Удалить">🗑️</button>
                    </div>
                </div>
            `).join('') : '<p style="text-align:center; color:#94a3b8; padding:40px;">Архив пуст</p>'}
        </div>
    </div>`;
};


const settingsView = () => {
    const s = getSettings();
    const isAdmin = s.role === 'admin';
    if (isAdmin) {
        setTimeout(() => {
            loadAllUsers();
            loadAllProjectsForAdmin();
        }, 100);
    }

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
                <div style="background:rgba(255,255,255,0.5); padding:20px; border:2px solid var(--pronto); border-radius:15px; margin-bottom:30px;">
                    <h4 style="margin-top:0; text-align:center; color:var(--pronto);">УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</h4>
                    <div id="all_users_list" style="background:#f8fafc; border-radius:10px; padding:15px; text-align:center; border: 1px solid #cbd5e1; max-height:300px; overflow-y:auto;">Загрузка...</div>
                </div>

          <div style="background:rgba(255,255,255,0.5); padding:20px; border:2px solid var(--pronto); border-radius:15px; margin-bottom:30px;">
    <h4 style="margin-top:0; text-align:center; color:var(--pronto);">БАЗА ВСЕХ ПРОЕКТОВ (ТЗ)</h4>
    
    <input type="text" id="admin_search" onkeyup="searchAllProjects()" placeholder="🔍 Поиск по № ТЗ или Менеджеру..." style="width:100%; padding:12px; border-radius:8px; border:2px solid #cbd5e1; margin-bottom:15px;">
    
    <button onclick="navigate('admin_trash')" class="btn" style="background:#ef4444; width:100%; margin-bottom:15px; font-size:14px; font-weight:bold; border:none; color:white; cursor:pointer;">🗑️ ПОСМОТРЕТЬ УДАЛЕННЫЕ (ОБЩАЯ КОРЗИНА)</button>
    
    <div id="admin_projects_list" style="background:#f8fafc; border-radius:10px; padding:15px; border: 1px solid #cbd5e1; max-height:400px; overflow-y:auto;">Идет поиск в базе...</div>
</div>

                <div style="background:rgba(255,255,255,0.5); padding:20px; border:2px solid var(--pronto); border-radius:15px; margin-bottom:30px;">
                    <h4 style="margin-top:0; text-align:center;">БЕЗОПАСНОСТЬ</h4>
                    <button onclick="document.getElementById('changePassModal').style.display='flex'" class="btn" style="background:orange; width:100%;">СМЕНИТЬ ПАРОЛЬ АДМИНА</button>
                </div>
            ` : ''}

            <button onclick="saveSettings()" class="btn btn-secondary" style="width:100%; height:60px; font-size:18px;">СОХРАНИТЬ И ВЫЙТИ</button>
        </div>
        ${modalsHTML}
    </div>`;
};
// Найди конец функции settingsView (после последней обратной кавычки `)
// И вставляй:

const trashView = () => {
    let trash = getTrash();
    // Авто-очистка при открытии (15 дней)
    const cleanedTrash = cleanupTrash(trash);
    if (cleanedTrash.length !== trash.length) {
        trash = cleanedTrash;
        localStorage.setItem('pronto_trash', JSON.stringify(trash));
        const s = getSettings();
        if (s.username) db.ref('users/' + s.username + '/trash').set(trash);
    }

    return `
    <div class="home-card fade-in">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <h1 style="margin:0; color:#ef4444;">КОРЗИНА (15 ДНЕЙ)</h1>
            <button onclick="navigate('home')" class="close-x">✕</button>
        </div>
        <div style="text-align:left;">
            ${trash.length > 0 ? trash.map((item, i) => `
                <div class="archive-item" style="border-left: 4px solid #ef4444; margin-bottom:10px; padding:15px; background:white; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1;">
                        <b style="font-size:16px;">№ ${item.tz_no}</b> — <span style="color:var(--pronto);">${item.eq}</span><br>
                        <small style="color:#64748b;">Удалено: ${new Date(item.deletedAt).toLocaleDateString()} (владелец: ${item._originalOwner || 'вы'})</small>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="restoreFromTrash(${i})" class="btn-mini" style="background:#10b981; padding:8px 12px;">Восстановить</button>
                        <button onclick="permanentDelete(${i})" class="btn-mini" style="background:#ef4444; padding:8px 12px;">Удалить</button>
                    </div>
                </div>
            `).join('') : '<p style="text-align:center; padding:50px; color:#94a3b8;">Корзина пуста</p>'}
        </div>
    </div>`;
};
const templateView = () => `
    <style>
        @media print {
            #signature-box {
                margin-top: 650px !important; 
            }
        }
    </style>

    <div class="document-sheet fade-in" id="print-root">
        
        <div id="pdf-page-1">
            <div class="doc-header" style="display:flex; align-items:flex-start;">
                <div style="flex-grow:1; padding-right: 20px;">
                    <div style="display:flex; align-items:center; padding-bottom: 5px;">
                        <span style="font-weight:900; color:var(--pronto); font-size:32px; margin-right: 20px;">SPECS (ТЗ) №</span>
                        <input type="text" id="tz_no" style="width:200px; font-size:32px; border:none; font-weight:900; margin:0; padding:2px; line-height:normal; background:transparent;" placeholder="000-00">
                        <span id="tz_no_text" style="display:none; font-size:32px; font-weight:900; margin:0; padding:2px; line-height:normal;"></span>
                    </div>
                    
                    <div style="margin-top:10px; display:flex; align-items:baseline; width:100%;">
                        <b style="font-size:16px; margin-right:10px; white-space:nowrap;">ЗАКАЗЧИК:</b> 
                        <input type="text" id="client_name" style="flex-grow:1; margin-right:10px; border:none; border-bottom:2px solid #ccc; font-size:16px; font-weight:bold; background:transparent; outline:none;" placeholder="Название компании или ФИО клиента">
                    </div>

                    <div style="margin-top:10px;">
                        <b style="font-size:16px; margin-right:10px;">МЕНЕДЖЕР:</b> 
                        <input type="text" id="manager_name" style="border:none; border-bottom:2px solid #ccc; width:250px; font-size:16px; font-weight:bold; background:transparent; outline:none;" placeholder="Фамилия">
                    </div>
                </div>
                <button onclick="navigate('home')" class="close-x no-print">✕</button>
            </div>
            
            <div class="top-info-grid" style="margin-top: 20px;">
                <div><label style="font-size:11px; font-weight:bold; color:#64748b; display:block;">ОБОРУДОВАНИЕ</label>${renderSelect('equipment_select', 'equipment')}</div>
                <div><label style="font-size:11px; font-weight:bold; color:#64748b; display:block;">ЕД. ИЗМ.</label><select id="unit"><option>шт.</option><option>компл.</option></select></div>
                <div><label style="font-size:11px; font-weight:bold; color:#64748b; display:block;">КОЛ-ВО</label><input type="number" id="qty" style="width:100%;"></div>
            </div>

            <table class="spec-table">
                <thead><tr><th width="45">№</th><th>ПАРАМЕТР</th><th>ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ</th></tr></thead>
                <tbody>
                    <tr class="section-title"><td colspan="3">1. ГАБАРИТНЫЕ РАЗМЕРЫ (мм)</td></tr>
                    <tr><td>1.1</td><td>Длина (L)</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="h" style="width:70px; text-align:center;"> <span>мм</span></div></td></tr>
                    <tr><td>1.2</td><td>Ширина|Глубина (W|D)</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="w" style="width:70px; text-align:center;"> <span>мм</span></div></td></tr>
                    <tr><td>1.3</td><td>Высота (H)</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="d" style="width:70px; text-align:center;"> <span>мм</span></div></td></tr>
                    <tr><td>1.4</td><td>Допуск</td><td><div style="display:flex; align-items:center; gap:5px;"><span>±</span><input type="number" id="val_1_4" style="width:50px; text-align:center;"> <span>мм</span></div></td></tr>
                    
                    <tr class="section-title"><td colspan="3">2. ИСПОЛНЕНИЕ</td></tr>
                    <tr><td>2.1</td><td>Материал</td><td>${renderSelect('mat', 'materials')}</td></tr>
                    <tr><td>2.2</td><td>Конструкция</td><td>${renderSelect('con', 'constructions')}</td></tr>
                    
                    <tr class="section-title"><td colspan="3">3. ОХЛАЖДЕНИЕ</td></tr>
                    <tr><td>3.1</td><td>Система</td><td>${renderSelect('cool', 'coolingMethods')}</td></tr>
                    
                    <tr class="section-title"><td colspan="3">4. КОМПЛЕКТАЦИЯ</td></tr>
                    <tr><td>4.1</td><td>Столешница</td><td><div style="display:flex; gap:10px;">${renderSelect('val_4_1', 'tabletops')}${renderSelect('val_4_1_mat', 'tabletopMaterials')}</div></td></tr>
                    <tr><td>4.2</td><td>Гастроёмкости</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_2', 'gnTypes')} <span>глуб:</span> <input type="number" id="val_4_2" style="width:60px; text-align:center;"> <span>мм</span></div></td></tr>
                    <tr><td>4.3</td><td>Количество GN</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="val_4_3" style="width:60px; text-align:center;"> <span>шт.</span></div></td></tr>
                    <tr><td>4.4</td><td>Двери</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_4', 'doorTypes')} <input type="number" id="val_4_4" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
                    <tr><td>4.5</td><td>Ящики / Салазки</td><td><div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px;">${renderSelect('sel_4_5', 'drawerTypes')}${renderSelect('val_4_5_slides', 'slideTypes')}</div></td></tr>
                    <tr><td>4.6</td><td>Полки</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_6', 'shelfTypes')} <input type="number" id="val_4_6" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
                    <tr><td>4.7</td><td>Нагрузка</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="val_4_7" style="width:60px; text-align:center;" value="15"> <span>кг</span></div></td></tr>
                    <tr><td>4.8</td><td>Подсветка</td><td>${renderSelect('val_4_8', 'lighting')}</td></tr>
                    <tr><td>4.9</td><td>Ножки</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_9', 'legs')} <input type="number" id="val_4_9" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
                    <tr><td>4.10</td><td>Колеса</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_10', 'wheels')} <input type="number" id="val_4_10" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
                    <tr><td>4.11</td><td>Вентиляция</td><td>${renderSelect('val_4_12', 'ventilation')}</td></tr>
                </tbody>
            </table>
        </div> 
        
        <div id="pdf-page-2" style="margin-top: 20px;">
            <table class="spec-table">
                <tbody>
                    <tr class="section-title"><td colspan="3">5. ТЕМПЕРАТУРА</td></tr>
                    <tr><td>5.1</td><td>Режим</td><td><div style="display:flex; align-items:center; gap:10px;"><span>t° :</span> <input type="text" id="val_5_1" style="width:90px; text-align:center;"> <div id="dual_temp_zone" style="display:none; align-items:center; gap:5px;"><span>/ t° :</span> <input type="text" id="val_5_1_2" style="width:90px; text-align:center;"></div></div></td></tr>
                    
                    <tr class="section-title"><td colspan="3">6. СРЕДА</td></tr>
                    <tr><td>6.1</td><td>Условия эксплуатации</td><td><div style="display:flex; align-items:center; gap:5px;"><span>+</span> <input type="number" id="val_6_1" style="width:50px; text-align:center;"> <span>/</span> <input type="number" id="val_6_2" style="width:50px; text-align:center;"> <span>%</span></div></td></tr>

                    <tr class="section-title"><td colspan="3">7. ГАРАНТИЯ</td></tr>
                    <tr><td>7.1</td><td>Срок гарантии</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="val_7_1" style="width:60px; text-align:center; font-weight:bold;"> <span>мес.</span></div></td></tr>
                    
                    <tr class="section-title page-break-print"><td colspan="3">8. ЭСКИЗ И ПРИМЕЧАНИЯ</td></tr>
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

            <div id="signature-box" style="margin-top:40px; margin-bottom:10px; font-weight:bold; font-size:16px; color:black;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 30px;">
                    <div>ЗАКАЗЧИК: _____________________</div>
                    <div>ИСПОЛНИТЕЛЬ: _____________________</div>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <div>ДАТА: _________________________</div>
                    <div>СРОК: _________________________</div>
                </div>
            </div>
        </div> 
        
        <div class="footer-btns no-print" style="display:flex; gap:10px; margin-top:20px;">
            <button class="btn" onclick="saveToArchive()" style="background:#10b981; color:white; font-weight:bold; flex:1;">
                ${window.currentEditIndex !== null && window.currentEditIndex !== undefined ? '💾 СОХРАНИТЬ ИЗМЕНЕНИЯ' : '📥 В АРХИВ'}
            </button>
            <button class="btn btn-secondary" onclick="handlePrint()" style="flex:1;">ПЕЧАТЬ</button>
            <button class="btn" onclick="genPDF()" style="background:#2b6cb0; color:white; flex:1;">PDF</button>
            <button class="btn" onclick="sendTZ()" style="background:#8b5cf6; color:white; font-weight:bold; flex:1;">ОТПРАВИТЬ</button>
        </div>
        ${modalsHTML}
    </div>
`;

const adminTrashView = () => `
    <div class="home-card fade-in">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <h1 style="margin:0; color:#ef4444; font-weight:900;">ОБЩАЯ КОРЗИНА</h1>
            <button onclick="navigate('settings')" class="close-x">✕</button>
        </div>
        <div id="admin_trash_list" style="text-align:left; min-height: 200px; background:rgba(0,0,0,0.03); border-radius:15px; padding:15px;">
             <p style="text-align:center; padding:50px; color:#94a3b8;">🔍 Соединение с облаком...</p>
        </div>
    </div>`;

// ======================================================
// 4. ОБРАБОТЧИКИ СОБЫТИЙ И ПЕЧАТЬ
// ======================================================

function populateSelects() {
    const map = { 
        'equipment_select': 'equipment', 'mat': 'materials', 'con': 'constructions', 'cool': 'coolingMethods', 
        'val_4_1': 'tabletops', 'val_4_1_mat': 'tabletopMaterials', 'sel_4_2': 'gnTypes', 
        'sel_4_4': 'doorTypes', 'sel_4_5': 'drawerTypes', 'val_4_5_slides': 'slideTypes', 
        'sel_4_6': 'shelfTypes', 'val_4_8': 'lighting', 'sel_4_9': 'legs', 'sel_4_10': 'wheels', 
        'val_4_12': 'ventilation' 
    };
    for (let id in map) {
        const el = document.getElementById(id);
        if (el && window.APP_CONFIG) {
            el.innerHTML = '<option disabled selected>--   --</option>';
            const list = window.APP_CONFIG[map[id]] || [];
            list.forEach(v => el.add(new Option(v, v)));
        }
    }
}

function checkDualTemp() {
    const el = document.getElementById('equipment_select'); 
    if (!el) return; // Добавь эту строчку!
    
    const zone = document.getElementById('dual_temp_zone');
    if (zone) zone.style.display = el.value.toLowerCase().includes('комби') ? 'flex' : 'none';
}

function handleRole(el) { 
    if (el.value === 'admin') {
        // СРАЗУ отбрасываем селектор назад на "Участник". 
        // Юзер не станет админом, пока не введет пароль в модальном окне!
        el.value = 'participant'; 
        document.getElementById('inputPassword').value = ''; // Очищаем поле от старых попыток
        document.getElementById('loginModal').style.display = 'flex'; 
    } 
}
function closeModals() { 
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); 
}

function checkLogin() {
    const passInp = document.getElementById('inputPassword');
    
    if (window.APP_CONFIG && passInp.value === window.APP_CONFIG.adminPassword) {
        const s = getSettings();
        s.role = 'admin';
        localStorage.setItem('pronto_settings', JSON.stringify(s));
        
        // --- НОВОЕ: ЗАПИСЫВАЕМ СТАТУС АДМИНА В БАЗУ ДАННЫХ ---
        if (typeof db !== 'undefined' && s.username) {
            db.ref('users/' + s.username).update({ role: 'admin' });
        }
        
        passInp.value = ''; 
        closeModals(); 
        navigate('settings'); 
    } else {
        alert("⚠️ Неверный пароль! Доступ запрещен.");
        passInp.value = ''; 
    }
}

function saveNewCredentials() {
    const p = document.getElementById('newPassword').value;
    if (p.length < 3) return alert("Пароль слишком короткий!");
    if (!window.APP_CONFIG) window.APP_CONFIG = {};
    window.APP_CONFIG.adminPassword = p; 
    syncToCloud(); 
    closeModals(); 
    alert("Пароль обновлен");
}

function saveSettings() {
    const r = document.getElementById('role_select').value;
    const t = document.getElementById('theme_select').value;
    
    const s = getSettings(); 
    s.role = r;
    s.theme = t;
    localStorage.setItem('pronto_settings', JSON.stringify(s)); 
    
    // --- НОВОЕ: СОХРАНЯЕМ РОЛЬ В БАЗУ ПРИ ВЫХОДЕ ИЗ НАСТРОЕК ---
    if (typeof db !== 'undefined' && s.username) {
        db.ref('users/' + s.username).update({ role: r });
    }

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

function handlePrint() {
    document.getElementById('printReminderModal').style.display = 'flex';
}

function startFinalPrint() {
    closeModals(); 
    prepareForPrint(true); 
    
    setTimeout(() => {
        window.print(); 
        setTimeout(() => prepareForPrint(false), 500);
    }, 150);
}

function prepareForPrint(enable) {
    const tzInp = document.getElementById('tz_no');
    const tzText = document.getElementById('tz_no_text');
    const p2 = document.getElementById('pdf-page-2');
    const sig = document.getElementById('signature-box');
    const footer = document.querySelector('.footer-btns');
    const closeBtn = document.querySelector('.close-x');

    if (enable) {
        document.body.classList.add('pdf-mode');
        if (footer) footer.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';

        if (p2 && sig) {
            p2.style.display = 'flex';
            p2.style.flexDirection = 'column';
            sig.style.marginTop = 'auto'; 
        }
        if (tzInp && tzText) {
            tzText.innerText = tzInp.value;
            tzInp.style.display = 'none';
            tzText.style.display = 'inline-block';
        }
    } else {
        document.body.classList.remove('pdf-mode');
        if (footer) footer.style.display = 'flex';
        if (closeBtn) closeBtn.style.display = 'block';
        
        if (p2 && sig) {
            p2.style.display = 'block';
            p2.style.minHeight = 'auto';
            sig.style.marginTop = '40px'; 
        }
        if (tzInp && tzText) {
            tzInp.style.display = 'inline-block';
            tzText.style.display = 'none';
        }
    }
}

async function genPDF() {
    const page1 = document.getElementById('pdf-page-1');
    const page2 = document.getElementById('pdf-page-2');
    
    prepareForPrint(true);

    setTimeout(async () => {
        try {
            const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
            const margin = 10; 
            const imgWidth = 210 - (margin * 2); 

            const canvas1 = await html2canvas(page1, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgHeight1 = (canvas1.height * imgWidth) / canvas1.width;
            pdf.addImage(canvas1.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, imgHeight1);

            pdf.addPage();
            const canvas2 = await html2canvas(page2, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgHeight2 = (canvas2.height * imgWidth) / canvas2.width;
            pdf.addImage(canvas2.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, imgHeight2);

            pdf.save(`TZ_${document.getElementById('tz_no').value || 'DOC'}.pdf`);
        } catch (err) { 
            alert("Ошибка при создании PDF."); 
        } finally { 
            prepareForPrint(false);
        }
    }, 250);
}

// ======================================================
// 5. АРХИВ (ПЫЛЕСОС И УМНЫЕ КНОПКИ)
// ======================================================



function createNewTZ() { 
    uploadedImageBase64 = null; 
    window.currentEditIndex = null; // ГАРАНТИЯ: Режим создания
    navigate('template'); // Отрисовываем пустой бланк ТЗ
    
    // МАГИЯ: Ждем долю секунды, пока бланк отрисуется, и вставляем логин
    setTimeout(() => {
        const s = getSettings();
        const managerInput = document.getElementById('manager_name');
        
        // Если поле найдено и пользователь авторизован, вписываем его логин
        if (managerInput && s.username) {
            managerInput.value = s.username;
            managerInput.readOnly = true;
            // Опционально: можно сделать поле "Только для чтения", 
            // чтобы менеджер не мог стереть свое имя и вписать чужое.
            // Если захочешь жесткий контроль - раскомментируй строчку ниже:
            // managerInput.readOnly = true; 
        }
    }, 100);
}

async function saveToArchive() {
    try {
        const s = getSettings();
        // 1. Проверка авторизации
        if (!s.username) {
            return alert("⚠️ Ошибка: Вы не авторизованы!");
        }

        const tzInput = document.getElementById('tz_no');
        const currentTzNo = tzInput ? tzInput.value.trim() : '';

        // 2. Проверка номера ТЗ
        if (currentTzNo === '' || currentTzNo === '?') {
            return alert("⚠️ Ошибка: Укажите номер ТЗ перед сохранением!");
        }

        const isEditing = window.currentEditIndex !== null && window.currentEditIndex !== undefined;
        
        // 3. ЗАЩИТА ОТ ОШИБКИ [arc.unshift is not a function]
        let arc = getArchive();
        if (!Array.isArray(arc)) {
            console.warn("Архив был поврежден, сбрасываю до пустого списка.");
            arc = []; 
        }

        let tzChanged = false;
        if (isEditing) {
            const originalTzNo = String(arc[window.currentEditIndex].tz_no).trim();
            tzChanged = (currentTzNo !== originalTzNo);
        }

        // 4. Проверка на дубликаты в глобальной базе Firebase
        let tzExistsGlobally = false;
        let ownerOfTz = null;

        if (typeof db !== 'undefined') {
            const snap = await db.ref('users').once('value');
            if (snap.exists()) {
                const allUsers = snap.val();
                for (let u in allUsers) {
                    const uArchive = allUsers[u].archive;
                    if (uArchive && Array.isArray(uArchive)) {
                        const found = uArchive.find(p => p && String(p.tz_no).trim() === currentTzNo);
                        if (found) {
                            tzExistsGlobally = true;
                            ownerOfTz = u;
                            break;
                        }
                    }
                }
            }
        }

        if (isEditing && tzChanged && tzExistsGlobally) {
            return alert(`⚠️ Ошибка: Номер ${currentTzNo} уже существует в базе (автор: ${ownerOfTz})!\nВыберите другой номер.`);
        }
        if (!isEditing && tzExistsGlobally) {
            return alert(`⚠️ Ошибка: ТЗ с номером ${currentTzNo} уже существует в базе (автор: ${ownerOfTz})!`);
        }

        // 5. Сбор данных из полей
        const docData = { 
            tz_no: currentTzNo, 
            eq: document.getElementById('equipment_select') ? document.getElementById('equipment_select').value : '',
            manager: document.getElementById('manager_name') ? document.getElementById('manager_name').value : '',
            date: new Date().toLocaleDateString(),
            image: typeof uploadedImageBase64 !== 'undefined' ? uploadedImageBase64 : null,
            fields: {}
        };

        const allInputs = document.querySelectorAll('.document-sheet input, .document-sheet select, .document-sheet textarea');
        allInputs.forEach(el => {
            if (el.id && el.id !== 'file_input') {
                docData.fields[el.id] = el.value;
            }
        });

        // 6. Сохранение: либо замена старого, либо добавление в начало (unshift)
        if (isEditing && !tzChanged) {
            arc[window.currentEditIndex] = docData;
        } else {
            arc.unshift(docData);
        }

        // 7. Запись в локальную память и в облако Firebase
        localStorage.setItem('pronto_archive', JSON.stringify(arc)); 
        if (typeof db !== 'undefined') {
            await db.ref('users/' + s.username + '/archive').set(arc);
        }
        
        // 8. Сброс индекса редактирования и возврат на главную
        window.currentEditIndex = null;
        navigate('home');

    } catch (error) {
        alert("Системная ошибка при сохранении: " + error.message);
        console.error(error);
    }
}

function editFromArchive(i) {
    window.currentEditIndex = i;
    const d = getArchive()[i]; 
    navigate('template');
    
    setTimeout(() => {
        if (d.fields && Object.keys(d.fields).length > 0) {
            for (let id in d.fields) {
                const el = document.getElementById(id);
                if (el) el.value = d.fields[id];
            }
        } else {
            if(document.getElementById('tz_no')) document.getElementById('tz_no').value = d.tz_no || '';
            if(document.getElementById('equipment_select')) document.getElementById('equipment_select').value = d.eq || '';
            if(document.getElementById('manager_name')) document.getElementById('manager_name').value = d.manager || '';
        }

        if(d.image) {
            uploadedImageBase64 = d.image;
            const img = document.getElementById('preview_img');
            if(img) { img.src = d.image; img.style.display = 'block'; }
            const txt = document.getElementById('img_text');
            if(txt) txt.style.display = 'none';
        }
        
        checkDualTemp();
        
        const tzInput = document.getElementById('tz_no');
        const saveBtn = document.querySelector('button[onclick="saveToArchive()"]');
        
        if (tzInput && saveBtn) {
            const originalTz = tzInput.value.trim();
            
            tzInput.addEventListener('input', function() {
                if (this.value.trim() === originalTz) {
                    saveBtn.innerHTML = '💾 СОХРАНИТЬ ИЗМЕНЕНИЯ';
                } else {
                    saveBtn.innerHTML = '📥 СОХРАНИТЬ КАК НОВЫЙ';
                }
            });
        }
    }, 200);
}

async function deleteFromArchive(i) {
    if (!confirm('Переместить проект в корзину? (Он будет храниться там 15 дней)')) return;
    
    const s = getSettings();
    let arc = getArchive();
    let trash = getTrash();

    // 1. Извлекаем проект
    const projectToDelete = arc.splice(i, 1)[0];
    
    // 2. Добавляем метку времени удаления
    projectToDelete.deletedAt = Date.now();
    projectToDelete._originalOwner = s.username; // Чтобы админ знал, чьё это
    
    trash.unshift(projectToDelete);

    // 3. Сохраняем обновленный архив и корзину
    localStorage.setItem('pronto_archive', JSON.stringify(arc));
    localStorage.setItem('pronto_trash', JSON.stringify(trash));

    if (typeof db !== 'undefined' && s.username) {
        // Обновляем только нужные ветки (быстро)
        await db.ref('users/' + s.username + '/archive').set(arc);
        await db.ref('users/' + s.username + '/trash').set(trash);
    }
    
    navigate('home');
}

// Добавь эти функции в конец раздела про архив:

async function restoreFromTrash(i) {
    let trash = getTrash();
    let arc = getArchive();
    const s = getSettings();

    const restored = trash[i];
    if (!restored) return;

    // --- ПРОВЕРКА НА ДУБЛИКАТ ---
    const isDuplicate = arc.find(p => p && String(p.tz_no).trim() === String(restored.tz_no).trim());
    if (isDuplicate) {
        return alert(`⚠️ Ошибка восстановления!\nПроект № ${restored.tz_no} уже существует в вашем архиве. Сначала удалите или переименуйте текущий проект № ${restored.tz_no}.`);
    }
    // ----------------------------

    trash.splice(i, 1);
    delete restored.deletedAt;
    arc.unshift(restored);

    localStorage.setItem('pronto_archive', JSON.stringify(arc));
    localStorage.setItem('pronto_trash', JSON.stringify(trash));

    if (s.username && typeof db !== 'undefined') {
        await db.ref(`users/${s.username}/archive`).set(arc);
        await db.ref(`users/${s.username}/trash`).set(trash);
    }
    navigate('trash');
}

async function permanentDelete(i) {
    if (!confirm('Удалить проект навсегда без возможности восстановления?')) return;
    let trash = getTrash();
    const s = getSettings();
    
    trash.splice(i, 1);
    
    localStorage.setItem('pronto_trash', JSON.stringify(trash));
    if (s.username) await db.ref('users/' + s.username + '/trash').set(trash);
    navigate('trash');
}

function pdfFromArchive(i) {
    editFromArchive(i); 
    setTimeout(() => {
        genPDF(); 
    }, 500);
}

function printFromArchive(i) {
    editFromArchive(i);
    setTimeout(() => {
        handlePrint(); 
    }, 500);
}

function sendFromArchiveBtn(i) {
    editFromArchive(i);
    setTimeout(() => {
        sendTZ(); 
    }, 500);
}

// ======================================================
// 6. FIREBASE (ВХОД И РЕГИСТРАЦИЯ)
// ======================================================

async function mockRegister() {
    try {
        const loginInp = document.getElementById('reg_login');
        const passInp = document.getElementById('reg_pass');
        
        if (!loginInp || !passInp) return alert("Системная ошибка: поля ввода не найдены!");

        const login = loginInp.value.trim();
        const pass = passInp.value.trim();
        
        if (login === '' || pass === '') {
            return alert("⚠️ Пожалуйста, введите логин и пароль!");
        }

        if (typeof db === 'undefined') {
            return alert("⚠️ Ошибка: Нет подключения к облачной базе данных (Firebase).");
        }

        const safeLogin = login.replace(/[.#$\[\]]/g, '_');

        const btn = document.querySelector('button[onclick="mockRegister()"]');
        if (btn) {
            btn.innerText = 'ОТПРАВКА...';
            btn.disabled = true;
        }

        const snapshot = await db.ref('users/' + safeLogin).once('value');
        
        if (snapshot.exists()) {
            alert("⚠️ Этот логин уже занят! Придумайте другой.");
        } else {
            await db.ref('users/' + safeLogin).set({ 
                password: pass, 
                role: 'participant', 
                status: 'pending' 
            });

            // --- ДОБАВЛЕНО: Запоминаем логин и ПАРОЛЬ ---
            const rememberCheckbox = document.getElementById('reg_remember_login');
            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem('pronto_saved_login', login);
                localStorage.setItem('pronto_saved_pass', pass);
            }

            alert("✅ Успешно! Ваша заявка отправлена администратору на одобрение.");
            navigate('portal'); 
        }

        if (btn) {
            btn.innerText = 'ЗАРЕГИСТРИРОВАТЬСЯ';
            btn.disabled = false;
        }

    } catch (error) {
        alert("Системная ошибка при регистрации: " + error.message);
        console.error(error);
        const btn = document.querySelector('button[onclick="mockRegister()"]');
        if (btn) {
            btn.innerText = 'ЗАРЕГИСТРИРОВАТЬСЯ';
            btn.disabled = false;
        }
    }
}

async function mockLogin() {
    try {
        const loginInp = document.getElementById('auth_login');
        const passInp = document.getElementById('auth_pass');
        
        if (!loginInp || !passInp) return alert("Системная ошибка: поля ввода не найдены!");

        const login = loginInp.value.trim();
        const pass = passInp.value.trim();

        if (login === '' || pass === '') {
            return alert("⚠️ Введите логин и пароль!");
        }

        if (typeof db === 'undefined') {
            return alert("⚠️ Ошибка: Нет подключения к облачной базе данных!");
        }

        const btn = document.querySelector('button[onclick="mockLogin()"]');
        if (btn) {
            btn.innerText = 'ВХОД...';
            btn.disabled = true;
        }

        const safeLogin = login.replace(/[.#$\[\]]/g, '_');
        const snapshot = await db.ref('users/' + safeLogin).once('value');

        if (!snapshot.exists()) {
            if (btn) { btn.innerText = 'ВОЙТИ'; btn.disabled = false; }
            return alert("⚠️ Такого пользователя не существует!");
        }
        
        const user = snapshot.val();
        
        if (user.password !== pass) {
            if (btn) { btn.innerText = 'ВОЙТИ'; btn.disabled = false; }
            return alert("⚠️ Неверный пароль!");
        }

        if (user.role !== 'admin' && user.status !== 'approved') {
            if (btn) { btn.innerText = 'ВОЙТИ'; btn.disabled = false; }
            return alert("⚠️ Ваш аккаунт еще не одобрен администратором или заблокирован.");
        }

        const s = getSettings();
        localStorage.setItem('pronto_settings', JSON.stringify({ role: user.role, theme: s.theme, username: safeLogin }));

        if (user.archive) {
            localStorage.setItem('pronto_archive', JSON.stringify(user.archive));
        } else {
            localStorage.removeItem('pronto_archive');
        }
        
        if (btn) { btn.innerText = 'ВОЙТИ'; btn.disabled = false; }

        // --- ДОБАВЛЕНО: Запоминаем логин и ПАРОЛЬ ---
        const rememberCheckbox = document.getElementById('remember_login');
        if (rememberCheckbox && rememberCheckbox.checked) {
            localStorage.setItem('pronto_saved_login', login); 
            localStorage.setItem('pronto_saved_pass', pass); 
        } else if (rememberCheckbox && !rememberCheckbox.checked) {
            localStorage.removeItem('pronto_saved_login'); 
            localStorage.removeItem('pronto_saved_pass'); 
        }

        if (user.role === 'admin') {
            alert("Секретный вход! Добро пожаловать в панель управления.");
            navigate('settings'); 
        } else {
            alert(`Добро пожаловать, ${login}!`);
            navigate('home'); 
        }

    } catch (error) {
        alert("Системная ошибка при входе: " + error.message);
        console.error(error);
        const btn = document.querySelector('button[onclick="mockLogin()"]');
        if (btn) {
            btn.innerText = 'ВОЙТИ';
            btn.disabled = false;
        }
    }
}

// ======================================================
// 7. ПАНЕЛЬ АДМИНА: УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ И БАЗА ТЗ
// ======================================================

function loadAllUsers() {
    if (typeof db === 'undefined') return;
    const listDiv = document.getElementById('all_users_list');
    if (!listDiv) return;

    // Узнаем, кто сейчас сидит за экраном
    const currentAdminLogin = getSettings().username;

    db.ref('users').once('value').then(snapshot => {
        if (!snapshot.exists()) { listDiv.innerHTML = "Пользователей нет"; return; }
        
        const users = snapshot.val();
        let html = '';
        
        for (let login in users) {
            const u = users[login];
            
            // Защита от старых юзеров без статуса (если статуса нет, считаем его активным)
            const safeStatus = u.status || 'approved'; 

            let statusColor = safeStatus === 'pending' ? '#eab308' : (safeStatus === 'banned' ? '#ef4444' : '#10b981');
            let statusText = safeStatus === 'pending' ? 'Ожидает' : (safeStatus === 'banned' ? 'В бане' : 'Активен');
            
            // Если это админ, подсвечиваем его короной
            if (u.role === 'admin') {
                statusText = '👑 Администратор';
                statusColor = '#8b5cf6';
            }

            let btns = '';

            // --- БРОНЯ 1: Запрет на самовыпил ---
            if (login === currentAdminLogin) {
                btns = `<span style="font-size:12px; color:#64748b; font-weight:bold; padding:5px;">👤 Это вы</span>`;
            
            // --- БРОНЯ 2: Запрет на бан других админов ---
            } else if (u.role === 'admin') {
                btns = `<span style="font-size:12px; color:#8b5cf6; font-weight:bold; padding:5px;">🛡️ Защита</span>`;
            
            // --- ОБЫЧНЫЕ ПОЛЬЗОВАТЕЛИ ---
            } else {
                if (safeStatus === 'pending') {
                    btns = `
                        <button onclick="approveUser('${login}')" class="btn-mini" style="background:#10b981; padding:5px; font-weight:bold;">✓ Одобрить</button>
                        <button onclick="rejectUser('${login}')" class="btn-mini" style="background:#ef4444; padding:5px; font-weight:bold;">✕ Отказ</button>
                    `;
                } else if (safeStatus === 'approved') {
                    btns = `<button onclick="banUser('${login}')" class="btn-mini" style="background:#ef4444; padding:5px; font-weight:bold;">🚫 Забанить</button>`;
                } else if (safeStatus === 'banned') {
                    btns = `
                        <button onclick="approveUser('${login}')" class="btn-mini" style="background:#10b981; padding:5px; font-weight:bold;">🔄 Разбанить</button>
                        <button onclick="rejectUser('${login}')" class="btn-mini" style="background:#64748b; padding:5px; font-weight:bold;">🗑️ Удалить</button>
                    `;
                }
            }

            html += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:10px; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:10px; text-align:left;">
                    <div>
                        <b style="color:var(--text); font-size:16px;">👤 ${login}</b><br>
                        <span style="font-size:12px; color:${statusColor}; font-weight:bold;">${statusText}</span>
                    </div>
                    <div style="display:flex; gap:5px; flex-direction:column; align-items:flex-end;">
                        ${btns}
                    </div>
                </div>
            `;
        }
        listDiv.innerHTML = html === '' ? "Нет пользователей" : html;
    });
}

function approveUser(login) {
    if(confirm(`Одобрить/разбанить пользователя ${login}?`)) {
        db.ref('users/' + login).update({ status: 'approved' }).then(() => loadAllUsers());
    }
}

function rejectUser(login) {
    if (login === getSettings().username) return alert("❌ Вы не можете удалить сами себя!");
    if(confirm(`Полностью удалить аккаунт ${login}? Это действие нельзя отменить.`)) {
        db.ref('users/' + login).remove().then(() => loadAllUsers());
    }
}

function banUser(login) {
    if (login === getSettings().username) return alert("❌ Вы не можете забанить сами себя!");
    if(confirm(`Заблокировать ${login}? Он больше не сможет войти в систему.`)) {
        db.ref('users/' + login).update({ status: 'banned' }).then(() => loadAllUsers());
    }
}

let allAdminProjects = [];

function loadAllProjectsForAdmin() {
    if (typeof db === 'undefined') return;
    const listDiv = document.getElementById('admin_projects_list');
    
    db.ref('users').once('value').then(snap => {
        allAdminProjects = [];
        if (!snap.exists()) {
            if(listDiv) listDiv.innerHTML = "База пуста.";
            return;
        }
        const users = snap.val();
        for (let login in users) {
            if (users[login].archive && Array.isArray(users[login].archive)) {
                users[login].archive.forEach(proj => {
                   allAdminProjects.push({ ...proj, _owner: login }); 
                });
            }
        }
        allAdminProjects.reverse();
        searchAllProjects(); 
    });
}

function searchAllProjects() {
    const searchInput = document.getElementById('admin_search');
    
    // ЗАЩИТА: Если мы ушли с экрана настроек и поля нет — просто выходим
    if (!searchInput) return; 

    const query = searchInput.value.toLowerCase();
    const listDiv = document.getElementById('admin_projects_list');
    if (!listDiv) return;

    const filtered = allAdminProjects.filter(p => {
        const tz = (p.tz_no || '').toLowerCase();
        const man = (p.manager || '').toLowerCase();
        return tz.includes(query) || man.includes(query);
    });

    if (filtered.length === 0) {
        listDiv.innerHTML = '<p style="text-align:center; color:#94a3b8; margin:20px 0;">Проекты не найдены.</p>';
        return;
    }

    let html = '';
    filtered.slice(0, 30).forEach((item, idx) => {
        const realIdx = allAdminProjects.indexOf(item);
        html += `
            <div class="archive-item" style="margin-bottom:10px; padding:15px; border-left:4px solid var(--pronto); text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1;">
                        <b style="font-size:18px; color:var(--text);">№ ${item.tz_no || '---'}</b>
                        <div style="font-size:14px; font-weight:bold; margin-top:3px; color:var(--pronto);">${item.eq || '---'}</div>
                        <div style="font-size:12px; color:#64748b; margin-top:5px;">Менеджер: ${item.manager || '—'} | Автор: ${item._owner}</div>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button onclick="viewProjectAsAdmin(${realIdx})" class="btn-mini" style="background:#3b82f6; padding:10px;">📂 ОТКРЫТЬ</button>
                        <button onclick="deleteProjectAsAdmin(${realIdx})" class="btn-mini" style="background:#ef4444; padding:10px;">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    });
    listDiv.innerHTML = html;
}

function viewProjectAsAdmin(idx) {
    const d = allAdminProjects[idx];
    if (!d) return;

    navigate('template');

    setTimeout(() => {
        if (d.fields) {
            for (let id in d.fields) {
                const el = document.getElementById(id);
                if (el) el.value = d.fields[id];
            }
        }
        
        if (d.image) {
            uploadedImageBase64 = d.image;
            const img = document.getElementById('preview_img');
            if (img) { img.src = d.image; img.style.display = 'block'; }
            const txt = document.getElementById('img_text');
            if (txt) txt.style.display = 'none';
        }

        const allInputs = document.querySelectorAll('.document-sheet input, .document-sheet select, .document-sheet textarea');
        allInputs.forEach(el => {
            el.disabled = true;
            el.style.backgroundColor = '#f1f5f9'; 
        });

        const saveBtn = document.querySelector('button[onclick="saveToArchive()"]');
        if (saveBtn) saveBtn.style.display = 'none';

        document.querySelectorAll('.admin-add-btn').forEach(btn => btn.style.display = 'none');
        
        checkDualTemp();
    }, 300);
}
async function deleteProjectAsAdmin(idx) {
    const project = allAdminProjects[idx];
    if (!project) return;
    
    const tzNo = project.tz_no;
    const owner = project._owner; // Тот самый логин пользователя, чей это проект

    if (!confirm(`⚠️ ВНИМАНИЕ!\nВы уверены, что хотите НАВСЕГДА удалить ТЗ № ${tzNo} (Автор: ${owner})?\nЭто действие нельзя будет отменить.`)) {
        return;
    }

    try {
        if (typeof db === 'undefined') return alert("Нет подключения к базе данных!");

        // 1. Скачиваем архив этого конкретного пользователя из базы
        const snap = await db.ref('users/' + owner + '/archive').once('value');
        
        if (snap.exists()) {
            let userArchive = snap.val();
            
            // 2. Фильтруем архив, выкидывая из него проект с этим номером
            userArchive = userArchive.filter(p => p && String(p.tz_no).trim() !== String(tzNo).trim());
            
            // 3. Отправляем очищенный архив обратно в облако
            await db.ref('users/' + owner + '/archive').set(userArchive);
            
            // 4. Перезагружаем список проектов админа, чтобы проект исчез с экрана
            loadAllProjectsForAdmin();
            alert(`✅ Проект № ${tzNo} успешно удален из базы!`);
            
        } else {
            alert("⚠️ Ошибка: Архив этого пользователя пуст или не найден.");
        }
    } catch (error) {
        alert("Системная ошибка при удалении: " + error.message);
        console.error(error);
    }
}
// ======================================================
// 8. ГЕНЕРАЦИЯ ОТПРАВКИ 
// ======================================================

async function sendTZ() {
    const tzNo = document.getElementById('tz_no').value || "DOC";
    const fileName = `TZ_${tzNo}.pdf`;
    const page1 = document.getElementById('pdf-page-1');
    const page2 = document.getElementById('pdf-page-2');
    const footer = document.querySelector('.footer-btns');
    const closeBtn = document.querySelector('.close-x');
    
    const btns = footer ? footer.querySelectorAll('.btn') : [];
    let sendBtn = null;
    btns.forEach(b => { if(b.innerText.includes('ОТПРАВИТЬ')) sendBtn = b; });
    const originalText = sendBtn ? sendBtn.innerText : 'ОТПРАВИТЬ';

    prepareForPrint(true);
    if (footer) footer.style.display = 'none';
    if (closeBtn) closeBtn.style.display = 'none';
    if (sendBtn) sendBtn.innerText = 'СОЗДАНИЕ PDF...';

    setTimeout(async () => {
        try {
            const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
            const margin = 10; 
            const imgWidth = 210 - (margin * 2); 

            const canvas1 = await html2canvas(page1, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgHeight1 = (canvas1.height * imgWidth) / canvas1.width;
            pdf.addImage(canvas1.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, imgHeight1);

            pdf.addPage();
            const canvas2 = await html2canvas(page2, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgHeight2 = (canvas2.height * imgWidth) / canvas2.width;
            pdf.addImage(canvas2.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, imgHeight2);
            
            pdf.save(fileName);
            alert(`Готово! Файл ${fileName} скачан.\n\nТеперь просто открой нужный чат в Telegram и перетащи этот файл туда мышкой.`);

        } catch (err) { 
            alert("Ошибка при создании: " + err); 
        } finally { 
            if (footer) footer.style.display = 'flex'; 
            if (closeBtn) closeBtn.style.display = 'block';
            if (sendBtn) sendBtn.innerText = originalText;
            prepareForPrint(false);
        }
    }, 150);
}
// ======================================================
// 9. ФУНКЦИИ ОБЩЕЙ КОРЗИНЫ ДЛЯ АДМИНА (ПОЛНАЯ ВЕРСИЯ)
// ======================================================

async function loadAllTrashForAdmin() {
    // 1. Небольшая задержка, чтобы браузер успел отрисовать HTML-блок
    await new Promise(resolve => setTimeout(resolve, 150));

    const listDiv = document.getElementById('admin_trash_list');
    if (!listDiv) {
        console.error("❌ Ошибка: Блок 'admin_trash_list' не найден на странице!");
        return;
    }

    console.log("--- Запуск загрузки общей корзины ---");

    try {
        if (typeof db === 'undefined') {
            listDiv.innerHTML = "<p style='text-align:center; color:red;'>Ошибка: Firebase не подключен</p>";
            return;
        }

        // 2. Тянем данные всех пользователей
        const snap = await db.ref('users').once('value');
        if (!snap.exists()) {
            listDiv.innerHTML = "<p style='text-align:center; padding:50px;'>В базе данных пока нет пользователей.</p>";
            return;
        }

        const users = snap.val();
        let allDeleted = [];

        // 3. Собираем всё удаленное в один массив
        for (let login in users) {
            let uTrash = users[login].trash;
            if (uTrash) {
                // Если данные пришли как объект {}, превращаем их в массив []
                const trashArray = Array.isArray(uTrash) ? uTrash : Object.values(uTrash);
                
                trashArray.forEach((item, idx) => {
                    if (item && item.tz_no) {
                        allDeleted.push({ 
                            ...item, 
                            _owner: login, 
                            _idxInTrash: idx 
                        });
                    }
                });
            }
        }

        console.log("Найдено удаленных проектов:", allDeleted.length);

        if (allDeleted.length === 0) {
            listDiv.innerHTML = '<p style="text-align:center; padding:50px; color:#94a3b8;">Общая корзина пуста</p>';
            return;
        }

        // 4. Сортировка: свежеудаленные сверху
        allDeleted.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));

        // 5. Вывод на экран
        listDiv.innerHTML = allDeleted.map(item => `
            <div class="archive-item" style="border-left: 4px solid #ef4444; margin-bottom:12px; padding:15px; background:white; border-radius:12px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="flex:1; text-align:left;">
                    <b style="font-size:16px; color:#1e293b;">№ ${item.tz_no}</b> — <span style="color:var(--pronto); font-weight:bold;">${item.eq || 'Без названия'}</span><br>
                    <small style="color:#64748b;">Автор: <b style="color:#334155;">${item._owner}</b> | Удалено: ${item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : '???'}</small>
                </div>
                <button onclick="adminRestoreFromTrash('${item._owner}', ${item._idxInTrash})" class="btn-mini" style="background:#10b981; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer; border:none; color:white;">Восстановить</button>
            </div>
        `).join('');

    } catch (e) {
        console.error("КРИТИЧЕСКАЯ ОШИБКА:", e);
        listDiv.innerHTML = "<p style='text-align:center; color:red;'>Ошибка загрузки: " + e.message + "</p>";
    }
}

async function adminRestoreFromTrash(owner, index) {
    try {
        const snap = await db.ref(`users/${owner}`).once('value');
        if (!snap.exists()) return alert("Пользователь не найден!");

        const userData = snap.val();
        let trash = Array.isArray(userData.trash) ? userData.trash : Object.values(userData.trash || {});
        let archive = Array.isArray(userData.archive) ? userData.archive : Object.values(userData.archive || {});

        const restored = trash[index];
        if (!restored) return alert("Проект не найден в корзине.");

        // ПРОВЕРКА НА ДУБЛИКАТ (Чтобы не было двух ТЗ с одним номером)
        const isDuplicate = archive.find(p => p && String(p.tz_no).trim() === String(restored.tz_no).trim());
        if (isDuplicate) {
            return alert(`⚠️ Ошибка!\nУ пользователя ${owner} уже есть активный проект № ${restored.tz_no}.\nВосстановление невозможно.`);
        }

        if (!confirm(`Восстановить проект № ${restored.tz_no} для пользователя ${owner}?`)) return;

        // Переносим
        trash.splice(index, 1);
        delete restored.deletedAt;
        archive.unshift(restored);

        // Сохраняем
        await db.ref(`users/${owner}/trash`).set(trash);
        await db.ref(`users/${owner}/archive`).set(archive);
        
        alert("✅ Проект успешно возвращен автору!");
        loadAllTrashForAdmin(); // Обновляем список на экране

    } catch (e) {
        alert("Системная ошибка: " + e.message);
        console.error(e);
    }
}