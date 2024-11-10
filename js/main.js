// Обновление контента при изменении фильтров
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
        <div class="stat-box fade-in delay-1">
            <h3>Всего сделок</h3>
            <div class="stat-value">${stats.totalTrades}</div>
        </div>
        <div class="stat-box fade-in delay-2">
            <h3>Прибыльных</h3>
            <div class="stat-value profit">+${stats.totalProfit}%</div>
        </div>
        <div class="stat-box fade-in delay-3">
            <h3>Убыточных</h3>
            <div class="stat-value loss">-${stats.totalLoss}%</div>
        </div>
        <div class="stat-box fade-in delay-4">
            <h3>Winrate</h3>
            <div class="stat-value">${stats.winRate}%</div>
        </div>
    `;
}

// Обновление списка сделок
function updateTradesGrid(trades) {
    const container = document.getElementById('tradesGrid');
    container.innerHTML = '';

    trades.forEach((trade, index) => {
        const card = createTradeCard(trade, index);
        container.appendChild(card);
    });
}

// Создание карточки сделки с анимацией
function createTradeCard(trade, index) {
    const card = document.createElement('div');
    card.className = `trade-card ${trade.status}`;
    
    card.innerHTML = `
        <div class="active-glow"></div>
        <div class="trade-header">
            <div class="trade-pair">
                <div class="pair-icon">
                    ${trade.result > 0 ? 
                        '<i class="lucide lucide-trending-up"></i>' : 
                        (trade.result < 0 ? 
                            '<i class="lucide lucide-trending-down"></i>' : 
                            '<i class="lucide lucide-minus"></i>')}
                </div>
                <div class="pair-name">#${trade.pair}</div>
            </div>
            <div class="trade-result">
                ${trade.result > 0 ? '+' : ''}${trade.result}%
                ${trade.leverage ? ` (${trade.leverage})` : ''}
            </div>
        </div>
        <div class="progress-container">
            <div class="progress-bar" style="width: 0%">
                <div class="progress-shine"></div>
            </div>
        </div>
        ${trade.comment ? `<div class="trade-comment">${trade.comment}</div>` : ''}
    `;

    // Эффект свечения при наведении
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--x', `${x}%`);
        card.style.setProperty('--y', `${y}%`);
    });

    // Анимация появления
    setTimeout(() => {
        card.classList.add('visible');
        const progressBar = card.querySelector('.progress-bar');
        const width = Math.min(Math.abs(trade.result) * 1.5, 100);
        progressBar.style.width = `${width}%`;
    }, index * 100);

    return card;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateContent();
});
