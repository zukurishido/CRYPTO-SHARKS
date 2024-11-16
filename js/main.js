// Глобальное состояние приложения
const state = {
    currentYear: new Date().getFullYear().toString(),
    currentMonth: MONTHS[new Date().getMonth()],
    currentCategory: 'SPOT',
    isLoading: false
};

// Улучшенное обновление контента
async function updateContent(showLoader = true) {
    if (state.isLoading) return;
    state.isLoading = true;

    const statsContainer = document.getElementById('statsContainer');
    if (showLoader && statsContainer) {
        statsContainer.classList.add('loading');
    }

    try {
        const trades = getPeriodData(
            state.currentYear,
            state.currentMonth,
            state.currentCategory
        );
        const stats = calculateStats(trades);

        updateSummaryStats(stats);
        updateTradesGrid(trades);
        updateFilters();

    } catch (error) {
        console.error('Error updating content:', error);
        showNotification('Ошибка обновления данных', 'error');
    } finally {
        state.isLoading = false;
        if (showLoader && statsContainer) {
            statsContainer.classList.remove('loading');
        }
    }
}

// Улучшенное отображение статистики
function updateSummaryStats(stats) {
    const summaryStats = document.getElementById('summaryStats');
    if (!summaryStats) return;

    summaryStats.innerHTML = `
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
            <h3>Винрейт</h3>
            <div class="stat-value ${parseFloat(stats.winRate) > 50 ? 'profit' : 'loss'}">${stats.winRate}%</div>
        </div>
    `;
}

// Улучшенное отображение сделок
function updateTradesGrid(trades) {
    const container = document.getElementById('tradesGrid');
    if (!container) return;
    
    container.innerHTML = '';

    if (trades.length === 0) {
        container.innerHTML = `
            <div class="no-trades fade-in">
                <p class="text-center text-gray-500">Нет сделок за выбранный период</p>
            </div>
        `;
        return;
    }

    const sortedTrades = [...trades].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    sortedTrades.forEach((trade, index) => {
        const card = document.createElement('div');
        card.className = `trade-card fade-in ${trade.status}`;
        card.style.animationDelay = `${index * 0.1}s`;

        const isProfit = trade.result > 0;
        const resultClass = isProfit ? 'profit-text' : 'loss-text';
        const barColor = isProfit ? '#00ff9d' : '#ff4444';
        const date = new Date(trade.timestamp).toLocaleDateString('ru-RU');
        
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

// Улучшенные фильтры
function updateFilters() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const categorySelect = document.getElementById('categorySelect');

    if (!yearSelect || !monthSelect || !categorySelect) return;

    // Обновляем текущие значения
    yearSelect.value = state.currentYear;
    monthSelect.value = state.currentMonth;
    categorySelect.value = state.currentCategory;

    // Добавляем обработчики
    [yearSelect, monthSelect, categorySelect].forEach(select => {
        select.addEventListener('change', (e) => {
            state[e.target.id.replace('Select', '').toLowerCase()] = e.target.value;
            updateContent(true);
        });
    });
}

// Инициализация приложения
async function initializeApp() {
    try {
        const loadingResult = await loadData();
        if (!loadingResult) {
            showNotification('Ошибка загрузки данных', 'error');
            return;
        }

        // Инициализация фильтров
        const filtersContainer = document.getElementById('filters');
        if (filtersContainer) {
            filtersContainer.innerHTML = `
                <select id="yearSelect" class="filter-select">
                    ${YEARS.map(year => `
                        <option value="${year}" ${year === state.currentYear ? 'selected' : ''}>
                            ${year}
                        </option>
                    `).join('')}
                </select>
                <select id="monthSelect" class="filter-select">
                    ${MONTHS.map(month => `
                        <option value="${month}" ${month === state.currentMonth ? 'selected' : ''}>
                            ${month}
                        </option>
                    `).join('')}
                </select>
                <select id="categorySelect" class="filter-select">
                    ${CATEGORIES.map(category => `
                        <option value="${category}" ${category === state.currentCategory ? 'selected' : ''}>
                            ${category}
                        </option>
                    `).join('')}
                </select>
            `;
        }

        await updateContent(false);
        
        // Инициализация админ-панели
        if (typeof initializeAdminPanel === 'function') {
            initializeAdminPanel();
        }

    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Ошибка инициализации приложения', 'error');
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', initializeApp);

// Обновление при возвращении на вкладку
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateContent(true);
    }
});

// Автоматическое обновление
setInterval(() => {
    if (!document.hidden) {
        updateContent(false);
    }
}, 30000);
