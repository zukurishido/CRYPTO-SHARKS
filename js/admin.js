// Управление состоянием админ-панели
let isAuthenticated = false;
let isAdminPanelVisible = false;

// Функции для работы с паролем в localStorage
function setAdminPassword(password) {
    const hashedPassword = btoa(password); // Простое кодирование
    localStorage.setItem('adminHash', hashedPassword);
}

function checkAdminPassword(password) {
    const hashedPassword = localStorage.getItem('adminHash');
    return hashedPassword === btoa(password);
}

// Инициализация пароля при первом запуске
function initializeAdminPassword() {
    if (!localStorage.getItem('adminHash')) {
        setAdminPassword('Cr5pt0Sh@rks2024#AdminP@nel');
    }
}

// Показ формы массового добавления
function showBulkInput() {
    document.querySelector('.admin-form').innerHTML = `
        <div class="input-group fade-in">
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
            <button onclick="parseBulkTrades()" class="add-btn">
                <i class="lucide lucide-plus-circle"></i>
                Добавить все сделки
            </button>
        </div>
    `;

    // Анимируем появление
    gsap.from('.input-group', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out'
    });
}

// Функция массового добавления сделок
function parseBulkTrades() {
    const bulkText = document.getElementById('bulkInput').value;
    const trades = parseTrades(bulkText); // Функция из data.js

    if (trades.length === 0) {
        showNotification('Не найдено сделок для добавления', 'error');
        return;
    }

    // Группируем сделки по категориям для статистики
    const stats = trades.reduce((acc, trade) => {
        const cat = trade.category;
        if (!acc[cat]) {
            acc[cat] = { count: 0, profit: 0, loss: 0 };
        }
        acc[cat].count++;
        if (trade.result > 0) acc[cat].profit += trade.result;
        if (trade.result < 0) acc[cat].loss += Math.abs(trade.result);
        return acc;
    }, {});

    // Формируем текст подтверждения
    let confirmText = 'Найдены сделки:\n\n';
    Object.entries(stats).forEach(([category, stat]) => {
        confirmText += `${category}:\n`;
        confirmText += `Количество: ${stat.count}\n`;
        if (stat.profit > 0) confirmText += `Прибыль: +${stat.profit.toFixed(1)}%\n`;
        if (stat.loss > 0) confirmText += `Убыток: -${stat.loss.toFixed(1)}%\n`;
        confirmText += '\n';
    });

    if (confirm(confirmText)) {
        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;

        // Добавляем сделки с анимацией
        trades.forEach((trade, index) => {
            setTimeout(() => {
                addTradeData(year, month, trade.category, trade);
                if (index === trades.length - 1) {
                    updateContent();
                    showNotification(`Добавлено ${trades.length} сделок`, 'success');
                }
            }, index * 100);
        });
    }
}

// Показ обычной формы добавления
function showRegularForm() {
    document.querySelector('.admin-form').innerHTML = `
        <div class="form-content fade-in">
            <div class="input-group">
                <label>Пара</label>
                <input type="text" id="pairInput" placeholder="Например: BTC">
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
                    <option value="neutral">В работе</option>
                </select>
            </div>
            <div class="input-group">
                <label>Кратность (для FUTURES)</label>
                <input type="text" id="leverageInput" placeholder="Например: 20x">
            </div>
            <div class="input-group">
                <label>Комментарий</label>
                <textarea id="commentInput" rows="2"></textarea>
            </div>
            <div class="button-group">
                <button onclick="addSingleTrade()" class="add-btn">Добавить сделку</button>
                <button onclick="showBulkInput()" class="secondary-btn">Массовое добавление</button>
            </div>
        </div>
    `;
}

// Добавление одиночной сделки
function addSingleTrade() {
    const trade = {
        pair: document.getElementById('pairInput').value,
        result: Number(document.getElementById('resultInput').value),
        status: document.getElementById('statusInput').value,
        leverage: document.getElementById('leverageInput').value,
        comment: document.getElementById('commentInput').value
    };

    if (!trade.pair || isNaN(trade.result)) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    addTradeData(year, month, category, trade);
    updateContent();
    showNotification('Сделка добавлена', 'success');
    clearForm();
}

// Показ списка сделок для редактирования
function showTradesList() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const categories = ['SPOT', 'FUTURES', 'DeFi'];
    
    let html = '<div class="trades-list">';
    
    categories.forEach(category => {
        const trades = getPeriodData(year, month, category);
        if (trades.length > 0) {
            html += `
                <div class="category-section fade-in">
                    <h3>${category}</h3>
                    <div class="trades-grid">
            `;
            
            trades.forEach((trade, index) => {
                html += `
                    <div class="trade-item ${trade.status}">
                        <div class="trade-content">
                            <div class="trade-pair">${trade.pair}</div>
                            <div class="trade-result">
                                ${trade.result > 0 ? '+' : ''}${trade.result}% 
                                ${trade.leverage ? `(${trade.leverage})` : ''}
                            </div>
                        </div>
                        <div class="trade-actions">
                            <button onclick="editTrade('${year}', '${month}', '${category}', ${index})" 
                                    class="edit-btn" title="Редактировать">
                                <i class="lucide lucide-edit"></i>
                            </button>
                            <button onclick="deleteTrade('${year}', '${month}', '${category}', ${index})" 
                                    class="delete-btn" title="Удалить">
                                <i class="lucide lucide-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    
    document.querySelector('.admin-form').innerHTML = html;

    // Анимируем появление списка
    gsap.from('.category-section', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
    });
}

// Редактирование сделки
function editTrade(year, month, category, index) {
    const trades = getPeriodData(year, month, category);
    const trade = trades[index];
    
    document.querySelector('.admin-form').innerHTML = `
        <div class="edit-form fade-in">
            <h3>Редактирование сделки</h3>
            <div class="input-group">
                <label>Пара</label>
                <input type="text" id="editPair" value="${trade.pair}">
            </div>
            <div class="input-group">
                <label>Результат (%)</label>
                <input type="number" id="editResult" value="${trade.result}" step="0.01">
            </div>
            <div class="input-group">
                <label>Статус</label>
                <select id="editStatus">
                    <option value="profit" ${trade.status === 'profit' ? 'selected' : ''}>Прибыль</option>
                    <option value="loss" ${trade.status === 'loss' ? 'selected' : ''}>Убыток</option>
                    <option value="neutral" ${trade.status === 'neutral' ? 'selected' : ''}>В работе</option>
                </select>
            </div>
            <div class="input-group">
                <label>Кратность</label>
                <input type="text" id="editLeverage" value="${trade.leverage || ''}">
            </div>
            <div class="input-group">
                <label>Комментарий</label>
                <textarea id="editComment">${trade.comment || ''}</textarea>
            </div>
            <div class="button-group">
                <button onclick="saveTrade('${year}', '${month}', '${category}', ${index})" class="save-btn">
                    <i class="lucide lucide-save"></i> Сохранить
                </button>
                <button onclick="showTradesList()" class="cancel-btn">
                    <i class="lucide lucide-x"></i> Отмена
                </button>
            </div>
        </div>
    `;
}

// Сохранение отредактированной сделки
function saveTrade(year, month, category, index) {
    const updatedTrade = {
        pair: document.getElementById('editPair').value,
        result: parseFloat(document.getElementById('editResult').value),
        status: document.getElementById('editStatus').value,
        leverage: document.getElementById('editLeverage').value,
        comment: document.getElementById('editComment').value
    };

    if (updateTradeData(year, month, category, index, updatedTrade)) {
        showNotification('Сделка обновлена', 'success');
        showTradesList();
        updateContent();
    } else {
        showNotification('Ошибка при обновлении', 'error');
    }
}

// Удаление сделки
function deleteTrade(year, month, category, index) {
    if (confirm('Удалить эту сделку?')) {
        if (deleteTradeData(year, month, category, index)) {
            showNotification('Сделка удалена', 'success');
            showTradesList();
            updateContent();
        } else {
            showNotification('Ошибка при удалении', 'error');
        }
    }
}

// Уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.innerHTML = `
        <i class="lucide lucide-${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);

    gsap.to(notification, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        delay: 2,
        onComplete: () => notification.remove()
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPassword();
});
