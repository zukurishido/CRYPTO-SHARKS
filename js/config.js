// Базовая конфигурация приложения
const APP_CONFIG = {
    name: 'CRYPTO SHARKS',
    version: '1.0.0',
    debug: false,
};

// Конфигурация GitHub
window.githubConfig = {
    // Основные настройки репозитория
    owner: 'zukurishido',
    repo: 'CRYPTO-SHARKS',
    branch: 'main',
    dataFile: 'trades.json',

    // Настройки безопасности
    adminHash: 'YWRtaW4xMjM=', // Зашифрованный пароль admin123
    encryptedToken: 'Z2hwXzJJQ0swa2x0Wm1ROGYyQXpBQm9GaFBwMExWVTFhclZ6ZA==', // Зашифрованный токен
    tokenKey: 'crypto_sharks_token',
    sessionKey: 'crypto_sharks_session',
    
    // Временные интервалы (в миллисекундах)
    refreshInterval: 30000, // 30 секунд
    sessionDuration: 24 * 60 * 60 * 1000, // 24 часа
    
    // API endpoints
    api: {
        base: 'https://api.github.com',
        gist: function() {
            return `${this.base}/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`;
        }
    },
    
    // Максимальные значения
    limits: {
        maxLoginAttempts: 5,
        lockoutDuration: 30 * 60 * 1000, // 30 минут
        maxBulkTrades: 50,
        maxTradesPerDay: 100
    }
};

// Защита конфигурации от изменений
Object.freeze(window.githubConfig);
Object.freeze(window.githubConfig.api);
Object.freeze(window.githubConfig.limits);

// Вспомогательные функции для работы с конфигурацией
const ConfigUtils = {
    // Проверка авторизации
    isAuthorized: () => {
        const session = localStorage.getItem(window.githubConfig.sessionKey);
        if (!session) return false;
        
        try {
            const { expiry } = JSON.parse(session);
            return expiry > Date.now();
        } catch {
            return false;
        }
    },

    // Сохранение сессии
    saveSession: (token) => {
        const session = {
            token: btoa(token),
            expiry: Date.now() + window.githubConfig.sessionDuration
        };
        localStorage.setItem(window.githubConfig.sessionKey, JSON.stringify(session));
    },

    // Очистка сессии
    clearSession: () => {
        localStorage.removeItem(window.githubConfig.sessionKey);
        localStorage.removeItem(window.githubConfig.tokenKey);
    },

    // Получение токена
    getToken: () => {
        const session = localStorage.getItem(window.githubConfig.sessionKey);
        if (!session) return null;
        
        try {
            const { token } = JSON.parse(session);
            return atob(token);
        } catch {
            return null;
        }
    },

    // Проверка лимитов
    checkLimits: (type, value) => {
        return value <= window.githubConfig.limits[type];
    },

    // Формирование URL для API
    getApiUrl: (endpoint) => {
        return `${window.githubConfig.api.base}${endpoint}`;
    }
};

// Экспорт утилит для использования в других файлах
window.configUtils = Object.freeze(ConfigUtils);

// Настройка обработки ошибок
window.onerror = function(msg, url, line, col, error) {
    if (APP_CONFIG.debug) {
        console.error('Error:', {
            message: msg,
            url: url,
            line: line,
            column: col,
            error: error
        });
    }
    return false;
};
