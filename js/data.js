// Локальное хранилище данных
const DataStore = {
    data: {},
    version: '1.0.0',
    lastUpdate: null,
    
    // Константы
    YEARS: ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
    MONTHS: [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    CATEGORIES: ['SPOT', 'FUTURES', 'DeFi']
};

// Класс для работы с данными
class DataManager {
    constructor() {
        this.store = DataStore;
        this.isLoading = false;
        this.initializeEventListeners();
    }

    // Загрузка данных
    async loadData() {
        if (this.isLoading) return false;
        this.isLoading = true;

        try {
            // Добавляем timestamp для предотвращения кэширования
            const timestamp = new Date().getTime();
            const response = await fetch(`${window.githubConfig.dataFile}?t=${timestamp}`);
            
            if (!response.ok) throw new Error('Failed to fetch data');
            
            const loadedData = await response.json();
            
            // Валидация данных
            if (!this.validateData(loadedData)) {
                throw new Error('Invalid data structure');
            }
            
            // Обновление хранилища
            this.store.data = loadedData;
            this.store.lastUpdate = timestamp;
            
            // Инициализация структуры
            this.initializeDataStructure();
            
            // Кэширование
            this.cacheData();
            
            return true;
        } catch (error) {
            console.error('Data loading error:', error);
            return this.loadFromCache();
        } finally {
            this.isLoading = false;
        }
    }

    // Сохранение данных
    async saveData() {
        if (!window.configUtils.isAuthorized()) {
            this.showError('Требуется авторизация');
            return false;
        }

        try {
            const token = window.configUtils.getToken();
            if (!token) throw new Error('No token available');

            // Получаем текущий SHA файла
            const fileUrl = `https://api.github.com/repos/${window.githubConfig.owner}/${window.githubConfig.repo}/contents/${window.githubConfig.dataFile}`;
            const fileResponse = await fetch(fileUrl, {
                headers: { 'Authorization': `token ${token}` }
            });
            
            if (!fileResponse.ok) throw new Error('Failed to get file info');
            const fileInfo = await fileResponse.json();

            // Подготовка данных
            const content = btoa(JSON.stringify(this.store.data, null, 2));
            
            // Сохранение
            const response = await fetch(fileUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
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

            // Обновление кэша
            this.cacheData();
            this.showSuccess('Данные сохранены');
            
            return true;
        } catch (error) {
            console.error('Save error:', error);
            this.showError('Ошибка сохранения');
            return false;
        }
    }

    // Валидация данных
    validateData(data) {
        if (typeof data !== 'object' || data === null) return false;
        
        for (const year of this.store.YEARS) {
            if (!data[year]) return false;
            
            for (const month of this.store.MONTHS) {
                if (!data[year][month]) return false;
                
                for (const category of this.store.CATEGORIES) {
                    if (!data[year][month][category] || 
                        !Array.isArray(data[year][month][category].trades)) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    // Инициализация структуры данных
    initializeDataStructure() {
        this.store.YEARS.forEach(year => {
            if (!this.store.data[year]) this.store.data[year] = {};
            
            this.store.MONTHS.forEach(month => {
                if (!this.store.data[year][month]) {
                    this.store.data[year][month] = {};
                    
                    this.store.CATEGORIES.forEach(category => {
                        if (!this.store.data[year][month][category]) {
                            this.store.data[year][month][category] = { trades: [] };
                        }
                    });
                }
            });
        });
    }

    // Кэширование данных
    cacheData() {
        try {
            localStorage.setItem('cryptoSharksData', JSON.stringify({
                data: this.store.data,
                version: this.store.version,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Cache error:', error);
        }
    }

    // Загрузка из кэша
    loadFromCache() {
        try {
            const cached = localStorage.getItem('cryptoSharksData');
            if (!cached) return false;

            const { data, version, timestamp } = JSON.parse(cached);
            
            // Проверяем версию и актуальность
            if (version !== this.store.version || 
                Date.now() - timestamp > 24 * 60 * 60 * 1000) {
                return false;
            }

            this.store.data = data;
            return true;
        } catch {
            return false;
        }
    }

    // Получение данных за период
    getPeriodData(year, month, category) {
        return this.store.data[year]?.[month]?.[category]?.trades || [];
    }

    // Добавление сделок
    async addTrades(year, month, category, trades) {
        if (!window.configUtils.isAuthorized()) {
            this.showError('Требуется авторизация');
            return false;
        }

        try {
            if (!this.store.data[year]) this.store.data[year] = {};
            if (!this.store.data[year][month]) this.store.data[year][month] = {};
            if (!this.store.data[year][month][category]) {
                this.store.data[year][month][category] = { trades: [] };
            }

            const tradesArray = Array.isArray(trades) ? trades : [trades];
            
            // Проверка лимитов
            if (!window.configUtils.checkLimits('maxBulkTrades', tradesArray.length)) {
                throw new Error('Превышен лимит на количество сделок');
            }

            // Добавление timestamp и ID
            tradesArray.forEach(trade => {
                trade.id = Date.now() + Math.random();
                trade.timestamp = new Date().toISOString();
            });

            this.store.data[year][month][category].trades.push(...tradesArray);
            
            const success = await this.saveData();
            if (success) {
                this.showSuccess(`Добавлено ${tradesArray.length} сделок`);
            }
            return success;
        } catch (error) {
            console.error('Error adding trades:', error);
            this.showError(error.message);
            return false;
        }
    }

    // Удаление сделки
    async deleteTrade(year, month, category, index) {
        if (!window.configUtils.isAuthorized()) {
            this.showError('Требуется авторизация');
            return false;
        }

        try {
            if (!this.store.data[year]?.[month]?.[category]?.trades) {
                return false;
            }

            const trades = this.store.data[year][month][category].trades;
            if (index >= 0 && index < trades.length) {
                trades.splice(index, 1);
                const success = await this.saveData();
                if (success) {
                    this.showSuccess('Сделка удалена');
                }
                return success;
            }
            return false;
        } catch (error) {
            console.error('Error deleting trade:', error);
            this.showError('Ошибка удаления');
            return false;
        }
    }

    // Уведомления
    showSuccess(message) {
        window.showNotification?.(message, 'success');
    }

    showError(message) {
        window.showNotification?.(message, 'error');
    }

    // Обработчики событий
    initializeEventListeners() {
        // Автоматическое обновление
        setInterval(() => {
            if (!document.hidden) {
                this.loadData();
            }
        }, window.githubConfig.refreshInterval);

        // Обновление при возвращении на вкладку
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadData();
            }
        });
    }
}

// Создаем экземпляр менеджера данных
window.dataManager = new DataManager();

// Экспортируем методы для обратной совместимости
window.loadData = () => window.dataManager.loadData();
window.saveData = () => window.dataManager.saveData();
window.getPeriodData = (y, m, c) => window.dataManager.getPeriodData(y, m, c);
window.addTradeData = (y, m, c, t) => window.dataManager.addTrades(y, m, c, t);
window.deleteTradeData = (y, m, c, i) => window.dataManager.deleteTrade(y, m, c, i);
