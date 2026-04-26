document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // 2. Navbar & Scroll Logic
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        // Navbar styling
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Parallax effects
        const scrolled = window.scrollY;
        const parallaxBg = document.querySelector('.parallax-img');
        if (parallaxBg && scrolled < window.innerHeight) {
            parallaxBg.style.transform = `translateY(${scrolled * 0.4}px)`;
        }
    });

    // 4. 3D Tilt Effect for Glass Panels
    const tiltElements = document.querySelectorAll('.tilt-element');
    
    if (window.innerWidth > 1024) {
        tiltElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const multiplier = 20;
                const xRotate = multiplier * ((y - rect.height / 2) / rect.height);
                const yRotate = -multiplier * ((x - rect.width / 2) / rect.width);
                
                el.style.transform = `perspective(1000px) rotateX(${xRotate}deg) rotateY(${yRotate}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }

    // 5. Reveal Animations on Scroll
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });
    
    // Trigger hero animations immediately
    setTimeout(() => {
        document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('active'));
    }, 100);

    // 6. Mobile Menu Overlay Logic
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let isMenuOpen = false;

    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    menuBtn.addEventListener('click', toggleMenu);
    if(closeBtn) closeBtn.addEventListener('click', toggleMenu);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu();
        });
    });

    // 7. FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close others
            faqItems.forEach(other => {
                if (other !== item && other.classList.contains('active')) {
                    other.classList.remove('active');
                }
            });
            // Toggle clicked
            item.classList.toggle('active');
        });
    });

    // 8. Map interactive behavior (prevent scroll trap)
    const mapContainer = document.querySelector('.map-container');
    const iframe = document.querySelector('.map-container iframe');
    
    if (mapContainer && iframe) {
        mapContainer.addEventListener('click', () => {
            iframe.style.pointerEvents = 'auto';
            iframe.style.filter = 'none'; // Optional: remove grayscale on interact
        });
        
        mapContainer.addEventListener('mouseleave', () => {
            iframe.style.pointerEvents = 'none';
        });
    }

    // 9. Service Slider Logic (Seamless Infinite Loop)
    const sliderTrack = document.getElementById('service-slider');
    let cards = document.querySelectorAll('.modern-service-card');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dotsContainer = document.getElementById('slider-dots');
    
    if (sliderTrack && cards.length > 0 && window.innerWidth > 768) {
        const originalCount = cards.length;
        
        // Clone all cards and append to the end for the seamless forward loop
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('clone');
            sliderTrack.appendChild(clone);
        });
        
        // Update nodelist to include clones
        cards = document.querySelectorAll('.modern-service-card');
        
        const sliderContainer = document.querySelector('.services-slider-container');
        
        // Dynamically calculate left padding to perfectly center the active card on mobile
        const updateCentering = () => {
            if (window.innerWidth <= 768) {
                const centerPadding = (sliderContainer.offsetWidth - cards[0].offsetWidth) / 2;
                sliderTrack.style.paddingLeft = `${Math.max(0, centerPadding)}px`;
            } else {
                sliderTrack.style.paddingLeft = ''; // Revert to CSS default on desktop
            }
        };
        
        // Initial call and resize listener
        updateCentering();
        window.addEventListener('resize', () => {
            updateCentering();
            goToSlide(currentIndex); // Re-align if width changed
        });
        
        let currentIndex = 0;
        let isTransitioning = false;
        
        // Create dots only for original cards
        for (let i = 0; i < originalCount; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                if (isTransitioning) return;
                goToSlide(i);
            });
            dotsContainer.appendChild(dot);
        }
        const dots = document.querySelectorAll('.dot');
        
        const goToSlide = (index) => {
            if (isTransitioning) return;
            isTransitioning = true;
            
            currentIndex = index;
            
            // Calculate width dynamically in case of resize
            const cardWidth = cards[0].offsetWidth + 32; // 32 is the gap (2rem)
            
            sliderTrack.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            sliderTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            
            // Update active dot safely
            dots.forEach(d => d.classList.remove('active'));
            dots[currentIndex % originalCount].classList.add('active');
        };
        
        // Listen for the end of the transition to silently jump back
        sliderTrack.addEventListener('transitionend', () => {
            isTransitioning = false;
            // If we've slid into the cloned area, snap back to the original silently
            if (currentIndex >= originalCount) {
                sliderTrack.style.transition = 'none';
                currentIndex = currentIndex % originalCount;
                const cardWidth = cards[0].offsetWidth + 32;
                sliderTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                sliderTrack.offsetHeight; // Force reflow
            }
        });
        
        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            if (currentIndex <= 0) {
                // Silently jump to the cloned equivalent before sliding back
                sliderTrack.style.transition = 'none';
                currentIndex = originalCount;
                const cardWidth = cards[0].offsetWidth + 32;
                sliderTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                sliderTrack.offsetHeight; // Force reflow
                
                // Then animate backwards
                setTimeout(() => goToSlide(currentIndex - 1), 20);
            } else {
                goToSlide(currentIndex - 1);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            goToSlide(currentIndex + 1);
        });
        
        // Auto sliding
        let slideInterval = setInterval(() => {
            if (!isTransitioning) goToSlide(currentIndex + 1);
        }, 4000);
        
        // Pause on hover
        sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
        sliderContainer.addEventListener('mouseleave', () => {
            slideInterval = setInterval(() => {
                if (!isTransitioning) goToSlide(currentIndex + 1);
            }, 4000);
        });
    }

    // 10. Floating Actions Reveal
    const floatingActions = document.getElementById('floating-actions');
    const contactSection = document.getElementById('contact');
    
    window.addEventListener('scroll', () => {
        if (floatingActions) {
            let isContactVisible = false;
            if (contactSection) {
                const rect = contactSection.getBoundingClientRect();
                // Hide floating buttons if the contact section is in the viewport
                if (rect.top < window.innerHeight * 0.9) {
                    isContactVisible = true;
                }
            }

            // Reveal after scrolling past the 80% of the viewport (past hero), 
            // but hide them if we are currently looking at the contact form
            if (window.scrollY > window.innerHeight * 0.8 && !isContactVisible) {
                floatingActions.classList.add('visible');
            } else {
                floatingActions.classList.remove('visible');
            }
        }
    });

    // 11. Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
