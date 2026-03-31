// ==========================================
// 1. FIREBASE CONNECTION FOR LIVE GALLERY
// ==========================================
// Renamed to 'publicFirebaseConfig' to prevent clashes!
const publicFirebaseConfig = {
    apiKey: "AIzaSyA93amAMYJvfSWsgx6d31Xi95-cyI8WiRg",
    authDomain: "lumina-studio-9069d.firebaseapp.com",
    projectId: "lumina-studio-9069d",
    storageBucket: "lumina-studio-9069d.firebasestorage.app",
    messagingSenderId: "351859749046",
    appId: "1:351859749046:web:b7cab0b9a40adcaa27b617"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(publicFirebaseConfig);
}
const db = firebase.firestore();

// Global Filter Function (Needs to run after photos load)
window.initGalleryFilters = function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Remove old listeners to prevent duplicates if called twice
    const newBtns = [];
    filterBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtns.push(newBtn);
    });

    newBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update button styles
            newBtns.forEach(b => {
                b.classList.remove('active', 'border-brand-gold', 'text-brand-gold');
                b.classList.add('border-transparent', 'text-gray-500');
            });
            btn.classList.add('active', 'border-brand-gold', 'text-brand-gold');
            btn.classList.remove('border-transparent', 'text-gray-500');

            const filterValue = btn.getAttribute('data-filter');

            // Hide/Show items
            const currentItems = document.querySelectorAll('.gallery-item');
            currentItems.forEach(item => {
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
};

// Function to fetch and display photos
async function loadLiveGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return; // Stop if not on the home page

    try {
        // Fetch photos from the database, newest first
        const snapshot = await db.collection('photos').orderBy('createdAt', 'desc').get();
        
        galleryGrid.innerHTML = ''; // Clear loading state

        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Create the HTML for each photo
            const photoHTML = `
                <div class="gallery-item relative overflow-hidden group cursor-pointer break-inside-avoid rounded-sm shadow-md transition-opacity duration-300" style="opacity: 1;" data-category="${data.category}" onclick="openLightbox(this)">
                    <img src="${data.imageUrl}" alt="${data.category} photo" loading="lazy" class="w-full h-auto transform group-hover:scale-110 transition-transform duration-700 ease-in-out">
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <i class="fa-solid fa-expand text-white text-3xl"></i>
                    </div>
                </div>
            `;
            galleryGrid.innerHTML += photoHTML;
        });

        // Initialize the filters now that the photos exist
        window.initGalleryFilters();

    } catch (error) {
        console.error("Error loading gallery:", error);
        galleryGrid.innerHTML = '<p class="text-gray-500 text-center col-span-full py-10">Failed to load gallery. Please check console.</p>';
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', loadLiveGallery);


// ==========================================
// 2. KEEP YOUR EXISTING SCRIPT.JS CODE BELOW THIS LINE
// ==========================================

// --- Cinematic Preloader Logic ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const loaderText = document.querySelector('.loader-text');
    const loaderBar = document.querySelector('.loader-bar');

    if(preloader) {
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
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialize Scroll Animations (AOS)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true,
            offset: 50,
            duration: 800,
            easing: 'ease-in-out-cubic',
        });
    }

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
        document.body.addEventListener('mouseenter', (e) => {
            if (e.target.matches('a, button, input, select, textarea, .gallery-item')) {
                cursor.classList.add('hover');
            }
        }, true);
        
        document.body.addEventListener('mouseleave', (e) => {
            if (e.target.matches('a, button, input, select, textarea, .gallery-item')) {
                cursor.classList.remove('hover');
            }
        }, true);
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

    if(themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if(mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);

    // 4. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if(mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 5. Before/After Slider Logic
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

// 6. Lightbox Global Functions
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

window.openLightbox = function(element) {
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