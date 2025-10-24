document.addEventListener('DOMContentLoaded', function () {
  // Intro enabled: keep content hidden until intro completes
  // try { document.body.classList.remove('content-hidden'); } catch (e) {}

  
  var overlay = document.getElementById('intro-overlay');
  var video = document.getElementById('intro-video');
  var logoOverlay = document.getElementById('logo-overlay');
  if (!overlay || !video) return;

  // Query param overrides: ?intro=1 (force show), ?intro=0 (force skip)
  var params;
  try { params = new URLSearchParams(window.location.search); } catch (e) { params = null; }
  var forceIntro = params && params.get('intro') === '1';
  var forceSkip = params && params.get('intro') === '1';
  if (forceIntro) {
    try {
      if (window.sessionStorage) window.sessionStorage.removeItem('introSeen');
      if (window.localStorage) window.localStorage.removeItem('introSeen'); // cleanup old behavior
    } catch (e) {}
  }

  // If intro was already seen in this session, skip overlays and show content immediately
  try {
    var introSeen = window.sessionStorage && window.sessionStorage.getItem('introSeen') === '1';
    if (introSeen || forceSkip) {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (logoOverlay && logoOverlay.parentNode) logoOverlay.parentNode.removeChild(logoOverlay);
      document.body.classList.remove('content-hidden');
      return;
    }
  } catch (e) {}

  // Configurable playback rate from data-attribute, fallback 1
  var speedAttr = overlay.getAttribute('data-intro-speed');
  var playbackRate = parseFloat(speedAttr);
  if (isNaN(playbackRate) || playbackRate <= 0) playbackRate = 1;
  video.playbackRate = playbackRate;

  // Safety timeout in case of stalled metadata or errors
  var maxWaitMs = 12000; // 12s default cap
  var safetyTimer = setTimeout(hideOverlay, maxWaitMs);

  // Hide overlay helper
  function hideOverlay() {
    overlay.classList.add('hide');
    // Remove from DOM after transition for performance
    setTimeout(function () {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 1100);
    // After intro overlay hidden, show logo overlay if present
    if (logoOverlay) {
      showLogoOverlay();
    }
  }

  function showLogoOverlay() {
    if (!logoOverlay) return;
    // Ensure visible
    logoOverlay.classList.remove('hide');
    // Prefer waiting for CSS animation end on the spinning logo
    var logoImg = logoOverlay.querySelector('.logo-anim img');
    var logoDone = false;
    function finishLogoOnce() {
      if (logoDone) return;
      logoDone = true;
      hideLogoOverlay();
    }
    if (logoImg) {
      logoImg.addEventListener('animationend', finishLogoOnce, { once: true });
    }
    // Fallback in case animationend doesn't fire
    setTimeout(finishLogoOnce, 2000);
    // Click to skip
    logoOverlay.addEventListener('click', finishLogoOnce, { once: true });
  }

  function hideLogoOverlay() {
    if (!logoOverlay) return;
    logoOverlay.classList.add('hide');
    setTimeout(function () {
      if (logoOverlay && logoOverlay.parentNode) {
        logoOverlay.parentNode.removeChild(logoOverlay);
      }
    }, 1100);
    // Reveal page content after logo overlay is gone
    try {
      document.body.classList.remove('content-hidden');
      // Persist that intro has been seen for this session only
      if (window.sessionStorage) {
        window.sessionStorage.setItem('introSeen', '1');
      }
    } catch (e) {}
  }

  // End when video finishes
  video.addEventListener('ended', function () {
    clearTimeout(safetyTimer);
    hideOverlay();
  });

  // If video can play, ensure playbackRate is applied and start
  video.addEventListener('loadedmetadata', function () {
    video.playbackRate = playbackRate;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(function () {
        // Autoplay blocked; allow click to play/skip
      });
    }
  });

  // Click to skip
  overlay.addEventListener('click', function () {
    try { video.pause(); } catch (e) {}
    clearTimeout(safetyTimer);
    hideOverlay();
  });



// Scroll efekti: video'yu gizle ve mat arka planı göster
window.addEventListener('scroll', function() {
  const video = document.getElementById('bg-video');
  const videoOverlay = document.getElementById('video-overlay');
  const matteBackground = document.getElementById('matte-background');
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  
  // Scroll yüzdesine göre opacity hesapla (0-1 arası)
  const scrollPercent = Math.min(scrollY / (windowHeight * 0.6), 1);
  
  // Video'yu tamamen gizle
  const videoOpacity = 1 - scrollPercent;
  
  // Video overlay'i tamamen gizle
  const overlayOpacity = 1 - scrollPercent;
  
  // Mat arka planı tamamen göster
  const matteOpacity = scrollPercent;
  
  if (video) {
    video.style.opacity = Math.max(0, videoOpacity);
  }
  
  if (videoOverlay) {
    videoOverlay.style.opacity = Math.max(0, overlayOpacity);
  }
  
  if (matteBackground) {
    matteBackground.style.opacity = matteOpacity;
  }
});

});