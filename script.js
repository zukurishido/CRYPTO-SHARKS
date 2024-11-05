// Инициализация GSAP
gsap.registerPlugin();

// Создание плавающих монет
function createFloatingCoins() {
    const coinsContainer = document.querySelector('.coins-container');
    const coinsSVG = [
        `<svg viewBox="0 0 50 50" class="floating-coin">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#00ff9d" stroke-width="2"/>
            <text x="25" y="25" text-anchor="middle" dy=".3em" fill="#00ff9d">₿</text>
        </svg>`,
        `<svg viewBox="0 0 50 50" class="floating-coin">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#00ff9d" stroke-width="2"/>
            <text x="25" y="25" text-anchor="middle" dy=".3em" fill="#00ff9d">Ξ</text>
        </svg>`
    ];

    for (let i = 0; i < 10; i++) {
        const coin = document.createElement('div');
        coin.classList.add('floating-coin-wrapper');
        coin.innerHTML = coinsSVG[Math.floor(Math.random() * coinsSVG.length)];
        coinsContainer.appendChild(coin);

        gsap.to(coin, {
            y: -Math.random() * 500,
            x: Math.random() * 100 - 50,
            rotation: Math.random() * 360,
            duration: 5 + Math.random() * 5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: Math.random() * 5
        });
    }
}

// Анимация акулы
function animateShark() {
    const timeline = gsap.timeline({repeat: -1});
    
    timeline
        .from('.shark-body', {
            strokeDasharray: 300,
            strokeDashoffset: 300,
            duration: 2,
            ease: "power2.out"
        })
        .from('.shark-fin, .shark-tail', {
            strokeDasharray: 100,
            strokeDashoffset: 100,
            duration: 1,
            ease: "power2.out"
        }, "-=1.5")
        .from('.shark-eye', {
            scale: 0,
            duration: 0.5,
            ease: "back.out"
        }, "-=0.5");

    // Моргание глаза
    gsap.to('.shark-eye', {
        scaleY: 0.1,
        duration: 0.1,
        repeat: -1,
        repeatDelay: 3,
        yoyo: true
    });

    // Плавное движение акулы
    gsap.to('.shark-logo', {
        x: 10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    });
}

// Анимация счетчиков
function animateCounters() {
    document.querySelectorAll('.value').forEach(counter => {
        const value = counter.innerText;
        const isPercentage = value.includes('%');
        const number = parseFloat(value.replace('%', ''));

        gsap.from(counter, {
            textContent: 0,
            duration: 2,
            ease: "power1.inOut",
            snap: { textContent: 1 },
            stagger: {
                each: 0.5,
                onUpdate: function() {
                    counter.textContent = this.targets()[0].textContent + (isPercentage ? '%' : '');
                },
            }
        });
    });
}

// Переключение табов
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Удаляем активный класс у всех табов и контента
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => {
                gsap.to(c, {
                    opacity: 0,
                    y: 20,
                    duration: 0.3,
                    onComplete: () => {
                        c.classList.remove('active');
                    }
                });
            });

            // Добавляем активный класс выбранному табу
            tab.classList.add('active');
            const content = document.getElementById(tab.dataset.tab);
            
            // Анимируем появление нового контента
            gsap.to(content, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: 0.3,
                onStart: () => {
                    content.classList.add('active');
                }
            });

            // Запускаем анимацию счетчиков для активного таба
            animateCounters();
        });
    });
}

// Создание частиц фона
function createParticles() {
    const particles = document.querySelector('.particles');
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particles.appendChild(particle);

        gsap.set(particle, {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        });

        gsap.to(particle, {
            x: '+=' + (Math.random() * 100 - 50),
            y: '+=' + (Math.random() * 100 - 50),
            opacity: Math.random(),
            duration: 2 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: "none"
        });
    }
}

// Инициализация всех анимаций при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    createFloatingCoins();
    animateShark();
    createParticles();
    initTabs();
    animateCounters();

    // Анимация появления шапки
    gsap.from('.header', {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
    });

    // Анимация появления периода
    gsap.from('.period-badge', {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "back.out(1.7)"
    });

    // Анимация появления табов
    gsap.from('.tab-btn', {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.5,
        ease: "power2.out"
    });
});

// Обработка ховер-эффектов
document.querySelectorAll('.trade-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        gsap.to(item, {
            x: 10,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    item.addEventListener('mouseleave', () => {
        gsap.to(item, {
            x: 0,
            duration: 0.3,
            ease: "power2.out"
        });
    });
});
