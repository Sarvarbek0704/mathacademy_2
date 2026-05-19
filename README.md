# MathAcademy Digital Campus

Zamonaviy ta'lim muassasalari uchun to'liq raqamli boshqaruv tizimi. O'quvchilar, o'qituvchilar, ota-onalar va ma'muriyat uchun yagona platforma.

---

## Mundarija

- [Loyiha haqida](#loyiha-haqida)
- [Texnologiyalar](#texnologiyalar)
- [Arxitektura](#arxitektura)
- [Modullar va imkoniyatlar](#modullar-va-imkoniyatlar)
- [Boshlash](#boshlash)
- [Muhit o'zgaruvchilari](#muhit-ozgaruvchilari)
- [Ma'lumotlar bazasi](#malumotlar-bazasi)
- [API hujjatlari](#api-hujjatlari)
- [Foydalanuvchi rollari](#foydalanuvchi-rollari)
- [Loyiha tuzilmasi](#loyiha-tuzilmasi)

---

## Loyiha haqida

**MathAcademy Digital Campus** — ko'p ijarachilik (multi-tenant) arxitekturasida qurilgan, to'liq funksional ta'lim boshqaruv tizimi (LMS/SIS). Tizim uchta asosiy foydalanuvchi turiga xizmat qiladi:

- **Xodimlar (Staff)** — ma'muriyat, o'qituvchilar va operatorlar uchun keng funksional panel
- **Ota-onalar (Guardian)** — farzandining akademik holati, davomat va to'lovlarini kuzatish
- **Tizim** — har bir maktab/akademiya o'z tenantiga ega, ma'lumotlar to'liq izolyatsiya qilingan

---

## Texnologiyalar

### Backend
| Texnologiya | Versiya | Maqsad |
|---|---|---|
| **NestJS** | 11.0 | Asosiy framework (modular, DI) |
| **Prisma ORM** | 7.3 | Ma'lumotlar bazasi bilan ishlash |
| **PostgreSQL** | 15+ | Asosiy ma'lumotlar bazasi |
| **Redis** | 7+ | Kesh, auth lock, sessiya |
| **JWT** | — | Autentifikatsiya (access + refresh tokens) |
| **bcrypt** | 6.0 | Parollarni xeshlash |
| **Multer** | — | Fayl yuklash (avatar, media) |
| **Swagger** | 11.2 | API hujjatlari (`/api/docs`) |
| **class-validator** | — | DTO validatsiyasi |

### Frontend
| Texnologiya | Versiya | Maqsad |
|---|---|---|
| **React** | 18.3 | UI framework |
| **Vite** | 5.4 | Build tool va dev server |
| **TypeScript** | 5.x | Type safety |
| **TailwindCSS** | 3.4 | Utility-first CSS |
| **shadcn/ui** | — | UI komponentlar kutubxonasi (Radix UI) |
| **TanStack Query** | 5.x | Server state boshqaruv |
| **React Router** | 6.x | Client-side routing |
| **Recharts** | 2.x | Diagrammalar va grafiklar |
| **Framer Motion** | 12.x | Animatsiyalar |
| **dayjs** | — | Sana/vaqt boshqaruvi |
| **Zod** | 3.x | Forma validatsiyasi |

---

## Arxitektura

```
mathacademy-digital-campus/
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/      # 28 ta feature modul
│   │   │   ├── common/       # Guards, pipes, interceptors
│   │   │   ├── prisma/       # PrismaService
│   │   │   └── main.ts
│   │   └── prisma/
│   │       ├── schema.prisma # 56 ta model
│   │       └── seed.ts       # Demo ma'lumotlar
│   └── web/                  # React frontend
│       └── src/
│           ├── pages/
│           │   ├── staff/    # 30+ xodim sahifalari
│           │   └── guardian/ # 12 ota-ona sahifasi
│           ├── components/
│           │   ├── shared/   # DataTable, PageHeader, SlideOver...
│           │   └── ui/       # shadcn komponentlari
│           ├── hooks/        # useCrud, useAuth...
│           └── lib/          # api.ts, auth.tsx, utils.ts
└── packages/                 # Shared packages
```

### Multi-tenant arxitektura

Har bir muassasa (`tenant`) o'zining izolyatsiyalangan ma'lumotlariga ega. Barcha so'rovlarda `tenant_id` avtomatik qo'shiladi — bir tenant boshqasining ma'lumotlariga kira olmaydi.

```
Tenant A (mathacademy) ──► o'z o'quvchilari, guruhlari, to'lovlari
Tenant B (another-school) ──► to'liq izolyatsiya
```

---

## Modullar va imkoniyatlar

### Xodimlar paneli (Staff)

#### Akademik boshqaruv
- **O'quvchilar** — to'liq profil, guruhga qo'shish, avatar yuklash, shaxsiy sahifa (baholar, davomat, intizom, to'lovlar tarixi)
- **Guruhlar** — sinf/guruh boshqaruvi, o'quvchilarni qo'shish/o'chirish, fanlar bog'lash
- **Akademik yillar** — o'quv yili boshqaruvi
- **Fanlar** — fan katalogi va boshqaruvi
- **Yo'nalishlar (Tracks)** — o'quvchi yo'nalishlari
- **Kohortlar** — o'quvchilarni guruhlash (abituriyentlar, iqtidorlilar va h.k.)

#### Baholar va natijalar
- **Baholashlar (Assessments)** — turli turdagi imtihonlar: `REGULAR`, `BLOCK_TEST`, `MOCK_EXAM`, `FINAL`
  - BLOCK_TEST uchun 189 ballik maxsus tizim (matematika + ingliz + majburiy fanlar)
  - Guruhga ko'ra fanlarni avtomatik filtrlash
- **Reyting (Ranking)** — guruh bo'yicha o'quvchilar reytingi, ballar matritsasi
- **Sertifikatlar** — IELTS, SAT, olimpiada natijalari, kirish natijalari (`EARLY_ADMITTED`, `ON_TIME_ADMITTED`, `NOT_ADMITTED`)

#### Davomat
- **Dars jadvali (Timetable)** — haftalik grid va ro'yxat ko'rinishi, davomatni to'g'ridan-to'g'ri jadvaldan belgilash
- **Davomat** — sessiyalar bo'yicha, guruh bo'yicha, sanalar bo'yicha filtrlash

#### Intizom
- **Qoidabuzarliklar (Violations)** — intizom buzilishlarini qayd etish
- **Intizom choralari (Discipline Actions)** — choralar va ularning statusi
- **Ta'tillar (Leaves)** — sababli/sababsiz dars qoldirish so'rovlari

#### Moliya
- **Hisob-fakturalar (Invoices)** — to'lov majburiyatlari, muddatlar
- **To'lovlar (Payments)** — to'lov tarixi, naqd/karta/o'tkazma usullari
- **Billing** — oylik daromad diagrammasi, statistika
- **Yotoqxona billing** — yotoqxona to'lovlari
- **Ovqatlanish billing** — kunlik ovqatlanish to'lovlari

#### Infratuzilma
- **Yotoqxonalar (Dorms)** — bino va xonalar boshqaruvi, o'quvchilarni jinstosh xonalarga joylashtirish
- **Kampuslar** — jismoniy manzillar, xarita integratsiyasi
- **Dars jadvali** — jadval yaratish va tahrirlash, haftalik ko'rinish

#### Kommunikatsiya
- **Tadbirlar (Events)** — maktab tadbirlari va ishtirokchilar
- **E'lonlar (Announcements)** — xodimlar, o'quvchilar yoki ota-onalarga yo'naltirilgan xabarlar
- **Bildirishnomalar (Notifications)** — push va in-app bildirishnomalar
- **Mukofotlar (Awards)** — stipendiyalar, sertifikatlar, kuboklar
- **Musobaqalar (Competitions)** — olimpiada va musobaqalar, natijalar

#### Tizim
- **Rollar va ruxsatlar (RBAC)** — granular huquqlar tizimi
- **Foydalanuvchilar** — xodimlar ro'yxati va boshqaruvi
- **Hisobotlar (Reports)** — umumiy statistika, to'lov intizomi
- **Media markaz** — fayllar va rasm yuklash
- **Ekranlar (Displays)** — axborot ekranlari uchun kontent boshqaruvi

### Ota-onalar paneli (Guardian)

| Sahifa | Tavsif |
|---|---|
| **Dashboard** | Umumiy holat: baholar, davomat, oxirgi xabarlar |
| **O'quvchi profili** | Shaxsiy ma'lumotlar, guruh, yo'nalish |
| **Baholar** | Barcha imtihon natijalari va statistika |
| **Davomat** | Oylik davomat tarixi va foiz |
| **Intizom** | Qoidabuzarliklar va choralar |
| **To'lovlar** | Hisob-fakturalar va to'lov tarixi |
| **Tadbirlar** | Kelgusi va o'tgan tadbirlar |
| **Dars jadvali** | Haftalik dars jadvali |
| **Sertifikatlar** | O'quvchi sertifikatlari |
| **E'lonlar** | Maktabdan xabarlar |
| **Bildirishnomalar** | Push bildirishnomalar |

---

## Boshlash

### Talablar

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- pnpm 9+ (yoki npm/yarn)

### O'rnatish

```bash
# Repozitoriyni klonlash
git clone https://github.com/Sarvarbek0704/mathacademy_2.git
cd mathacademy_2

# Barcha bog'liqliklarni o'rnatish
npm install
```

### Backend sozlash

```bash
cd apps/api

# .env faylini yaratish
cp .env.example .env
# .env faylini tahrirlang (PostgreSQL, Redis, JWT kalitlari)

# Ma'lumotlar bazasini migratsiya qilish
npx prisma migrate deploy

# Demo ma'lumotlarni yuklash
npm run seed
```

### Frontend sozlash

```bash
cd apps/web

# .env faylini yaratish
echo "VITE_API_URL=http://localhost:3000" > .env.local
```

### Ishga tushirish

```bash
# Loyiha ildizidan (ikkala server ham parallel)
npm run dev:api    # Backend: http://localhost:3000
npm run dev:web    # Frontend: http://localhost:5173
```

---

## Muhit o'zgaruvchilari

### Backend (`apps/api/.env`)

```env
# Ma'lumotlar bazasi
DATABASE_URL="postgresql://user:password@localhost:5432/mathacademy"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookie
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false

# Fayl yuklash
UPLOAD_MAX_SIZE_MB=25
UPLOAD_DIR=./uploads

# Swagger (production da false)
SWAGGER_ENABLED=true

# CORS
CORS_ORIGINS=http://localhost:5173
```

### Frontend (`apps/web/.env.local`)

```env
VITE_API_URL=http://localhost:3000
```

---

## Ma'lumotlar bazasi

### Asosiy modellar (56 ta)

```
Tenant boshqaruvi:     tenants, system_settings
Foydalanuvchilar:      users, roles, permissions, user_roles
O'quvchilar:           students, student_accounts, student_tracks
                       student_group_history, student_living_history
                       student_outcomes, student_risk_scores, student_timeline
Akademik:              groups, academic_years, subjects, track_subjects
                       cohorts, student_cohort
Baholash:              assessments, assessment_scores
                       grade_snapshots, grade_snapshot_rows
Davomat:               attendance_sessions, attendance_marks
Dars jadvali:          timetable, timetable_lessons
Intizom:               discipline_actions, violations
Ta'til:                leave_requests
Moliya:                invoices, payments
Yotoqxona:             dorms, dorm_rooms, dorm_student_charges
                       dorm_payment_announcements
Ovqatlanish:           meal_weeks, meal_student_charges
                       meal_payment_announcements
Infratuzilma:          campuses, living_types
Kommunikatsiya:        events, event_participants
                       announcements, notifications
                       notification_preferences, notification_templates
Mukofotlar:            awards, award_recipients
Musobaqalar:           competitions, competition_entries, competition_results
Sertifikatlar:         certificates
Ekranlar:              displays, display_playlists, display_items
Fayllar:               files
Xavfsizlik:            audit_logs, auth_attempts, auth_locks, auth_sessions
Yordamchi:             student_id_sequences
```

### Seed ma'lumotlar

Demo ma'lumotlar yuklangandan keyin quyidagi hisoblar mavjud:

| Rol | Login | Parol | Izoh |
|---|---|---|---|
| **Superadmin** | `mathacademy` / `admin` | `MathAdmin@2025!` | To'liq huquq |
| **Demo admin** | `mathacademy` / `demo` | `Demo@1234` | Faqat ko'rish |
| **O'qituvchi** | `mathacademy` / `teacher.001` | `Ustoz@2025!` | 10 ta o'qituvchi (001–010) |
| **Demo o'qituvchi** | `mathacademy` / `demo.teacher` | `Demo@1234` | Faqat ko'rish |
| **Guardian (ota-ona)** | `mathacademy-MA-0001` | `Ota@12345` | 60 ta (MA-0001 … MA-0060) |
| **Demo guardian** | `mathacademy-MA-DEMO` | `Demo@1234` | Demo ota-ona |

> **Izoh:** Guardian login formatida tenant slug ham kiritiladi: `mathacademy-MA-0001`

---

## API hujjatlari

Backend ishga tushgandan keyin Swagger UI mavjud:

```
http://localhost:3000/api/docs
```

### Asosiy endpoint guruhlar

| Prefix | Tavsif |
|---|---|
| `POST /auth/staff/login` | Xodim kirishi |
| `POST /auth/guardian/login` | Ota-ona kirishi |
| `POST /auth/refresh` | Token yangilash |
| `GET /staff/students` | O'quvchilar ro'yxati |
| `GET /staff/groups` | Guruhlar |
| `GET /staff/assessments` | Baholashlar |
| `GET /staff/attendance/sessions` | Davomat sessiyalari |
| `GET /staff/timetables/:id` | Dars jadvali |
| `GET /staff/billing/summary` | Moliyaviy xulosa |
| `GET /staff/reports/overview` | Umumiy hisobot |
| `GET /guardian/dashboard` | Ota-ona dashboard |
| `GET /guardian/timetable` | Farzand dars jadvali |

---

## Foydalanuvchi rollari

### RBAC (Role-Based Access Control)

Tizim granular huquqlar tizimiga ega. Har bir rol o'ziga xos ruxsatlar to'plamiga ega:

```
superadmin   → barcha huquqlar
admin        → boshqaruv (o'chirish huquqisiz)
teacher      → o'z guruhlari: baholar, davomat
receptionist → o'quvchilar, to'lovlar (faqat ko'rish/kiritish)
accountant   → moliya modullari
```

Rollar va ruxsatlar dinamik — admin paneli orqali yangi rollar yaratish va huquqlarni sozlash mumkin.

---

## Asosiy texnik xususiyatlar

### Xavfsizlik
- **JWT** access (15 daqiqa) + refresh (7 kun) token strategiyasi
- **Brute-force himoya** — noto'g'ri urinishlar soniga qarab hisobni qulflash
- **Audit log** — barcha muhim amallar qayd etiladi (kim, qachon, nima)
- **bcrypt** parol xeshlash (cost factor 10+)
- **CORS** — faqat ruxsat etilgan originlardan so'rovlar

### Unumdorlik
- **Redis** kesh — tez-tez so'raladigan ma'lumotlar keshlash
- **Pagination** — barcha ro'yxat endpointlarida sahifalash
- **Lazy loading** — frontend komponentlari kerak bo'lganda yuklanadi

### Frontend
- **useCrud hook** — barcha CRUD operatsiyalari uchun universal hook (pagination, search, create, update, delete)
- **DataTable** — universal jadval komponenti (search, pagination, custom render)
- **SlideOver** — forma paneli (create/edit uchun)
- **StatusBadge** — holat ko'rsatuvchi badge (ACTIVE, PENDING, PAID, va h.k.)
- **StatCard** — statistika kartasi

---

## Deploy

### Render.com (Backend)

1. `apps/api` papkasini web service sifatida ulang
2. Build command: `npm install && npx prisma generate && npm run build`
3. Start command: `node dist/main`
4. Muhit o'zgaruvchilarini Render dashboard orqali kiriting

### Vercel (Frontend)

1. `apps/web` papkasini Vercel loyihasiga ulang
2. Build command: `npm run build`
3. Output directory: `dist`
4. `VITE_API_URL` muhit o'zgaruvchisini kiriting

### Ma'lumotlar bazasi

Render Postgres yoki Supabase bilan ishlaydi. Birinchi deploydan keyin:

```bash
npx prisma migrate deploy
npm run seed:prod   # Minimal boshlang'ich ma'lumotlar
```

---

## Litsenziya

Bu loyiha xususiy (private) bo'lib, Sarvarbek0704 tomonidan ishlab chiqilgan.
