// ==========================================
// HR ADMIN PANEL | AUTO-SAVE & PROTECTED AREA
// ==========================================

window.BOT_VACANCIES = [
    { id: 1, name_ru: "Менеджер", name_uz: "Menejer", req_ru: "Опыт...", req_uz: "Tajriba..." }
];

// 🌟 ПОЛНЫЙ СПИСОК ИЗ 16 ВОПРОСОВ 🌟
window.BOT_QUESTIONS = [
    { id: 1, name_ru: "ФИО", name_uz: "F.I.Sh", q_ru: "Введите ваше ФИО (по паспорту):", q_uz: "F.I.Sh. ni kiriting (pasport bo'yicha):", type: "text", buttons_ru: "", buttons_uz: "", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 2, name_ru: "Дата рождения", name_uz: "Tug'ilgan sana", q_ru: "Введите вашу дату рождения (например, 15.05.1995):", q_uz: "Tug'ilgan sanangizni kiriting (masalan, 15.05.1995):", type: "text", buttons_ru: "", buttons_uz: "", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 3, name_ru: "Место проживания", name_uz: "Yashash joyi", q_ru: "Введите ваше место проживания (город, район):", q_uz: "Yashash joyingizni kiriting (shahar, tuman):", type: "text", buttons_ru: "", buttons_uz: "", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 4, name_ru: "Телефон", name_uz: "Telefon", q_ru: "Введите ваш номер телефона:", q_uz: "Telefon raqamingizni kiriting:", type: "text", buttons_ru: "", buttons_uz: "", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 5, name_ru: "Пол", name_uz: "Jins", q_ru: "Укажите ваш пол:", q_uz: "Jinsingizni ko'rsating:", type: "buttons", buttons_ru: "Муж, Жен", buttons_uz: "Erkak, Ayol", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 6, name_ru: "Семейное положение", name_uz: "Oilaviy ahvol", q_ru: "Ваше семейное положение:", q_uz: "Oilaviy ahvolingiz:", type: "buttons", buttons_ru: "Женат/Замужем, Холост/Не замужем", buttons_uz: "Uylangan/Turmushga chiqqan, Bo'ydoq/Turmushga chiqmagan", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 7, name_ru: "Студент", name_uz: "Talaba", q_ru: "Вы являетесь студентом?", q_uz: "Talabamisiz?", type: "buttons", buttons_ru: "Да, Нет", buttons_uz: "Ha, Yo'q", cond_ru: "Нет", cond_uz: "Yo'q", cond_target: "10" },
    { id: 8, name_ru: "Форма обучения", name_uz: "Ta'lim shakli", q_ru: "Форма обучения:", q_uz: "Ta'lim shakli:", type: "buttons", buttons_ru: "Очно, Заочно", buttons_uz: "Kunduzgi, Sirtqi", cond_ru: "Заочно", cond_uz: "Sirtqi", cond_target: "10" },
    { id: 9, name_ru: "Время обучения", name_uz: "O'qish vaqti", q_ru: "Время обучения:", q_uz: "O'qish vaqti:", type: "buttons", buttons_ru: "Утреннее, Вечернее", buttons_uz: "Ertalabki, Kechki", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 10, name_ru: "Опыт работы", name_uz: "Ish tajribasi", q_ru: "Опишите ваш опыт работы (компания, срок, должность).\nЕсли опыта нет, напишите 'Нет опыта':", q_uz: "Ish tajribangizni tasvirlab bering (kompaniya, muddat, lavozim).\nAgar tajribangiz bo'lmasa, 'Tajriba yo'q' deb yozing:", type: "text", buttons_ru: "", buttons_uz: "", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 11, name_ru: "Уровень Узбекского", name_uz: "O'zbek tili", q_ru: "Уровень Узбекского языка:", q_uz: "O'zbek tilini bilish darajasi:", type: "buttons", buttons_ru: "Низкий, Средний, Продвинутый", buttons_uz: "Past, O'rta, Yuqori", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 12, name_ru: "Уровень Английского", name_uz: "Ingliz tili", q_ru: "Уровень Английского языка:", q_uz: "Ingliz tilini bilish darajasi:", type: "buttons", buttons_ru: "Низкий, Средний, Продвинутый", buttons_uz: "Past, O'rta, Yuqori", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 13, name_ru: "Уровень Русского", name_uz: "Rus tili", q_ru: "Уровень Русского языка:", q_uz: "Rus tilini bilish darajasi:", type: "buttons", buttons_ru: "Низкий, Средний, Продвинутый", buttons_uz: "Past, O'rta, Yuqori", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 14, name_ru: "Зарплата", name_uz: "Maosh", q_ru: "Укажите ожидаемый уровень зарплаты (в сумах):", q_uz: "Kutilayotgan ish haqi miqdorini ko'rsating (so'mda):", type: "buttons", buttons_ru: "Пропустить", buttons_uz: "O'tkazib yuborish", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 15, name_ru: "Фото", name_uz: "Rasm", q_ru: "Пожалуйста, отправьте ваше фото (прикрепите как картинку):", q_uz: "Iltimos, rasmingizni yuboring (rasm sifatida biriktiring):", type: "text", buttons_ru: "", buttons_uz: "", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 16, name_ru: "Откуда узнали", name_uz: "Qayerdan bildingiz", q_ru: "Как вы узнали о нашей вакансии?", q_uz: "Vakansiyamiz haqida qayerdan bildingiz?", type: "buttons", buttons_ru: "Telegram, HeadHunter, Знакомые, Другое", buttons_uz: "Telegram, HeadHunter, Tanishlar, Boshqa", cond_ru: "", cond_uz: "", cond_target: "" }
];

window.ADMIN_FIELDS = [
    { key: "menu_greeting", name: "Главное меню", ru: "Выберите раздел:", uz: "Bo'limni tanlang:" },
    { key: "about_text", name: "Текст 'О нас'", ru: "Мы крутая компания!", uz: "Biz ajoyib kompaniyamiz!" },
    { key: "success", name: "Успешная отправка", ru: "Анкета отправлена!", uz: "Anketa yuborildi!" }
];

// 🌟 ЗАГРУЗКА ИЗ ЛОКАЛЬНОГО ХРАНИЛИЩА (Версия 2.0) 🌟
function loadLocalData() {
    try {
        const data = localStorage.getItem('hr_admin_autosave_v2'); 
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed.vacancies) window.BOT_VACANCIES = parsed.vacancies;
            if (parsed.questions) window.BOT_QUESTIONS = parsed.questions;
            if (parsed.fields) window.ADMIN_FIELDS = parsed.fields;
        }
    } catch(e) { console.error("Ошибка загрузки сохранений:", e); }
}
loadLocalData();

document.addEventListener("DOMContentLoaded", () => {
    try {
        const s = localStorage.getItem('pronto_settings');
        if (s) {
            const parsed = JSON.parse(s);
            if (parsed.username && parsed.role === 'admin') {
                return navigate('home');
            } else if (parsed.username) {
                alert("⛔ Доступ запрещен!");
                window.location.href = '../index.html';
                return;
            }
        }
    } catch(e) {}
    alert("Авторизуйтесь!");
    window.location.href = '../index.html';
});

function navigate(view) {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = ''; 
    if (view === 'home') app.innerHTML = homeView();
}

const homeView = () => {
    const s = JSON.parse(localStorage.getItem('pronto_settings') || '{}');
    return `
    <div class="home-card fade-in" style="max-width: 900px; text-align: left;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 20px; align-items: center;">
            <div>
                <h1 style="margin:0; color: var(--pronto);">HR ПАНЕЛЬ</h1>
                <p style="margin:0; color:#64748b; font-weight:bold; font-size: 14px;">Пользователь: ${s.username} <span id="saveStatus" style="color:#22c55e; margin-left:10px; font-size:12px;">✔️ Сохранено</span></p>
            </div>
            <button onclick="window.location.href='../index.html'" class="btn" style="background:#64748b; color:white; width: auto; padding: 10px 20px;">🔙 НА ПОРТАЛ</button>
        </div>
        
        <div style="background: #e0f2fe; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h3>💼 Вакансии</h3>
            <div id="vac_container">${buildVacanciesHTML()}</div>
            <button onclick="addVacancy()" class="btn-mini" style="background:#3b82f6; color:white; margin-top:10px;">➕ ДОБАВИТЬ ВАКАНСИЮ</button>
        </div>

        <div style="background: #fef08a; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h3>📋 Умный конструктор анкеты</h3>
            <div id="q_container">${buildQuestionsHTML()}</div>
            <button onclick="addQuestion()" class="btn-mini" style="background:#ca8a04; color:white; margin-top:10px;">➕ ДОБАВИТЬ ВОПРОС</button>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 15px;">
            <h3>📝 Основные тексты</h3>
            ${window.ADMIN_FIELDS.map(f => `
                <div style="margin-bottom: 10px;">
                    <label>${f.name}:</label>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="${f.key}_ru" value="${f.ru}" oninput="saveState()">
                        <input type="text" id="${f.key}_uz" value="${f.uz}" oninput="saveState()">
                    </div>
                </div>
            `).join('')}
        </div>

        <button onclick="saveToBot()" id="saveBtn" class="btn" style="height:60px; font-size:18px; margin-top:20px;">💾 ОТПРАВИТЬ В TELEGRAM</button>
    </div>
    `;
};

function buildVacanciesHTML() {
    return window.BOT_VACANCIES.map((v, i) => `
        <div style="background:white; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #93c5fd; position:relative;">
            <button onclick="removeVacancy(${v.id})" class="btn-mini" style="position:absolute; right:10px; top:10px; background:#ef4444; color:white;">🗑️</button>
            <input type="text" id="vac_name_ru_${v.id}" value="${v.name_ru}" oninput="saveState()" placeholder="Название (RU)" style="width:45%;">
            <input type="text" id="vac_name_uz_${v.id}" value="${v.name_uz}" oninput="saveState()" placeholder="Название (UZ)" style="width:45%;">
            <textarea id="vac_req_ru_${v.id}" oninput="saveState()" placeholder="Условия (RU)" rows="2" style="width:45%;"></textarea>
            <textarea id="vac_req_uz_${v.id}" oninput="saveState()" placeholder="Условия (UZ)" rows="2" style="width:45%;"></textarea>
        </div>
    `).join('');
}
function addVacancy() { window.BOT_VACANCIES.push({id: Date.now(), name_ru:"", name_uz:"", req_ru:"", req_uz:""}); refreshUI(); }
function removeVacancy(id) { window.BOT_VACANCIES = window.BOT_VACANCIES.filter(v => v.id !== id); refreshUI(); }

function buildQuestionsHTML() {
    let questionOptions = `<option value="">-- Обычно --</option><option value="end">🏁 Конец</option>`;
    window.BOT_QUESTIONS.forEach(targetQ => { questionOptions += `<option value="${targetQ.id}">Прыжок на: ${targetQ.name_ru}</option>`; });

    return window.BOT_QUESTIONS.map((q, i) => `
        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:15px; border:2px solid #eab308; position:relative;">
            <div style="position:absolute; right:10px; top:10px; display:flex; gap:5px;">
                <button onclick="moveQuestion(${i}, -1)" class="btn-mini">⬆️</button>
                <button onclick="moveQuestion(${i}, 1)" class="btn-mini">⬇️</button>
                <button onclick="removeQuestion(${q.id})" class="btn-mini" style="background:#ef4444;">🗑️</button>
            </div>
            <b>Вопрос ${i+1}:</b> <input type="text" id="q_name_ru_${q.id}" value="${q.name_ru}" oninput="saveState()" style="width:200px;">
            <br>
            <input type="text" id="q_ru_${q.id}" value="${q.q_ru}" oninput="saveState()" placeholder="RU" style="width:48%;">
            <input type="text" id="q_uz_${q.id}" value="${q.q_uz}" oninput="saveState()" placeholder="UZ" style="width:48%;">
            <br>
            <select id="q_type_${q.id}" onchange="saveState(); refreshUI()">
                <option value="text" ${q.type==='text'?'selected':''}>Текст</option>
                <option value="buttons" ${q.type==='buttons'?'selected':''}>Кнопки</option>
            </select>
            ${q.type === 'buttons' ? `
                <div style="margin-top:5px;">
                    <input type="text" id="q_btn_ru_${q.id}" value="${q.buttons_ru}" oninput="saveState()" placeholder="Да, Нет" style="width:48%;">
                    <input type="text" id="q_btn_uz_${q.id}" value="${q.buttons_uz}" oninput="saveState()" placeholder="Ha, Yo'q" style="width:48%;">
                </div>
            ` : ''}
            <div style="margin-top:10px; font-size:12px; border-top:1px dashed #ccc; padding-top:5px;">
                🔀 Прыжок если ответ: <input type="text" id="q_cond_ru_${q.id}" value="${q.cond_ru || ''}" oninput="saveState()" placeholder="Нет" style="width:100px;">
                на вопрос: <select id="q_cond_target_${q.id}" onchange="saveState()">
                    ${questionOptions.replace(`value="${q.cond_target}"`, `value="${q.cond_target}" selected`)}
                </select>
            </div>
        </div>
    `).join('');
}

function moveQuestion(index, direction) {
    if (index + direction < 0 || index + direction >= window.BOT_QUESTIONS.length) return;
    let temp = window.BOT_QUESTIONS[index];
    window.BOT_QUESTIONS[index] = window.BOT_QUESTIONS[index + direction];
    window.BOT_QUESTIONS[index + direction] = temp;
    refreshUI();
}
function addQuestion() { window.BOT_QUESTIONS.push({id: Date.now(), name_ru:"Новый", name_uz:"Yangi", q_ru:"?", q_uz:"?", type:"text", buttons_ru:"", buttons_uz:"", cond_ru:"", cond_uz:"", cond_target:""}); refreshUI(); }
function removeQuestion(id) { window.BOT_QUESTIONS = window.BOT_QUESTIONS.filter(q => q.id !== id); refreshUI(); }

function saveState() {
    if (!document.getElementById('vac_container')) return;
    window.BOT_VACANCIES.forEach(v => {
        v.name_ru = document.getElementById('vac_name_ru_'+v.id)?.value || v.name_ru;
        v.name_uz = document.getElementById('vac_name_uz_'+v.id)?.value || v.name_uz;
        v.req_ru = document.getElementById('vac_req_ru_'+v.id)?.value || v.req_ru;
        v.req_uz = document.getElementById('vac_req_uz_'+v.id)?.value || v.req_uz;
    });
    window.BOT_QUESTIONS.forEach(q => {
        q.name_ru = document.getElementById('q_name_ru_'+q.id)?.value || q.name_ru;
        q.q_ru = document.getElementById('q_ru_'+q.id)?.value || q.q_ru;
        q.q_uz = document.getElementById('q_uz_'+q.id)?.value || q.q_uz;
        q.type = document.getElementById('q_type_'+q.id)?.value || q.type;
        if(q.type === 'buttons') {
            q.buttons_ru = document.getElementById('q_btn_ru_'+q.id)?.value || q.buttons_ru;
            q.buttons_uz = document.getElementById('q_btn_uz_'+q.id)?.value || q.buttons_uz;
        }
        q.cond_ru = document.getElementById('q_cond_ru_'+q.id)?.value || q.cond_ru;
        q.cond_target = document.getElementById('q_cond_target_'+q.id)?.value || q.cond_target;
    });
    window.ADMIN_FIELDS.forEach(f => {
        f.ru = document.getElementById(f.key + '_ru')?.value || f.ru;
        f.uz = document.getElementById(f.key + '_uz')?.value || f.uz;
    });
    localStorage.setItem('hr_admin_autosave_v2', JSON.stringify({ vacancies: window.BOT_VACANCIES, questions: window.BOT_QUESTIONS, fields: window.ADMIN_FIELDS }));
    const status = document.getElementById('saveStatus');
    if (status) { status.innerText = "⏳..."; setTimeout(() => status.innerText = "✔️ Сохранено", 500); }
}

function refreshUI() {
    saveState();
    document.getElementById('vac_container').innerHTML = buildVacanciesHTML();
    document.getElementById('q_container').innerHTML = buildQuestionsHTML();
}

function saveToBot() {
    saveState();
    const btn = document.getElementById('saveBtn'); btn.innerText = "⏳..."; btn.disabled = true;
    let updatedTexts = {}; window.ADMIN_FIELDS.forEach(f => { updatedTexts[f.key + '_ru'] = f.ru; updatedTexts[f.key + '_uz'] = f.uz; });
    const payload = { adminPassword: "TimurSuperAdmin123", newTexts: updatedTexts, vacancies: window.BOT_VACANCIES, questions: window.BOT_QUESTIONS };
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzEHSCuchjeLD6IzBtUgy3_wTI21fM9-V5EtJRNzJGiDqGHmv3Bc0KWE4GqG4awJKWWew/exec"; // <--- ВСТАВЬ ССЫЛКУ!
    fetch(GAS_URL, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "text/plain;charset=utf-8" } })
    .then(r => r.text()).then(r => { alert("✅ Обновлено!"); btn.innerText = "💾 ОТПРАВИТЬ В TELEGRAM"; btn.disabled = false; })
    .catch(e => { alert("❌ Ошибка!"); btn.innerText = "💾 ОТПРАВИТЬ В TELEGRAM"; btn.disabled = false; });
}
