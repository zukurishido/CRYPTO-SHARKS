// Структура данных
let data = {};

// Загрузка данных
function loadData() {
    const savedData = localStorage.getItem('cryptoSharksData');
    if (savedData) {
        data = JSON.parse(savedData);
    }
}

// Сохранение данных
function saveData() {
    localStorage.setItem('cryptoSharksData', JSON.stringify(data));
}

// Парсинг любого формата данных
function parseTradesFlexible(text) {
    const cleanText = text.replace(/[^\w\s+\-#%().,]/g, '');
    const lines = cleanText.split('\n').filter(line => line.trim());
    const trades = [];
    
    lines.forEach(line => {
        // Паттерн 1: #SYMBOL +/-XX%
        const pattern1 = /#(\w+)\s*([-+])\s*(\d+\.?\d*)%/;
        
        // Паттерн 2: SYMBOL +/-XX%
        const pattern2 = /(\w+)\s*([-+])\s*(\d+\.?\d*)%/;
        
        // Паттерн для левериджа
        const leveragePattern = /\((\d+)x\)/i;
        
        let match = line.match(pattern1) || line.match(pattern2);
        
        if (match) {
            const [_, symbol, sign, value] = match;
            const leverageMatch = line.match(leveragePattern);
            const leverage = leverageMatch ? leverageMatch[1] : '';
            
            const result = (sign === '+' ? 1 : -1) * parseFloat(value);
            
            trades.push({
                id: Date.now() + Math.random(),
                pair: symbol.replace('#', '').trim(),
                result: result,
                leverage: leverage ? `${leverage}x` : '',
                status: result > 0 ? 'profit' : 'loss'
            });
        }
    });
    
    return trades;
}

// Добавление сделок
function addTradeData(year, month, category, trades) {
    if (!data[year]) data[year] = {};
    if (!data[year][month]) data[year][month] = {};
    if (!data[year][month][category]) data[year][month][category] = { trades: [] };

    if (Array.isArray(trades)) {
        data[year][month][category].trades.push(...trades);
    } else {
        data[year][month][category].trades.push(trades);
    }
    
    saveData();
}

// Обновление сделки
function updateTradeData(year, month, category, tradeId, updatedData) {
    if (data[year]?.[month]?.[category]) {
        const trades = data[year][month][category].trades;
        const index = trades.findIndex(t => t.id === tradeId);
        
        if (index !== -1) {
            trades[index] = { ...trades[index], ...updatedData };
            saveData();
            return true;
        }
    }
    return false;
}

// Удаление сделки
function deleteTradeData(year, month, category, tradeId) {
    if (data[year]?.[month]?.[category]) {
        const trades = data[year][month][category].trades;
        data[year][month][category].trades = trades.filter(t => t.id !== tradeId);
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
    
    trades.forEach(trade => {
        if (trade.result > 0) {
            totalProfit += trade.result;
            profitCount++;
        } else if (trade.result < 0) {
            totalLoss += Math.abs(trade.result);
            lossCount++;
        }
    });

    return {
        totalTrades: trades.length,
        profitTrades: profitCount,
        lossTrades: lossCount,
        totalProfit: totalProfit.toFixed(1),
        totalLoss: totalLoss.toFixed(1),
        winRate: trades.length > 0 ? ((profitCount / trades.length) * 100).toFixed(1) : 0
    };
}

// Инициализация
document.addEventListener('DOMContentLoaded', loadData);
