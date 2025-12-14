// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all functionality
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initFormValidation();
    initCurrentYear();
    initIntersectionObserver();

    // Fix viewport height for mobile
    fixViewportHeight();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Check if elements exist before adding event listeners
    if (!mobileMenuBtn || !navLinks) {
        console.log('Mobile menu elements not found');
        return;
    }

    const navLinksItems = document.querySelectorAll('.nav-link');

    mobileMenuBtn.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent event from bubbling up
        navLinks.classList.toggle('active');

        // Toggle icon
        const icon = this.querySelector('i');
        if (icon) {
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }

        // Toggle aria-expanded for accessibility
        const isExpanded = navLinks.classList.contains('active');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Close mobile menu when clicking on a link
    navLinksItems.forEach(item => {
        item.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
        const isClickInsideNav = event.target.closest('.main-nav');
        const isClickOnMenuBtn = event.target.closest('.mobile-menu-btn');

        if (!isClickInsideNav && !isClickOnMenuBtn && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    function closeMobileMenu() {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
}

// Smooth Scrolling for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Skip if it's just "#" or invalid
            if (targetId === '#' || targetId === '#!' || !targetId || targetId.startsWith('javascript:')) return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = mobileMenuBtn?.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                    if (mobileMenuBtn) {
                        mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    }
                }

                // Calculate header offset
                const header = document.querySelector('.main-header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                // Smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL hash without jumping
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                } else {
                    window.location.hash = targetId;
                }

                // Update active nav link
                setTimeout(() => {
                    updateActiveNavLink();
                }, 100);
            }
        });
    });
}

// Header Scroll Effects
function initHeaderScroll() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    let lastScrollTop = 0;
    const scrollThreshold = 100;
    let scrollTimeout;
    let isScrolling = false;

    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add/remove scrolled class based on scroll position
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide/show header on scroll (only on desktop)
        if (window.innerWidth > 768) {
            if (scrollTop > scrollThreshold) {
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // Scrolling down - hide header
                    header.classList.add('hidden');
                } else {
                    // Scrolling up - show header
                    header.classList.remove('hidden');
                }
            } else {
                // Near top - always show header
                header.classList.remove('hidden');
            }
        }

        // Update active navigation link based on scroll position
        updateActiveNavLink();

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    }

    // Throttle scroll events
    window.addEventListener('scroll', function () {
        if (!isScrolling) {
            window.requestAnimationFrame(function () {
                handleScroll();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    let currentSection = '';
    const scrollPosition = window.scrollY + 100;

    // Find current section
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = sectionId;
        }
    });

    // If no section found, check if we're at the top
    if (!currentSection && window.scrollY < 100) {
        currentSection = 'home';
    }

    // Update nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSection}` || (currentSection === 'home' && href === '#home')) {
            link.classList.add('active');
        }
    });
}

// Form Validation
function initFormValidation() {
    const contactForm = document.getElementById('simpleContactForm');

    if (!contactForm) return;

    // Add input event listeners for real-time validation
    ['simpleName', 'simpleEmail', 'simpleMessage'].forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Validate on blur
            input.addEventListener('blur', function () {
                validateField(this);
            });

            // Clear error on input
            input.addEventListener('input', function () {
                if (this.classList.contains('error')) {
                    removeError(this.id);
                }
            });
        }
    });

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const nameInput = document.getElementById('simpleName');
        const emailInput = document.getElementById('simpleEmail');
        const messageInput = document.getElementById('simpleMessage');

        if (!nameInput || !emailInput || !messageInput) return;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        // Validate all fields
        const isNameValid = validateField(nameInput);
        const isEmailValid = validateField(emailInput);
        const isMessageValid = validateField(messageInput);

        if (isNameValid && isEmailValid && isMessageValid) {
            submitContactForm(name, email, message);
        }
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldId = field.id;
    let errorMessage = '';

    if (!value) {
        switch (fieldId) {
            case 'simpleName':
                errorMessage = 'Please enter your name';
                break;
            case 'simpleEmail':
                errorMessage = 'Please enter your email address';
                break;
            case 'simpleMessage':
                errorMessage = 'Please enter your message';
                break;
        }
        if (errorMessage) {
            showError(fieldId, errorMessage);
            return false;
        }
    }

    if (fieldId === 'simpleEmail' && value && !isValidEmail(value)) {
        showError(fieldId, 'Please enter a valid email address');
        return false;
    }

    // If no errors, remove any existing error
    removeError(fieldId);
    return true;
}

// Show error message
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const formGroup = input.closest('.form-group-simple');
    if (!formGroup) return;

    // Remove existing error
    removeError(inputId);

    // Add error class to input
    input.classList.add('error');

    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    formGroup.appendChild(errorElement);
}

// Remove error message
function removeError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const formGroup = input.closest('.form-group-simple');
    if (!formGroup) return;

    // Remove error class from input
    input.classList.remove('error');

    // Remove error message element
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Submit contact form (simulated - in production, this would be an AJAX call)
function submitContactForm(name, email, message) {
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        showSuccessMessage();

        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Reset form
        const contactForm = document.getElementById('simpleContactForm');
        if (contactForm) {
            contactForm.reset();
        }
    }, 1500);
}

// Show success message
function showSuccessMessage() {
    // Remove any existing success message
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.setAttribute('role', 'alert');
    successMessage.setAttribute('aria-live', 'polite');
    successMessage.innerHTML = `
        <div class="success-alert">
            <i class="fas fa-check-circle"></i>
            <span>Thank you! Your message has been sent. We'll get back to you within 24 hours.</span>
        </div>
    `;

    // Insert after form submit button
    const form = document.getElementById('simpleContactForm');
    if (form) {
        const formSubmit = form.querySelector('.form-submit');
        if (formSubmit) {
            formSubmit.appendChild(successMessage);
        } else {
            form.appendChild(successMessage);
        }
    }

    // Remove message after 5 seconds
    setTimeout(() => {
        if (successMessage.parentNode) {
            successMessage.remove();
        }
    }, 5000);
}

// Update copyright year
function initCurrentYear() {
    const copyrightElements = document.querySelectorAll('.copyright p');

    if (copyrightElements.length === 0) return;

    const currentYear = new Date().getFullYear();

    copyrightElements.forEach(element => {
        // Replace any occurrence of 2025 with current year
        element.innerHTML = element.innerHTML.replace(/2025/g, currentYear);
    });
}

// Add intersection observer for fade-in animations
function initIntersectionObserver() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        console.log('IntersectionObserver not supported');
        return;
    }

    // Animation for service cards and about sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        observer.observe(card);
    });

    // Observe about sections
    const aboutSections = document.querySelectorAll('.about-section-content');
    aboutSections.forEach(section => {
        observer.observe(section);
    });
}

// Add CSS for error states and animations
(function addErrorStyles() {
    // Check if styles already exist
    if (document.querySelector('#dynamic-styles')) return;

    const style = document.createElement('style');
    style.id = 'dynamic-styles';
    style.textContent = `
        /* Form error styles */
        .form-group-simple input.error,
        .form-group-simple textarea.error {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
        }
        
        .error-message {
            color: #dc3545 !important;
            font-size: 0.85rem !important;
            margin-top: 5px !important;
        }
        
        /* Success message styles */
        .success-message {
            margin-top: 20px;
            animation: fadeIn 0.3s ease;
        }
        
        .success-alert {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #c3e6cb;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .success-alert i {
            color: #28a745;
            font-size: 1.2rem;
        }
        
        /* Animation styles */
        .service-card,
        .about-section-content {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .service-card.visible,
        .about-section-content.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Animation for button hover */
        .btn-primary:hover i,
        .btn-outline:hover i {
            transform: translateX(3px);
            transition: transform 0.3s ease;
        }
        
        /* Mobile menu active state */
        .nav-links.active {
            display: flex !important;
            animation: slideDown 0.3s ease;
        }
        
        /* Keyframes */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideDown {
            from { 
                opacity: 0;
                transform: translateY(-10px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Loading spinner */
        .fa-spinner {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
})();

// Fix for mobile viewport height
function fixViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Handle viewport resize
window.addEventListener('resize', fixViewportHeight);

// Window load event for additional initialization
window.addEventListener('load', function () {
    // Update active nav link on initial load
    updateActiveNavLink();

    // Add loaded class to body for CSS transitions
    document.body.classList.add('loaded');

    // Initialize any lazy loading if needed
    console.log('ALOLE Technologies website fully loaded');
});

// Service card hover effects for touch devices
document.addEventListener('touchstart', function () { }, { passive: true });

// Handle service card clicks on mobile
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', function (e) {
        // On mobile, toggle the flip instead of hover
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const inner = this.querySelector('.service-card-inner');
            if (inner) {
                const isFlipped = inner.style.transform === 'rotateY(180deg)';
                inner.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
            }
        }
    });
});

// Add active class to hero section when in view
function initHeroObserver() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heroSection.classList.add('in-view');
            }
        });
    }, { threshold: 0.5 });

    observer.observe(heroSection);
}

// Initialize hero observer
initHeroObserver();