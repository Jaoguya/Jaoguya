/* ============================================================
   JAOGUYA PORTFOLIO — Interactive Scripts
   Theme toggle, scroll animations, form validation,
   cookie consent, mobile nav, typing effect
   ============================================================ */

(function () {
  'use strict';

  // ————————————————————————————————————
  // DOM References
  // ————————————————————————————————————
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const header = $('#header');
  const hamburger = $('#hamburger');
  const mobileNav = $('#mobile-nav');
  const themeToggle = $('#theme-toggle');
  const backToTop = $('#back-to-top');
  const cookieBanner = $('#cookie-banner');
  const cookieAccept = $('#cookie-accept');
  const cookieDecline = $('#cookie-decline');
  const contactForm = $('#contact-form');
  const typingText = $('#typing-text');
  const footerYear = $('#footer-year');

  // ————————————————————————————————————
  // 1. THEME TOGGLE
  // ————————————————————————————————————
  function initTheme() {
    const saved = localStorage.getItem('jaoguya-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('jaoguya-theme', next);

    // Announce to screen readers
    const label = next === 'dark' ? 'Dark theme enabled' : 'Light theme enabled';
    announceToSR(label);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  initTheme();

  // ————————————————————————————————————
  // 2. MOBILE NAVIGATION
  // ————————————————————————————————————
  function openMobileNav() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first link
    const firstLink = mobileNav.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMobileNav() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  function toggleMobileNav() {
    const isOpen = mobileNav.classList.contains('open');
    isOpen ? closeMobileNav() : openMobileNav();
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileNav);
  }

  // Close mobile nav on link click
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  // Close mobile nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) {
      closeMobileNav();
    }
  });

  // ————————————————————————————————————
  // 3. HEADER HIDE/SHOW ON SCROLL
  // ————————————————————————————————————
  let lastScrollY = 0;
  let ticking = false;

  function handleHeaderScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleHeaderScroll);
      ticking = true;
    }
  }, { passive: true });

  // ————————————————————————————————————
  // 4. ACTIVE NAV LINK HIGHLIGHTING
  // ————————————————————————————————————
  function updateActiveNav() {
    const sections = $$('section[id]');
    const scrollPos = window.scrollY + 150;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      const links = $$(`nav a[href="#${id}"]`);

      if (scrollPos >= top && scrollPos < top + height) {
        links.forEach((l) => l.classList.add('active'));
      } else {
        links.forEach((l) => l.classList.remove('active'));
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ————————————————————————————————————
  // 5. SCROLL REVEAL ANIMATIONS
  // ————————————————————————————————————
  function initScrollReveal() {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      $$('.reveal').forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    $$('.reveal').forEach((el) => observer.observe(el));
  }

  initScrollReveal();

  // ————————————————————————————————————
  // 6. BACK TO TOP BUTTON
  // ————————————————————————————————————
  function handleBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  if (backToTop) {
    window.addEventListener('scroll', handleBackToTop, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Focus the skip link after scrolling
      setTimeout(() => {
        const skipLink = $('#skip-link');
        if (skipLink) skipLink.focus();
      }, 500);
    });
  }

  // ————————————————————————————————————
  // 7. TYPING ANIMATION
  // ————————————————————————————————————
  function initTypingAnimation() {
    if (!typingText) return;

    const titles = [
      'Full-Stack Developer',
      'Cybersecurity Enthusiast',
      'CTF Competitor',
      'ABSE Researcher',
      'Computer Engineering Student',
    ];

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function type() {
      const currentTitle = titles[titleIndex];

      if (isDeleting) {
        typingText.textContent = currentTitle.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 40;
      } else {
        typingText.textContent = currentTitle.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 80;
      }

      if (!isDeleting && charIndex === currentTitle.length) {
        // Pause at end of word
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    }

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typingText.textContent = titles[0];
      typingText.style.borderRight = 'none';
      return;
    }

    type();
  }

  initTypingAnimation();

  // ————————————————————————————————————
  // 8. CONTACT FORM VALIDATION
  // ————————————————————————————————————
  function validateField(input, errorEl, message) {
    if (!input.value.trim()) {
      input.classList.add('error');
      errorEl.textContent = message;
      errorEl.classList.add('visible');
      return false;
    }
    // Email format check
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
      input.classList.add('error');
      errorEl.textContent = 'Please enter a valid email address.';
      errorEl.classList.add('visible');
      return false;
    }
    input.classList.remove('error');
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
    return true;
  }

  function clearFieldError(input, errorEl) {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    });
  }

  if (contactForm) {
    const nameInput = $('#contact-name');
    const emailInput = $('#contact-email');
    const messageInput = $('#contact-message');
    const consentInput = $('#contact-consent');
    const nameError = $('#name-error');
    const emailError = $('#email-error');
    const messageError = $('#message-error');
    const consentError = $('#consent-error');
    const formStatus = $('#form-status');

    // Live error clearing
    clearFieldError(nameInput, nameError);
    clearFieldError(emailInput, emailError);
    clearFieldError(messageInput, messageError);

    consentInput.addEventListener('change', () => {
      consentError.textContent = '';
      consentError.classList.remove('visible');
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      if (!validateField(nameInput, nameError, 'Please enter your name.')) isValid = false;
      if (!validateField(emailInput, emailError, 'Please enter your email address.')) isValid = false;
      if (!validateField(messageInput, messageError, 'Please enter your message.')) isValid = false;

      if (!consentInput.checked) {
        consentError.textContent = 'You must consent to data processing to send a message.';
        consentError.classList.add('visible');
        isValid = false;
      }

      if (!isValid) {
        // Focus first error
        const firstError = contactForm.querySelector('.error, .form-error.visible');
        if (firstError) {
          const targetInput = firstError.classList.contains('error')
            ? firstError
            : firstError.previousElementSibling || consentInput;
          targetInput.focus();
        }
        return;
      }

      // Simulate form submission (no actual backend)
      const submitBtn = $('#contact-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span aria-hidden="true">⏳</span> Sending...';

      setTimeout(() => {
        formStatus.className = 'form-status success';
        formStatus.textContent = '✅ Thank you! Your message has been sent successfully. I\'ll get back to you soon!';

        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span aria-hidden="true">📨</span> Send Message';

        // Clear success after 8 seconds
        setTimeout(() => {
          formStatus.className = 'form-status';
          formStatus.textContent = '';
        }, 8000);
      }, 1500);
    });
  }

  // ————————————————————————————————————
  // 9. COOKIE CONSENT BANNER
  // ————————————————————————————————————
  function initCookieBanner() {
    if (!cookieBanner) return;

    const consent = localStorage.getItem('jaoguya-cookie-consent');

    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => {
        cookieBanner.classList.add('visible');
      }, 1500);
    }

    if (cookieAccept) {
      cookieAccept.addEventListener('click', () => {
        localStorage.setItem('jaoguya-cookie-consent', 'accepted');
        cookieBanner.classList.remove('visible');
        announceToSR('Cookies accepted');
        // Here you would initialize analytics/tracking scripts
        loadTrackingScripts();
      });
    }

    if (cookieDecline) {
      cookieDecline.addEventListener('click', () => {
        localStorage.setItem('jaoguya-cookie-consent', 'declined');
        cookieBanner.classList.remove('visible');
        announceToSR('Cookies declined');
      });
    }
  }

  function loadTrackingScripts() {
    // Placeholder: Only load tracking/analytics scripts AFTER user consent
    // Example:
    // const gaScript = document.createElement('script');
    // gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=YOUR_ID';
    // gaScript.async = true;
    // document.head.appendChild(gaScript);
    console.log('[Cookie Consent] User accepted cookies. Tracking scripts can now be loaded.');
  }

  initCookieBanner();

  // ————————————————————————————————————
  // 10. FOOTER YEAR
  // ————————————————————————————————————
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // ————————————————————————————————————
  // 11. SMOOTH SCROLL FOR ANCHOR LINKS
  // ————————————————————————————————————
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = $(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update URL without jumping
        history.pushState(null, null, targetId);
      }
    });
  });

  // ————————————————————————————————————
  // 12. ACCESSIBILITY: Screen Reader Announcements
  // ————————————————————————————————————
  function announceToSR(message) {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.classList.add('sr-only');
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);

    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 3000);
  }

  // ————————————————————————————————————
  // 13. KEYBOARD NAVIGATION: Focus trap for mobile nav
  // ————————————————————————————————————
  if (mobileNav) {
    mobileNav.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      const focusable = mobileNav.querySelectorAll('a, button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // ————————————————————————————————————
  // 14. PARALLAX MESH (subtle mouse interaction)
  // ————————————————————————————————————
  const bgMesh = $('.bg-mesh');
  if (bgMesh && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      bgMesh.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
  }

})();
