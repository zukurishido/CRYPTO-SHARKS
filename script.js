class CryptoAdmin {
    constructor() {
        this.init();
        this.bindEvents();
    }

    init() {
        // Загрузка сохраненных данных
        this.loadData();
        
        // Инициализация UI
        const adminToggle = document.querySelector('.admin-toggle');
        adminToggle.addEventListener('click', () => {
            document.querySelector('.admin-panel').classList.toggle('hidden');
        });

        document.querySelector('.close-button').addEventListener('click', () => {
            document.querySelector('.admin-panel').classList.add('hidden');
        });
    }

    bindEvents() {
        // Обработка быстрого ввода
        document.querySelector('.save-all').addEventListener('click', () => {
            const input = document.querySelector('.crystal-input').value;
            this.processBulkInput(input);
        });

        // Очистка ввода
        document.querySelector('.clear').addEventListener('click', () => {
            document.querySelector('.crystal-input').value = '';
        });

        // Обработка шаблонов
        document.querySelectorAll('.template-buttons button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.target.textContent;
                const textarea = document.querySelector('.crystal-input');
                textarea.value += template + '\n';
            });
        });

        // Обновление отображения при изменении периода
        document.getElementById('yearSelect').addEventListener('change', this.updateDisplay.bind(this));
        document.getElementById('monthSelect').addEventListener('change', this.updateDisplay.bind(this));
    }

    processBulkInput(input) {
        const trades = input.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [symbol, percentage, status] = line.trim().split(' ');
                return {
                    symbol: symbol.replace('#', ''),
                    percentage: parseFloat(percentage),
                    status: status || 'neutral'
                };
            });

        if (trades.length > 0) {
            this.saveTrades(trades);
            document.querySelector('.crystal-input').value = '';
            this.showNotification('Сделки успешно добавлены');
        }
    }

    saveTrades(trades) {
        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;
        const category = document.querySelector('.trading-column.active').dataset.type;
        const key = `${year}-${month}-${category}`;

        let data = this.loadData();
        if (!data[key]) {
            data[key] = [];
        }
        data[key].push(...trades);
        
        localStorage.setItem('cryptoSharksData', JSON.stringify(data));
        this.updateDisplay();
    }

    loadData() {
        return JSON.parse(localStorage.getItem('cryptoSharksData') || '{}');
    }

    updateDisplay() {
        // Обновляем дату
        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;
        document.getElementById('dateBadge').textContent = 
            `01.${month.padStart(2, '0')}.${year}-01.${(parseInt(month) + 1).toString().padStart(2, '0')}.${year}`;

        // Обновляем данные в колонках
        const category = document.querySelector('.trading-column.active').dataset.type;
        const key = `${year}-${month}-${category}`;
        const data = this.loadData()[key] || [];
        
        updateTradesDisplay(category, data);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'crystal-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Инициализация админ-панели
document.addEventListener('DOMContentLoaded', () => {
    new CryptoAdmin();
});
