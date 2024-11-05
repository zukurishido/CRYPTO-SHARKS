// Initialize GSAP
gsap.registerPlugin();

// Tab Switching Logic
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
        
        // Animate counters for the active tab
        animateCounters(tabId);
    });
});

// Counter Animation Function
function animateCounters(tabId) {
    const counters = document.querySelectorAll(`#${tabId} .counter`);
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2;
        
        gsap.fromTo(counter, {
            textContent: 0
        }, {
            duration: duration,
            textContent: target,
            roundProps: "textContent",
            ease: "power1.inOut",
            snap: { textContent: 0.1 },
            onUpdate: function() {
                counter.textContent = parseFloat(counter.textContent).toFixed(1);
            }
        });
    });
}

// Initial Animation on Page Load
document.addEventListener('DOMContentLoaded', () => {
    // Animate logo and header elements
    gsap.from('.shark-logo', {
        duration: 1,
        scale: 0,
        rotation: 360,
        ease: "back.out(1.7)"
    });
    
    gsap.from('.brand', {
        duration: 1,
        x: -100,
        opacity: 0,
        delay: 0.3
    });
    
    gsap.from('.private-badge', {
        duration: 1,
        y: -50,
        opacity: 0,
        delay: 0.5
    });
    
    // Animate initial tab content
    gsap.from('.stats-grid', {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 0.7
    });
    
    // Start counter animations for initial tab
    animateCounters('futures');
});

// Add hover animations for stat cards
document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            duration: 0.3,
            scale: 1.05,
            boxShadow: '0 10px 20px rgba(0,255,157,0.2)'
        });
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            duration: 0.3,
            scale: 1,
            boxShadow: 'none'
        });
    });
});
