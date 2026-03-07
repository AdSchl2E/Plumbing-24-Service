// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = mobileMenuButton.querySelector('svg:first-child');
const closeIcon = mobileMenuButton.querySelector('svg:last-child');
let isMenuOpen = false;

function toggleMobileMenu() {
  isMenuOpen = !isMenuOpen;
  
  // Toggle menu visibility
  mobileMenu.classList.toggle('hidden');
  
  // Toggle icons
  if (isMenuOpen) {
    menuIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');
    mobileMenuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
  } else {
    menuIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = ''; // Re-enable scrolling
  }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      // Close mobile menu if open
      if (isMenuOpen) {
        toggleMobileMenu();
      }
      
      // Calculate the header height for offset
      const headerHeight = document.querySelector('header').offsetHeight;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - (headerHeight + 20);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Form validation and submission
const contactForm = document.getElementById('contact-form');
const contactFormBottom = document.getElementById('contact-form-bottom');
const toastSuccess = document.getElementById('toast-success');
const toastSuccessBottom = document.getElementById('toast-success-bottom');

function showToast(toastElement) {
  if (!toastElement) return;
  
  toastElement.classList.remove('opacity-0', 'pointer-events-none');
  
  setTimeout(() => {
    toastElement.classList.add('opacity-0', 'pointer-events-none');
  }, 5000);
}

function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('border-red-500');
      
      // Add error message if not already present
      if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('text-red-500')) {
        const error = document.createElement('p');
        error.className = 'text-red-500 text-sm mt-1';
        error.textContent = 'This field is required';
        field.parentNode.insertBefore(error, field.nextSibling);
      }
    } else {
      field.classList.remove('border-red-500');
      // Remove error message if exists
      if (field.nextElementSibling && field.nextElementSibling.classList.contains('text-red-500')) {
        field.nextElementSibling.remove();
      }
      
      // Additional validation for email
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        isValid = false;
        field.classList.add('border-red-500');
        const error = document.createElement('p');
        error.className = 'text-red-500 text-sm mt-1';
        error.textContent = 'Please enter a valid email address';
        field.parentNode.insertBefore(error, field.nextSibling);
      }
      
      // Additional validation for phone
      if (field.type === 'tel' && !/^\+?[\d\s-()]{7,}$/.test(field.value)) {
        isValid = false;
        field.classList.add('border-red-500');
        const error = document.createElement('p');
        error.className = 'text-red-500 text-sm mt-1';
        error.textContent = 'Please enter a valid phone number';
        field.parentNode.insertBefore(error, field.nextSibling);
      }
    }
  });
  
  return isValid;
}

function handleFormSubmit(e, form, toastElement) {
  e.preventDefault();
  
  // Honeypot check
  const honeypot = form.querySelector('input[name="website"]');
  if (honeypot && honeypot.value.trim() !== '') {
    // Likely a bot, don't submit
    return false;
  }
  
  if (validateForm(form)) {
    // In a real app, you would send the form data to a server here
    // For now, we'll just show a success message
    
    // Show success toast
    showToast(toastElement);
    
    // Reset form
    form.reset();
    
    // Remove any error messages
    form.querySelectorAll('.text-red-500').forEach(el => el.remove());
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.classList.remove('border-red-500');
    });
    
    return true;
  }
  
  return false;
}

// Add event listeners
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    handleFormSubmit(e, contactForm, toastSuccess);
  });
}

if (contactFormBottom) {
  contactFormBottom.addEventListener('submit', (e) => {
    handleFormSubmit(e, contactFormBottom, toastSuccessBottom);
  });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (isMenuOpen && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
    toggleMobileMenu();
  }
});

// Initialize
if (mobileMenuButton) {
  mobileMenuButton.addEventListener('click', toggleMobileMenu);
}

// Add loading state to buttons
document.querySelectorAll('button[type="submit"]').forEach(button => {
  button.addEventListener('click', function() {
    if (this.form && this.form.checkValidity()) {
      this.disabled = true;
      this.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      `;
      
      // Re-enable button after 3 seconds (for demo purposes)
      setTimeout(() => {
        this.disabled = false;
        this.innerHTML = `
          <i class="fas fa-paper-plane mr-2" aria-hidden="true"></i>
          Send Message
        `;
      }, 3000);
    }
  });
});
