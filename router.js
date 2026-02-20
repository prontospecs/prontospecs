/**
 * ======================================================
 * PRONTO SPECS CLOUD ENGINE | FINAL VERSION 3.0
 * ======================================================
 */

// ======================================================
// 1. ИНИЦИАЛИЗАЦИЯ И СИСТЕМНЫЕ ФУНКЦИИ
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(hideLoader, 3000); 

    if (typeof db !== 'undefined') {
        db.ref('settings').on('value', (snapshot) => {
            const cloudData = snapshot.val();
            if (cloudData) {
                APP_CONFIG = cloudData;
                if (document.getElementById('equipment_select')) populateSelects();
            } else {
                db.ref('settings').set(APP_CONFIG);
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

const getArchive = () => {
    const data = localStorage.getItem('pronto_archive');
    return data ? JSON.parse(data) : [];
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
    if (typeof db !== 'undefined') db.ref('settings').set(APP_CONFIG);
}

function navigate(view) {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = ''; 
    if (view === 'portal') app.innerHTML = portalView();
    else if (view === 'login') app.innerHTML = loginView();
    else if (view === 'register') app.innerHTML = registerView();
    else if (view === 'home') app.innerHTML = homeView();
    else if (view === 'settings') app.innerHTML = settingsView();
    else if (view === 'template') app.innerHTML = templateView();
    else app.innerHTML = portalView();

    if (view === 'template') {
        populateSelects();
        checkDualTemp();
    }
    window.scrollTo(0, 0);
}

// ======================================================
// 2. АДМИНКА И СПИСКИ
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
    list.forEach(item => modalSelect.add(new Option(item, item)));
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
    if (confirm(`Удалить "${modalSelect.value}"?`)) {
        APP_CONFIG[currentManageKey] = APP_CONFIG[currentManageKey].filter(v => v !== modalSelect.value);
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
                <h3 style="margin:0 0 5px 0; color:var(--text); font-size:22px;">PRODUCTION SPECS</h3>
                <div style="font-size:14px; font-weight:bold; color:var(--pronto); margin-bottom:10px;">(fridge)</div>
                <p style="font-size:13px; color:#64748b; margin:0;">Генератор технических заданий.</p>
            </div>
            <div style="border:2px dashed #cbd5e1; border-radius:15px; padding:25px; cursor:not-allowed; opacity:0.6; background: #f8fafc;">
                <div style="font-size:40px; margin-bottom:15px;">🚀</div>
                <h3 style="margin:0 0 10px 0; color:var(--text);">NEW APP</h3>
                <p style="font-size:13px; color:#64748b; margin:0;">Следующее приложение в разработке...</p>
            </div>
        </div>
    </div>
`;

const loginView = () => `
    <div class="home-card fade-in" style="max-width: 400px; text-align: center;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <button onclick="navigate('portal')" class="btn-mini" style="background:#cbd5e1; color:#0f172a;">🡠 Назад</button>
            <h2 style="margin:0; color:var(--pronto);">ВХОД</h2>
            <div style="width:50px;"></div>
        </div>
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

const registerView = () => `
    <div class="home-card fade-in" style="max-width: 400px; text-align: center;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <button onclick="navigate('portal')" class="btn-mini" style="background:#cbd5e1; color:#0f172a;">🡠 Назад</button>
            <h2 style="margin:0; color:var(--pronto);">РЕГИСТРАЦИЯ</h2>
            <div style="width:50px;"></div>
        </div>
        <div style="text-align: left;">
            <label style="font-weight:bold; font-size:12px; color:#64748b;">ЛОГИН:</label>
            <input type="text" id="reg_login" placeholder="Новый логин" style="width:100%; padding:12px; margin-bottom:15px; border:2px solid #e2e8f0; border-radius:8px;">
            <label style="font-weight:bold; font-size:12px; color:#64748b;">ПАРОЛЬ:</label>
            <input type="password" id="reg_pass" placeholder="Новый пароль" style="width:100%; padding:12px; margin-bottom:25px; border:2px solid #e2e8f0; border-radius:8px;">
            <button onclick="mockRegister()" class="btn" style="width:100%; margin-bottom:15px; background:#3b82f6;">ЗАРЕГИСТРИРОВАТЬСЯ</button>
        </div>
    </div>
`;

const homeView = () => {
    const s = getSettings();
    if (s.username && typeof db !== 'undefined') {
        db.ref('users/' + s.username + '/archive').once('value').then(snap => {
            if (snap.exists()) localStorage.setItem('pronto_archive', JSON.stringify(snap.val()));
        });
    }

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
            <h4 style="border-bottom:3px solid var(--border); padding-bottom:15px; color:var(--pronto); font-weight:900;">ПОСЛЕДНИЕ ПРОЕКТЫ</h4>
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
    if (isAdmin) setTimeout(loadPendingUsers, 100);

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
                    <h4 style="margin-top:0; text-align:center;">БЕЗОПАСНОСТЬ</h4>
                    <button onclick="document.getElementById('changePassModal').style.display='flex'" class="btn" style="background:orange; width:100%; margin-bottom:20px;">СМЕНИТЬ ПАРОЛЬ АДМИНА</button>
                    <h4 style="margin-top:20px; text-align:center; color:#3b82f6;">ЗАЯВКИ НА РЕГИСТРАЦИЮ</h4>
                    <div id="pending_users_list" style="background:#f8fafc; border-radius:10px; padding:15px; text-align:center; border: 1px solid #cbd5e1;">Загрузка...</div>
                </div>
            ` : ''}
            <button onclick="saveSettings()" class="btn btn-secondary" style="width:100%; height:60px; font-size:18px;">СОХРАНИТЬ</button>
        </div>
        ${modalsHTML}
    </div>`;
};

const templateView = () => `
    <div class="document-sheet fade-in" id="print-root">
        <div class="doc-header">
            <div style="flex-grow:1;">
                <div style="display:flex; align-items:center;">
                    <span style="font-weight:900; color:var(--pronto); font-size:32px; margin-right:15px;">SPECS №</span>
                    <input type="text" id="tz_no" style="width:250px; font-size:32px; border:none; font-weight:900; margin:0; padding:0; line-height:1; vertical-align:middle; background:transparent;" placeholder="000-00">
                    <span id="tz_no_text" style="display:none; width:250px; font-size:32px; font-weight:900; margin:0; padding:0; line-height:1;"></span>
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
            <div><label style="font-size:11px; font-weight:bold; color:#64748b; display:block;">КОЛ-ВО</label><input type="number" id="qty" style="width:100%;"></div>
        </div>

        <table class="spec-table">
            <thead><tr><th width="45">№</th><th>ПАРАМЕТР</th><th>ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ</th></tr></thead>
            <tbody>
                <tr class="section-title"><td colspan="3">1. ГАБАРИТНЫЕ РАЗМЕРЫ (мм)</td></tr>
                <tr><td>1.1</td><td>Высота (H)</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="h" style="width:70px; text-align:center;"> <span>мм</span></div></td></tr>
                <tr><td>1.2</td><td>Ширина (W)</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="w" style="width:70px; text-align:center;"> <span>мм</span></div></td></tr>
                <tr><td>1.3</td><td>Глубина (D)</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="d" style="width:70px; text-align:center;"> <span>мм</span></div></td></tr>
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
                <tr><td>4.7</td><td>Нагрузка</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="val_4_7" style="width:60px; text-align:center;"> <span>кг</span></div></td></tr>
                <tr><td>4.8</td><td>Подсветка</td><td>${renderSelect('val_4_8', 'lighting')}</td></tr>
                <tr><td>4.9</td><td>Ножки</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_9', 'legs')} <input type="number" id="val_4_9" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
                <tr><td>4.10</td><td>Колеса (торм.)</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_10', 'wheels')} <input type="number" id="val_4_10" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
                <tr><td>4.11</td><td>Колеса (б/торм)</td><td><div style="display:flex; align-items:center; gap:5px;">${renderSelect('sel_4_11', 'wheels')} <input type="number" id="val_4_11" style="width:50px; text-align:center;"> <span>шт.</span></div></td></tr>
                <tr><td>4.12</td><td>Вентиляция</td><td>${renderSelect('val_4_12', 'ventilation')}</td></tr>
                
                <tr class="section-title"><td colspan="3">5. ТЕМПЕРАТУРА</td></tr>
                <tr><td>5.1</td><td>Режим</td><td><div style="display:flex; align-items:center; gap:10px;"><span>t° :</span> <input type="text" id="val_5_1" style="width:90px; text-align:center;"> <div id="dual_temp_zone" style="display:none; align-items:center; gap:5px;"><span>/ t° :</span> <input type="text" id="val_5_1_2" style="width:90px; text-align:center;"></div></div></td></tr>
                
                <tr class="section-title"><td colspan="3">6. СРЕДА</td></tr>
                <tr><td>6.1</td><td>Условия</td><td><div style="display:flex; align-items:center; gap:5px;"><span>+</span> <input type="number" id="val_6_1" style="width:50px; text-align:center;"> <span>/</span> <input type="number" id="val_6_2" style="width:50px; text-align:center;"> <span>%</span></div></td></tr>

                <tr class="section-title"><td colspan="3">7. ГАРАНТИЯ</td></tr>
                <tr><td>7.1</td><td>Срок гарантии</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="val_7_1" style="width:60px; text-align:center; font-weight:bold;"> <span>мес.</span></div></td></tr>

                <tr class="section-title"><td colspan="3">8. СРОК СЛУЖБЫ</td></tr>
                <tr><td>8.1</td><td>Расчетный срок</td><td><div style="display:flex; align-items:center; gap:5px;"><input type="number" id="val_8_1" style="width:60px; text-align:center; font-weight:bold;"> <span>лет</span></div></td></tr>
                
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
        if (zone) zone.style.display = el.value.toLowerCase().includes('комби') ? 'flex' : 'none';
    }
}

function handleRole(el) { if (el.value === 'admin') document.getElementById('loginModal').style.display = 'flex'; }
function closeModals() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }

function checkLogin() {
    if (document.getElementById('inputPassword').value === APP_CONFIG.adminPassword) {
        localStorage.setItem('pronto_settings', JSON.stringify({role: 'admin', theme: getSettings().theme}));
        closeModals(); navigate('settings');
    } else alert("Неверно!");
}

function saveNewCredentials() {
    const p = document.getElementById('newPassword').value;
    if (p.length < 3) return alert("Пароль слишком короткий!");
    APP_CONFIG.adminPassword = p; syncToCloud(); closeModals(); alert("Пароль обновлен");
}

function saveSettings() {
    const r = document.getElementById('role_select').value;
    const t = document.getElementById('theme_select').value;
    localStorage.setItem('pronto_settings', JSON.stringify({role: r, theme: t}));
    applyTheme(); navigate('home');
}

function handleFile(input) {
    const f = input.files[0];
    if (f) {
        const r = new FileReader();
        r.onload = e => {
            uploadedImageBase64 = e.target.result;
            const img = document.getElementById('preview_img');
            img.src = e.target.result; img.style.display = 'block';
            document.getElementById('img_text').style.display = 'none';
        };
        r.readAsDataURL(f);
    }
}

function handlePrint() {
    prepareForPrint(true);
    setTimeout(() => {
        window.print();
        setTimeout(() => prepareForPrint(false), 500);
    }, 100);
}

function genPDF() {
    const el = document.querySelector('.document-sheet');
    const footer = document.querySelector('.footer-btns');
    const closeBtn = document.querySelector('.close-x');
    
    prepareForPrint(true);
    if (footer) footer.style.display = 'none';
    if (closeBtn) closeBtn.style.display = 'none';

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
            const sliceHeight = pageHeight - 20; 

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= sliceHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 10; 
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position - 20, imgWidth, imgHeight); 
                heightLeft -= sliceHeight;
            }

            pdf.save(`TZ_${document.getElementById('tz_no').value || 'DOC'}.pdf`);
        } catch (err) { alert("Ошибка при создании PDF."); } 
        finally { 
            if (footer) footer.style.display = 'flex'; 
            if (closeBtn) closeBtn.style.display = 'block';
            prepareForPrint(false);
        }
    }, 150); 
}

function prepareForPrint(enable) {
    const inputs = document.querySelectorAll('input, select, textarea');
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

    if(enable) {
        if(tzInp && tzTxt) {
            tzTxt.innerText = tzInp.value || '000-00';
            tzInp.style.display = 'none';
            tzTxt.style.display = 'inline-block';
        }
    } else {
        if(tzInp && tzTxt) {
            tzInp.style.display = 'inline-block';
            tzTxt.style.display = 'none';
        }
    }

    const imgText = document.getElementById('img_text');
    if(imgText) imgText.style.display = enable ? 'none' : (uploadedImageBase64 ? 'none' : 'block');
    const upZone = document.getElementById('upload_zone');
    if(upZone) upZone.style.border = enable ? 'none' : '3px dashed #cbd5e1';
}

async function sendTZ() {
    const tzNo = document.getElementById('tz_no').value || "DOC";
    const fileName = `TZ_${tzNo}.pdf`;
    const el = document.querySelector('.document-sheet');
    const footer = document.querySelector('.footer-btns');
    const closeBtn = document.querySelector('.close-x');
    
    prepareForPrint(true);
    if (footer) footer.style.display = 'none';
    if (closeBtn) closeBtn.style.display = 'none';

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
            const sliceHeight = pageHeight - 20; 

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= sliceHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 10; 
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position - 20, imgWidth, imgHeight); 
                heightLeft -= sliceHeight;
            }

            const pdfBlob = pdf.output('blob'); 
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: `ТЗ №${tzNo}`, text: `Отправляю ТЗ №${tzNo}` });
            } else {
                alert("На этом устройстве нет меню 'Поделиться'. Файл скачан.");
                pdf.save(fileName);
            }
        } catch (err) { 
            if (err.name !== 'AbortError') alert("Ошибка при отправке: " + err); 
        } finally { 
            if (footer) footer.style.display = 'flex'; 
            if (closeBtn) closeBtn.style.display = 'block';
            prepareForPrint(false);
        }
    }, 150);
}

// ======================================================
// 5. АРХИВ (ПЫЛЕСОС И УМНЫЕ КНОПКИ)
// ======================================================

function createNewTZ() { 
    uploadedImageBase64 = null; 
    navigate('template'); 
}

function saveToArchive() {
    const s = getSettings();
    if (!s.username) return alert("Ошибка: Вы не авторизованы!");

    const docData = { 
        tz_no: document.getElementById('tz_no') ? document.getElementById('tz_no').value : '?', 
        eq: document.getElementById('equipment_select') ? document.getElementById('equipment_select').value : '',
        manager: document.getElementById('manager_name') ? document.getElementById('manager_name').value : '',
        date: new Date().toLocaleDateString(),
        image: uploadedImageBase64,
        fields: {} // 🎒 ВОТ НАШ МЕШОК ДЛЯ ЦИФР
    };

    // 🌪️ ПЫЛЕСОС 3.0: Ищет абсолютно все поля ввода внутри документа
    const allInputs = document.querySelectorAll('.document-sheet input, .document-sheet select, .document-sheet textarea');
    allInputs.forEach(el => {
        if (el.id && el.id !== 'file_input') {
            docData.fields[el.id] = el.value;
        }
    });

    // 🚨 ДАТЧИК СЛЕЖЕНИЯ: Выведет в консоль (F12) всё, что смог собрать пылесос!
    console.log("📦 СОБРАНО ДЛЯ АРХИВА:", docData);

    const arc = getArchive();
    arc.unshift(docData); 
    localStorage.setItem('pronto_archive', JSON.stringify(arc)); 
    if (typeof db !== 'undefined') db.ref('users/' + s.username + '/archive').set(arc);
    navigate('home');
}

function editFromArchive(i) {
    const d = getArchive()[i]; 
    navigate('template');
    
    // Ждем 200 миллисекунд, чтобы бланк точно нарисовался на экране
    setTimeout(() => {
        // Если мешок с цифрами есть — распаковываем его
        if (d.fields && Object.keys(d.fields).length > 0) {
            console.log("📂 РАСПАКОВКА АРХИВА:", d.fields);
            for (let id in d.fields) {
                const el = document.getElementById(id);
                if (el) el.value = d.fields[id];
            }
        } else {
            // Если открыли старый проект (где мешка еще не было)
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
    }, 200); 
}

function deleteFromArchive(i) {
    if(confirm("Удалить проект из архива?")) {
        const s = getSettings();
        const arc = getArchive(); 
        arc.splice(i,1);
        localStorage.setItem('pronto_archive', JSON.stringify(arc)); 
        if (s.username && typeof db !== 'undefined') db.ref('users/' + s.username + '/archive').set(arc);
        navigate('home');
    }
}

function pdfFromArchive(i) { editFromArchive(i); setTimeout(genPDF, 500); }
function printFromArchive(i) { editFromArchive(i); setTimeout(handlePrint, 500); }
function sendFromArchiveBtn(i) { editFromArchive(i); setTimeout(sendTZ, 500); }

// ======================================================
// 6. FIREBASE (ВХОД И РЕГИСТРАЦИЯ)
// ======================================================

function mockRegister() {
    const login = document.getElementById('reg_login').value.trim();
    const pass = document.getElementById('reg_pass').value.trim();
    if (login === '' || pass === '') return alert("Введите логин и пароль!");

    db.ref('users/' + login).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            alert("Этот логин уже занят! Придумайте другой.");
        } else {
            db.ref('users/' + login).set({ password: pass, role: 'participant', status: 'pending' })
            .then(() => {
                alert("Успешно! Ваша заявка отправлена администратору на одобрение.");
                navigate('portal'); 
            }).catch((err) => alert("Ошибка соединения с базой: " + err.message));
        }
    });
}

function mockLogin() {
    const login = document.getElementById('auth_login').value.trim();
    const pass = document.getElementById('auth_pass').value.trim();
    if (login === '' || pass === '') return alert("Введите логин и пароль!");

    if (login === 'admin' && pass === '777') {
        localStorage.setItem('pronto_settings', JSON.stringify({ role: 'admin', theme: getSettings().theme, username: 'SuperAdmin' }));
        alert("Секретный вход! Добро пожаловать в панель управления.");
        return navigate('settings'); 
    }

    db.ref('users/' + login).once('value').then((snapshot) => {
        if (!snapshot.exists()) return alert("Такого пользователя не существует!");
        
        const user = snapshot.val();
        if (user.password !== pass) return alert("Неверный пароль!");
        if (user.status !== 'approved') return alert("Ваш аккаунт еще не одобрен администратором.");

        const s = getSettings();
        localStorage.setItem('pronto_settings', JSON.stringify({ role: user.role, theme: s.theme, username: login }));

        if (user.archive) localStorage.setItem('pronto_archive', JSON.stringify(user.archive));
        else localStorage.removeItem('pronto_archive');
        
        alert(`Добро пожаловать, ${login}!`);
        navigate('home'); 
    }).catch((err) => alert("Ошибка при входе: " + err.message));
}

// ======================================================
// 7. ПАНЕЛЬ АДМИНИСТРАТОРА (ОДОБРЕНИЕ ЗАЯВОК)
// ======================================================

function loadPendingUsers() {
    if (typeof db === 'undefined') return;
    const listDiv = document.getElementById('pending_users_list');
    if (!listDiv) return;

    db.ref('users').once('value').then(snapshot => {
        if (!snapshot.exists()) { listDiv.innerHTML = "Пока нет новых заявок"; return; }
        
        const users = snapshot.val();
        let html = '';
        
        for (let login in users) {
            if (users[login].status === 'pending') {
                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:10px; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:10px; text-align:left;">
                        <b style="color:var(--text); font-size:16px;">👤 ${login}</b>
                        <div style="display:flex; gap:5px;">
                            <button onclick="approveUser('${login}')" class="btn-mini" style="background:#10b981; padding:5px 10px; font-weight:bold;">✓ Одобрить</button>
                            <button onclick="rejectUser('${login}')" class="btn-mini" style="background:#ef4444; padding:5px 10px; font-weight:bold;">✕ Отказ</button>
                        </div>
                    </div>
                `;
            }
        }
        listDiv.innerHTML = html === '' ? "Пока нет новых заявок" : html;
    });
}

function approveUser(login) {
    if(confirm(`Одобрить доступ для пользователя ${login}?`)) {
        db.ref('users/' + login).update({ status: 'approved' })
            .then(() => { alert(`Пользователь ${login} успешно одобрен!`); loadPendingUsers(); });
    }
}

function rejectUser(login) {
    if(confirm(`Удалить заявку от ${login}? Это действие нельзя отменить.`)) {
        db.ref('users/' + login).remove()
            .then(() => { alert('Заявка удалена.'); loadPendingUsers(); });
    }
}

