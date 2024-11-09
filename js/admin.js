let isAuthenticated = false;
let isAdminPanelVisible = false;

// Обновление информации в админ-панели
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

// Переключение видимости админ-панели
function toggleAdmin() {
    if (!isAuthenticated) {
        const password = prompt('Введите пароль администратора:');
        if (password !== CONFIG.ADMIN_PASSWORD) {
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

    // Подтверждение добавления
    const confirmation = confirm(`Добавить сделку:\nГод: ${year}\nМесяц: ${month}\nКатегория: ${category}\nПара: ${tradeData.pair}\nРезультат: ${tradeData.result}%`);
    
    if (confirmation) {
        addTradeData(year, month, category, tradeData);
        updateContent();
        clearAdminForm();
        showSuccessMessage();
    }
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

// Добавляем слушатели для обновления информации
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('yearSelect').addEventListener('change', updateAdminPanelInfo);
    document.getElementById('monthSelect').addEventListener('change', updateAdminPanelInfo);
    document.getElementById('categorySelect').addEventListener('change', updateAdminPanelInfo);
    isAuthenticated = false;
    isAdminPanelVisible = false;
});
