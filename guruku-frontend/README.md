# Guruku.AI Mobile Frontend 📱✨

Aplikasi mobile pembelajaran cerdas berbasis **React Native**, **TypeScript**, dan **Expo SDK 54**, dengan sistem navigasi modern berbasis berkas (**Expo Router v6**), rendering formula matematika **LaTeX/KaTeX**, dan integrasi kecerdasan buatan **Google Gemini AI**.

---

## 📋 Daftar Isi
1. [Ikhtisar Arsitektur](#-ikhtisar-arsitektur)
2. [Fitur Unggulan Antarmuka](#-fitur-unggulan-antarmuka)
3. [Struktur Folder & Routing](#-struktur-folder--routing)
4. [Komponen Inti & Rendering Rumus (KaTeX)](#-komponen-inti--rendering-rumus-katex)
5. [Prasyarat & Setup Lokal](#-prasyarat--setup-lokal)
6. [Konfigurasi Environment Variables](#-konfigurasi-environment-variables)
7. [Menjalankan Aplikasi](#-menjalankan-aplikasi)
8. [Build & Distribusi (EAS Build APK)](#-build--distribusi-eas-build-apk)

---

## 🏛️ Ikhtisar Arsitektur

Frontend Guruku.AI dirancang dengan pendekatan modular yang memisahkan antara logika routing, komponen UI, state lokal, dan integrasi API:

```text
guruku-frontend/
├── app/                        # Direktori Rute (Expo Router File-based Routing)
│   ├── _layout.tsx             # Root Stack Navigator & Font Loader
│   ├── index.tsx               # Onboarding Slider (4 Slide Interaktif)
│   ├── role_guard.ts           # Hook Proteksi Rute (useRoleGuard)
│   ├── Login/                  # Layar Masuk (Email & Password)
│   ├── Register/               # Layar Pendaftaran (Pilihan Peran: Siswa / Guru)
│   ├── JoinKelas/              # Modal & Layar Masuk Kelas via Kode Undangan
│   ├── Chatbot/                # Antarmuka Chat Socratic AI Tutor
│   ├── admin/                  # Dashboard & Verifikasi Akun Administrator
│   └── (tabs)/                 # Tab Navigasi Berdasarkan Peran
│       ├── _layout.tsx         # Tab Router Dispatcher
│       ├── students/           # Tab Area Siswa (Home, Kelas, Kuis, Riwayat, Profil)
│       └── teachers/           # Tab Area Guru (Home, Kelas, Buat Kuis, Rekap Nilai, Profil)
│
├── components/                 # Komponen Reusable UI
│   ├── MathRenderer.tsx        # Renderer Khusus Rumus Matematika (LaTeX / KaTeX)
│   ├── AnnouncementCard.tsx    # Kartu Pengumuman Kelas & Sistem
│   ├── ClassCard.tsx           # Kartu Informasi Kelas & Progres Belajar
│   ├── FloatingButton.tsx      # Tombol Aksi Melayang (Akses Cepat Chatbot AI)
│   ├── BackButton.tsx          # Tombol Navigasi Kembali
│   └── BottomNav.tsx           # Komponen Navigasi Bawah Kustom
│
├── services/                   # Layanan Integrasi Backend (Axios Client)
│   ├── api.ts                  # Axios Instance, Interceptor, & Base URL
│   ├── auth.ts                 # Service Login & Registrasi
│   ├── classes.ts              # Service CRUD Kelas, Undangan, & Peserta
│   ├── materials.ts            # Service Unggah Materi & AI Content Generator
│   ├── quizzes.ts              # Service Kuis, Pengerjaan, & AI Quiz Maker
│   ├── chatbot.ts              # Service Percakapan & Pengiriman Pesan AI
│   └── admin.ts                # Service Statistik & Verifikasi Akun
│
├── constants/                  # Token Desain, Warna, & Tipografi
├── hooks/                      # Custom React Hooks
├── app.json                    # Konfigurasi Metaprogramming Expo
├── eas.json                    # Konfigurasi Build Cloud Expo Application Services
└── package.json                # Dependensi Aplikasi
```

---

## 🌟 Fitur Unggulan Antarmuka

### 1. 🚶‍♂️ Onboarding Interaktif (`app/index.tsx`)
Slider pengenalan fitur platform dengan indikator titik (*dot indicators*) dan navigasi bertahap untuk mengenalkan peran Guru, Siswa, dan Asisten AI sebelum masuk ke layar autentikasi.

### 2. 🛡️ Proteksi Rute Berbasis Peran & Verifikasi (`app/role_guard.ts`)
Menggunakan hook `useRoleGuard()` yang memeriksa data tersimpan di `AsyncStorage`:
- Mengarahkan siswa yang mencoba membuka menu guru ke dashboard siswa (`/students`).
- Mengarahkan guru yang membuka menu siswa ke dashboard guru (`/teachers`).
- Memproteksi rute `/admin` hanya untuk akun dengan peran `admin`.
- Memeriksa flag `is_verified`: Pengguna yang belum diverifikasi diarahkan ke halaman profil untuk melengkapi data legalitas (NIP untuk guru atau NISN untuk siswa).

### 3. 📐 Rendering Rumus Matematika LaTeX (`components/MathRenderer.tsx`)
Mendukung rendering formula matematika tingkat lanjut dengan pustaka **KaTeX** dan **react-native-webview**. Format rumus blok `$$...$$` dan inline `$..$` dari modul pembelajaran maupun jawaban AI chatbot akan dirender secara presisi dan elegan, tidak berupa teks mentah.

### 4. 🤖 Antarmuka Chatbot Sokratik AI (`app/Chatbot/index.tsx`)
- Tampilan chat bubble modern dengan pembeda peran pengguna dan AI.
- Dukungan parsing Markdown dan rumus matematika interaktif.
- Auto-scroll ke pesan terbaru, indikator pengetikan (*typing indicator*), dan riwayat sesi belajar.

### 5. 📝 Pengerjaan Kuis Interaktif (`app/(tabs)/students/quizzes/[id]/attempt.tsx`)
- Tampilan pertanyaan satu per satu atau daftar soal.
- Pilihan ganda interaktif dengan visual feedback.
- Timer waktu mundur (*countdown duration*).
- Validasi batas maksimal percobaan pengerjaan (*attempt limit check*).
- Penghitungan skor otomatis langsung setelah pengiriman jawaban.

### 6. 🪄 Alat Bantu AI untuk Guru
- **AI Material Generator**: Guru memilih berkas materi pembelajaran di HP, dan AI langsung mengisi teks modul secara otomatis.
- **AI Quiz Maker**: Guru mengunggah berkas bank soal atau bahan ajar, menentukan jumlah soal, dan soal pilihan ganda langsung tersusun secara instan.
- **Buku Nilai Guru (`scores.tsx`)**: Melihat daftar siswa yang telah mengerjakan kuis beserta skor dan waktu pengerjaan.

---

## 🧩 Komponen Inti & Rendering Rumus (KaTeX)

Untuk memastikan pengalaman membaca materi sains dan matematika yang optimal pada perangkat mobile, Guruku.AI mengimplementasikan `MathRenderer.tsx`:

- **Ekstraksi String Rumus**: Mendeteksi pola regex rumus matematika LaTeX (`$$...$$`).
- **WebView KaTeX Engine**: Merender formula menggunakan HTML KaTeX ringan dengan auto-scaling ukuran font sesuai layar perangkat.
- **Fallback Graceful**: Jika perangkat mengalami keterbatasan rendering WebView, teks fallback tetap ditampilkan secara rapi.

---

## 💻 Prasyarat & Setup Lokal

1. **Node.js**: Versi 18 LTS atau 20 LTS disarankan.
2. **Paket Pengelola**: `npm` atau `yarn`.
3. **Expo CLI**: Terinstal secara lokal dalam proyek (`npx expo`).
4. **Alat Pengujian**:
   - **Perangkat Fisik**: Pasang aplikasi **Expo Go** dari Google Play Store atau Apple App Store.
   - **Emulator**: Android Studio dengan Virtual Device (AVD), atau Xcode Simulator (khusus macOS).

---

## ⚙️ Konfigurasi Environment Variables

Aplikasi menggunakan sistem environment variables bawaan Expo dengan prefix `EXPO_PUBLIC_`.

1. Salin berkas template `.env.example`:
   ```bash
   copy .env.example .env     # Windows
   cp .env.example .env       # Linux / macOS
   ```

2. Tentukan nilai `EXPO_PUBLIC_API_URL`:

| Lingkungan Pengujian | Konfigurasi `EXPO_PUBLIC_API_URL` | Penjelasan |
| :--- | :--- | :--- |
| **Android Emulator** | `http://10.0.2.2:8000/api` | `10.0.2.2` adalah alias IP localhost komputer dari sudut pandang emulator Android. |
| **Web Browser / iOS Sim** | `http://localhost:8000/api` | Langsung mengakses port 8000 pada komputer lokal. |
| **HP Fisik (Expo Go)** | `http://192.168.1.X:8000/api` | Ganti dengan alamat IP lokal komputer Anda di jaringan Wi-Fi yang sama. |
| **Tunnel Cloud (Ngrok)** | `https://xxxx.ngrok-free.dev/api` | Solusi terbaik jika HP fisik dan komputer berada di jaringan Wi-Fi yang berbeda. |

---

## 🚀 Menjalankan Aplikasi

1. **Pasang seluruh dependensi pustaka**:
   ```bash
   npm install
   ```

2. **Jalankan server pengembangan Expo**:
   ```bash
   npx expo start
   ```

3. **Buka Aplikasi**:
   - Tekan **`a`** pada keyboard terminal untuk membuka di **Android Emulator**.
   - Tekan **`w`** untuk membuka di **Web Browser**.
   - Pindai **QR Code** di terminal menggunakan kamera HP (iOS) atau fitur Scan QR pada aplikasi **Expo Go** (Android).

---

## 📦 Build & Distribusi (EAS Build APK)

Proyek ini telah dikonfigurasi dengan **Expo Application Services (EAS)** pada berkas `eas.json` untuk menghasilkan berkas instalasi mandiri (**Android APK**) tanpa memerlukan Android Studio secara lokal.

### 1. Pasang EAS CLI secara global (jika belum)
```bash
npm install -g eas-cli
```

### 2. Login ke akun Expo
```bash
eas login
```

### 3. Build APK Preview untuk Android
```bash
eas build -p android --profile preview
```
- Sistem EAS Cloud akan melakukan build secara otomatis.
- Setelah proses build selesai, link unduhan berkas **`.apk`** akan tersedia di terminal dan dashboard Expo Anda untuk dipasang langsung di smartphone Android.
