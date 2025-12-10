
# TODO List Frontend - Guruku.AI (React Native + Expo)

### 1. Persiapan Awal
- [ ] **Clone project dari GitHub**  
  - Pastikan repository sudah ada dan dikloning oleh semua tim.

- [ ] **Install dependencies**  
  - Jalankan perintah untuk menginstal semua dependensi:
    ```bash
    npm install
    ```

- [ ] **Setup Expo Project**  
  - Pastikan Expo berjalan dengan baik dan aplikasi bisa dijalankan di emulator atau perangkat fisik.
  - Jalankan:
    ```bash
    npx expo start
    ```

---

### 2. Setup Navigasi
- [ ] **Install React Navigation**  
  - Install dan setup **React Navigation** untuk memudahkan navigasi antar halaman (Stack, Bottom Tab).

  ```bash
  npm install @react-navigation/native
  npm install react-native-screens react-native-safe-area-context
  npm install @react-navigation/native-stack
  npm install @react-navigation/bottom-tabs
  ```

- [ ] **Setup Stack Navigation**  
  - Buat navigasi stack untuk login, registrasi, dan halaman lainnya.

- [ ] **Setup Bottom Tab Navigation**  
  - Implementasi navigasi bottom tab untuk dashboard utama (misalnya: Home, Profile).

---

### 3. Implementasi UI dan Layout
- [ ] **Halaman Login**  
  - Implementasikan halaman login dengan **username/password** atau **email/password**.
  - Tambahkan validasi input.

- [ ] **Halaman Dashboard**  
  - Halaman **Dashboard Guru** dan **Dashboard Siswa**.
  - Tampilkan kelas yang diajarkan atau yang diikuti, materi, dan kuis.

- [ ] **Halaman Profile**  
  - Implementasikan halaman profil pengguna, untuk melihat informasi user dan update profil.

- [ ] **Halaman Create Class, Create Material, Create Quiz (untuk Guru)**  
  - Implementasikan halaman untuk membuat kelas, materi, dan kuis khusus untuk **guru**.

- [x] **Halaman Chatbot**  
  - Implementasikan halaman chatbot yang mengintegrasikan AI untuk membantu siswa dalam belajar.

---

### 4. Integrasi dengan Backend
- [x] **Setup Axios untuk API Calls**  
  - Konfigurasi **Axios** untuk berkomunikasi dengan backend API.
  - Pastikan base URL sesuai dengan URL backend.

- [x] **Koneksi ke Backend API (Login, Register, Kelas, Materi, Quiz, Chatbot)**  
  - Gunakan Axios untuk melakukan request ke API.
  - Pastikan alur login, pendaftaran, serta akses data kelas, materi, kuis, dan chatbot berjalan dengan baik.

---

### 5. Pengujian dan Debugging
- [ ] **Testing UI dan Fungsi**  
  - Lakukan pengujian fungsionalitas aplikasi di perangkat fisik atau emulator.
  - Cek apakah aplikasi berjalan sesuai dengan yang diinginkan (navigasi, login, API calls).

- [ ] **Debugging dan Error Handling**  
  - Perbaiki bug atau masalah yang muncul saat testing.
  - Pastikan error handling berjalan dengan baik (misalnya, ketika API gagal atau input tidak valid).

---

### 6. Dokumentasi dan Laporan
- [ ] **Menulis Dokumentasi Pengguna**  
  - Tulis dokumentasi tentang cara penggunaan aplikasi untuk pengguna (siswa dan guru).

- [ ] **Menulis Dokumentasi Pengembang**  
  - Tulis dokumentasi teknis untuk pengembang lain, seperti struktur project, dependensi yang digunakan, dan cara menjalankan aplikasi.

- [ ] **Laporan Proyek**  
  - Buat laporan akhir proyek frontend yang mencakup fitur, teknologi yang digunakan, dan tantangan yang dihadapi selama pengembangan.

---

### 7. Refactor dan Pemeliharaan Kode
- [ ] **Refactor Kode dan Optimalisasi UI**  
  - Refactor kode agar lebih rapi, efisien, dan mudah dipelihara.
  - Optimalkan UI agar responsif dan nyaman digunakan.

- [ ] **Update Dependensi**  
  - Perbarui semua dependensi agar selalu menggunakan versi terbaru dan aman.

- [ ] **Pemeliharaan dan Pembaruan Fitur**  
  - Tambahkan fitur baru atau pembaruan berdasarkan feedback pengguna.

---

### 8. Deployment
- [ ] **Deployment ke Expo**  
  - Deploy aplikasi ke Expo untuk pengujian lebih lanjut.
  - Setup aplikasi di Expo untuk distribusi ke tester atau pengguna lainnya.

- [ ] **Publish ke Google Play dan App Store**  
  - Siapkan aplikasi untuk dipublikasikan di **Google Play** dan **Apple App Store** (opsional, jika aplikasi siap dirilis).