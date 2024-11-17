// Класс для управления приложением
class AppManager {
    constructor() {
        // Состояние приложения
        this.state = {
            currentYear: new Date().getFullYear().toString(),
            currentMonth: DataStore.MONTHS[new Date().getMonth()],
            currentCategory: 'SPOT',
            isLoading: false,
            isInitialized: false
        };

        // Селекторы элементов
        this.selectors = {
            filters: '#filters',
            summaryStats: '#summaryStats',
            statsContainer: '#statsContainer',
            tradesGrid: '#tradesGrid'
        };

        // Цветовая схема
        this.colors = {
            profit: '#00ff9d',
            loss: '#ff4444'
        };
    }

    // Инициализация приложения
    async initialize() {
        if (this.state.isInitialized) return;
        
        try {
            // Загрузка данных
            const loaded = await window.dataManager.loadData();
            if (!loaded) {
                this.showError('Ошибка загрузки данных');
                return;
            }

            // Инициализация компонентов
            this.initializeFilters();
            await this.updateContent(false);

            // Инициализация админ-панели
            if (typeof initializeAdminPanel === 'function') {
                initializeAdminPanel();
            }

            this.initializeEventListeners();
            this.state.isInitialized = true;

        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Ошибка инициализации приложения');
        }
    }

    // Обновление контента
    async updateContent(showLoader = true) {
        if (this.state.isLoading) return;
        this.state.isLoading = true;

        const container = document.querySelector(this.selectors.statsContainer);
        if (showLoader && container) {
            container.classList.add('loading');
        }

        try {
            const trades = window.dataManager.getPeriodData(
                this.state.currentYear,
                this.state.currentMonth,
                this.state.currentCategory
            );
            const stats = this.calculateStats(trades);

            this.updateSummaryStats(stats);
            this.updateTradesGrid(trades);
            this.updateFiltersState();

        } catch (error) {
            console.error('Content update error:', error);
            this.showError('Ошибка обновления данных');
        } finally {
            this.state.isLoading = false;
            if (showLoader && container) {
                container.classList.remove('loading');
            }
        }
    }

    // Расчет статистики
    calculateStats(trades) {
        const stats = {
            totalTrades: 0,
            profitTrades: 0,
            lossTrades: 0,
            totalProfit: 0,
            totalLoss: 0,
            maxProfit: 0,
            maxLoss: 0,
            avgProfit: 0,
            avgLoss: 0,
            winRate: 0,
            profitFactor: 0,
            expectancy: 0
        };

        if (!trades.length) return stats;

        trades.forEach(trade => {
            if (trade.result > 0) {
                stats.profitTrades++;
                stats.totalProfit += trade.result;
                stats.maxProfit = Math.max(stats.maxProfit, trade.result);
            } else if (trade.result < 0) {
                stats.lossTrades++;
                stats.totalLoss += Math.abs(trade.result);
                stats.maxLoss = Math.max(stats.maxLoss, Math.abs(trade.result));
            }
        });

        stats.totalTrades = trades.length;
        
        if (stats.profitTrades > 0) {
            stats.avgProfit = stats.totalProfit / stats.profitTrades;
        }
        
        if (stats.lossTrades > 0) {
            stats.avgLoss = stats.totalLoss / stats.lossTrades;
        }

        if (stats.totalTrades > 0) {
            stats.winRate = (stats.profitTrades / stats.totalTrades) * 100;
        }

        if (stats.totalLoss > 0) {
            stats.profitFactor = stats.totalProfit / stats.totalLoss;
        }

        stats.expectancy = (stats.avgProfit * (stats.winRate / 100)) - 
                          (stats.avgLoss * (1 - stats.winRate / 100));

        // Форматирование значений
        return {
            ...stats,
            totalProfit: stats.totalProfit.toFixed(1),
            totalLoss: stats.totalLoss.toFixed(1),
            maxProfit: stats.maxProfit.toFixed(1),
            maxLoss: stats.maxLoss.toFixed(1),
            avgProfit: stats.avgProfit.toFixed(1),
            avgLoss: stats.avgLoss.toFixed(1),
            winRate: stats.winRate.toFixed(1),
            profitFactor: stats.profitFactor.toFixed(2),
            expectancy: stats.expectancy.toFixed(2)
        };
    }

    // Обновление статистики
    updateSummaryStats(stats) {
        const container = document.querySelector(this.selectors.summaryStats);
        if (!container) return;

        container.innerHTML = `
            <div class="stat-box fade-in">
                <h3>Всего сделок</h3>
                <div class="stat-value">${stats.totalTrades}</div>
                <div class="stat-details">
                    <span class="profit">Win: ${stats.profitTrades}</span>
                    <span class="loss">Loss: ${stats.lossTrades}</span>
                </div>
            </div>
            <div class="stat-box fade-in">
                <h3>Прибыль</h3>
                <div class="stat-value profit">+${stats.totalProfit}%</div>
                <div class="stat-details">
                    <span>Макс: +${stats.maxProfit}%</span>
                    <span>Сред: +${stats.avgProfit}%</span>
                </div>
            </div>
            <div class="stat-box fade-in">
                <h3>Убытки</h3>
                <div class="stat-value loss">-${stats.totalLoss}%</div>
                <div class="stat-details">
                    <span>Макс: -${stats.maxLoss}%</span>
                    <span>Сред: -${stats.avgLoss}%</span>
                </div>
            </div>
            <div class="stat-box fade-in">
                <h3>Показатели</h3>
                <div class="stat-value ${parseFloat(stats.winRate) > 50 ? 'profit' : 'loss'}">
                    ${stats.winRate}%
                </div>
                <div class="stat-details">
                    <span>PF: ${stats.profitFactor}</span>
                    <span>Exp: ${stats.expectancy}</span>
                </div>
            </div>
        `;
    }

    // Обновление сетки сделок
    updateTradesGrid(trades) {
        const container = document.querySelector(this.selectors.tradesGrid);
        if (!container) return;
        
        container.innerHTML = '';

        if (!trades.length) {
            container.innerHTML = `
                <div class="no-trades fade-in">
                    <p class="text-center text-gray-500">Нет сделок за выбранный период</p>
                </div>
            `;
            return;
        }

        const sortedTrades = [...trades].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedTrades.forEach((trade, index) => {
            const card = document.createElement('div');
            card.className = `trade-card fade-in ${trade.status}`;
            card.style.animationDelay = `${index * 0.1}s`;

            const isProfit = trade.result > 0;
            const resultClass = isProfit ? 'profit-text' : 'loss-text';
            const barColor = isProfit ? this.colors.profit : this.colors.loss;
            
            const date = new Date(trade.timestamp).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            card.innerHTML = `
                <div class="trade-header">
                    <div class="trade-pair">
                        <span class="pair-name">#${trade.pair}</span>
                        ${trade.leverage ? `<span class="leverage">${trade.leverage}</span>` : ''}
                    </div>
                    <div class="trade-result ${resultClass}">
                        ${isProfit ? '+' : ''}${trade.result}%
                    </div>
                </div>
                <div class="trade-details">
                    <span class="trade-date">${date}</span>
                    <span class="trade-category">${trade.category}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" 
                         style="background: ${barColor}; 
                                width: 100%;">
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    // Инициализация фильтров
    initializeFilters() {
        const container = document.querySelector(this.selectors.filters);
        if (!container) return;

        container.innerHTML = `
            <select id="yearSelect" class="filter-select">
                ${DataStore.YEARS.map(year => `
                    <option value="${year}" ${year === this.state.currentYear ? 'selected' : ''}>
                        ${year}
                    </option>
                `).join('')}
            </select>
            <select id="monthSelect" class="filter-select">
                ${DataStore.MONTHS.map(month => `
                    <option value="${month}" ${month === this.state.currentMonth ? 'selected' : ''}>
                        ${month}
                    </option>
                `).join('')}
            </select>
            <select id="categorySelect" class="filter-select">
                ${DataStore.CATEGORIES.map(category => `
                    <option value="${category}" ${category === this.state.currentCategory ? 'selected' : ''}>
                        ${category}
                    </option>
                `).join('')}
            </select>
        `;

        this.initializeFilterHandlers();
    }

    // Обработчики фильтров
    initializeFilterHandlers() {
        ['yearSelect', 'monthSelect', 'categorySelect'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', (e) => {
                    const stateKey = id.replace('Select', '').toLowerCase();
                    this.state[`current${stateKey.charAt(0).toUpperCase()}${stateKey.slice(1)}`] = e.target.value;
                    this.updateContent(true);
                });
            }
        });
    }

    // Обновление состояния фильтров
    updateFiltersState() {
        ['yearSelect', 'monthSelect', 'categorySelect'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                const stateKey = id.replace('Select', '').toLowerCase();
                select.value = this.state[`current${stateKey.charAt(0).toUpperCase()}${stateKey.slice(1)}`];
            }
        });
    }

    // Инициализация обработчиков событий
    initializeEventListeners() {
        // Обновление при возвращении на вкладку
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateContent(true);
            }
        });

        // Автоматическое обновление
        setInterval(() => {
            if (!document.hidden) {
                this.updateContent(false);
            }
        }, window.githubConfig.refreshInterval);
    }

    // Уведомления
    showError(message) {
        window.showNotification?.(message, 'error');
    }
}

// Создание и запуск приложения
window.app = new AppManager();
document.addEventListener('DOMContentLoaded', () => window.app.initialize());
