const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

const closeMenu = () => {
    mobileMenu.classList.remove('active');
    navLinks.classList.remove('active');
    document.body.style.overflow = 'auto';
};

const openMenu = () => {
    mobileMenu.classList.add('active');
    navLinks.classList.add('active');
    document.body.style.overflow = 'hidden';
};

mobileMenu.addEventListener('click', () => {
    if (navLinks.classList.contains('active')) {
        closeMenu();
    } else {
        openMenu();
    }
});

navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 480) {
            closeMenu();
        }
    });
});

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 480) {
        if (!mobileMenu.contains(e.target) && 
            !navLinks.contains(e.target) && 
            navLinks.classList.contains('active')) {
            closeMenu();
        }
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 480) {
        closeMenu();
    }
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(26, 26, 26, 0.98)';
        navbar.style.padding = '0.8rem 5%';
    } else {
        navbar.style.background = 'rgba(26, 26, 26, 0.95)';
        navbar.style.padding = '1rem 5%';
    }
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.class-card').forEach(card => {
    observer.observe(card);
});