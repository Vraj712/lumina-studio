// --- Cinematic Preloader Logic ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const loaderText = document.querySelector('.loader-text');
    const loaderBar = document.querySelector('.loader-bar');

    setTimeout(() => {
        loaderText.classList.remove('opacity-0', 'translate-y-4');
        loaderText.classList.add('opacity-100', 'translate-y-0');
    }, 300);

    setTimeout(() => {
        loaderBar.style.width = '100%';
    }, 800);

    setTimeout(() => {
        preloader.classList.add('opacity-0');
        document.body.classList.remove('overflow-hidden');
        
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 1000); 
    }, 2400);
});

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialize Scroll Animations (AOS)
    AOS.init({
        once: true,
        offset: 50,
        duration: 800,
        easing: 'ease-in-out-cubic',
    });

    // 2. Custom Cursor Logic
    const cursor = document.querySelector('.custom-cursor');
    if (window.innerWidth > 768 && cursor) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const updateCursor = () => {
            cursor.style.transform = `translate3d(${mouseX - 8}px, ${mouseY - 8}px, 0)`;
            requestAnimationFrame(updateCursor);
        };
        requestAnimationFrame(updateCursor);

        // Hover events for custom cursor
        document.querySelectorAll('a, button, input, select, textarea, .gallery-item').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    // 3. Dark/Light Mode Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const htmlElement = document.documentElement;
    
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    const toggleTheme = () => {
        htmlElement.classList.toggle('dark');
        localStorage.setItem('theme', htmlElement.classList.contains('dark') ? 'dark' : 'light');
    };

    themeToggle.addEventListener('click', toggleTheme);
    mobileThemeToggle.addEventListener('click', toggleTheme);

    // 4. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // 5. Portfolio Filtering System
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active', 'border-brand-gold', 'text-brand-gold');
                b.classList.add('border-transparent', 'text-gray-500');
            });
            
            btn.classList.add('active', 'border-brand-gold', 'text-brand-gold');
            btn.classList.remove('border-transparent', 'text-gray-500');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hidden');
                    setTimeout(() => { item.style.opacity = '1'; }, 50);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => { item.classList.add('hidden'); }, 300);
                }
            });
        });
    });

    // 6. Before/After Slider Logic
    const sliderContainer = document.getElementById('ba-slider');
    const beforeImage = document.getElementById('ba-before');
    const sliderHandle = document.getElementById('ba-handle');
    let isDragging = false;

    if (sliderContainer) {
        const moveSlider = (e) => {
            if (!isDragging) return;
            const rect = sliderContainer.getBoundingClientRect();
            let x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            const percentage = (x / rect.width) * 100;
            
            beforeImage.style.width = `${percentage}%`;
            sliderHandle.style.left = `${percentage}%`;
        };

        sliderContainer.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('mousemove', moveSlider);

        sliderContainer.addEventListener('touchstart', () => isDragging = true);
        window.addEventListener('touchend', () => isDragging = false);
        window.addEventListener('touchmove', moveSlider);
    }
});

// 7. Lightbox Global Functions
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(element) {
    const imgSrc = element.querySelector('img').src;
    lightboxImg.src = imgSrc;
    lightbox.classList.remove('hidden');
    void lightbox.offsetWidth; 
    lightbox.classList.remove('opacity-0');
    lightbox.classList.add('opacity-100');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('opacity-100');
    lightbox.classList.add('opacity-0');
    setTimeout(() => {
        lightbox.classList.add('hidden');
        lightboxImg.src = '';
        document.body.style.overflow = '';
    }, 300);
}

if(lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}
if(lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target !== lightboxImg) {
            closeLightbox();
        }
    });
}