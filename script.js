// Анимация акулы
const initSharkAnimation = () => {
    // Анимация появления
    gsap.set('.shark-outline, .shark-fin', {
        strokeDasharray: 300,
        strokeDashoffset: 300,
        opacity: 0
    });

    const tl = gsap.timeline();

    tl.to('.shark-outline, .shark-fin', {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 2,
        ease: "power2.out",
        stagger: 0.2
    })
    .from('.shark-eye', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
    }, "-=1");

    // Плавное движение
    gsap.to('.shark-icon', {
        x: 10,
        rotation: 5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    });

    // Моргание
    gsap.to('.shark-eye', {
        scaleY: 0.1,
        duration: 0.1,
        repeat: -1,
        repeatDelay: 3,
        yoyo: true
    });
};

// Создание плавающих монет
const createFloatingCoins = () => {
    const coinsContainer = document.querySelector('.floating-coins');
    
    for (let i = 0; i < 15; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin';
        coinsContainer.appendChild(coin);

        gsap.set(coin, {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0.5 + Math.random() * 0.5,
            opacity: 0.2 + Math.random() * 0.3
        });

        gsap.to(coin, {
            y: '-=200',
            x: '+=50',
            rotation: 360,
            duration: 3 + Math.random() * 4,
            repeat: -1,
            ease: "none",
            delay: Math.random() * 2
        });
    }
};

// Загрузка данных
const loadTradesData = () => {
    const futuresData = {
        trades: [
            { coin: 'BLZ', leverage: '20x', result: '+48.26%', status: 'positive' },
            { coin: 'TIA', leverage: '10x', result: '-20%', status: 'negative' },
            { coin: 'ATOM', leverage: '15x', result: 'б/у', status: 'neutral' }
        ],
        stats: {
            total: 3,
            breakeven: 1,
            stopLoss: '1 (-20%)',
            profitable: '1 (+48%)'
        }
    };

    const spotData = {
        trades: [
            { coin: 'ETH', result: '+6%' },
            { coin: 'MEW', result: '+120%' },
            // ... добавьте остальные сделки
        ],
        stats: {
            total: 17,
            breakeven: 0,
            losses: 0,
            profitable: '15 (+398%)',
            active: 2
        }
    };

    const defiData = {
        trades: [
            { coin: 'EGGY', result: '+51%' },
            { coin: 'PINKE', result: '+800%' },
            // ... добавьте остальные сделки
        ],
        stats: {
            totalProfit: '+2598%',
            failures: 3
        }
    };

    return { futuresData, spotData, defiData };
};

// Анимация появления контента
const animateContent = () => {
    gsap.from('.period-header', {
        y: -30,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
    });

    gsap.from('.trading-tabs .tab-btn', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)"
    });

    gsap.from('.stats-grid .stat-box', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out"
    });

    gsap.from('.trades-list .trade-item', {
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
    });
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initSharkAnimation();
    createFloatingCoins();
    const data = loadTradesData();
    renderTrades(data);
    animateContent();
    initTabSwitching();
});
