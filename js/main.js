// Инициализация основного контента
function initializeContent() {
    initializeFilters();
    updateContent();
}

// Инициализация фильтров
function initializeFilters() {
    // Заполнение годов
    const yearSelect = document.getElementById('yearSelect');
    const years = ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Заполнение месяцев
    const monthSelect = document.getElementById('monthSelect');
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    // Заполнение категорий
    const categorySelect = document.getElementById('categorySelect');
    const categories = ['SPOT', 'FUTURES', 'DeFi'];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Добавление обработчиков событий
    [yearSelect, monthSelect, categorySelect].forEach(select => {
        select.addEventListener('change', updateContent);
    });
}

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
    summaryStats.innerHTML = `
        <div class="bg-[#242830] rounded-xl p-6">
            <h2 class="text-xl mb-2">Всего сделок</h2>
            <p class="text-3xl font-bold text-[#00ff9d]">${stats.totalTrades}</p>
        </div>
        <div class="bg-[#242830] rounded-xl p-6">
            <h2 class="text-xl mb-2">Прибыльных</h2>
            <p class="text-3xl font-bold text-[#00ff9d]">+${stats.totalProfit}%</p>
        </div>
        <div class="bg-[#242830] rounded-xl p-6">
            <h2 class="text-xl mb-2">Убыточных</h2>
            <p class="text-3xl font-bold text-red-500">-${stats.totalLoss}%</p>
        </div>
    `;
}

// Обновление сетки сделок
function updateTradesGrid(trades) {
    const tradesGrid = document.getElementById('tradesGrid');
    tradesGrid.innerHTML = '';

    trades.forEach((trade, index) => {
        const card = document.createElement('div');
        card.className = `trade-card ${trade.status} fade-in`;
        card.style.animationDelay = `${index * 0.1}s`;

        const progressWidth = Math.min(Math.abs(trade.result) * 1.5, 100);
        
        card.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <div class="text-lg font-medium">#${trade.pair}</div>
                <div class="text-lg ${trade.result > 0 ? 'text-[#00ff9d]' : 'text-red-500'}">
                    ${trade.result > 0 ? '+' : ''}${trade.result}%
                    ${trade.leverage ? `(${trade.leverage})` : ''}
                </div>
            </div>
            <div class="h-1 bg-[#1a1d24] rounded-full overflow-hidden">
                <div class="progress-bar" style="width: ${progressWidth}%"></div>
            </div>
        `;

        tradesGrid.appendChild(card);
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeContent);
