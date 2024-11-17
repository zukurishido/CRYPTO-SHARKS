// Класс управления админ-панелью
class AdminPanel {
    constructor() {
        // Состояние
        this.state = {
            isAuthenticated: false,
            isPanelVisible: false,
            loginAttempts: 0,
            lastLoginAttempt: 0,
            currentMode: 'bulk' // 'bulk', 'single', 'list'
        };

        // Константы
        this.MAX_LOGIN_ATTEMPTS = window.githubConfig.limits.maxLoginAttempts;
        this.LOCKOUT_TIME = window.githubConfig.limits.lockoutDuration;

        // Селекторы
        this.selectors = {
            adminButton: '#adminButton',
            adminPanel: '#adminPanel',
            closeAdmin: '#closeAdmin',
            adminForm: '.admin-form'
        };

        // Привязка методов к контексту
        this.togglePanel = this.togglePanel.bind(this);
        this.login = this.login.bind(this);
        this.showLoginForm = this.showLoginForm.bind(this);
        this.showBulkInput = this.showBulkInput.bind(this);
        this.showRegularForm = this.showRegularForm.bind(this);
        this.showTradesList = this.showTradesList.bind(this);
    }

    // Инициализация
    initialize() {
        this.initializeElements();
        this.initializeEventListeners();
        this.restoreSession();
    }

    // Инициализация элементов
    initializeElements() {
        this.elements = {
            adminButton: document.querySelector(this.selectors.adminButton),
            adminPanel: document.querySelector(this.selectors.adminPanel),
            closeAdmin: document.querySelector(this.selectors.closeAdmin),
            adminForm: document.querySelector(this.selectors.adminForm)
        };
    }

    // Инициализация обработчиков событий
    initializeEventListeners() {
        if (this.elements.adminButton) {
            this.elements.adminButton.addEventListener('click', () => {
                if (!this.state.isAuthenticated) {
                    this.showLoginForm();
                } else {
                    this.togglePanel();
                }
            });
        }

        if (this.elements.closeAdmin) {
            this.elements.closeAdmin.addEventListener('click', this.togglePanel);
        }

        // Обработка клавиш
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isPanelVisible) {
                this.togglePanel();
            }
        });
    }

    // Восстановление сессии
    restoreSession() {
        if (window.configUtils.isAuthorized()) {
            this.state.isAuthenticated = true;
            document.body.classList.add('is-admin');
        }
    }

    // Проверка блокировки
    isLocked() {
        if (this.state.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
            const timePassedSinceLastAttempt = Date.now() - this.state.lastLoginAttempt;
            if (timePassedSinceLastAttempt < this.LOCKOUT_TIME) {
                const minutesLeft = Math.ceil((this.LOCKOUT_TIME - timePassedSinceLastAttempt) / 60000);
                this.showError(`Слишком много попыток. Попробуйте через ${minutesLeft} минут`);
                return true;
            } else {
                this.state.loginAttempts = 0;
            }
        }
        return false;
    }

    // Проверка авторизации
    checkAuth() {
        if (!this.state.isAuthenticated) {
            this.showError('Требуется авторизация');
            this.showLoginForm();
            return false;
        }
        return true;
    }

    // Переключение видимости панели
    togglePanel() {
        this.state.isPanelVisible = !this.state.isPanelVisible;
        
        if (this.elements.adminPanel) {
            this.elements.adminPanel.classList.toggle('visible');
            
            if (this.state.isPanelVisible && this.state.isAuthenticated) {
                switch (this.state.currentMode) {
                    case 'bulk':
                        this.showBulkInput();
                        break;
                    case 'single':
                        this.showRegularForm();
                        break;
                    case 'list':
                        this.showTradesList();
                        break;
                    default:
                        this.showBulkInput();
                }
            }
        }

        // Блокировка прокрутки страницы
        document.body.style.overflow = this.state.isPanelVisible ? 'hidden' : '';
    }

    // Показ формы входа
    showLoginForm() {
        if (this.isLocked()) return;

        const form = this.elements.adminForm;
        if (!form) return;

        form.innerHTML = `
            <div class="login-form">
                <div class="input-group">
                    <input type="password" 
                           id="passwordInput" 
                           placeholder="Введите пароль" 
                           class="admin-input"
                           autocomplete="current-password"
                           onkeypress="if(event.key === 'Enter') window.adminPanel.login()">
                    <button onclick="window.adminPanel.login()" class="add-btn">
                        Войти
                    </button>
                </div>
                <div class="login-attempts">
                    Осталось попыток: ${this.MAX_LOGIN_ATTEMPTS - this.state.loginAttempts}
                </div>
            </div>
        `;
        
        if (!this.state.isPanelVisible) {
            this.togglePanel();
        }
        
        // Фокус на поле ввода
        setTimeout(() => {
            const input = document.getElementById('passwordInput');
            if (input) input.focus();
        }, 100);
    }

    // Вход в админ-панель
    async login() {
        if (this.isLocked()) return;

        const passwordInput = document.getElementById('passwordInput');
        if (!passwordInput) return;

        const password = passwordInput.value;
        const validHash = window.githubConfig.adminHash;
        
        if (btoa(password) === validHash) {
            this.state.isAuthenticated = true;
            document.body.classList.add('is-admin');
            
            // Сохранение сессии
            window.configUtils.saveSession(password);

            this.state.loginAttempts = 0;
            this.showBulkInput();
            this.showSuccess('Успешный вход');
        } else {
            this.state.loginAttempts++;
            this.state.lastLoginAttempt = Date.now();
            this.showError(`Неверный пароль. Осталось попыток: ${this.MAX_LOGIN_ATTEMPTS - this.state.loginAttempts}`);
            
            if (this.state.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
                this.showError(`Слишком много попыток. Панель заблокирована на 30 минут`);
            }
        }
    }
    // Показ формы массового добавления
    showBulkInput() {
        if (!this.checkAuth()) return;
        this.state.currentMode = 'bulk';

        const form = this.elements.adminForm;
        if (!form) return;

        form.innerHTML = `
            <div class="mode-switcher mb-4">
                <button onclick="window.adminPanel.showBulkInput()" class="mode-btn active">
                    <span class="mode-icon">📥</span>
                    Массовое добавление
                </button>
                <button onclick="window.adminPanel.showRegularForm()" class="mode-btn">
                    <span class="mode-icon">➕</span>
                    Одиночное добавление
                </button>
                <button onclick="window.adminPanel.showTradesList()" class="mode-btn">
                    <span class="mode-icon">📋</span>
                    Управление сделками
                </button>
            </div>

            <div class="input-group">
                <label>Массовое добавление сделок</label>
                <div class="format-helper">
                    <button onclick="window.adminPanel.showFormatHelp()" class="help-btn">
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
                    <button onclick="window.adminPanel.processBulkTrades()" class="add-btn">
                        Добавить сделки
                    </button>
                    <button onclick="window.adminPanel.clearInput()" class="clear-btn">
                        Очистить
                    </button>
                </div>
            </div>
        `;
    }

    // Показ формы одиночного добавления
    showRegularForm() {
        if (!this.checkAuth()) return;
        this.state.currentMode = 'single';

        const form = this.elements.adminForm;
        if (!form) return;

        form.innerHTML = `
            <div class="mode-switcher mb-4">
                <button onclick="window.adminPanel.showBulkInput()" class="mode-btn">
                    <span class="mode-icon">📥</span>
                    Массовое добавление
                </button>
                <button onclick="window.adminPanel.showRegularForm()" class="mode-btn active">
                    <span class="mode-icon">➕</span>
                    Одиночное добавление
                </button>
                <button onclick="window.adminPanel.showTradesList()" class="mode-btn">
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

                <button onclick="window.adminPanel.processSingleTrade()" class="add-btn">
                    Добавить сделку
                </button>
            </div>
        `;

        // Настройка поля плеча
        const categoryInputs = form.querySelectorAll('input[name="category"]');
        const leverageInput = document.getElementById('leverageInput');
        if (leverageInput) {
            leverageInput.style.display = 'none';
            categoryInputs.forEach(input => {
                input.addEventListener('change', () => {
                    leverageInput.style.display = input.value === 'FUTURES' ? 'block' : 'none';
                });
            });
        }
    }

    // Обработка массового добавления
    async processBulkTrades() {
        if (!this.checkAuth()) return;

        const bulkInput = document.getElementById('bulkInput');
        if (!bulkInput) return;

        const text = bulkInput.value.trim();
        if (!text) {
            this.showError('Введите данные для добавления');
            return;
        }

        const trades = window.parseTrades(text);
        
        if (trades.length === 0) {
            this.showError('Не удалось распознать сделки');
            return;
        }

        if (trades.length > window.githubConfig.limits.maxBulkTrades) {
            this.showError(`Максимум ${window.githubConfig.limits.maxBulkTrades} сделок за раз`);
            return;
        }

        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;
        const category = document.getElementById('categorySelect').value;

        try {
            const success = await window.dataManager.addTrades(year, month, category, trades);
            if (success) {
                bulkInput.value = '';
                this.showSuccess(`Добавлено ${trades.length} сделок`);
                window.app.updateContent();
            }
        } catch (error) {
            this.showError('Ошибка при добавлении сделок');
            console.error('Bulk trades error:', error);
        }
    }

    // Обработка одиночного добавления
    async processSingleTrade() {
        if (!this.checkAuth()) return;

        const pair = document.getElementById('pairInput')?.value.trim();
        const result = parseFloat(document.getElementById('resultInput')?.value);
        const leverage = document.getElementById('leverageInput')?.value.trim();
        const category = document.querySelector('input[name="category"]:checked')?.value;

        if (!pair || isNaN(result)) {
            this.showError('Заполните обязательные поля');
            return;
        }

        const trade = {
            id: Date.now() + Math.random(),
            pair: pair.toUpperCase(),
            result: result,
            leverage: leverage || '',
            status: result > 0 ? 'profit' : 'loss',
            category: category,
            timestamp: new Date().toISOString()
        };

        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;

        try {
            const success = await window.dataManager.addTrades(year, month, category, trade);
            if (success) {
                document.getElementById('pairInput').value = '';
                document.getElementById('resultInput').value = '';
                document.getElementById('leverageInput').value = '';
                
                this.showSuccess('Сделка добавлена');
                window.app.updateContent();
            }
        } catch (error) {
            this.showError('Ошибка при добавлении сделки');
            console.error('Single trade error:', error);
        }
    }

    // Показ списка сделок
    showTradesList() {
        if (!this.checkAuth()) return;
        this.state.currentMode = 'list';

        const year = document.getElementById('yearSelect')?.value;
        const month = document.getElementById('monthSelect')?.value;
        const category = document.getElementById('categorySelect')?.value;
        
        const trades = window.dataManager.getPeriodData(year, month, category);
        
        const form = this.elements.adminForm;
        if (!form) return;

        let html = this.getTradesListHeader();
        html += this.getTradesListContent(trades, year, month, category);
        
        form.innerHTML = html;
    }

    // Получение заголовка списка сделок
    getTradesListHeader() {
        return `
            <div class="mode-switcher mb-4">
                <button onclick="window.adminPanel.showBulkInput()" class="mode-btn">
                    <span class="mode-icon">📥</span>
                    Массовое добавление
                </button>
                <button onclick="window.adminPanel.showRegularForm()" class="mode-btn">
                    <span class="mode-icon">➕</span>
                    Одиночное добавление
                </button>
                <button onclick="window.adminPanel.showTradesList()" class="mode-btn active">
                    <span class="mode-icon">📋</span>
                    Управление сделками
                </button>
            </div>
        `;
    }

    // Получение содержимого списка сделок
    getTradesListContent(trades, year, month, category) {
        let html = `
            <div class="current-period">
                Период: ${month} ${year}, ${category}
            </div>
            <div class="trades-list">
        `;
        
        if (trades.length === 0) {
            html += '<p class="text-center text-gray-500">Нет сделок за выбранный период</p>';
        } else {
            trades.forEach((trade, index) => {
                html += this.getTradeItemHtml(trade, index, year, month, category);
            });
        }
        
        html += '</div>';
        return html;
    }

    // Получение HTML элемента сделки
    getTradeItemHtml(trade, index, year, month, category) {
        const resultColor = trade.result > 0 ? '#00ff9d' : '#ff4444';
        const resultText = `${trade.result > 0 ? '+' : ''}${trade.result}%${trade.leverage ? ` (${trade.leverage})` : ''}`;
        const date = new Date(trade.timestamp).toLocaleDateString();
        
        return `
            <div class="trade-item fade-in">
                <div class="trade-content">
                    <div class="trade-info">
                        <span class="trade-pair">#${trade.pair}</span>
                        <span style="color: ${resultColor}">${resultText}</span>
                    </div>
                    <div class="trade-date">${date}</div>
                </div>
                <div class="trade-actions">
                    <button onclick="window.adminPanel.confirmDelete('${year}', '${month}', '${category}', ${index})" 
                            class="delete-btn">
                        Удалить
                    </button>
                </div>
            </div>
        `;
    }

    // Подтверждение удаления
    async confirmDelete(year, month, category, index) {
        if (!this.checkAuth()) return;

        if (confirm('Удалить эту сделку?')) {
            try {
                const success = await window.dataManager.deleteTrade(year, month, category, index);
                if (success) {
                    this.showSuccess('Сделка удалена');
                    this.showTradesList();
                    window.app.updateContent();
                }
            } catch (error) {
                this.showError('Ошибка при удалении');
                console.error('Delete error:', error);
            }
        }
    }

    // Очистка поля ввода
    clearInput() {
        const input = document.getElementById('bulkInput');
        if (input) {
            input.value = '';
            this.showSuccess('Поле очищено');
        }
    }

    // Показ справки по формату
    showFormatHelp() {
        this.showInfo(`
            Поддерживаемые форматы:
            SPOT/FUTURES/DeFi: заголовок категории
            BTC +55% : пара и результат
            ETH -12% : пара и убыток
            SOL +33% (5x) : пара, результат и плечо
        `, 8000);
    }

    // Уведомления
    showSuccess(message) {
        window.showNotification?.(message, 'success');
    }

    showError(message) {
        window.showNotification?.(message, 'error');
    }

    showInfo(message, duration) {
        window.showNotification?.(message, 'info', duration);
    }
}

// Создание экземпляра админ-панели
window.adminPanel = new AdminPanel();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => window.adminPanel.initialize());
