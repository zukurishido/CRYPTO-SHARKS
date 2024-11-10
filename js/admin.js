// Состояние администратора
let isAuthenticated = false;
let isAdminPanelVisible = false;

// Функции для работы с паролем
function setAdminPassword(password) {
    localStorage.setItem('adminPassword', password);
}

function getAdminPassword() {
    return localStorage.getItem('adminPassword') || 'Cr5pt0Sh@rks2024#AdminP@nel';
}

// Функция первичной установки пароля
function setupAdminPassword() {
    if (!localStorage.getItem('adminPassword')) {
        const defaultPassword = 'Cr5pt0Sh@rks2024#AdminP@nel';
        setAdminPassword(defaultPassword);
    }
}

// Функция изменения пароля
function changeAdminPassword() {
    if (!isAuthenticated) {
        alert('Необходимо войти в админ-панель!');
        return;
    }
    
    const currentPassword = prompt('Введите текущий пароль:');
    if (currentPassword !== getAdminPassword()) {
        alert('Неверный текущий пароль!');
        return;
    }
    
    const newPassword = prompt('Введите новый пароль:');
    if (newPassword && newPassword.length >= 8) {
        setAdminPassword(newPassword);
        alert('Пароль успешно изменен!');
    } else {
        alert('Новый пароль должен содержать минимум 8 символов!');
    }
}

// Переключение видимости админ-панели
function toggleAdmin() {
    if (!isAuthenticated) {
        const password = prompt('Введите пароль администратора:');
        if (password !== getAdminPassword()) {
            alert('Неверный пароль!');
            return;
        }
        isAuthenticated = true;
    }

    const panel = document.getElementById('adminPanel');
    isAdminPanelVisible = !isAdminPanelVisible;
    
    if (isAdminPanelVisible) {
        panel.classList.add('visible');
        updateAdminPanelInfo();
        showBulkInput();
        gsap.to(panel, {
            right: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
    } else {
        gsap.to(panel, {
            right: -400,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => panel.classList.remove('visible')
        });
    }
}

// Остальные функции остаются без изменений
function updateAdminPanelInfo() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const monthNames = {
        '1': 'Январь', '2': 'Февраль', '3': 'Март', '4': 'Апрель',
        '5': 'Май', '6': 'Июнь', '7': 'Июль', '8': 'Август',
        '9': 'Сентябрь', '10': 'Октябрь', '11': 'Ноябрь', '12': 'Декабрь'
    };

    document.getElementById('currentSettings').innerHTML = `
        <div class="current-setting">
            <span class="setting-label">Год:</span>
            <span class="setting-value">${year}</span>
        </div>
        <div class="current-setting">
            <span class="setting-label">Месяц:</span>
            <span class="setting-value">${monthNames[month]}</span>
        </div>
        <div class="current-setting">
            <span class="setting-label">Категория:</span>
            <span class="setting-value">${category}</span>
        </div>
    `;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    setupAdminPassword();
    document.getElementById('yearSelect').addEventListener('change', updateAdminPanelInfo);
    document.getElementById('monthSelect').addEventListener('change', updateAdminPanelInfo);
    document.getElementById('categorySelect').addEventListener('change', updateAdminPanelInfo);
    isAuthenticated = false;
    isAdminPanelVisible = false;
});

// Остальной код остается без изменений...
