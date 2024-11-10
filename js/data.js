// Начальные данные
let data = {
    '2024': {
        '10': {
            'SPOT': { trades: [] },
            'FUTURES': { trades: [] },
            'DEFI': { trades: [] }
        }
    }
};

// Загрузка данных из localStorage
function loadData() {
    const savedData = localStorage.getItem('cryptoSharksData');
    if (savedData) {
        data = JSON.parse(savedData);
    }
}

// Сохранение данных в localStorage
function saveData() {
    localStorage.setItem('cryptoSharksData', JSON.stringify(data));
}

// Добавление новой сделки
function addTradeData(year, month, category, tradeData) {
    // Создаем структуру, если её нет
    if (!data[year]) {
        data[year] = {};
    }
    if (!data[year][month]) {
        data[year][month] = {};
    }
    if (!data[year][month][category]) {
        data[year][month][category] = { trades: [] };
    }

    // Добавляем сделку
    data[year][month][category].trades.push(tradeData);
    
    // Сохраняем данные
    saveData();
}

// Получение данных за период
function getPeriodData(year, month, category) {
    return data[year]?.[month]?.[category]?.trades || [];
}

// Расчет статистики
function calculateStats(trades) {
    let totalProfit = 0;
    let totalLoss = 0;
    
    trades.forEach(trade => {
        if (trade.result > 0) {
            totalProfit += trade.result;
        } else {
            totalLoss += Math.abs(trade.result);
        }
    });

    return {
        totalTrades: trades.length,
        profitTrades: trades.filter(t => t.result > 0).length,
        lossTrades: trades.filter(t => t.result < 0).length,
        neutralTrades: trades.filter(t => t.result === 0).length,
        totalProfit: totalProfit.toFixed(1),
        totalLoss: totalLoss.toFixed(1),
        winRate: trades.length ? 
            ((trades.filter(t => t.result > 0).length / trades.length) * 100).toFixed(1) : 0
    };
}

// Загружаем данные при старте
loadData();
