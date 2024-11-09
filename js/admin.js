// Конфигурация админа
const ADMIN_PASSWORD = 'Cr5pt0Sh@rks2024#AdminP@nel'; // Сложный пароль
let isAuthenticated = false;
let isAdminPanelVisible = false;

// Переключение видимости админ-панели
function toggleAdmin() {
    if (!isAuthenticated) {
        const password = prompt('Введите пароль администратора:');
        if (password !== ADMIN_PASSWORD) {
            alert('Неверный пароль!');
            return;
        }
        isAuthenticated = true;
    }

    const panel = document.getElementById('adminPanel');
    isAdminPanelVisible = !isAdminPanelVisible;
    
    if (isAdminPanelVisible) {
        panel.classList.add('visible');
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

// Выход из админ-панели
function logoutAdmin() {
    isAuthenticated = false;
    isAdminPanelVisible = false;
    const panel = document.getElementById('adminPanel');
    gsap.to(panel, {
        right: -400,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => panel.classList.remove('visible')
    });
}

// Добавление новой сделки
function addTrade() {
    if (!isAuthenticated) {
        alert('Необходима авторизация!');
        return;
    }

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const tradeData = {
        pair: document.getElementById('pairInput').value,
        result: Number(document.getElementById('resultInput').value),
        status: document.getElementById('statusInput').value,
        comment: document.getElementById('commentInput').value
    };

    // Валидация
    if (!tradeData.pair) {
        alert('Введите пару!');
        return;
    }

    // Добавление сделки и обновление отображения
    addTradeData(year, month, category, tradeData);
    updateContent();
    clearAdminForm();
    
    // Анимация успешного добавления
    showSuccessMessage();
}

// Очистка формы админ-панели
function clearAdminForm() {
    document.getElementById('pairInput').value = '';
    document.getElementById('resultInput').value = '';
    document.getElementById('statusInput').value = 'profit';
    document.getElementById('commentInput').value = '';
}

// Показ сообщения об успешном добавлении
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message fade-in';
    message.textContent = 'Сделка успешно добавлена';
    
    document.querySelector('.admin-form').appendChild(message);
    
    setTimeout(() => {
        gsap.to(message, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            onComplete: () => message.remove()
        });
    }, 2000);
}

// Проверка авторизации при загрузке
document.addEventListener('DOMContentLoaded', () => {
    isAuthenticated = false;
    isAdminPanelVisible = false;
});
