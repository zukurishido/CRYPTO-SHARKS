// Структура для хранения данных
let data = {
    '2024': {
        '10': {
            'SPOT': { trades: [] },
            'FUTURES': { trades: [] },
            'DeFi': { trades: [] }
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
    // Создаем структуру если её нет
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

// Обновление существующей сделки
function updateTradeData(year, month, category, index, tradeData) {
    if (data[year]?.[month]?.[category]?.trades[index]) {
        data[year][month][category].trades[index] = tradeData;
        saveData();
        return true;
    }
    return false;
}

// Удаление сделки
function deleteTradeData(year, month, category, index) {
    if (data[year]?.[month]?.[category]?.trades[index]) {
        data[year][month][category].trades.splice(index, 1);
        saveData();
        return true;
    }
    return false;
}

// Получение данных за период
function getPeriodData(year, month, category) {
    return data[year]?.[month]?.[category]?.trades || [];
}

// Расчет статистики
function calculateStats(trades) {
    let totalProfit = 0;
    let totalLoss = 0;
    let profitCount = 0;
    let lossCount = 0;
    let neutCount = 0;
    
    trades.forEach(trade => {
        if (trade.result > 0) {
            totalProfit += trade.result;
            profitCount++;
        } else if (trade.result < 0) {
            totalLoss += Math.abs(trade.result);
            lossCount++;
        } else {
            neutCount++;
        }
    });

    const total = trades.length;
    
    return {
        totalTrades: total,
        profitTrades: profitCount,
        lossTrades: lossCount,
        neutralTrades: neutCount,
        totalProfit: totalProfit.toFixed(1),
        totalLoss: totalLoss.toFixed(1),
        netProfit: (totalProfit - totalLoss).toFixed(1),
        winRate: total > 0 ? ((profitCount / total) * 100).toFixed(1) : 0
    };
}

// Парсинг массового ввода
function parseTrades(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let currentCategory = '';
    let trades = [];
    
    lines.forEach(line => {
        // Определение категории
        if (line.includes('DEFI:') || line.includes('DeFi:')) {
            currentCategory = 'DeFi';
            return;
        } else if (line.includes('FUTURES:')) {
            currentCategory = 'FUTURES';
            return;
        } else if (line.includes('SPOT:')) {
            currentCategory = 'SPOT';
            return;
        }

        // Парсинг сделки
        const tradeMatch = line.match(/\d+\.#(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/);
        
        if (tradeMatch && currentCategory) {
            const [_, symbol, sign, value, leverage] = tradeMatch;
            const result = (sign === '+' ? 1 : -1) * parseFloat(value);
            
            trades.push({
                pair: symbol,
                result: result,
                status: result > 0 ? 'profit' : (result < 0 ? 'loss' : 'neutral'),
                leverage: leverage || '',
                comment: leverage ? `(${leverage}x)` : '',
                category: currentCategory
            });
        }
    });

    return trades;
}

// Экспорт данных
function exportData() {
    return {
        data: JSON.stringify(data),
        timestamp: new Date().toISOString()
    };
}

// Импорт данных
function importData(jsonData) {
    try {
        const importedData = JSON.parse(jsonData);
        data = importedData;
        saveData();
        return true;
    } catch (error) {
        console.error('Ошибка импорта данных:', error);
        return false;
    }
}

// Очистка данных за период
function clearPeriodData(year, month, category) {
    if (data[year]?.[month]?.[category]) {
        data[year][month][category].trades = [];
        saveData();
        return true;
    }
    return false;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateContent(); // Функция должна быть определена в main.js
});
