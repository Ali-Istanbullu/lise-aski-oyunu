# 💛 Lise Aşkı — Web Visual Novel

Türkçe, web tabanlı görsel roman oyunu. Seçimlerinle şekillenen lise aşk hikayesi.

## 🎮 Özellikler

- 👤 Kullanıcı kaydı ve girişi (JWT ile güvenli)
- 💾 Kaldığı yerden devam (otomatik kayıt)
- 📖 15 sahne, 3 farklı son
- 📱 Mobil uyumlu
- 🎨 Anime-tarzı görseller

## 🏗️ Mimari

```
SOLID Prensipleri:
S → AuthService, SaveService, StoryService (tek sorumluluk)
O → SceneManager registry ile genişletilebilir
L → Tüm servisler mock ile swap edilebilir
I → AuthInterface, SaveInterface ayrı
D → Dependency Injection (test edilebilir)
```

## 📁 Yapı

```
visual-novel/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/       # DB singleton
│   │   ├── controllers/  # HTTP handlers
│   │   ├── services/     # İş mantığı (SOLID)
│   │   ├── repositories/ # Veri erişimi
│   │   ├── middleware/   # Auth + Error
│   │   └── routes/       # API routes
│   └── tests/
│       ├── unit/         # Jest unit testler
│       └── integration/  # Supertest entegrasyon
├── frontend/         # Vanilla HTML/CSS/JS
│   ├── src/
│   │   ├── engine/   # GameEngine, SceneManager, DialogueBox
│   │   ├── auth/     # AuthManager
│   │   ├── api/      # ApiClient
│   │   └── styles/   # CSS Design System
│   └── assets/       # Görseller
├── .github/
│   └── workflows/
│       ├── ci.yml    # Test + Lint (PR'da)
│       └── deploy.yml # Render deploy (main'de)
└── render.yaml       # Render.com config
```

## 🚀 Kurulum (Local)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```
frontend/index.html dosyasını Live Server ile aç
VS Code → Live Server → Go Live
```

## 🧪 Testler

```bash
cd backend
npm test              # Tüm testler
npm run test:unit     # Sadece unit
npm run test:integration  # Sadece entegrasyon
npm run coverage      # Coverage raporu
```

Test Coverage Hedefi: **%80+**

## 🌐 Deploy (Render.com)

1. Projeyi GitHub'a push et
2. [render.com](https://render.com) → New Web Service
3. GitHub repo bağla, `render.yaml` otomatik algılanır
4. `JWT_SECRET` env değişkenini ayarla
5. `frontend/src/api/ApiClient.js` içinde `BASE_URL`'i Render URL'siyle güncelle

### GitHub Actions Secrets (CI/CD için)

```
RENDER_API_KEY=render-api-anahtarın
RENDER_SERVICE_ID=render-servis-id
RENDER_BACKEND_URL=https://lise-aski-backend.onrender.com
```

## 📖 API Endpoints

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| POST | `/api/auth/register` | - | Kayıt |
| POST | `/api/auth/login` | - | Giriş |
| GET | `/api/auth/me` | ✅ | Profil |
| GET | `/api/game/save` | ✅ | Kayıt getir |
| POST | `/api/game/save` | ✅ | Kayıt güncelle |
| DELETE | `/api/game/save` | ✅ | Kayıt sıfırla |
| GET | `/api/game/scene/:id` | ✅ | Sahne getir |
| POST | `/api/game/choice` | ✅ | Seçim yap |

## 📜 Lisans

MIT © 2024
