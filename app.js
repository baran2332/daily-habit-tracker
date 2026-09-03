// ==========================================
// 1. REKLAM KİMLİKLERİ (AD UNIT IDs)
// ==========================================
const ADMOB_BANNER_ID = 'ca-app-pub-6791068479641990/1929671055'; // BURAYA BANNER ID'Nİ YAZ
const ADMOB_INTERSTITIAL_ID = 'ca-app-pub-6791068479641990/1597769618'; // BURAYA GEÇİŞ ID'Nİ YAZ

// ==========================================
// 2. ADMOB BAŞLATMA VE BANNER GÖSTERME
// ==========================================
async function initAdMob() {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
    const { AdMob } = window.Capacitor.Plugins;
    try {
      await AdMob.initialize();
      await AdMob.showBanner({
        adId: ADMOB_BANNER_ID,
        adSize: 'BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
        isTesting: false
      });
      console.log("Banner yüklendi.");
    } catch (e) {
      console.log("AdMob Hatası:", e);
    }
  }
}

// ==========================================
// 3. GEÇİŞ REKLAMI GÖSTERME
// ==========================================
async function showInterstitialAd() {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
    const { AdMob } = window.Capacitor.Plugins;
    try {
      await AdMob.prepareInterstitial({
        adId: ADMOB_INTERSTITIAL_ID,
        isTesting: false
      });
      await AdMob.showInterstitial();
    } catch (e) {
      console.log("Geçiş Reklamı Hatası:", e);
    }
  }
}

// ==========================================
// 4. BİLDİRİMLERİ BAŞLATMA
// ==========================================
async function initNotifications() {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
    const { LocalNotifications } = window.Capacitor.Plugins;
    try {
      await LocalNotifications.requestPermissions();
    } catch (e) {
      console.log("Bildirim Hatası:", e);
    }
  }
}

// ==========================================
// 5. UYGULAMA YÜKLENDİĞİNDE ÇALIŞTIR
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initAdMob();
  initNotifications();
});
