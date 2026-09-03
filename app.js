import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { LocalNotifications } from '@capacitor/local-notifications';

// ==========================================
// 1. REKLAM KİMLİKLERİ (AD UNIT IDs)
// ==========================================
// AdMob panelinden aldığın (sonu / ile biten) ID'leri buraya yapıştır:
const ADMOB_BANNER_ID = 'ca-app-pub-6791068479641990/1929671055'; // BURAYA BANNER REKLAM ID'Nİ YAZ
const ADMOB_INTERSTITIAL_ID = 'ca-app-pub-6791068479641990/1597769618'; // BURAYA GEÇİŞ REKLAM ID'Nİ YAZ

// ==========================================
// 2. ADMOB BAŞLATMA VE BANNER GÖSTERME
// ==========================================
async function initAdMob() {
  try {
    // AdMob SDK Başlat
    await AdMob.initialize();

    // Banner Reklam Yükle ve En Alta Hizala
    await AdMob.showBanner({
      adId: ADMOB_BANNER_ID,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false // Mağazaya gönderirken false olmalı
    });
    console.log("Banner reklam başarıyla yüklendi.");
  } catch (error) {
    console.error("AdMob Başlatma Hatası:", error);
  }
}

// ==========================================
// 3. GEÇİŞ REKLAMI (INTERSTITIAL) GÖSTERME
// ==========================================
// Alışkanlık tamamlama veya yeni alışkanlık ekleme fonksiyonunun sonuna ekleyebilirsin:
async function showInterstitialAd() {
  try {
    await AdMob.prepareInterstitial({
      adId: ADMOB_INTERSTITIAL_ID,
      isTesting: false
    });
    await AdMob.showInterstitial();
  } catch (error) {
    console.error("Geçiş Reklamı Gösterme Hatası:", error);
  }
}

// ==========================================
// 4. YEREL BİLDİRİM (LOCAL NOTIFICATION) İZİNLERİ VE BİLDİRİM KURMA
// ==========================================
async function initNotifications() {
  try {
    // Bildirim İzni İste
    const permResult = await LocalNotifications.requestPermissions();
    if (permResult.display === 'granted') {
      console.log("Bildirim izni alındı.");
    }
  } catch (error) {
    console.error("Bildirim İzni Hatası:", error);
  }
}

// Günlük Hatırlatıcı Bildirim Zamanlama Fonksiyonu
async function scheduleDailyReminder(id, title, body, hour, minute) {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body,
          id: id,
          schedule: {
            on: {
              hour: hour,
              minute: minute
            },
            repeats: true,
            every: 'day'
          },
          actionTypeId: '',
          extra: null
        }
      ]
    });
  } catch (error) {
    console.error("Bildirim Kurma Hatası:", error);
  }
}

// ==========================================
// 5. UYGULAMA YÜKLENDİĞİNDE ÇALIŞTIR
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Servisleri ve reklamları başlat
  initAdMob();
  initNotifications();
});
