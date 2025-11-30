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
const modalCaption = document.getElementById('modalCaption');
const modalDownload = document.getElementById('modalDownload');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const closeBtn = document.getElementById('closeBtn');
const modalControls = document.getElementById('modalControls');

let scale = 1;

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
document.querySelectorAll('.gallery-thumb').forEach((img) => {
  img.addEventListener('click', (e) => {
    const full = img.dataset.full || img.src;
    const caption = img.dataset.caption || img.alt || '';
    // ensure modal becomes visible and centered
    modal.style.display = 'flex';
    modalImg.src = safeUrl(full) || '';
    if (modalCaption) modalCaption.textContent = caption;
    if (modalDownload) modalDownload.href = safeUrl(full) || '';
    scale = 1;
    modalImg.style.transform = 'scale(1)';
    if (modalControls) modalControls.classList.remove('hidden');
  });
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
  if (modalControls) modalControls.classList.add('hidden');
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
