// Инициализация GSAP
gsap.config({ force3D: true });

// Основные анимации при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
    updateContent();
});

function initializeAnimations() {
    gsap.from('#header', {
        opacity: 0,
        y: -20,
        duration: 1,
        ease: 'power2.out'
    });

    gsap.from('#filters', {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.3,
        ease: 'power2.out'
    });
}

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

// Обновление сводной статистики
function updateSummaryStats(stats) {
    const summaryStats = document.getElementById('summaryStats');
    summaryStats.innerHTML = `
        <div class="stat-box fade-in delay-1">
            <h3>Всего сделок</h3>
            <div class="stat-value">${stats.totalTrades}</div>
        </div>
        <div class="stat-box fade-in delay-2">
            <h3>Winrate</h3>
            <div class="stat-value">${stats.winRate}%</div>
        </div>
        <div class="stat-box fade-in delay-3">
            <h3>Общий профит</h3>
            <div class="stat-value ${stats.totalProfit >= 0 ? 'profit' : 'loss'}">
                ${stats.totalProfit > 0 ? '+' : ''}${stats.totalProfit}%
            </div>
        </div>
    `;
}

// Обновление сетки сделок
function updateTradesGrid(trades) {
    const tradesGrid = document.getElementById('tradesGrid');
    tradesGrid.innerHTML = '';

    trades.forEach((trade, index) => {
        const tradeCard = document.createElement('div');
        tradeCard.className = `trade-card ${trade.status} scale-in`;
        tradeCard.style.animationDelay = `${index * 0.1}s`;

        tradeCard.innerHTML = `
            <div class="trade-header">
                <span>${trade.pair}</span>
                <span>${trade.result > 0 ? '+' : ''}${trade.result}%</span>
            </div>
            ${trade.comment ? `<div class="trade-comment">${trade.comment}</div>` : ''}
            <div class="progress-container">
                <div class="progress-bar" style="width: ${Math.abs(trade.result)}%"></div>
            </div>
        `;

        tradesGrid.appendChild(tradeCard);
    });
}
