// Конфигурация сайта
window.githubConfig = {
    owner: 'zukurishido',
    repo: 'CRYPTO-SHARKS',
    branch: 'main',
    adminHash: btoa('ВАШ_ПАРОЛЬ_АДМИНА'), // Замените на ваш пароль
    token: 'ВАШ_GITHUB_TOKEN', // Замените на ваш токен
    dataFile: 'trades.json'
};

// Защита от изменения конфигурации
Object.freeze(window.githubConfig);
