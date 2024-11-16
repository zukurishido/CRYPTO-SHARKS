// Конфигурация GitHub
window.githubConfig = {
    owner: 'zukurishido',
    repo: 'CRYPTO-SHARKS',
    branch: 'main',
    adminHash: 'YWRtaW4xMjM=', // Зашифрованный пароль admin123
    // Токен будет добавлен через localStorage при успешной авторизации
    dataFile: 'trades.json'
};

// Защита от изменения конфигурации
Object.freeze(window.githubConfig);
