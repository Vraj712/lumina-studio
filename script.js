// --- Cinematic Preloader Logic ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const loaderText = document.querySelector('.loader-text');
    const loaderBar = document.querySelector('.loader-bar');

    // 1. Fade in the logo text smoothly
    setTimeout(() => {
        loaderText.classList.remove('opacity-0', 'translate-y-4');
        loaderText.classList.add('opacity-100', 'translate-y-0');
    }, 300);

    // 2. Expand the gold loading bar
    setTimeout(() => {
        loaderBar.style.width = '100%';
    }, 800);

    // 3. Fade out the entire black screen and restore scrolling
    setTimeout(() => {
        preloader.classList.add('opacity-0');
        document.body.classList.remove('overflow-hidden'); // Allows scrolling again
        
        // Remove it from the DOM so it doesn't block clicks
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 1000); 
    }, 2400); // 2.4 seconds total loading time
});

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialize Scroll Animations (AOS)
    AOS.init({
        once: true, // Animations happen only once on scroll down
        offset: 50,
        duration: 800,
        easing: 'ease-in-out-cubic',
    });

    // 2. Dark/Light Mode Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check local storage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    themeToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        if (htmlElement.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // 3. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // 4. Portfolio Filtering System (Backend Ready)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active', 'border-brand-gold', 'text-brand-gold'));
            b.classList.add('border-transparent', 'text-gray-500');
            
            // Add active class to clicked
            btn.classList.add('active', 'border-brand-gold', 'text-brand-gold');
            btn.classList.remove('border-transparent', 'text-gray-500');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hidden');
                    // Brief timeout to allow CSS to render the display change before animating opacity
                    setTimeout(() => { item.style.opacity = '1'; }, 50);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => { item.classList.add('hidden'); }, 300); // Wait for fade out
                }
            });
        });
    });

    // 5. Before/After Slider Logic
    const sliderContainer = document.getElementById('ba-slider');
    const beforeImage = document.getElementById('ba-before');
    const sliderHandle = document.getElementById('ba-handle');
    let isDragging = false;

    if (sliderContainer) {
        const moveSlider = (e) => {
            if (!isDragging) return;
            
            // Get boundaries of the container
            const rect = sliderContainer.getBoundingClientRect();
            // Get X position of mouse/touch relative to container
            let x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            
            // Constrain to container width
            x = Math.max(0, Math.min(x, rect.width));
            
            // Calculate percentage
            const percentage = (x / rect.width) * 100;
            
            // Update elements
            beforeImage.style.width = `${percentage}%`;
            sliderHandle.style.left = `${percentage}%`;
        };

        // Mouse Events
        sliderContainer.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('mousemove', moveSlider);

        // Touch Events
        sliderContainer.addEventListener('touchstart', () => isDragging = true);
        window.addEventListener('touchend', () => isDragging = false);
        window.addEventListener('touchmove', moveSlider);
    }
});

// 6. Lightbox Global Functions
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(element) {
    // Extract high-res image source from the clicked gallery item
    const imgSrc = element.querySelector('img').src;
    lightboxImg.src = imgSrc;
    
    // Show modal with fade-in
    lightbox.classList.remove('hidden');
    // Force reflow
    void lightbox.offsetWidth; 
    lightbox.classList.remove('opacity-0');
    lightbox.classList.add('opacity-100');
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('opacity-100');
    lightbox.classList.add('opacity-0');
    
    // Wait for transition to finish before hiding
    setTimeout(() => {
        lightbox.classList.add('hidden');
        lightboxImg.src = ''; // Clear source memory
        document.body.style.overflow = ''; // Restore scrolling
    }, 300);
}

// Close on 'X' click or clicking outside the image
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