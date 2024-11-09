// Конфигурация админа
let isAuthenticated = false;
let isAdminPanelVisible = false;

// Обновление информации в админ-панели
function updateAdminPanelInfo() { function toggleAdmin() {
    if (!isAuthenticated) {
        const password = prompt('Введите пароль администратора:');
        if (password !== CONFIG.ADMIN_PASSWORD) {  // Теперь берём пароль из CONFIG
            alert('Неверный пароль!');
            return;
        }
        isAuthenticated = true;
    }
    // ... остальной код
}
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const monthNames = {
        '1': 'Январь', '2': 'Февраль', '3': 'Март', '4': 'Апрель',
        '5': 'Май', '6': 'Июнь', '7': 'Июль', '8': 'Август',
        '9': 'Сентябрь', '10': 'Октябрь', '11': 'Ноябрь', '12': 'Декабрь'
    };

    document.getElementById('currentSettings').innerHTML = `
        <div class="current-setting">
            <span class="setting-label">Год:</span>
            <span class="setting-value">${year}</span>
        </div>
        <div class="current-setting">
            <span class="setting-label">Месяц:</span>
            <span class="setting-value">${monthNames[month]}</span>
        </div>
        <div class="current-setting">
            <span class="setting-label">Категория:</span>
            <span class="setting-value">${category}</span>
        </div>
    `;
}

// Переключение видимости админ-панели
function toggleAdmin() {
    if (!isAuthenticated) {
        const password = prompt('Введите пароль администратора:');
        if (password !== ADMIN_PASSWORD) {
            alert('Неверный пароль!');
            return;
        }
        isAuthenticated = true;
    }

    const panel = document.getElementById('adminPanel');
    isAdminPanelVisible = !isAdminPanelVisible;
    
    if (isAdminPanelVisible) {
        panel.classList.add('visible');
        updateAdminPanelInfo();
        showBulkInput(); // Показываем форму массового ввода по умолчанию
        gsap.to(panel, {
            right: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
    } else {
        gsap.to(panel, {
            right: -400,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => panel.classList.remove('visible')
        });
    }
}

// Функция парсинга сделок
function parseBulkTrades() {
    const bulkText = document.getElementById('bulkInput').value;
    const lines = bulkText.split('\n').filter(line => line.trim() !== '');
    
    let currentCategory = '';
    let trades = [];
    let stats = {
        DEFI: { profit: 0, loss: 0, count: 0 },
        FUTURES: { profit: 0, loss: 0, count: 0 },
        SPOT: { profit: 0, loss: 0, count: 0 }
    };

    lines.forEach(line => {
        // Определяем категорию
        if (line.includes('DEFI:')) {
            currentCategory = 'DEFI';
            return;
        } else if (line.includes('FUTURES:')) {
            currentCategory = 'FUTURES';
            return;
        } else if (line.includes('SPOT:')) {
            currentCategory = 'SPOT';
            return;
        }

        // Парсим сделку
        const tradeMatch = line.match(/\d+\.#(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/);
        
        if (tradeMatch && currentCategory) {
            const [_, symbol, sign, value, leverage] = tradeMatch;
            const result = (sign === '+' ? 1 : -1) * parseFloat(value);
            
            const trade = {
                pair: symbol,
                result: result,
                status: result > 0 ? 'profit' : (result < 0 ? 'loss' : 'neutral'),
                leverage: leverage || '',
                comment: leverage ? `(${leverage}x)` : '',
                category: currentCategory
            };

            trades.push(trade);

            // Обновляем статистику
            if (result > 0) {
                stats[currentCategory].profit += result;
            } else {
                stats[currentCategory].loss += Math.abs(result);
            }
            stats[currentCategory].count++;
        }
    });

    // Формируем текст подтверждения
    let confirmText = 'Найдены сделки:\n\n';
    
    for (let category in stats) {
        if (stats[category].count > 0) {
            confirmText += `${category}:\n`;
            confirmText += `Количество: ${stats[category].count}\n`;
            confirmText += `Общий профит: +${stats[category].profit.toFixed(1)}%\n`;
            confirmText += `Общий убыток: -${stats[category].loss.toFixed(1)}%\n\n`;
        }
    }

    confirmText += 'Добавить эти сделки?';

    // Подтверждение
    if (confirm(confirmText)) {
        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;

        trades.forEach(trade => {
            addTradeData(year, month, trade.category, {
                pair: trade.pair,
                result: trade.result,
                status: trade.status,
                comment: trade.comment
            });
        });

        updateContent();
        document.getElementById('bulkInput').value = '';
        showSuccessMessage(`Добавлено ${trades.length} сделок`);
    }
}

// Обновляем HTML форму для массового ввода
function showBulkInput() {
    document.querySelector('.admin-form').innerHTML = `
        <div class="input-group">
            <label>Массовое добавление сделок</label>
            <textarea id="bulkInput" rows="15" placeholder="DEFI:🚀
1.#FIT +20%
2.#AMT +22%

FUTURES:🚀
1.#BNB +35% (5х)
2.#CELO +76% (20х)

SPOT:🚀
1.#TWT +35%
2.#NEAR -15%"></textarea>
        </div>
        <div class="button-group">
            <button onclick="parseBulkTrades()" class="add-btn">Добавить все сделки</button>
            <button onclick="showRegularForm()" class="secondary-btn">Обычная форма</button>
        </div>
    `;
}

// Показ обычной формы
function showRegularForm() {
    document.querySelector('.admin-form').innerHTML = `
        <div class="input-group">
            <label>Пара</label>
            <input type="text" id="pairInput" placeholder="Например: BTC/USDT">
        </div>
        <div class="input-group">
            <label>Результат (%)</label>
            <input type="number" id="resultInput" step="0.01">
        </div>
        <div class="input-group">
            <label>Статус</label>
            <select id="statusInput">
                <option value="profit">Прибыль</option>
                <option value="loss">Убыток</option>
                <option value="neutral">Нейтральный</option>
            </select>
        </div>
        <div class="input-group">
            <label>Комментарий</label>
            <textarea id="commentInput" rows="3"></textarea>
        </div>
        <div class="button-group">
            <button onclick="addTrade()" class="add-btn">Добавить сделку</button>
            <button onclick="showBulkInput()" class="secondary-btn">Массовое добавление</button>
        </div>
    `;
}

// Выход из админ-панели
function logoutAdmin() {
    isAuthenticated = false;
    isAdminPanelVisible = false;
    const panel = document.getElementById('adminPanel');
    gsap.to(panel, {
        right: -400,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => panel.classList.remove('visible')
    });
}

// Показ сообщения об успешном добавлении
function showSuccessMessage(message) {
    const msgElem = document.createElement('div');
    msgElem.className = 'success-message fade-in';
    msgElem.textContent = message;
    
    document.querySelector('.admin-form').appendChild(msgElem);
    
    setTimeout(() => {
        gsap.to(msgElem, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            onComplete: () => msgElem.remove()
        });
    }, 2000);
}

// Добавляем слушатели для обновления информации
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('yearSelect').addEventListener('change', updateAdminPanelInfo);
    document.getElementById('monthSelect').addEventListener('change', updateAdminPanelInfo);
    document.getElementById('categorySelect').addEventListener('change', updateAdminPanelInfo);
    isAuthenticated = false;
    isAdminPanelVisible = false;
});
