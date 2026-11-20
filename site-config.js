/* ===================== ALZAHRAA LIVE CONFIG LOADER =====================
   ضع هنا رابط الـ Web app URL الخاص بشيت الإعدادات (نفس الرابط اللي في admin.html)
*/
const ALZAHRAA_SETTINGS_API_URL = 'https://script.google.com/macros/s/AKfycbzfTu68NYIkCWdm-P8sIQUcTGZXL_oeUyqZJ6KtocxZ6MruOwGcbaXZf-S07vS-AsKm/exec';

window.ALZAHRAA_CONFIG = null;
window._alzahraaConfigCallbacks = [];

window.onAlzahraaConfigReady = function (cb) {
  if (window.ALZAHRAA_CONFIG) {
    cb(window.ALZAHRAA_CONFIG);
  } else {
    window._alzahraaConfigCallbacks.push(cb);
  }
};

function renderTopAnnouncementBanner_(text) {
  if (!text || document.getElementById('alzahraa-top-banner')) return;
  const bar = document.createElement('div');
  bar.id = 'alzahraa-top-banner';
  bar.className = 'w-full bg-plum-900 text-white text-center text-xs sm:text-sm font-bold py-2.5 px-4';
  bar.textContent = text;
  document.body.insertBefore(bar, document.body.firstChild);
}

(async function loadLiveSettings_() {
  if (!ALZAHRAA_SETTINGS_API_URL || ALZAHRAA_SETTINGS_API_URL.includes('YOUR_SETTINGS_API_URL')) {
    return;
  }
  try {
    const res = await fetch(`${ALZAHRAA_SETTINGS_API_URL}?mode=public`);
    const cfg = await res.json();
    if (!cfg || cfg.status !== 'success') return;

    window.ALZAHRAA_CONFIG = cfg;

    // 1) تفعيل الشريط الإعلاني أعلى كل الصفحات لو متفعل من الأدمن
    if (cfg.banner_enabled && cfg.banner_text) {
      renderTopAnnouncementBanner_(cfg.banner_text);
    }

    // 2) تحديث رابط ريفيوهات جوجل درايف تلقائياً
    if (cfg.reviews_drive_url) {
      document.querySelectorAll('[data-reviews-drive]').forEach(el => {
        el.href = cfg.reviews_drive_url;
      });
    }

    // 3) تحديث روابط واتساب الجملة (تفعيل الجملة)
    if (cfg.wholesale_whatsapp) {
      const wText = encodeURIComponent('مرحباً، أرغب في تفعيل حساب/طلب الجملة والحصول على كلمة المرور');
      document.querySelectorAll('[data-wholesale-activate]').forEach(el => {
        el.href = `https://wa.me/${cfg.wholesale_whatsapp}?text=${wText}`;
      });
    }

    // 4) إبلاغ الصفحة الحالية بالتحديثات (كلمات المرور / أكواد الموظفين / أرقام الواتساب)
    window._alzahraaConfigCallbacks.forEach(fn => {
      try { fn(cfg); } catch (e) { console.error(e); }
    });
    window._alzahraaConfigCallbacks = [];

  } catch (err) {
    console.warn('Could not load live settings, using fallback values:', err);
  }
})();