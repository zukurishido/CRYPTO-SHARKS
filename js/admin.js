// Состояние админ-панели
let isAdminPanelVisible = false;
let isAuthenticated = false;

// Инициализация админ-панели
function initializeAdminPanel() {
    const adminButton = document.getElementById('adminButton');
    const closeAdmin = document.getElementById('closeAdmin');
    const adminPanel = document.getElementById('adminPanel');

    adminButton.addEventListener('click', () => {
        if (!isAuthenticated) {
            showLoginForm();
        } else {
            toggleAdminPanel();
        }
    });

    closeAdmin.addEventListener('click', () => {
        toggleAdminPanel();
    });
}

// Переключение видимости админ-панели
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    isAdminPanelVisible = !isAdminPanelVisible;
    adminPanel.classList.toggle('visible');
    
    if (isAdminPanelVisible && isAuthenticated) {
        showAdminContent();
    }
}

// Показ формы входа
function showLoginForm() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="space-y-4">
            <input type="password" 
                   id="adminPassword" 
                   placeholder="Введите пароль" 
                   class="w-full px-4 py-2 bg-[#1a1d24] border border-[#00ff9d] rounded-lg text-white">
            <button onclick="login()" 
                    class="w-full px-6 py-2 bg-[#00ff9d] text-[#1a1d24] rounded-lg">
                Войти
            </button>
        </div>
    `;
    toggleAdminPanel();
}

// Вход в админ-панель
function login() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'admin123') { // Замените на реальный пароль
        isAuthenticated = true;
        showAdminContent();
        showNotification('Вход выполнен успешно', 'success');
    } else {
        showNotification('Неверный пароль', 'error');
    }
}

// Показ контента админ-панели
function showAdminContent() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="space-y-6">
            <div class="flex space-x-4">
                <button onclick="showBulkInput()" 
                        class="flex-1 px-4 py-2 bg-[#1a1d24] border border-[#00ff9d] rounded-lg text-white hover:bg-[#2a2f38]">
                    Массовое добавление
                </button>
                <button onclick="showSingleInput()" 
                        class="flex-1 px-4 py-2 bg-[#1a1d24] border border-[#00ff9d] rounded-lg text-white hover:bg-[#2a2f38]">
                    Одиночное добавление
                </button>
            </div>
            <div id="inputForm"></div>
        </div>
    `;
}

// Показ формы массового добавления
function showBulkInput() {
    const inputForm = document.getElementById('inputForm');
    inputForm.innerHTML = `
        <div class="space-y-4">
            <textarea id="bulkInput" 
                      rows="10" 
                      placeholder="Примеры форматов:
#BTC +55%
ETH -12%
SOL +33% (10x)
DOT +25%" 
                      class="w-full p-4 bg-[#1a1d24] border border-[#00ff9d] rounded-lg text-white"></textarea>
            <button onclick="processBulkInput()" 
                    class="w-full px-6 py-2 bg-[#00ff9d] text-[#1a1d24] rounded-lg">
                Добавить сделки
            </button>
        </div>
    `;
}

// Показ формы одиночного добавления
function showSingleInput() {
    const inputForm = document.getElementById('inputForm');
    inputForm.innerHTML = `
        <div class="space-y-4">
            <input type="text" 
                   id="pairInput" 
                   placeholder="Пара (например: BTC)" 
                   class="w-full px-4 py-2 bg-[#1a1d24] border border-[#00ff9d] rounded-lg text-white">
            <input type="number" 
                   id="resultInput" 
                   placeholder="Результат в % (например: 55 или -12)" 
                   class="w-full px-4 py-2 bg-[#1a1d24] border border-[#00ff9d] rounded-lg text-white">
            <input type="text" 
                   id="leverageInput" 
                   placeholder="Кратность (например: 10x)" 
                   class="w-full px-4 py-2 bg-[#1a1d24] border border-[#00ff9d] rounded-lg text-white">
            <button onclick="processSingleInput()" 
                    class="w-full px-6 py-2 bg-[#00ff9d] text-[#1a1d24] rounded-lg">
                Добавить сделку
            </button>
        </div>
    `;
}

// Обработка массового ввода
function processBulkInput() {
    const text = document.getElementById('bulkInput').value;
    const trades = parseTradesFlexible(text);
    
    if (trades.length === 0) {
        showNotification('Не удалось распознать сделки', 'error');
        return;
    }

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    addTradeData(year, month, category, trades);
    updateContent();
    
    document.getElementById('bulkInput').value = '';
    showNotification(`Добавлено ${trades.length} сделок`, 'success');
}

// Обработка одиночного ввода
function processSingleInput() {
    const pair = document.getElementById('pairInput').value;
    const result = parseFloat(document.getElementById('resultInput').value);
    const leverage = document.getElementById('leverageInput').value;

    if (!pair || isNaN(result)) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }

    const trade = {
        id: Date.now(),
        pair: pair,
        result: result,
        leverage: leverage ? `${leverage}` : '',
        status: result > 0 ? 'profit' : 'loss'
    };

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    addTradeData(year, month, category, trade);
    updateContent();

    // Очистка формы
    document.getElementById('pairInput').value = '';
    document.getElementById('resultInput').value = '';
    document.getElementById('leverageInput').value = '';
    
    showNotification('Сделка добавлена', 'success');
}

// Показ уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeAdminPanel);
