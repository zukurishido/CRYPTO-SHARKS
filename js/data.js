// Структура данных
let data = {};

// Константы для структуры данных
const YEARS = ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
const MONTHS = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const CATEGORIES = ['SPOT', 'FUTURES', 'DeFi'];

// Конфигурация синхронизации
const SYNC_CONFIG = {
    syncInterval: 30000,
    retryAttempts: 3,
    retryDelay: 3000
};

// Состояние синхронизации
const syncState = {
    lastSync: null,
    isSyncing: false,
    lastError: null,
    version: null,
    retryCount: 0
};

// Загрузка данных с JSONBin
async function loadData() {
    try {
        if (syncState.isSyncing) return;
        syncState.isSyncing = true;
        showSyncStatus('Синхронизация...');

        // Попытка загрузить с JSONBin
        const response = await fetch(`https://api.jsonbin.io/v3/b/${SYNC_CONFIG.binId}/latest`, {
            headers: {
                'X-Master-Key': SYNC_CONFIG.key,
                'X-Bin-Meta': 'false'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const remoteData = await response.json();

        // Инициализация структуры данных
        YEARS.forEach(year => {
            if (!remoteData[year]) remoteData[year] = {};
            MONTHS.forEach(month => {
                if (!remoteData[year][month]) {
                    remoteData[year][month] = {};
                    CATEGORIES.forEach(category => {
                        if (!remoteData[year][month][category]) {
                            remoteData[year][month][category] = { trades: [] };
                        }
                    });
                }
            });
        });

        data = remoteData;
        localStorage.setItem('cryptoSharksData', JSON.stringify(data));
        syncState.lastSync = Date.now();
        syncState.lastError = null;
        showSyncStatus('Данные обновлены', 'success');
        updateContent();
        return true;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        syncState.lastError = error.message;
        showSyncStatus(`Ошибка синхронизации: ${error.message}`, 'error');
        
        // Загрузка локальных данных при ошибке
        const savedData = localStorage.getItem('cryptoSharksData');
        if (savedData) {
            data = JSON.parse(savedData);
        }
        return false;
    } finally {
        syncState.isSyncing = false;
    }
}

// Сохранение данных в JSONBin
async function saveData() {
    try {
        if (syncState.isSyncing) return false;
        syncState.isSyncing = true;
        showSyncStatus('Сохранение...');

        const response = await fetch(`https://api.jsonbin.io/v3/b/${SYNC_CONFIG.binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': SYNC_CONFIG.key,
                'X-Bin-Versioning': 'false'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        localStorage.setItem('cryptoSharksData', JSON.stringify(data));
        syncState.lastSync = Date.now();
        showSyncStatus('Сохранено', 'success');
        return true;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        syncState.lastError = error.message;
        showSyncStatus(`Ошибка сохранения: ${error.message}`, 'error');
        return false;
    } finally {
        syncState.isSyncing = false;
    }
}

// Показ статуса синхронизации
function showSyncStatus(message, type = 'info') {
    const statusContainer = document.getElementById('syncStatus') || createSyncStatusElement();
    statusContainer.className = `sync-status ${type}`;
    statusContainer.innerHTML = `
        <span class="sync-message">${message}</span>
        ${type === 'error' ? '<button onclick="retrySync()" class="retry-btn">Повторить</button>' : ''}
    `;

    if (type !== 'error') {
        setTimeout(() => {
            statusContainer.classList.add('fade-out');
        }, 3000);
    }
}

// Создание элемента статуса синхронизации
function createSyncStatusElement() {
    const container = document.createElement('div');
    container.id = 'syncStatus';
    document.body.appendChild(container);
    return container;
}

// Повторная синхронизация
async function retrySync() {
    syncState.retryCount = 0;
    await loadData();
}

// Парсер сделок
function parseTrades(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let currentCategory = '';
    let trades = [];
    
    lines.forEach(line => {
        const cleanLine = line.trim().replace(/["""'']/g, '');

        if (cleanLine.match(/DEFI|ДЕФИ|DEFI:|ДЕФИ:|DEFI🚀|DEF|DEPOSIT|ДЕФИ СПОТЫ?/i)) {
            currentCategory = 'DeFi';
            return;
        } else if (cleanLine.match(/FUTURES|ФЬЮЧЕРС|FUTURES:|ФЬЮЧЕРС:|FUTURES🚀|FUT|PERPETUAL|ФЬЮЧЕРСЫ?/i)) {
            currentCategory = 'FUTURES';
            return;
        } else if (cleanLine.match(/SPOT|СПОТ|SPOT:|СПОТ:|SPOT🚀|DEPOSIT|SPOT TRADING|СПОТ ТОРГОВЛЯ/i)) {
            currentCategory = 'SPOT';
            return;
        }

        const patterns = [
            /[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(?:\d+[\.)]\s*)[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s*[-\.]\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)([-+])(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s+(\d+\.?\d*)%/i,
            /[#]?(\w+)\s*([+-])?(\d+\.?\d*)%\s*(?:\((\d+)[xх]\)?)?/i
        ];

        for (const pattern of patterns) {
            const match = cleanLine.match(pattern);
            if (match && currentCategory) {
                const [_, symbol, sign, value, leverage] = match;
                let result = parseFloat(value);
                
                if (sign === '-' || cleanLine.includes('-')) {
                    result = -result;
                }
                
                const cleanSymbol = symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                
                trades.push({
                    id: Date.now() + Math.random(),
                    pair: cleanSymbol,
                    result: result,
                    leverage: leverage || '',
                    status: result > 0 ? 'profit' : 'loss',
                    category: currentCategory,
                    timestamp: new Date().toISOString()
                });
                break;
            }
        }
    });

    return trades;
}

// Добавление сделок
async function addTradeData(year, month, category, trades) {
    try {
        if (!data[year]) data[year] = {};
        if (!data[year][month]) data[year][month] = {};
        if (!data[year][month][category]) data[year][month][category] = { trades: [] };

        if (Array.isArray(trades)) {
            data[year][month][category].trades.push(...trades);
        } else {
            data[year][month][category].trades.push(trades);
        }
        
        await saveData();
        return true;
    } catch (error) {
        console.error('Ошибка добавления:', error);
        showSyncStatus('Ошибка при добавлении сделок', 'error');
        return false;
    }
}

// Получение данных за период
function getPeriodData(year, month, category) {
    return data[year]?.[month]?.[category]?.trades || [];
}

// Удаление сделки
async function deleteTradeData(year, month, category, index) {
    try {
        if (!data[year] || !data[year][month] || !data[year][month][category]) {
            return false;
        }

        const trades = data[year][month][category].trades;
        
        if (index >= 0 && index < trades.length) {
            trades.splice(index, 1);
            await saveData();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Ошибка удаления данных:', error);
        showSyncStatus('Ошибка при удалении', 'error');
        return false;
    }
}

// Расчет статистики
function calculateStats(trades) {
    try {
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
    } catch (error) {
        console.error('Ошибка расчета статистики:', error);
        return {
            totalTrades: 0,
            profitTrades: 0,
            lossTrades: 0,
            totalProfit: '0.0',
            totalLoss: '0.0',
            winRate: '0.0'
        };
    }
}

// Автоматическая синхронизация
function startAutoSync() {
    // Начальная загрузка
    loadData();
    
    // Периодическая синхронизация
    setInterval(loadData, SYNC_CONFIG.syncInterval);
    
    // Синхронизация при возвращении вкладки
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            loadData();
        }
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    startAutoSync();
});
