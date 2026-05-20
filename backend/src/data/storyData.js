/**
 * storyData.js — Lise Aşkı hikaye verisi
 * 15 sahne, 3 farklı son (A: Elif ile mutlu son, B: Yalnız son, C: Selin ile son)
 *
 * SOLID: Open/Closed — Yeni sahneler bu dosyaya eklenerek genişletilebilir
 */

const STORY_DATA = {
  // ══════════════════════════════════════
  //  BÖLÜM 1: YENİ BAŞLANGIÇ
  // ══════════════════════════════════════
  1: {
    title: 'İlk Gün',
    background: 'corridor',
    character: null,
    text: 'Yeni okulum Çınar Lisesi\'nin koridorlarında yürüyorum. Sınıfımı bulmaya çalışırken elimdeki harita düşüyor...',
    choices: [],
    next: 2,
  },

  2: {
    title: 'İlk Karşılaşma',
    background: 'corridor',
    character: 'elif',
    characterSide: 'right',
    text: '"Dur bir saniye," diyor yanımdan geçen esmer saçlı kız. "Haritanı düşürdün. Ben de 10-B\'yim, beraber gidelim."',
    choices: [
      {
        text: '"Teşekkür ederim, ben Kerem." (Samimi)',
        nextScene: 3,
        flags: { elifAffection: 1 },
      },
      {
        text: '"Gerek yok, yolumu bulabilirim." (Soğuk)',
        nextScene: 3,
        flags: { elifAffection: -1 },
      },
    ],
  },

  3: {
    title: 'Sınıfta İlk Gün',
    background: 'classroom',
    character: 'mert',
    characterSide: 'left',
    text: '"Yeni misin? Ben Mert! Yan yana oturalım, bu sınıfta kaybolmamak için bir rehbere ihtiyacın var." diye gülerek uzanıyor en arka sıradan.',
    choices: [],
    next: 4,
  },

  4: {
    title: 'Teneffüs',
    background: 'corridor',
    character: 'selin',
    characterSide: 'right',
    text: 'Teneffüste sınıfın en popüler kızı Selin yanıma geliyor. "Yeni misin? Çınar\'a hoş geldin. Burada sana lazım olabilirim." diyor.',
    choices: [
      {
        text: '"Tanıştığıma memnun oldum, Selin."',
        nextScene: 5,
        flags: { selinAffection: 1 },
      },
      {
        text: 'Kibarca gülümser, ama Elif\'i ararsın.',
        nextScene: 5,
        flags: { elifAffection: 1 },
      },
    ],
  },

  // ══════════════════════════════════════
  //  BÖLÜM 2: GELİŞEN İLİŞKİLER
  // ══════════════════════════════════════
  5: {
    title: 'Kütüphanede Tesadüf',
    background: 'library',
    character: 'elif',
    characterSide: 'right',
    text: 'Ödevini yaparken kütüphanede tekrar Elif\'le karşılaşıyorsun. "Tarih ödevinde takıldım..." diyor sessizce.',
    choices: [
      {
        text: '"Birlikte çözebiliriz, anlattığım bir konu vardı."',
        nextScene: 6,
        flags: { elifAffection: 2 },
      },
      {
        text: '"Özür dilerim, benim de ödevim var."',
        nextScene: 6,
        flags: { elifAffection: 0 },
      },
    ],
  },

  6: {
    title: 'Müzik Kulübü',
    background: 'classroom',
    character: 'mert',
    characterSide: 'left',
    text: '"Kardeşim, müzik kulübüne kayıt yaptırdım, sen de gel! Elif de orada çello çalıyor..." diyor Mert, kaşlarını oynata oynata.',
    choices: [
      {
        text: 'Kulübe kaydol.',
        nextScene: 7,
        flags: { joinedClub: true, elifAffection: 1 },
      },
      {
        text: 'Hayır de, ama merak et.',
        nextScene: 7,
        flags: { joinedClub: false },
      },
    ],
  },

  7: {
    title: 'Yağmurlu Gün',
    background: 'rainy',
    character: 'elif',
    characterSide: 'right',
    text: 'Okuldan çıktığında şiddetli yağmur başlıyor. Elif şemsiyesiz, kapıda bekliyor. "Eğer... beraber gideceksen, paylaşabiliriz şemsiyemi." diyor kızararak.',
    choices: [
      {
        text: '"Tabii ki, teşekkür ederim Elif."',
        nextScene: 8,
        flags: { elifAffection: 3, sharedUmbrella: true },
      },
      {
        text: '"Ben bekleyebilirim, sen git."',
        nextScene: 8,
        flags: { elifAffection: 1 },
      },
    ],
  },

  // ══════════════════════════════════════
  //  BÖLÜM 3: KARAR NOKTALARI
  // ══════════════════════════════════════
  8: {
    title: 'Okul Gezisi',
    background: 'corridor',
    character: null,
    text: 'Okul gezisi günü geliyor. Otobüste iki boş koltuk var: Elif\'in yanı ve Selin\'in yanı...',
    choices: [
      {
        text: 'Elif\'in yanına otur. (Karar Noktası #1)',
        nextScene: 9,
        flags: { elifPath: true },
      },
      {
        text: 'Selin\'in yanına otur. (Karar Noktası #1)',
        nextScene: 9,
        flags: { selinPath: true },
      },
    ],
  },

  9: {
    title: 'Gezi Dönüşü',
    background: 'classroom',
    character: 'mert',
    characterSide: 'left',
    text: '"Güzel geçti değil mi?" diye soruyor Mert. "Bir de... Elif sana bakarken gördüm. Ciddi söylüyorum, bir şey var orada."',
    choices: [],
    next: 10,
  },

  10: {
    title: 'Kavga',
    background: 'corridor',
    character: 'elif',
    characterSide: 'right',
    text: 'Bir yanlış anlaşılma yüzünden Elif seninle küsüyor. "Sanmıştım ki farklısın..." diyip gidiyor. Ne yapacaksın?',
    choices: [
      {
        text: 'Hemen arkasından git, özür dile. (Karar Noktası #2)',
        nextScene: 11,
        flags: { apologized: true, elifAffection: 3 },
      },
      {
        text: 'Bırak gitsin, o zaman bilirsin.',
        nextScene: 11,
        flags: { apologized: false, elifAffection: -2 },
      },
    ],
  },

  // ══════════════════════════════════════
  //  BÖLÜM 4: SONUÇ
  // ══════════════════════════════════════
  11: {
    title: 'Mezuniyet Yaklaşıyor',
    background: 'classroom',
    character: null,
    text: 'Son sınıfın son haftası. Mezuniyet balosu yaklaşıyor. Mert soruyor: "Kiminle gidiyorsun balo\'ya?"',
    choices: [],
    next: 12,
  },

  12: {
    title: 'İtiraf Gecesi',
    background: 'rainy',
    character: 'elif',
    characterSide: 'right',
    text: 'Okulun çatısında, şehrin ışıklarını seyrederken Elif yanına geliyor. "Sana bir şey söylemem gerekiyor..." diyor, sesi titriyor.',
    choices: [
      {
        text: '"Ben de..." de ve elini tut. (Karar Noktası #3)',
        nextScene: 13,
        flags: { confessed: true },
      },
      {
        text: 'Sessiz kal ve bekle.',
        nextScene: 14,
        flags: { confessed: false },
      },
    ],
  },

  // ══════════════════════════════════════
  //  SONLAR
  // ══════════════════════════════════════
  13: {
    title: '✨ Son A: Birlikte',
    background: 'classroom',
    character: 'elif',
    characterSide: 'right',
    isEnding: true,
    endingType: 'A',
    text: 'Elif gülümsüyor — o sıcak, nadir gülümsemesi. "Ben de seni... çok düşünüyordum." Şehrin ışıkları aşağıda parlıyor. Bu an, hayatınızın en güzel anı.\n\n💛 SON: BİRLİKTE',
    choices: [],
    next: null,
  },

  14: {
    title: '💔 Son B: Vedalar',
    background: 'rainy',
    character: null,
    isEnding: true,
    endingType: 'B',
    text: 'Sessizliğin içinde Elif yavaşça döner ve gider. Belki de bazı şeyler söylenmeden daha güzeldir. Ya da belki sadece cesaret gerekiyordu...\n\n💔 SON: VEDALAR',
    choices: [],
    next: null,
  },

  15: {
    title: '🌸 Son C: Yeni Başlangıç',
    background: 'corridor',
    character: 'selin',
    characterSide: 'right',
    isEnding: true,
    endingType: 'C',
    text: 'Bazen hayat bizi beklediğimiz kişiden farklı biriyle buluşturur. Selin\'in gülüşü bu defa gerçek hissettiriyor.\n\n🌸 SON: YENİ BAŞLANGIÇ',
    choices: [],
    next: null,
  },
};

module.exports = STORY_DATA;
