// Обновление контента
function updateContent() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    const trades = getPeriodData(year, month, category);
    const stats = calculateStats(trades);

    updateSummaryStats(stats);
    updateTradesGrid(trades);
}

// Обновление статистики
function updateSummaryStats(stats) {
    const summaryStats = document.getElementById('summaryStats');
    
    if (!summaryStats) return;

    let profitClass = stats.totalProfit > 0 ? 'profit' : '';
    let lossClass = stats.totalLoss > 0 ? 'loss' : '';

    summaryStats.innerHTML = `
        <div class="stat-box fade-in delay-1">
            <h3>Всего сделок</h3>
            <div class="stat-value">
                ${stats.totalTrades}
                <small class="stat-subtitle">${stats.winRate}% успешных</small>
            </div>
        </div>
        <div class="stat-box fade-in delay-2">
            <h3>Прибыльных</h3>
            <div class="stat-value ${profitClass}">
                +${stats.totalProfit}%
                <small class="stat-subtitle">${stats.profitTrades} сделок</small>
            </div>
        </div>
        <div class="stat-box fade-in delay-3">
            <h3>Убыточных</h3>
            <div class="stat-value ${lossClass}">
                -${stats.totalLoss}%
                <small class="stat-subtitle">${stats.lossTrades} сделок</small>
            </div>
        </div>
    `;
}

// Обновление сетки сделок
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

    // Сортировка сделок: сперва прибыльные, потом убыточные
    const sortedTrades = [...trades].sort((a, b) => b.result - a.result);

    sortedTrades.forEach((trade, index) => {
        const card = document.createElement('div');
        card.className = `trade-card ${trade.status} fade-in`;
        card.style.animationDelay = `${index * 0.1}s`;

        // Расчет ширины прогресс-бара
        const progressWidth = Math.min(Math.abs(trade.result) * 1.5, 100);
        
        // Определение иконки и цвета
        const icon = trade.result > 0 ? '↗' : '↘';
        const resultClass = trade.result > 0 ? 'profit' : 'loss';
        const timestamp = new Date(trade.timestamp).toLocaleString();
        
        card.innerHTML = `
            <div class="trade-header">
                <div class="trade-pair">
                    <span class="trade-icon ${resultClass}">${icon}</span>
                    <span class="pair-name">#${trade.pair}</span>
                </div>
                <div class="trade-result ${resultClass}">
                    ${trade.result > 0 ? '+' : ''}${trade.result}%
                    ${trade.leverage ? `<span class="leverage">(${trade.leverage})</span>` : ''}
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progressWidth}%">
                    <div class="progress-shine"></div>
                </div>
            </div>
            <div class="trade-info">
                <small class="trade-timestamp">${timestamp}</small>
            </div>
        `;

        // Добавляем эффект свечения при наведении
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--x', `${x}%`);
            card.style.setProperty('--y', `${y}%`);
        });

        container.appendChild(card);
    });

    // Добавляем анимацию появления
    container.querySelectorAll('.trade-card').forEach((card, index) => {
        setTimeout(() => card.classList.add('visible'), index * 100);
    });
}

// Инициализация фильтров
function initializeFilters() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');

    // Установка текущего года и месяца
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    const currentMonth = months[currentDate.getMonth()];

    if (yearSelect && monthSelect) {
        yearSelect.value = currentYear;
        monthSelect.value = currentMonth;

        // Добавление обработчиков событий
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', () => {
                const statsContainer = document.getElementById('statsContainer');
                if (statsContainer) {
                    statsContainer.classList.add('updating');
                }
                
                updateContent();
                
                setTimeout(() => {
                    if (statsContainer) {
                        statsContainer.classList.remove('updating');
                    }
                }, 500);
            });
        });
    }
}

// Форматирование чисел
function formatNumber(number) {
    return new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(number);
}

// Проверка состояния авторизации
function checkAuthState() {
    if (window.isAuthenticated) {
        document.body.classList.add('is-admin');
    } else {
        document.body.classList.remove('is-admin');
    }
}

// Инициализация приложения
function initializeApp() {
    loadData();
    initializeFilters();
    updateContent();
    checkAuthState();

    // Обновление при изменении данных в других вкладках
    window.addEventListener('storage', (e) => {
        if (e.key === 'cryptoSharksData') {
            loadData();
            updateContent();
        }
    });

    // Добавляем слушатель для обновления при изменении размера окна
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateContent, 100);
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initializeApp);
