/* ============================================================
   JAOGUYA PORTFOLIO — Interactive Scripts
   Theme toggle, scroll animations, form validation,
   mobile nav, typing effect
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
  const contactForm = $('#contact-form');
  const typingText = $('#typing-text');
  const footerYear = $('#footer-year');

  // ————————————————————————————————————
  // 1. THEME INITIALIZATION (Locked to Dark Mode)
  // ————————————————————————————————————
  function initTheme() {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  initTheme();

  // ————————————————————————————————————
  // 2. MOBILE NAVIGATION
  // ————————————————————————————————————
  let isProgrammaticScroll = false;

  function openMobileNav() {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first link
    const firstLink = mobileNav.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMobileNav(focusHamburger = false) {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (focusHamburger) {
      hamburger.focus();
    }
  }

  function toggleMobileNav() {
    if (!mobileNav) return;
    const isOpen = mobileNav.classList.contains('open');
    isOpen ? closeMobileNav(true) : openMobileNav();
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileNav);
  }

  // Close mobile nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) {
      closeMobileNav(true);
    }
  });

  // ————————————————————————————————————
  // 3. HEADER HIDE/SHOW ON SCROLL
  // ————————————————————————————————————
  let lastScrollY = 0;
  let ticking = false;

  function handleHeaderScroll() {
    if (!header || isProgrammaticScroll) return;
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
    if (!sections.length) return;
    const headerHeight = header ? header.getBoundingClientRect().height : 70;
    const scrollPos = window.scrollY + headerHeight + 60;

    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top + window.pageYOffset;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      const links = $$(
        `nav a[href="#${id}"], nav a[href$="#${id}"], #mobile-nav a[href="#${id}"], #mobile-nav a[href$="#${id}"]`
      );

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
  // 7. ROLE TYPEWRITER EFFECT
  // ————————————————————————————————————
  function initTypingAnimation() {
    if (!typingText) return;

    const titles = [
      'Computer Engineering @ SIIT',
      'Cryptographic Systems Researcher',
      'CTF Player & Security Enthusiast',
      'Cloud & Distributed Systems Developer',
      'ABSE & Verifiable Aggregation Researcher',
    ];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typingText.textContent = titles[0];
      return;
    }

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 80;
    const deletingSpeed = 40;
    const pauseEnd = 2000;
    const pauseStart = 400;

    function typeLoop() {
      const current = titles[titleIndex];

      if (!isDeleting) {
        typingText.textContent = current.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(typeLoop, pauseEnd);
          return;
        }
        setTimeout(typeLoop, typingSpeed);
      } else {
        typingText.textContent = current.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          titleIndex = (titleIndex + 1) % titles.length;
          setTimeout(typeLoop, pauseStart);
          return;
        }
        setTimeout(typeLoop, deletingSpeed);
      }
    }

    typeLoop();
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
  // 9.5. PROJECT CATEGORY FILTERING
  // ————————————————————————————————————
  function initProjectFilters() {
    const filterTabs = $$('.project-tab');
    const projectCards = $$('.project-card');

    if (!filterTabs.length || !projectCards.length) return;

    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');

        filterTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        projectCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  initProjectFilters();

  // ————————————————————————————————————
  // 9.6. INTERACTIVE CV MODAL
  // ————————————————————————————————————
  function initCvModal() {
    const cvModal = $('#cv-modal');
    const heroCvBtn = $('#hero-cta-cv');
    const cvCloseBtn = $('#cv-modal-close');
    const cvPrintBtn = $('#cv-print-btn');
    const openCvTriggers = $$('.open-cv-trigger');

    if (!cvModal) return;

    function openModal() {
      cvModal.classList.add('open');
      cvModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (cvCloseBtn) cvCloseBtn.focus();
    }

    function closeModal() {
      cvModal.classList.remove('open');
      cvModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (heroCvBtn) heroCvBtn.focus();
    }

    if (heroCvBtn) {
      heroCvBtn.addEventListener('click', openModal);
    }

    openCvTriggers.forEach((btn) => {
      btn.addEventListener('click', openModal);
    });

    if (cvCloseBtn) {
      cvCloseBtn.addEventListener('click', closeModal);
    }

    // Close on backdrop click
    cvModal.addEventListener('click', (e) => {
      if (e.target === cvModal) {
        closeModal();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && cvModal.classList.contains('open')) {
        closeModal();
      }
    });

    // Print CV
    if (cvPrintBtn) {
      cvPrintBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  initCvModal();

  // ————————————————————————————————————
  // 9.6b. VERIFIED CERTIFICATES VIEWER MODAL
  // ————————————————————————————————————
  function initCertModal() {
    const certModal = $('#cert-modal');
    const certCloseBtn = $('#cert-modal-close');
    const certTriggers = $$('[data-open-cert]');
    const tabButtons = $$('.cert-tab-btn');
    const certPanels = $$('.cert-panel');

    if (!certModal) return;

    function switchCertTab(target) {
      tabButtons.forEach((tab) => {
        const isActive = tab.getAttribute('data-cert-target') === target;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      certPanels.forEach((panel) => {
        const isTarget = panel.id === `cert-panel-${target}`;
        if (isTarget) {
          panel.classList.add('active');
          panel.removeAttribute('hidden');
        } else {
          panel.classList.remove('active');
          panel.setAttribute('hidden', 'true');
        }
      });
    }

    function openCertModal(certTarget) {
      if (certTarget) {
        switchCertTab(certTarget);
      }
      certModal.classList.add('open');
      certModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (certCloseBtn) certCloseBtn.focus();
    }

    function closeCertModal() {
      certModal.classList.remove('open');
      certModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    certTriggers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-open-cert');
        openCertModal(target);
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const target = btn.getAttribute('data-open-cert');
          openCertModal(target);
        }
      });
    });

    tabButtons.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-cert-target');
        switchCertTab(target);
      });
    });

    if (certCloseBtn) {
      certCloseBtn.addEventListener('click', closeCertModal);
    }

    // Close on backdrop click
    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) {
        closeCertModal();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && certModal.classList.contains('open')) {
        closeCertModal();
      }
    });
  }

  initCertModal();

  // ————————————————————————————————————
  // 9.7. 1-CLICK COPY EMAIL TO CLIPBOARD
  // ————————————————————————————————————
  function initCopyEmail() {
    const copyBtn = $('#copy-email-btn');
    const emailToast = $('#email-toast');
    let toastTimeout = null;

    if (!copyBtn) return;

    copyBtn.addEventListener('click', async () => {
      const email = 'guyhd9119@gmail.com';

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = email;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }

        if (emailToast) {
          emailToast.classList.add('show');
          if (toastTimeout) clearTimeout(toastTimeout);
          toastTimeout = setTimeout(() => {
            emailToast.classList.remove('show');
          }, 3200);
        }

        announceToSR('Email address copied to clipboard');
      } catch (err) {
        console.error('Failed to copy email:', err);
      }
    });
  }

  initCopyEmail();

  // ————————————————————————————————————
  // 10. FOOTER YEAR
  // ————————————————————————————————————
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // ————————————————————————————————————
  // 11. SMOOTH SCROLL FOR ANCHOR LINKS & MOBILE NAV
  // ————————————————————————————————————
  function smoothScrollTo(targetEl, targetId) {
    if (!targetEl) return;
    const headerEl = $('#header');
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 70;
    const targetRect = targetEl.getBoundingClientRect();
    const targetPos = targetRect.top + window.pageYOffset - headerHeight;

    isProgrammaticScroll = true;
    if (headerEl) headerEl.classList.remove('hidden');

    window.scrollTo({
      top: Math.max(0, targetPos),
      behavior: 'smooth'
    });

    if (targetId && history.pushState) {
      history.pushState(null, null, targetId);
    }

    setTimeout(() => {
      isProgrammaticScroll = false;
      lastScrollY = window.scrollY;
      updateActiveNav();
    }, 850);
  }

  // Handle mobile nav links safely without jumping
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        closeMobileNav(false); // Do not focus hamburger! Prevents scroll-to-top jump
        if (href) {
          const hashIndex = href.indexOf('#');
          if (hashIndex !== -1) {
            const hash = href.substring(hashIndex);
            const path = href.substring(0, hashIndex);
            const isCurrentPage =
              !path ||
              path === window.location.pathname.split('/').pop() ||
              (window.location.pathname.endsWith('/') && (path === 'index.html' || path === ''));
            if (isCurrentPage && hash !== '#') {
              const targetEl = $(hash);
              if (targetEl) {
                e.preventDefault();
                setTimeout(() => {
                  smoothScrollTo(targetEl, hash);
                }, 60);
              }
            }
          }
        }
      });
    });
  }

  // Handle all in-page anchor links (header desktop nav, buttons, etc.)
  $$('a[href^="#"]').forEach((anchor) => {
    if (anchor.closest('#mobile-nav')) return;

    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = $(targetId);
      if (targetEl) {
        e.preventDefault();
        smoothScrollTo(targetEl, targetId);
      }
    });
  });

  // Handle cross-page / hash landing on page load (e.g. index.html#certificates)
  if (window.location.hash) {
    const hash = window.location.hash;
    const targetEl = $(hash);
    if (targetEl) {
      setTimeout(() => {
        smoothScrollTo(targetEl, hash);
      }, 250);
    }
  }

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
