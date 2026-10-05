# Guruku.AI Backend Service ⚙️🚀

Layanan backend REST API untuk platform **Guruku.AI**, dibangun dengan **Django 4.2 LTS** dan **Django REST Framework (DRF)**, terintegrasi penuh dengan kecerdasan buatan **Google Gemini 2.5 Flash Lite**.

---

## 📋 Daftar Isi
1. [Arsitektur & Modul Sistem](#-arsitektur--modul-sistem)
2. [Fitur Utama Backend](#-fitur-utama-backend)
3. [Prasyarat Sistem](#-prasyarat-sistem)
4. [Langkah Instalasi & Setup Lokal](#-langkah-instalasi--setup-lokal)
5. [Konfigurasi Environment Variables](#-konfigurasi-environment-variables)
6. [Database & Seed Data (`data.json`)](#-database--seed-data-datajson)
7. [Integrasi Google Gemini AI](#-integrasi-google-gemini-ai)
8. [Dokumentasi Endpoint API](#-dokumentasi-endpoint-api)
9. [Deployment & Produksi](#-deployment--produksi)

---

## 🏗️ Arsitektur & Modul Sistem

Backend Guruku.AI menerapkan prinsip arsitektur modular di bawah direktori `api/`:

```text
guruku-backend/
├── config/                     # Konfigurasi Inti Django
│   ├── settings.py             # Pengaturan aplikasi, JWT, database, & static
│   ├── urls.py                 # Root URL router
│   ├── wsgi.py & asgi.py       # WSGI/ASGI entrypoint untuk server produksi
│
├── api/                        # Direktori Modul Aplikasi
│   ├── users/                  # Custom User (AbstractBaseUser), auth, profil Siswa & Guru
│   │   ├── auth_backend.py     # Autentikasi kustom berbasis Email (EmailBackend)
│   │   ├── models.py           # User, StudentProfile, TeacherProfile, SystemAnnouncement
│   │   ├── serializers.py      # Register, Dashboard, dan Profil serializer
│   │   └── views.py            # Login, Register, Profile, Dashboard views
│   │
│   ├── classes/                # Manajemen Kelas & Pengumuman
│   │   ├── models.py           # Model Class (UUID, invite_code otomatis) & Announcement
│   │   ├── serializers.py      # ClassSerializer & AnnouncementSerializer
│   │   └── views.py            # CRUD kelas, join via kode, leave class
│   │
│   ├── materials/              # Manajemen Materi & Pembelajaran
│   │   ├── models.py           # Material (Rich text, File, Video) & MaterialProgress
│   │   ├── serializers.py      # MaterialSerializer & ProgressSerializer
│   │   └── views.py            # Upload berkas, progress checklist, & AI module generator
│   │
│   ├── quizzes/                # Manajemen Kuis, Soal, & Penilaian
│   │   ├── models.py           # Quiz, Question (JSON options), QuizAttempt, UserAnswer
│   │   ├── serializers.py      # Admin & Student Quiz serializers, attempt grading
│   │   ├── gemini_utils.py     # Generator soal kuis otomatis dari dokumen via Gemini
│   │   └── views.py            # ViewSet pengerjaan siswa & manajemen guru
│   │
│   ├── chatbot/                # Asisten Tutor Cerdas (Socratic AI)
│   │   ├── models.py           # Conversation & ChatMessage
│   │   ├── gemini_service.py   # Konfigurasi prompt Sokratik & integrasi Google Gemini
│   │   ├── serializers.py      # Conversation & ChatMessage serializers
│   │   └── views.py            # Manajemen percakapan & pengiriman pesan
│   │
│   └── admin_panel/            # Panel Khusus Administrator
│       ├── urls.py             # Router panel admin
│       └── views.py            # Statistik platform & approval verifikasi akun
│
├── media/                      # Berkas unggahan pengguna (foto profil, materi, video)
├── data.json                   # Fixture data awal (seed database)
├── build.sh                    # Skrip otomasi build untuk hosting/cloud
└── requirements.txt            # Daftar paket dependensi Python
```

---

## 🌟 Fitur Utama Backend

1. **Custom User & Autentikasi Email**:
   - Model `User` mengimplementasikan `AbstractBaseUser` dan `PermissionsMixin`.
   - Autentikasi menggunakan email melalui `EmailBackend`.
   - Menggunakan **SimpleJWT** untuk pertukaran token akses dan refresh yang aman.
2. **Sistem Peran & Profil Terverifikasi**:
   - Signal otomatis (`post_save`) membuat `StudentProfile` atau `TeacherProfile` saat registrasi.
   - Atribut `is_verified` untuk menjamin guru dan siswa terdaftar secara valid.
3. **Kode Undangan Kelas Otomatis**:
   - Pembuatan kode undangan kelas 8 karakter heksadesimal unik saat kelas dibuat (`uuid.uuid4().hex[:8].upper()`).
4. **AI-Powered Material Generator**:
   - Menerima unggahan dokumen (PDF/Docx) dan menghasilkan modul pembelajaran Markdown lengkap beserta rumus LaTeX.
5. **AI-Powered Quiz Generator**:
   - Memindai dokumen bank soal dan mengekstrak pertanyaan, opsi pilihan ganda, dan kunci jawaban dalam format JSON terstruktur.
6. **Socratic AI Tutor**:
   - Chatbot berbasis `gemini-2.5-flash-lite` dengan instruksi sistem agar mengarahkan siswa memahami konsep dengan metode tanya jawab (Sokratik) dan format rumus `$$...$$`.
7. **Penyimpanan Berkas Terisolasi**:
   - Penamaan berkas otomatis dengan UUID v4 untuk mencegah konflik nama file materi dan avatar profil.

---

## 💻 Prasyarat Sistem

- **Python**: Versi 3.10 atau 3.11 disarankan.
- **PostgreSQL**: Versi 13 ke atas (atau gunakan MySQL / SQLite).
- **Git**
- **Koneksi Internet**: Untuk mengakses API Google Gemini.

---

## 🛠️ Langkah Instalasi & Setup Lokal

### 1. Masuk ke direktori backend
```bash
cd guruku-backend
```

### 2. Buat dan aktifkan Virtual Environment
- **Di Windows (PowerShell / Command Prompt)**:
  ```powershell
  python -m venv venv
  venv\Scripts\activate
  ```
- **Di Linux / macOS**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 3. Pasang seluruh dependensi Python
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Konfigurasi Variabel Lingkungan (`.env`)
Salin berkas template `.env.example`:
```bash
copy .env.example .env     # Windows
cp .env.example .env       # Linux / macOS
```
Buka berkas `.env` dan lengkapi informasinya (lihat penjelasan di bawah).

---

## ⚙️ Konfigurasi Environment Variables

Berikut adalah konfigurasi yang diperlukan pada berkas `.env`:

| Variabel | Deskripsi | Contoh Nilai |
| :--- | :--- | :--- |
| `SECRET_KEY` | Kunci rahasia pengaman Django | `django-insecure-...` |
| `DEBUG` | Mode debug (`True` untuk dev) | `True` |
| `DB_NAME` | Nama database PostgreSQL | `guruku_db` |
| `DB_USER` | Username database | `postgres` |
| `DB_PASSWORD` | Password database | `password_anda` |
| `DB_HOST` | Host database server | `127.0.0.1` |
| `DB_PORT` | Port database server | `5432` |
| `GEMINI_API_KEY` | API Key dari Google AI Studio | `AIzaSy...` |

> [!TIP]
> Jika Anda ingin mencoba menggunakan **SQLite** secara cepat tanpa PostgreSQL, Anda dapat mengganti konfigurasi `DATABASES` pada `config/settings.py` menjadi engine SQLite standar.

---

## 🗄️ Database & Seed Data (`data.json`)

1. **Jalankan Migrasi Skema Database**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Muat Data Awal (Sample Fixture Data)**:
   Repositori ini telah dilengkapi dengan berkas `data.json` berisi data kelas, soal kuis fisika, dan contoh percobaan kuis:
   ```bash
   python manage.py loaddata data.json
   ```

3. **Buat Akun Administrator**:
   ```bash
   python manage.py createsuperuser
   ```

4. **Jalankan Server Development**:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   Aplikasi backend siap melayani request di `http://127.0.0.1:8000/api/` dan panel admin Django di `http://127.0.0.1:8000/admin/`.

---

## 🧠 Integrasi Google Gemini AI

Backend menggunakan pustaka resmi `google-generativeai` dengan model **`gemini-2.5-flash-lite`** karena kecepatannya yang tinggi dan efisiensi token.

### 1. AI Socratic Tutor (`api/chatbot/gemini_service.py`)
Menerapkan instruksi sistem khusus (`TEACHER_INSTRUCTION`):
- Bertindak sebagai guru privat yang sabar, bersahabat, dan edukatif.
- Memprioritaskan **Metode Sokratik** (tidak langsung memberikan jawaban akhir, melainkan petunjuk bertahap).
- Mewajibkan rumus matematika ditulis menggunakan format LaTeX blok `$$...$$` atau inline `$...$`.
- Menolak pertanyaan non-edukatif secara halus.

### 2. Generator Modul Pembelajaran (`generate_material_content`)
Mengunggah file bahan ajar guru ke Gemini File API, lalu mengekstrak rangkuman terstruktur, konsep utama, rumus LaTeX, dan 3 latihan soal ringkas.

### 3. Generator Kuis Otomatis (`api/quizzes/gemini_utils.py`)
Menggunakan skema JSON terstruktur (`response_mime_type: "application/json"`) untuk mengekstrak atau membuat pertanyaan pilihan ganda lengkap dengan opsi, kunci jawaban, dan bobot poin.

---

## 📚 Dokumentasi Endpoint API

Dokumentasi lengkap seluruh endpoint, contoh payload request, response body, dan kode status dapat dilihat pada:
👉 **[API_DOCUMENTATION.md](file:///d:/Data%20Mahasiswa%20Andika%20Bahari%20Maskar/MATKUL/SEMESTER%207/PROJECT%20GURUKU-AI/Guruku-AI/guruku-backend/API_DOCUMENTATION.md)**

Ringkasan rute utama:
- `POST /api/users/register/` - Pendaftaran pengguna
- `POST /api/users/login/` - Login & penerbitan token JWT
- `GET  /api/users/dashboard/` - Informasi dashboard pengguna
- `GET  /api/classes/` - Daftar kelas (joined / recommended)
- `POST /api/classes/join/` - Bergabung ke kelas via kode undangan
- `GET  /api/materials/class/<id>/` - Daftar materi kelas
- `POST /api/materials/generate-content/` - Buat konten materi dari file via AI
- `POST /api/quizzes/manage/generate_from_file/` - Buat kuis dari file via AI
- `POST /api/quizzes/student/<id>/submit/` - Pengiriman lembar jawaban kuis siswa
- `POST /api/chatbot/conversations/<id>/message/` - Chat dengan AI Tutor
- `GET  /api/admin/stats` - Statistik platform administrator

---

## 🚀 Deployment & Produksi

Backend ini telah disiapkan untuk kemudahan deployment ke platform seperti **Render**, **Railway**, atau VPS:
1. **WhiteNoise**: Dikonfigurasi di `MIDDLEWARE` untuk menyajikan berkas statis secara efisien tanpa memerlukan Nginx terpisah.
2. **Gunicorn**: Disertakan dalam `requirements.txt` sebagai WSGI HTTP server untuk lingkungan produksi.
3. **Build Script (`build.sh`)**:
   ```bash
   chmod +x build.sh
   ./build.sh
   ```
   Skrip ini secara otomatis menginstal paket dependensi, menjalankan `collectstatic --no-input`, dan mengeksekusi `migrate`.