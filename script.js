// Инициализация анимаций акулы
const initSharkAnimation = () => {
    // Анимация появления акулы
    gsap.set(['.shark-body', '.shark-fin', '.shark-tail'], {
        strokeDasharray: 300,
        strokeDashoffset: 300,
        opacity: 0
    });

    // Последовательная анимация элементов акулы
    const tl = gsap.timeline();
    
    tl.to(['.shark-body', '.shark-fin', '.shark-tail'], {
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
    }, "-=1")
    .from('.shark-gills line', {
        scaleX: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1
    }, "-=0.5");

    // Анимация плавания
    gsap.to('.shark-logo', {
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
}

// Создание плавающих монет
const createFloatingCoins = () => {
    const coinsContainer = document.querySelector('.floating-coins');
    const coinsCount = 15;
    
    for (let i = 0; i < coinsCount; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin';
        coin.innerHTML = `
            <svg viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#00ff9d" stroke-width="2"/>
                <text x="25" y="25" text-anchor="middle" dy=".3em" fill="#00ff9d">
                    ${Math.random() > 0.5 ? '₿' : 'Ξ'}
                </text>
            </svg>
        `;
        coinsContainer.appendChild(coin);

        // Случайное начальное положение
        gsap.set(coin, {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0.5 + Math.random() * 0.5,
            opacity: 0.3 + Math.random() * 0.7
        });

        // Анимация плавания
        gsap.to(coin, {
            y: '-=100',
            x: '+=50',
            rotation: 360,
            duration: 3 + Math.random() * 4,
            repeat: -1,
            ease: "none",
            delay: Math.random() * 2
        });
    }
}

// Анимация появления контента
const animateContent = () => {
    gsap.from('.private-badge', {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)"
    });

    gsap.from('.period-info', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.3
    });

    gsap.from('.trading-nav', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.5
    });

    gsap.from('.stat-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.7
    });

    gsap.from('.trade-item', {
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        delay: 1
    });
}

// Анимация счетчиков
const animateCounters = () => {
    document.querySelectorAll('.stat-value').forEach(counter => {
        const value = counter.getAttribute('data-value');
        const isPercentage = counter.textContent.includes('%');
        const start = 0;
        const end = parseFloat(value);

        gsap.fromTo(counter, 
            { textContent: start },
            {
                duration: 2,
                textContent: end,
                snap: { textContent: 1 },
                ease: "power1.inOut",
                onUpdate: function() {
                    const current = Math.round(this.targets()[0].textContent);
                    this.targets()[0].textContent = isPercentage ? `${current}%` : current;
                }
            }
        );
    });
}

// Управление табами
const initTabs = () => {
    const tabs = document.querySelectorAll('.nav-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Удаляем активные классы
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => {
                gsap.to(c, {
                    opacity: 0,
                    y: 20,
                    duration: 0.3,
                    onComplete: () => c.classList.remove('active')
                });
            });

            // Активируем выбранный таб
            tab.classList.add('active');
            const content = document.getElementById(tab.dataset.tab);
            
            // Анимируем появление контента
            gsap.to(content, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: 0.3,
                onStart: () => {
                    content.classList.add('active');
                    animateCounters(); // Перезапускаем анимацию счетчиков
                }
            });
        });
    });
}

// Создание фоновых частиц
const createParticles = () => {
    const container = document.querySelector('.crypto-particles');
    const particlesCount = 50;

    for (let i = 0; i < particlesCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        container.appendChild(particle);

        gsap.set(particle, {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5,
            opacity: Math.random() * 0.3
        });

        gsap.to(particle, {
            x: '+=50',
            y: '+=50',
            rotation: 360,
            duration: 5 + Math.random() * 5,
            repeat: -1,
            ease: "none",
            delay: Math.random() * 2
        });
    }
}

// Добавляем интерактивность
const initInteractions = () => {
    // Hover эффекты для карточек
    document.querySelectorAll('.trade-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                x: 10,
                duration: 0.3,
                ease: "power2.out",
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                x: 0,
                duration: 0.3,
                ease: "power2.out",
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
            });
        });
    });
}

// Инициализация всех анимаций при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initSharkAnimation();
    createFloatingCoins();
    createParticles();
    animateContent();
    animateCounters();
    initTabs();
    initInteractions();
});
