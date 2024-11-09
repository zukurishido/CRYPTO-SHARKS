// Начальные данные
const initialData = {
    '2024': {
        '10': {
            'FUTURES': {
                trades: [
                    { pair: 'BLZ', result: 48.26, status: 'profit', comment: '' },
                    { pair: 'TIA', result: -20, status: 'loss', comment: '' },
                    { pair: 'ATOM', result: 0, status: 'neutral', comment: '' }
                ]
            },
            'SPOT': {
                trades: [
                    { pair: 'ETH', result: 6, status: 'profit', comment: '' },
                    { pair: 'MEW', result: 120, status: 'profit', comment: '' },
                    { pair: 'FLOKI', result: 20, status: 'profit', comment: '' },
                    { pair: 'SOL', result: 10, status: 'profit', comment: '' },
                    { pair: 'ZRO', result: 10, status: 'profit', comment: '' },
                    { pair: 'APT', result: 15, status: 'profit', comment: '' },
                    { pair: 'INJ', result: 20, status: 'profit', comment: '' },
                    { pair: 'BONK', result: 8, status: 'profit', comment: '' },
                    { pair: 'TURBO', result: 80, status: 'profit', comment: '' },
                    { pair: '1MBABYDOGE', result: 40, status: 'profit', comment: '' },
                    { pair: 'TIA', result: 10, status: 'profit', comment: '' },
                    { pair: 'PEPE', result: 15, status: 'profit', comment: '' },
                    { pair: 'DOGE', result: 24, status: 'profit', comment: '' },
                    { pair: 'WIF', result: 5, status: 'profit', comment: '' },
                    { pair: 'NEIROCTO', result: 15, status: 'profit', comment: '' },
                    { pair: 'MAVIA', result: 0, status: 'neutral', comment: 'В позиции' },
                    { pair: 'SUI', result: 0, status: 'neutral', comment: 'В позиции' }
                ]
            },
            'DeFi': {
                trades: [
                    { pair: 'EGGY', result: 51, status: 'neutral', comment: '' },
                    { pair: 'PINKE', result: 800, status: 'neutral', comment: '' },
                    { pair: 'OR', result: 25, status: 'neutral', comment: '' },
                    { pair: 'BGG', result: 150, status: 'neutral', comment: '' },
                    { pair: 'PHOENIX', result: 20, status: 'neutral', comment: '' },
                    { pair: 'MANTIS', result: 56, status: 'neutral', comment: '' },
                    { pair: 'DBTT', result: 150, status: 'neutral', comment: '' },
                    { pair: 'BELUGA', result: 100, status: 'neutral', comment: '' },
                    { pair: 'NIKICOIN', result: 100, status: 'neutral', comment: '' },
                    { pair: 'KLAUS', result: 72, status: 'neutral', comment: '' },
                    { pair: 'ENERGY', result: 50, status: 'neutral', comment: '' },
                    { pair: 'FLIP', result: 50, status: 'neutral', comment: '' },
                    { pair: 'MAVA', result: -40, status: 'neutral', comment: '' },
                    { pair: 'MORUD', result: 70, status: 'neutral', comment: '' },
                    { pair: 'VIKITA', result: 54, status: 'neutral', comment: '' },
                    { pair: 'REALCHAD', result: 800, status: 'neutral', comment: '' },
                    { pair: 'DOBBY', result: 40, status: 'neutral', comment: '' },
                    { pair: 'PUMPKING', result: 120, status: 'neutral', comment: '' },
                    { pair: 'TNUT', result: 66, status: 'neutral', comment: '' }
                ]
            }
        }
    }
};

// Загрузка данных из localStorage или использование начальных данных
let data = JSON.parse(localStorage.getItem('cryptoSharksData')) || initialData;

// Функция сохранения данных
function saveDataToStorage() {
    localStorage.setItem('cryptoSharksData', JSON.stringify(data));
}

// Функция получения данных для конкретного периода
function getPeriodData(year, month, category) {
    return data[year]?.[month]?.[category]?.trades || [];
}

// Функция добавления новой сделки
function addTradeData(year, month, category, tradeData) {
    if (!data[year]) data[year] = {};
    if (!data[year][month]) data[year][month] = {};
    if (!data[year][month][category]) data[year][month][category] = { trades: [] };
    
    data[year][month][category].trades.push(tradeData);
    saveDataToStorage();
}

// Функция расчета статистики
function calculateStats(trades) {
    return {
        totalTrades: trades.length,
        profitTrades: trades.filter(t => t.result > 0).length,
        lossTrades: trades.filter(t => t.result < 0).length,
        neutralTrades: trades.filter(t => t.result === 0).length,
        totalProfit: trades.reduce((acc, t) => acc + (t.result || 0), 0),
        winRate: trades.length ? 
            (trades.filter(t => t.result > 0).length / trades.length * 100).toFixed(1) : 0
    };
}
