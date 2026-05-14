// ==========================================
// HR ADMIN PANEL | AUTO-SYNC VERSION
// ==========================================

// Это "заглушки". Если из облака ничего не придет, покажутся они.
window.BOT_VACANCIES = [];
window.BOT_QUESTIONS = [];
window.ADMIN_FIELDS = [
    { key: "menu_greeting", name: "Главное меню", ru: "Загрузка...", uz: "Yuklanmoqda..." },
    { key: "about_text", name: "Текст 'О нас'", ru: "Загрузка...", uz: "Yuklanmoqda..." },
    { key: "success", name: "Успешная отправка", ru: "Загрузка...", uz: "Yuklanmoqda..." }
];

const GAS_URL = "https://script.google.com/macros/s/AKfycbycNi8t9H1uDVRKvyFazjiHum6iPTc86dnR2Z9Gryh02Ocf5duJpd3hgsEk87wdVPtzbg/exec"; 

// 1. ПРИНУДИТЕЛЬНАЯ ЗАГРУЗКА ПРИ СТАРТЕ
document.addEventListener("DOMContentLoaded", () => {
    const s = JSON.parse(localStorage.getItem('pronto_settings') || '{}');
    if (s.username && s.role === 'admin') {
        // Сначала грузим то, что сохранено в браузере (локально)
        loadLocalData();
        navigate('home');
        // А теперь идем в облако за свежими данными
        syncFromBot(true); 
    } else {
        window.location.href = '../index.html';
    }
});

function loadLocalData() {
    try {
        const data = localStorage.getItem('hr_admin_autosave_v2'); 
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed.vacancies) window.BOT_VACANCIES = parsed.vacancies;
            if (parsed.questions) window.BOT_QUESTIONS = parsed.questions;
            if (parsed.fields) window.ADMIN_FIELDS = parsed.fields;
        }
    } catch(e) { console.error("Локальных данных нет"); }
}

function navigate(view) {
    const app = document.getElementById('app');
    if (view === 'home') app.innerHTML = homeView();
}

function homeView() {
    const s = JSON.parse(localStorage.getItem('pronto_settings') || '{}');
    return `
    <div class="home-card fade-in" style="max-width: 900px; text-align: left;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 20px; align-items: center;">
            <div>
                <h1 style="margin:0; color: var(--pronto);">HR ПАНЕЛЬ</h1>
                <p style="margin:0; color:#64748b; font-size: 14px;">Админ: ${s.username} <span id="saveStatus" style="color:#22c55e;">✔️</span></p>
            </div>
            <div style="display:flex; gap:10px;">
                <button onclick="syncFromBot()" class="btn-mini" style="background:#8b5cf6; color:white;">🔄 ОБНОВИТЬ</button>
                <button onclick="window.location.href='../index.html'" class="btn-mini" style="background:#64748b; color:white;">🔙 ВЫХОД</button>
            </div>
        </div>
        
        <div style="background: #e0f2fe; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h3>💼 Вакансии</h3>
            <div id="vac_container">${buildVacanciesHTML()}</div>
            <button onclick="addVacancy()" class="btn-mini" style="background:#3b82f6; color:white;">➕ ДОБАВИТЬ</button>
        </div>

        <div style="background: #fef08a; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h3>📋 Конструктор анкеты</h3>
            <div id="q_container">${buildQuestionsHTML()}</div>
            <button onclick="addQuestion()" class="btn-mini" style="background:#ca8a04; color:white;">➕ ДОБАВИТЬ ВОПРОС</button>
        </div>

        <div id="fields_container" style="background: #f8fafc; padding: 20px; border-radius: 15px;">
            <h3>📝 Основные тексты</h3>
            ${buildFieldsHTML()}
        </div>

        <button onclick="saveToBot()" id="saveBtn" class="btn" style="height:60px; margin-top:20px;">💾 СОХРАНИТЬ В ОБЛАКО</button>
    </div>
    `;
}

function buildVacanciesHTML() {
    return window.BOT_VACANCIES.map(v => `
        <div style="background:white; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #93c5fd; position:relative;">
            <button onclick="removeVacancy(${v.id})" style="position:absolute; right:10px; top:10px; background:#ef4444; color:white; border:none; border-radius:5px; cursor:pointer;">🗑️</button>
            <input type="text" id="vac_name_ru_${v.id}" value="${v.name_ru}" oninput="saveState()" placeholder="Название (RU)" style="width:45%;">
            <input type="text" id="vac_name_uz_${v.id}" value="${v.name_uz}" oninput="saveState()" placeholder="Название (UZ)" style="width:45%;">
            <textarea id="vac_req_ru_${v.id}" oninput="saveState()" placeholder="Требования (RU)" style="width:45%; margin-top:5px; height:60px;">${v.req_ru}</textarea>
            <textarea id="vac_req_uz_${v.id}" oninput="saveState()" placeholder="Требования (UZ)" style="width:45%; margin-top:5px; height:60px;">${v.req_uz}</textarea>
        </div>
    `).join('');
}

function buildQuestionsHTML() {
    let opts = `<option value="">-- Обычно --</option><option value="end">🏁 Конец</option>`;
    window.BOT_QUESTIONS.forEach(t => { opts += `<option value="${t.id}">Прыжок на: ${t.name_ru}</option>`; });

    return window.BOT_QUESTIONS.map((q, i) => `
        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:15px; border:2px solid #eab308; position:relative;">
            <div style="position:absolute; right:10px; top:10px;">
                <button onclick="moveQuestion(${i}, -1)" class="btn-mini">⬆️</button>
                <button onclick="moveQuestion(${i}, 1)" class="btn-mini">⬇️</button>
                <button onclick="removeQuestion(${q.id})" class="btn-mini" style="background:#ef4444;">🗑️</button>
            </div>
            <b>В ${i+1}:</b> <input type="text" id="q_name_ru_${q.id}" value="${q.name_ru}" oninput="saveState()" style="width:150px;">
            <br>
            <input type="text" id="q_ru_${q.id}" value="${q.q_ru}" oninput="saveState()" placeholder="Текст вопроса RU" style="width:48%;">
            <input type="text" id="q_uz_${q.id}" value="${q.q_uz}" oninput="saveState()" placeholder="Текст вопроса UZ" style="width:48%;">
            <br>
            Тип: <select id="q_type_${q.id}" onchange="saveState(); refreshUI()">
                <option value="text" ${q.type==='text'?'selected':''}>Текст</option>
                <option value="buttons" ${q.type==='buttons'?'selected':''}>Кнопки</option>
            </select>
            ${q.type === 'buttons' ? `<input type="text" id="q_btn_ru_${q.id}" value="${q.buttons_ru}" oninput="saveState()" placeholder="Варианты (Да, Нет)" style="width:40%;">` : ''}
            <div style="margin-top:5px; font-size:12px;">
                Логика: Если ответ <input type="text" id="q_cond_ru_${q.id}" value="${q.cond_ru || ''}" oninput="saveState()" style="width:80px;"> ➡️
                <select id="q_cond_target_${q.id}" onchange="saveState()">
                    ${opts.replace(`value="${q.cond_target}"`, `value="${q.cond_target}" selected`)}
                </select>
            </div>
        </div>
    `).join('');
}

function buildFieldsHTML() {
    return window.ADMIN_FIELDS.map(f => `
        <div style="margin-bottom: 10px;">
            <label>${f.name}:</label>
            <div style="display:flex; gap:10px;">
                <input type="text" id="${f.key}_ru" value="${f.ru}" oninput="saveState()" style="flex:1;">
                <input type="text" id="${f.key}_uz" value="${f.uz}" oninput="saveState()" style="flex:1;">
            </div>
        </div>
    `).join('');
}

function saveState() {
    if (!document.getElementById('vac_container')) return;
    window.BOT_VACANCIES.forEach(v => {
        const elRu = document.getElementById('vac_name_ru_'+v.id);
        const elUz = document.getElementById('vac_name_uz_'+v.id);
        const elReqRu = document.getElementById('vac_req_ru_'+v.id);
        const elReqUz = document.getElementById('vac_req_uz_'+v.id);
        if(elRu) v.name_ru = elRu.value;
        if(elUz) v.name_uz = elUz.value;
        if(elReqRu) v.req_ru = elReqRu.value;
        if(elReqUz) v.req_uz = elReqUz.value;
    });
    window.BOT_QUESTIONS.forEach(q => {
        const elName = document.getElementById('q_name_ru_'+q.id);
        const elQru = document.getElementById('q_ru_'+q.id);
        const elQuz = document.getElementById('q_uz_'+q.id);
        const elType = document.getElementById('q_type_'+q.id);
        if(elName) q.name_ru = elName.value;
        if(elQru) q.q_ru = elQru.value;
        if(elQuz) q.q_uz = elQuz.value;
        if(elType) q.type = elType.value;
        if(q.type === 'buttons') {
            const elBtn = document.getElementById('q_btn_ru_'+q.id);
            if(elBtn) q.buttons_ru = elBtn.value;
        }
        const elCondRu = document.getElementById('q_cond_ru_'+q.id);
        const elCondTarget = document.getElementById('q_cond_target_'+q.id);
        if(elCondRu) q.cond_ru = elCondRu.value;
        if(elCondTarget) q.cond_target = elCondTarget.value;
    });
    window.ADMIN_FIELDS.forEach(f => {
        const elRu = document.getElementById(f.key + '_ru');
        const elUz = document.getElementById(f.key + '_uz');
        if(elRu) f.ru = elRu.value;
        if(elUz) f.uz = elUz.value;
    });
    localStorage.setItem('hr_admin_autosave_v2', JSON.stringify({ vacancies: window.BOT_VACANCIES, questions: window.BOT_QUESTIONS, fields: window.ADMIN_FIELDS }));
}

function refreshUI() {
    saveState();
    navigate('home');
}

// 2. ФУНКЦИЯ СИНХРОНИЗАЦИИ (БЕРЕТ ДАННЫЕ ИЗ ГУГЛА)
function syncFromBot(silent = false) {
    if (!silent && !confirm("Обновить данные из облака?")) return;
    
    // Используем GET запрос для получения данных, чтобы избежать проблем с CORS no-cors
    // Но так как у нас no-cors в POST, мы просто "просим" Гугл обновить данные
    fetch(GAS_URL + "?command=get_data&pass=TimaSafeKey_2026")
    .then(r => r.json())
    .then(data => {
        if(data.questions) window.BOT_QUESTIONS = data.questions;
        if(data.vacancies) window.BOT_VACANCIES = data.vacancies;
        if(data.newTexts) {
             window.ADMIN_FIELDS.forEach(f => {
                f.ru = data.newTexts[f.key + '_ru'] || f.ru;
                f.uz = data.newTexts[f.key + '_uz'] || f.uz;
             });
        }
        localStorage.setItem('hr_admin_autosave_v2', JSON.stringify({ vacancies: window.BOT_VACANCIES, questions: window.BOT_QUESTIONS, fields: window.ADMIN_FIELDS }));
        refreshUI();
        if(!silent) alert("✅ Данные обновлены!");
    })
    .catch(e => {
        console.log("Синхронизация не удалась (это нормально при первом запуске или CORS)");
    });
}

function saveToBot() {
    saveState();
    const btn = document.getElementById('saveBtn'); btn.innerText = "⏳ Сохраняю..."; btn.disabled = true;
    let texts = {}; window.ADMIN_FIELDS.forEach(f => { texts[f.key + '_ru'] = f.ru; texts[f.key + '_uz'] = f.uz; });
    const payload = { adminPassword: "TimaSafeKey_2026", newTexts: texts, vacancies: window.BOT_VACANCIES, questions: window.BOT_QUESTIONS };
    
    fetch(GAS_URL, { 
        method: "POST", 
        mode: "no-cors",
        body: JSON.stringify(payload), 
        headers: { "Content-Type": "text/plain" } 
    })
    .then(() => { 
        alert("✅ Сохранено в облако! Теперь всё подтянется."); 
        btn.innerText = "💾 СОХРАНИТЬ В ОБЛАКО"; 
        btn.disabled = false; 
    })
    .catch(() => { 
        alert("❌ Ошибка сети"); 
        btn.disabled = false; 
    });
}

// Вспомогательные функции для кнопок
function addVacancy() { window.BOT_VACANCIES.push({id: Date.now(), name_ru:"", name_uz:"", req_ru:"", req_uz:""}); refreshUI(); }
function removeVacancy(id) { window.BOT_VACANCIES = window.BOT_VACANCIES.filter(v => v.id !== id); refreshUI(); }
function addQuestion() { window.BOT_QUESTIONS.push({id: Date.now(), name_ru:"Новый", name_uz:"", q_ru:"", q_uz:"", type:"text", buttons_ru:"", cond_ru:"", cond_target:""}); refreshUI(); }
function removeQuestion(id) { window.BOT_QUESTIONS = window.BOT_QUESTIONS.filter(q => q.id !== id); refreshUI(); }
function moveQuestion(idx, dir) {
    if (idx + dir < 0 || idx + dir >= window.BOT_QUESTIONS.length) return;
    let temp = window.BOT_QUESTIONS[idx];
    window.BOT_QUESTIONS[idx] = window.BOT_QUESTIONS[idx + dir];
    window.BOT_QUESTIONS[idx + dir] = temp;
    refreshUI();
}
