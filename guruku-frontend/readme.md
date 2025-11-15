# Guruku.AI Frontend

## Deskripsi

Frontend aplikasi **Guruku.AI** menggunakan **React Native** dan **Expo**. Aplikasi ini memberikan fitur seperti login, registrasi, dashboard siswa, dashboard guru, dan integrasi dengan API backend untuk mengambil materi dan kuis.

## Persyaratan

Sebelum memulai, pastikan sistem Anda sudah menginstal:

- **Node.js** (versi LTS)
- **npm** (untuk mengelola dependensi)
- **Expo Go** (untuk menjalankan aplikasi di perangkat mobile)

## Instalasi Frontend

### 1. Clone repository

```bash
git clone https://github.com/username/Guruku-AI.git
cd Guruku-AI/Frontend
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Jalankan Aplikasi

```bash
npx expo start
```

### 4. Struktur Folder yang harus dibuat

```bash
src/
 ├ screens/          # Halaman utama aplikasi
 ├ components/       # Komponen UI seperti tombol, input, dll
 ├ navigation/       # Navigasi aplikasi (Stack, Bottom Tabs)
 └ services/         # API calls (axios configuration)
```
