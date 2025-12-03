// Basic diagnostic so you can confirm the script loaded in the browser console
console.log('main.js loaded');

// Mobile menu toggle
const mobileBtn = document.getElementById('mobileBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener('click', () => {
    const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
    mobileBtn.setAttribute('aria-expanded', String(!expanded));
    mobileMenu.classList.toggle('hidden');
  });
}

// Modal / Gallery interactions
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const closeBtn = document.getElementById('closeBtn');
const modalControls = document.getElementById('modalControls');

let scale = 1;

// Attach image load/error handlers to help with production debugging and fallback
if (modalImg) {
  modalImg.addEventListener('load', () => {
    // image loaded successfully; ensure controls are visible
    if (modalControls) modalControls.style.display = 'flex';
  });

  modalImg.addEventListener('error', (ev) => {
    const attempted = modalImg.getAttribute('src') || '';
    console.error('Modal image failed to load:', attempted, ev);
    // If the attempted src was a sanitized URL, try the raw relative path once
    const raw = modalImg.dataset.raw || '';
    if (raw && attempted !== raw) {
      console.warn('Retrying modal image with raw path:', raw);
      modalImg.removeAttribute('src');
      // small timeout to allow browser to retry cleanly
      setTimeout(() => { modalImg.src = raw; }, 50);
    }
  });
}

// Safe URL sanitizer to avoid javascript: or other unsafe schemes
function safeUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';
  try {
    // Allow relative and absolute http/https URLs
    const u = new URL(raw, location.href);
    if (u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'data:') return u.href;
  } catch (e) {
    return '';
  }
  return '';
}

// Open thumbnails (uses data-full for full-res and data-caption for caption)
// Use event delegation so clicks are handled even if elements are added later
document.addEventListener('click', (e) => {
  // Allow clicks on the image itself, the overlay or the small view button
  const clickedThumb = e.target.closest && e.target.closest('.gallery-thumb');
  const clickedItem = e.target.closest && e.target.closest('.gallery-item');
  const img = clickedThumb || (clickedItem && clickedItem.querySelector('.gallery-thumb'));
  if (!img) return;
  try {
     const full = img.dataset.full || img.src || '';
     const caption = img.dataset.caption || img.alt || '';
    if (!modal) {
      console.error('Modal element not found (#imageModal)');
      return;
    }
    // ensure modal becomes visible and centered
    modal.style.display = 'flex';
    // compute safe URL and assign to image
    const safe = safeUrl(full);
    // store raw path on the image element so the error handler can retry if needed
    if (modalImg) modalImg.dataset.raw = full;
    // prefer sanitized URL; fall back to raw immediately if sanitizer returned empty
    modalImg && (modalImg.src = safe || full);
    
    scale = 1;
    if (modalImg) modalImg.style.transform = 'scale(1)';
    if (modalControls) modalControls.style.display = 'flex';
  } catch (err) {
    console.error('Error opening gallery image', err);
  }
});

if (zoomInBtn) {
  zoomInBtn.addEventListener('click', () => {
    scale = Math.min(3, +(scale + 0.15).toFixed(2));
    modalImg.style.transform = `scale(${scale})`;
  });
}

if (zoomOutBtn) {
  zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(0.2, +(scale - 0.15).toFixed(2));
    modalImg.style.transform = `scale(${scale})`;
  });
}

const closeModal = () => {
  // hide via inline style to ensure it appears above everything when open
  modal.style.display = 'none';
  if (modalControls) modalControls.style.display = 'none';
};

if (closeBtn) closeBtn.addEventListener('click', closeModal);

// Close when clicking outside the image
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// Close on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Gallery filters removed (no categorization)

// FAQ accordion & smooth open/close (scoped per column)
const faqCols = Array.from(document.querySelectorAll('.faq-col'));

faqCols.forEach(col => {
  const items = Array.from(col.querySelectorAll('.faq-item'));
  items.forEach(item => {
    const body = item.querySelector('.faq-body');
    if (body) body.style.maxHeight = item.open ? body.scrollHeight + 'px' : '0px';
    item.addEventListener('toggle', () => {
      const b = item.querySelector('.faq-body');
      if (item.open) {
        // close other items only within the same column
        items.forEach(other => {
          if (other !== item) {
            other.open = false;
            const ob = other.querySelector('.faq-body');
            if (ob) ob.style.maxHeight = '0px';
          }
        });
        if (b) b.style.maxHeight = b.scrollHeight + 'px';
      } else {
        if (b) b.style.maxHeight = '0px';
      }
    });
  });
});

// Initialize AOS (Animate On Scroll)
try {
  if (window.AOS) {
    AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic' });
  }
} catch (err) {
  console.warn('AOS init failed', err);
}

