/**
 * MMM Transport Moving - Bootstrap 5 Optimized JavaScript
 */

'use strict';

// State Management
const state = {
  currentGalleryIndex: 0,
  galleryImages: [],
  hasAnimatedStats: false
};

// Utility Functions
const utils = {
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  throttle(func, wait) {
    let throttled = false;
    return function(...args) {
      if (!throttled) {
        func.apply(this, args);
        throttled = true;
        setTimeout(() => throttled = false, wait);
      }
    };
  },

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top <= window.innerHeight && rect.bottom >= 0;
  }
};

// Scroll Progress Bar
const scrollProgress = {
  init() {
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', utils.throttle(() => {
      const winScroll = window.pageYOffset || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    }, 50));
  }
};

// Active Navigation Link
const navigation = {
  init() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    if (!sections.length || !navLinks.length) return;

    const updateActiveLink = () => {
      let currentSection = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 100) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', utils.debounce(updateActiveLink, 100));
    updateActiveLink();

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const navCollapse = document.getElementById('nav') || document.getElementById('navbarNav');
            if (navCollapse && navCollapse.classList.contains('show')) {
              const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
              if (bsCollapse) bsCollapse.hide();
            }
          }
        }
      });
    });
  }
};

// Stats Counter Animation
const statsCounter = {
  init() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    const animateStats = () => {
      const statsSection = document.querySelector('.stats-section');
      if (!statsSection || state.hasAnimatedStats) return;

      if (utils.isInViewport(statsSection)) {
        state.hasAnimatedStats = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target'));
          this.animateValue(stat, 0, target, 2000);
        });
      }
    };

    window.addEventListener('scroll', utils.throttle(animateStats, 200));
    animateStats();
  },

  animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        element.textContent = end;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }
};

// Gallery Lightbox
const gallery = {
  init() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('galleryLightbox');
    
    if (!galleryItems.length || !lightboxModal) return;

    // Collect all gallery images
    state.galleryImages = Array.from(galleryItems).map(item => {
      const img = item.querySelector('img');
      return {
        src: img.src,
        alt: img.alt
      };
    });

    // Add click handlers to gallery items
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        state.currentGalleryIndex = index;
        this.showImage();
        const modal = new bootstrap.Modal(lightboxModal);
        modal.show();
      });
    });

    // Navigation buttons
    const prevBtn = lightboxModal.querySelector('.lightbox-nav-prev');
    const nextBtn = lightboxModal.querySelector('.lightbox-nav-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevImage());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextImage());
    }

    // Keyboard navigation
    lightboxModal.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevImage();
      if (e.key === 'ArrowRight') this.nextImage();
    });
  },

  showImage() {
    const lightboxModal = document.getElementById('galleryLightbox');
    if (!lightboxModal) return;

    const img = lightboxModal.querySelector('.lightbox-img');
    const caption = lightboxModal.querySelector('.lightbox-caption');
    const current = state.galleryImages[state.currentGalleryIndex];

    if (img && current) {
      img.src = current.src;
      img.alt = current.alt;
      if (caption) caption.textContent = current.alt;
    }
  },

  prevImage() {
    state.currentGalleryIndex = (state.currentGalleryIndex - 1 + state.galleryImages.length) % state.galleryImages.length;
    this.showImage();
  },

  nextImage() {
    state.currentGalleryIndex = (state.currentGalleryIndex + 1) % state.galleryImages.length;
    this.showImage();
  }
};

// Form Handling
const forms = {
  init() {
    // Booking Form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      this.setupDateValidation(bookingForm);
      this.setupPhoneFormatting(bookingForm);
      bookingForm.addEventListener('submit', (e) => this.handleSubmit(e, bookingForm));
    }

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      this.setupPhoneFormatting(contactForm);
      contactForm.addEventListener('submit', (e) => this.handleSubmit(e, contactForm));
    }
  },

  setupDateValidation(form) {
    const dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }
  },

  setupPhoneFormatting(form) {
    const phoneInputs = form.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const value = e.target.value.replace(/\D/g, '');
        const match = value.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
        if (match) {
          let formatted = '';
          if (match[1]) formatted = `(${match[1]}`;
          if (match[2]) formatted += `) ${match[2]}`;
          if (match[3]) formatted += `-${match[3]}`;
          e.target.value = formatted;
        }
      });
    });
  },

  handleSubmit(e, form) {
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    // Show success toast
    const toast = document.getElementById('successToast');
    if (toast) {
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
    }

    // Close modal if form is in modal
    const modal = form.closest('.modal');
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        setTimeout(() => bsModal.hide(), 1000);
      }
    }
  }
};

// Analytics
const analytics = {
  init() {
    // Track phone clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.addEventListener('click', () => {
        this.trackEvent('Contact', 'Phone Click', link.textContent);
      });
    });

    // Track email clicks
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.addEventListener('click', () => {
        this.trackEvent('Contact', 'Email Click', link.textContent);
      });
    });

    // Track booking button clicks
    document.querySelectorAll('[data-bs-target="#bookingModal"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.trackEvent('Booking', 'Modal Open', 'Booking Button');
      });
    });
  },

  trackEvent(category, action, label) {
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        'event_category': category,
        'event_label': label
      });
    }
    console.log(`Event: ${category} - ${action} - ${label}`);
  }
};

// Performance
const performance = {
  init() {
    // Reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.scrollBehavior = 'auto';
      const style = document.createElement('style');
      style.textContent = '* { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }';
      document.head.appendChild(style);
    }

    // Lazy load images
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    }
  }
};

// App Initialization
const app = {
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  },

  start() {
    scrollProgress.init();
    navigation.init();
    statsCounter.init();
    gallery.init();
    forms.init();
    analytics.init();
    performance.init();

    // Check for success parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === '1') {
      const toast = document.getElementById('successToast');
      if (toast) {
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    console.log('MMM Transport Moving - Ready');
  }
};

// Initialize app
app.init();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { app, utils };
}