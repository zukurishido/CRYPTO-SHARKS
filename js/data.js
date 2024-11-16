// Структура данных
let data = {};

// Константы для структуры данных
const YEARS = ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
const MONTHS = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const CATEGORIES = ['SPOT', 'FUTURES', 'DeFi'];

// Улучшенная загрузка данных
async function loadData() {
    try {
        // Добавляем timestamp для предотвращения кэширования
        const timestamp = new Date().getTime();
        const response = await fetch(`${window.githubConfig.dataFile}?t=${timestamp}`);
        
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const loadedData = await response.json();
        
        // Проверка структуры данных
        if (!isValidDataStructure(loadedData)) {
            throw new Error('Invalid data structure');
        }
        
        data = loadedData;
        
        // Инициализация структуры данных
        YEARS.forEach(year => {
            if (!data[year]) data[year] = {};
            MONTHS.forEach(month => {
                if (!data[year][month]) {
                    data[year][month] = {};
                    CATEGORIES.forEach(category => {
                        if (!data[year][month][category]) {
                            data[year][month][category] = { trades: [] };
                        }
                    });
                }
            });
        });

        // Кэширование данных
        localStorage.setItem('cryptoSharksData', JSON.stringify(data));
        localStorage.setItem('cryptoSharksLastUpdate', timestamp.toString());
        
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Попытка загрузить из кэша
        const cachedData = localStorage.getItem('cryptoSharksData');
        if (cachedData) {
            try {
                data = JSON.parse(cachedData);
                return true;
            } catch (e) {
                console.error('Cache parsing error:', e);
            }
        }
        return false;
    }
}

// Улучшенное сохранение данных
async function saveData() {
    if (!window.isAuthenticated) {
        showNotification('Требуется авторизация', 'error');
        return false;
    }

    try {
        // Получаем текущий SHA файла
        const fileUrl = `https://api.github.com/repos/${window.githubConfig.owner}/${window.githubConfig.repo}/contents/${window.githubConfig.dataFile}`;
        const fileResponse = await fetch(fileUrl, {
            headers: {
                'Authorization': `token ${window.githubConfig.token}`
            }
        });
        
        if (!fileResponse.ok) throw new Error('Failed to get file info');
        
        const fileInfo = await fileResponse.json();

        // Подготовка данных
        const content = btoa(JSON.stringify(data, null, 2));
        
        // Сохранение на GitHub
        const response = await fetch(fileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${window.githubConfig.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update trading data',
                content: content,
                sha: fileInfo.sha,
                branch: window.githubConfig.branch
            })
        });

        if (!response.ok) throw new Error('Failed to save data');

        // Обновление локального кэша
        localStorage.setItem('cryptoSharksData', JSON.stringify(data));
        localStorage.setItem('cryptoSharksLastUpdate', new Date().getTime().toString());
        
        showNotification('Данные успешно сохранены', 'success');
        return true;
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Ошибка сохранения', 'error');
        return false;
    }
}

// Проверка структуры данных
function isValidDataStructure(data) {
    if (typeof data !== 'object' || data === null) return false;
    
    return true; // Базовая проверка, можно расширить при необходимости
}

// Парсер сделок с улучшенной валидацией
function parseTrades(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let currentCategory = '';
    let trades = [];
    
    lines.forEach(line => {
        // Очистка строки
        const cleanLine = line.trim().replace(/["""'']/g, '');

        // Определение категории
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

        // Паттерны для разбора строк
        const patterns = [
            /[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(?:\d+[\.)]\s*)[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s*[-\.]\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)([-+])(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s+(\d+\.?\d*)%/i
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
    if (!window.isAuthenticated) {
        showNotification('Требуется авторизация', 'error');
        return false;
    }

    try {
        if (!data[year]) data[year] = {};
        if (!data[year][month]) data[year][month] = {};
        if (!data[year][month][category]) data[year][month][category] = { trades: [] };

        if (Array.isArray(trades)) {
            data[year][month][category].trades.push(...trades);
        } else {
            data[year][month][category].trades.push(trades);
        }
        
        const success = await saveData();
        if (success) {
            showNotification('Сделки успешно добавлены', 'success');
        }
        return success;
    } catch (error) {
        console.error('Error adding trades:', error);
        showNotification('Ошибка добавления сделок', 'error');
        return false;
    }
}

// Получение данных за период
function getPeriodData(year, month, category) {
    return data[year]?.[month]?.[category]?.trades || [];
}

// Улучшенное удаление сделки
async function deleteTradeData(year, month, category, index) {
    if (!window.isAuthenticated) {
        showNotification('Требуется авторизация', 'error');
        return false;
    }

    try {
        if (!data[year] || !data[year][month] || !data[year][month][category]) {
            return false;
        }

        const trades = data[year][month][category].trades;
        if (index >= 0 && index < trades.length) {
            trades.splice(index, 1);
            const success = await saveData();
            if (success) {
                showNotification('Сделка удалена', 'success');
            }
            return success;
        }
        
        return false;
    } catch (error) {
        console.error('Error deleting trade:', error);
        showNotification('Ошибка удаления', 'error');
        return false;
    }
}

// Расчет статистики с дополнительными метриками
function calculateStats(trades) {
    try {
        let totalProfit = 0;
        let totalLoss = 0;
        let profitCount = 0;
        let lossCount = 0;
        let maxProfit = 0;
        let maxLoss = 0;
        let avgProfit = 0;
        let avgLoss = 0;
        
        trades.forEach(trade => {
            if (trade.result > 0) {
                totalProfit += trade.result;
                profitCount++;
                maxProfit = Math.max(maxProfit, trade.result);
            } else if (trade.result < 0) {
                totalLoss += Math.abs(trade.result);
                lossCount++;
                maxLoss = Math.max(maxLoss, Math.abs(trade.result));
            }
        });

        if (profitCount > 0) avgProfit = totalProfit / profitCount;
        if (lossCount > 0) avgLoss = totalLoss / lossCount;

        return {
            totalTrades: trades.length,
            profitTrades: profitCount,
            lossTrades: lossCount,
            totalProfit: totalProfit.toFixed(1),
            totalLoss: totalLoss.toFixed(1),
            winRate: trades.length > 0 ? ((profitCount / trades.length) * 100).toFixed(1) : 0,
            maxProfit: maxProfit.toFixed(1),
            maxLoss: maxLoss.toFixed(1),
            avgProfit: avgProfit.toFixed(1),
            avgLoss: avgLoss.toFixed(1)
        };
    } catch (error) {
        console.error('Error calculating stats:', error);
        return {
            totalTrades: 0,
            profitTrades: 0,
            lossTrades: 0,
            totalProfit: '0.0',
            totalLoss: '0.0',
            winRate: '0.0',
            maxProfit: '0.0',
            maxLoss: '0.0',
            avgProfit: '0.0',
            avgLoss: '0.0'
        };
    }
}

// Автоматическое обновление
setInterval(loadData, 30000);
