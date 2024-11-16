// Состояние админ-панели
window.isAuthenticated = false;
let isAdminPanelVisible = false;

// Проверка авторизации с блокировкой при множественных неудачных попытках
let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 минут
let lastLoginAttempt = 0;

// Проверка блокировки
function isLocked() {
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        const timePassedSinceLastAttempt = Date.now() - lastLoginAttempt;
        if (timePassedSinceLastAttempt < LOCKOUT_TIME) {
            const minutesLeft = Math.ceil((LOCKOUT_TIME - timePassedSinceLastAttempt) / 60000);
            showNotification(`Слишком много попыток. Попробуйте через ${minutesLeft} минут`, 'error');
            return true;
        } else {
            loginAttempts = 0;
        }
    }
    return false;
}

// Улучшенная проверка авторизации
function checkAuth() {
    if (!window.isAuthenticated) {
        showNotification('Требуется авторизация', 'error');
        showLoginForm();
        return false;
    }
    return true;
}

// Инициализация админ-панели
function initializeAdminPanel() {
    const adminButton = document.getElementById('adminButton');
    const closeAdmin = document.getElementById('closeAdmin');

    if (adminButton && closeAdmin) {
        adminButton.addEventListener('click', () => {
            if (!window.isAuthenticated) {
                showLoginForm();
            } else {
                toggleAdminPanel();
            }
        });

        closeAdmin.addEventListener('click', toggleAdminPanel);
    }

    // Восстановление сессии
    const savedAuth = localStorage.getItem('cryptoSharksAuth');
    if (savedAuth) {
        try {
            const authData = JSON.parse(savedAuth);
            if (authData.expiry > Date.now()) {
                window.isAuthenticated = true;
                window.githubConfig.token = atob(authData.token);
                document.body.classList.add('is-admin');
            } else {
                localStorage.removeItem('cryptoSharksAuth');
            }
        } catch (e) {
            localStorage.removeItem('cryptoSharksAuth');
        }
    }
}

// Улучшенное переключение панели
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    isAdminPanelVisible = !isAdminPanelVisible;
    
    if (adminPanel) {
        adminPanel.classList.toggle('visible');
        
        if (isAdminPanelVisible && window.isAuthenticated) {
            showBulkInput();
        }
    }
}

// Улучшенная форма входа
function showLoginForm() {
    if (isLocked()) return;

    const form = document.querySelector('.admin-form');
    if (form) {
        form.innerHTML = `
            <div class="login-form">
                <div class="input-group">
                    <input type="password" 
                           id="passwordInput" 
                           placeholder="Введите пароль" 
                           class="admin-input"
                           autocomplete="current-password"
                           onkeypress="if(event.key === 'Enter') login()">
                    <button onclick="login()" class="add-btn">Войти</button>
                </div>
                <div class="login-attempts">
                    Осталось попыток: ${MAX_LOGIN_ATTEMPTS - loginAttempts}
                </div>
            </div>
        `;
        
        toggleAdminPanel();
        
        // Фокус на поле ввода
        setTimeout(() => {
            const input = document.getElementById('passwordInput');
            if (input) input.focus();
        }, 100);
    }
}

// Улучшенный вход
async function login() {
    if (isLocked()) return;

    const passwordInput = document.getElementById('passwordInput');
    if (!passwordInput) return;

    const password = passwordInput.value;
    const validHash = window.githubConfig.adminHash;
    
    if (btoa(password) === validHash) {
        window.isAuthenticated = true;
        window.githubConfig.token = atob(window.githubConfig.encryptedToken);
        document.body.classList.add('is-admin');
        
        // Сохраняем сессию на 24 часа
        localStorage.setItem('cryptoSharksAuth', JSON.stringify({
            token: window.githubConfig.encryptedToken,
            expiry: Date.now() + (24 * 60 * 60 * 1000)
        }));

        loginAttempts = 0;
        showBulkInput();
        showNotification('Успешный вход', 'success');
    } else {
        loginAttempts++;
        lastLoginAttempt = Date.now();
        showNotification(`Неверный пароль. Осталось попыток: ${MAX_LOGIN_ATTEMPTS - loginAttempts}`, 'error');
        
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            showNotification(`Слишком много попыток. Панель заблокирована на 30 минут`, 'error');
        }
    }
}

// Улучшенная форма массового добавления
function showBulkInput() {
    if (!checkAuth()) return;

    const form = document.querySelector('.admin-form');
    if (form) {
        form.innerHTML = `
            <div class="mode-switcher mb-4">
                <button onclick="showBulkInput()" class="mode-btn active">
                    <span class="mode-icon">📥</span>
                    Массовое добавление
                </button>
                <button onclick="showRegularForm()" class="mode-btn">
                    <span class="mode-icon">➕</span>
                    Одиночное добавление
                </button>
                <button onclick="showTradesList()" class="mode-btn">
                    <span class="mode-icon">📋</span>
                    Управление сделками
                </button>
            </div>

            <div class="input-group">
                <label>Массовое добавление сделок</label>
                <div class="format-helper">
                    <button onclick="showFormatHelp()" class="help-btn">
                        Формат ввода ℹ️
                    </button>
                </div>
                <textarea id="bulkInput" 
                          class="trade-input" 
                          placeholder="SPOT:
BTC +55%
ETH -12%
SOL +33%

FUTURES:
BNB +35% (5x)
DOGE -15% (10x)
ETH +76% (20x)

DeFi:
UNI +25%
AAVE -18%"></textarea>
                <div class="button-group">
                    <button onclick="processBulkTrades()" class="add-btn">
                        Добавить сделки
                    </button>
                    <button onclick="clearInput()" class="clear-btn">
                        Очистить
                    </button>
                </div>
            </div>
        `;
    }
}

// Показ справки по формату
function showFormatHelp() {
    showNotification(`
        Поддерживаемые форматы:
        SPOT/FUTURES/DeFi: заголовок категории
        BTC +55% : пара и результат
        ETH -12% : пара и убыток
        SOL +33% (5x) : пара, результат и плечо
    `, 'info', 8000);
}

// Улучшенная форма одиночного добавления
function showRegularForm() {
    if (!checkAuth()) return;

    const form = document.querySelector('.admin-form');
    if (form) {
        form.innerHTML = `
            <div class="mode-switcher mb-4">
                <button onclick="showBulkInput()" class="mode-btn">
                    <span class="mode-icon">📥</span>
                    Массовое добавление
                </button>
                <button onclick="showRegularForm()" class="mode-btn active">
                    <span class="mode-icon">➕</span>
                    Одиночное добавление
                </button>
                <button onclick="showTradesList()" class="mode-btn">
                    <span class="mode-icon">📋</span>
                    Управление сделками
                </button>
            </div>

            <div class="input-group">
                <label>Добавление сделки</label>
                <input type="text" 
                       id="pairInput" 
                       class="trade-input" 
                       placeholder="Пара (например: BTC)"
                       autocomplete="off">
                
                <div class="result-group">
                    <input type="number" 
                           id="resultInput" 
                           class="trade-input" 
                           step="0.01" 
                           placeholder="Результат в % (например: 55 или -12)"
                           autocomplete="off">
                           
                    <input type="text" 
                           id="leverageInput" 
                           class="trade-input" 
                           placeholder="Плечо (например: 20x)"
                           autocomplete="off">
                </div>

                <div class="category-select">
                    <label>
                        <input type="radio" name="category" value="SPOT" checked>
                        SPOT
                    </label>
                    <label>
                        <input type="radio" name="category" value="FUTURES">
                        FUTURES
                    </label>
                    <label>
                        <input type="radio" name="category" value="DeFi">
                        DeFi
                    </label>
                </div>

                <button onclick="processSingleTrade()" class="add-btn">
                    Добавить сделку
                </button>
            </div>
        `;

        // Автоматическое включение поля плеча для FUTURES
        const categoryInputs = form.querySelectorAll('input[name="category"]');
        const leverageInput = document.getElementById('leverageInput');
        
        categoryInputs.forEach(input => {
            input.addEventListener('change', () => {
                leverageInput.style.display = input.value === 'FUTURES' ? 'block' : 'none';
            });
        });
    }
}

// Улучшенный список сделок
function showTradesList() {
    if (!checkAuth()) return;

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getPeriodData(year, month, category);
    
    const form = document.querySelector('.admin-form');
    if (form) {
        let html = `
            <div class="mode-switcher mb-4">
                <button onclick="showBulkInput()" class="mode-btn">
                    <span class="mode-icon">📥</span>
                    Массовое добавление
                </button>
                <button onclick="showRegularForm()" class="mode-btn">
                    <span class="mode-icon">➕</span>
                    Одиночное добавление
                </button>
                <button onclick="showTradesList()" class="mode-btn active">
                    <span class="mode-icon">📋</span>
                    Управление сделками
                </button>
            </div>

            <div class="current-period">
                Период: ${month} ${year}, ${category}
            </div>
        `;
        
        html += '<div class="trades-list">';
        
        if (trades.length === 0) {
            html += '<p class="text-center text-gray-500">Нет сделок за выбранный период</p>';
        } else {
            trades.forEach((trade, index) => {
                const resultColor = trade.result > 0 ? '#00ff9d' : '#ff4444';
                const resultText = `${trade.result > 0 ? '+' : ''}${trade.result}%${trade.leverage ? ` (${trade.leverage})` : ''}`;
                const date = new Date(trade.timestamp).toLocaleDateString();
                
                html += `
                    <div class="trade-item fade-in">
                        <div class="trade-content">
                            <div class="trade-info">
                                <span class="trade-pair">#${trade.pair}</span>
                                <span style="color: ${resultColor}">${resultText}</span>
                            </div>
                            <div class="trade-date">${date}</div>
                        </div>
                        <div class="trade-actions">
                            <button onclick="confirmDelete('${year}', '${month}', '${category}', ${index})" 
                                    class="delete-btn">
                                Удалить
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        form.innerHTML = html;
    }
}

// Улучшенная обработка массового добавления
async function processBulkTrades() {
    if (!checkAuth()) return;

    const bulkInput = document.getElementById('bulkInput');
    if (!bulkInput) return;

    const text = bulkInput.value.trim();
    if (!text) {
        showNotification('Введите данные для добавления', 'error');
        return;
    }

    const trades = parseTrades(text);
    
    if (trades.length === 0) {
        showNotification('Не удалось распознать сделки', 'error');
        return;
    }

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    const success = await addTradeData(year, month, category, trades);
    if (success) {
        bulkInput.value = '';
        showNotification(`Добавлено ${trades.length} сделок`, 'success');
        updateContent();
    }
}

// Улучшенная обработка одиночного добавления
async function processSingleTrade() {
    if (!checkAuth()) return;

    const pair = document.getElementById('pairInput').value.trim();
    const result = parseFloat(document.getElementById('resultInput').value);
    const leverage = document.getElementById('leverageInput').value.trim();
    const category = document.querySelector('input[name="category"]:checked').value;

    if (!pair || isNaN(result)) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }

    const trade = {
        id: Date.now() + Math.random(),
        pair: pair.toUpperCase(),
        result: result,
        leverage: leverage ? leverage : '',
        status: result > 0 ? 'profit' : 'loss',
        category: category,
        timestamp: new Date().toISOString()
    };

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;

    const success = await addTradeData(year, month, category, trade);
    if (success) {
        document.getElementById('pairInput').value = '';
        document.getElementById('resultInput').value = '';
        document.getElementById('leverageInput').value = '';
        
        showNotification('Сделка добавлена', 'success');
        updateContent();
    }
}

// Улучшенное подтверждение удаления
async function confirmDelete(year, month, category, index) {
    if (!checkAuth()) return;

    if (confirm('Удалить эту сделку?')) {
        const success = await deleteTradeData(year, month, category, index);
        if (success) {
            showNotification('Сделка удалена', 'success');
            showTradesList();
            updateContent();
        }
    }
}

// Очистка поля ввода
function clearInput() {
    const input = document.getElementById('bulkInput');
    if (input) {
        input.value = '';
        showNotification('Поле очищено', 'success');
    }
}

// Улучшенные уведомления
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Запуск логики админ-панели
document.addEventListener('DOMContentLoaded', initializeAdminPanel);
