gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. PRELOADER & THEME ---
    const html = document.documentElement;
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    }

    const tl = gsap.timeline();
    tl.to(".loader-text", { opacity: 1, y: -10, duration: 1, ease: "power2.out" })
      .to(".loader-bar", { width: "100%", duration: 1.5, ease: "power3.inOut" }, "-=0.5")
      .to("#preloader", { autoAlpha: 0, duration: 1, ease: "power2.inOut", onComplete: () => {
          document.body.classList.remove('overflow-hidden');
          gsap.to(".hero-img", { scale: 1, duration: 3, ease: "power2.out" });
      }});

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });

    // --- 2. CUSTOM CURSOR ---
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
    }

    // --- 3. GSAP SCROLL & PARALLAX ---
    const revealElements = document.querySelectorAll(".gs-reveal");
    revealElements.forEach((el) => {
        gsap.fromTo(el, { autoAlpha: 0, y: 40 }, {
            autoAlpha: 1, y: 0, duration: 1.2, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" }
        });
    });

    gsap.to(".parallax-img", {
        yPercent: 20, ease: "none",
        scrollTrigger: { trigger: "#about", start: "top bottom", end: "bottom top", scrub: true }
    });

    const navbar = document.getElementById('navbar');
    const navContainer = navbar.querySelector('div > div');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-md');
            gsap.to(navContainer, { height: "5rem", duration: 0.3 }); 
        } else {
            navbar.classList.remove('shadow-md');
            gsap.to(navContainer, { height: "6rem", duration: 0.3 });
        }
    });

    // --- 4. ADVANCED ZOOM LIGHTBOX ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    let currentScale = 1; let isDragging = false; let startX, startY, currentX = 0, currentY = 0;

    const updateImageTransform = () => {
        if (currentScale <= 1) { currentX = 0; currentY = 0; }
        lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
    };

    const attachEvents = () => {
        document.querySelectorAll('.lightbox-trigger').forEach(trigger => {
            // Clone to strip old event listeners so they don't fire twice
            const newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);
            
            newTrigger.addEventListener('click', () => {
                lightboxImg.src = newTrigger.querySelector('img').src;
                currentScale = 1; currentX = 0; currentY = 0;
                updateImageTransform();
                lightbox.classList.remove('pointer-events-none');
                lightbox.classList.add('opacity-100');
                document.body.classList.add('overflow-hidden');
            });

            // Re-attach cursor hover logic
            newTrigger.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
            newTrigger.addEventListener('mouseleave', () => cursor?.classList.remove('hover'));
        });
        
        // Ensure other links still have cursor hover
        document.querySelectorAll('a, button, input, textarea, select, .group').forEach(el => {
            el.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor?.classList.remove('hover'));
        });
    };
    attachEvents();

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.add('pointer-events-none');
        lightbox.classList.remove('opacity-100');
        document.body.classList.remove('overflow-hidden');
        setTimeout(() => { lightboxImg.src = ""; }, 300);
    });

    document.getElementById('zoom-in').addEventListener('click', () => { currentScale = Math.min(currentScale + 0.5, 4); updateImageTransform(); });
    document.getElementById('zoom-out').addEventListener('click', () => { currentScale = Math.max(currentScale - 0.5, 1); updateImageTransform(); });

    lightbox.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) currentScale = Math.min(currentScale + 0.2, 4);
        else currentScale = Math.max(currentScale - 0.2, 1);
        updateImageTransform();
    });

    lightboxImg.addEventListener('mousedown', (e) => {
        if (currentScale > 1) {
            isDragging = true;
            startX = e.clientX - currentX; startY = e.clientY - currentY;
        }
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging || currentScale <= 1) return;
        currentX = e.clientX - startX; currentY = e.clientY - startY;
        updateImageTransform();
    });

    // --- 5. ADMIN UPLOAD TERMINAL & SECURITY ---
    const adminUpload = document.getElementById('admin-upload');
    const portfolioGrid = document.getElementById('portfolio-grid');
    const adminPanel = document.getElementById('admin-panel');

    // SECRET URL LOGIC: Only show the upload button if "?admin=true" is in the URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' && adminPanel) {
        adminPanel.classList.remove('hidden');
    }

    // Upload Logic
    if (adminUpload) {
        adminUpload.addEventListener('change', (e) => {
            const files = e.target.files;
            if (!files.length) return;

            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const newDiv = document.createElement('div');
                    newDiv.className = 'relative overflow-hidden group portfolio-item lightbox-trigger md:cursor-none break-inside-avoid mb-8';
                    newDiv.innerHTML = `
                        <img src="${event.target.result}" class="w-full h-auto transform group-hover:scale-105 transition-transform duration-1000" style="image-rendering: high-quality;">
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center text-white text-sm uppercase tracking-widest">Enlarge</div>
                    `;
                    portfolioGrid.prepend(newDiv);
                    attachEvents(); // Re-bind clicks and hover events to the new image
                    gsap.fromTo(newDiv, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 });
                };
                reader.readAsDataURL(file);
            });
            adminUpload.value = '';
        });
    }
});