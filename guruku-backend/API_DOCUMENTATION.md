# Guruku.AI - Backend API Specification & Documentation

Dokumentasi resmi seluruh antarmuka pemrograman aplikasi (REST API) untuk sistem backend **Guruku.AI**.

---

## 📑 Daftar Isi
- [Ikhtisar & Konvensi](#ikhtisar--konvensi)
- [Autentikasi & Otorisasi](#autentikasi--otorisasi)
- [Format Respons & Kode Status](#format-respons--kode-status)
- [1. User & Authentication Endpoints](#1-user--authentication-endpoints)
- [2. Class Management Endpoints](#2-class-management-endpoints)
- [3. Material & Learning Endpoints](#3-material--learning-endpoints)
- [4. Quiz & Assessment Endpoints](#4-quiz--assessment-endpoints)
- [5. AI Chatbot (Tutor Sokratik) Endpoints](#5-ai-chatbot-tutor-sokratik-endpoints)
- [6. Admin Panel Endpoints](#6-admin-panel-endpoints)

---

## 🌐 Ikhtisar & Konvensi

- **Base URL Pengembangan**: `http://localhost:8000/api`
- **Tipe Konten Standar**: `application/json` (kecuali endpoint upload berkas yang menggunakan `multipart/form-data`)
- **Format Tanggal / Waktu**: ISO 8601 string (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **Primary Key**: Model pengguna & percakapan menggunakan integer ID; Model Kelas, Materi, Kuis, Soal, dan Percobaan menggunakan UUID v4.

---

## 🔐 Autentikasi & Otorisasi

API menggunakan **SimpleJWT (JSON Web Token)**. Sebagian besar endpoint memerlukan header otentikasi Bearer Token:

```http
Authorization: Bearer <access_token>
```

Masa berlaku token:
- **Access Token**: 60 menit
- **Refresh Token**: 1 hari

### Matriks Hak Akses Peran (Role-Based Access Control)
| Role | Akses Utama |
| :--- | :--- |
| **`student`** | Mengikuti kelas via kode, membaca materi, menyelesaikan materi, mengerjakan kuis, melihat riwayat nilai kuis, berinteraksi dengan AI chatbot. |
| **`teacher`** | Membuat dan mengedit kelas, mengunggah materi & video, membuat modul via AI, membuat kuis & mengekstrak soal via AI, meninjau hasil kuis siswa. |
| **`admin`** | Mengakses seluruh data, melihat statistik sistem, memverifikasi akun guru dan siswa, menyiarkan pengumuman sistem. |

---

## 🚦 Format Respons & Kode Status

### Respons Berhasil
```json
{
  "message": "Operasi berhasil",
  "data": { ... }
}
```

### Respons Gagal / Error
```json
{
  "error": "Pesan deskripsi kesalahan"
}
```
Atau jika berupa validasi form/serializer:
```json
{
  "email": ["Email ini sudah terdaftar."],
  "password": ["Kata sandi minimal 8 karakter."]
}
```

### Kode Status HTTP Umum
- `200 OK`: Permintaan berhasil diproses.
- `201 Created`: Entitas baru berhasil dibuat.
- `204 No Content`: Entitas berhasil dihapus.
- `400 Bad Request`: Payload data tidak valid atau parameter wajib hilang.
- `401 Unauthorized`: Token tidak disediakan atau sudah kedaluwarsa.
- `403 Forbidden`: Pengguna tidak memiliki izin untuk peran/entitas terkait.
- `404 Not Found`: Sumber daya tidak ditemukan.
- `500 Internal Server Error`: Kesalahan pemrosesan internal atau kegagalan API pihak ketiga (Gemini).

---

## 1. User & Authentication Endpoints

Prefix: `/api/users/`

### 1.1 Registrasi Pengguna
- **URL**: `/api/users/register/`
- **Method**: `POST`
- **Auth**: None (Public)
- **Request Body**:
  ```json
  {
    "email": "siswa@example.com",
    "password": "PasswordRahasia123!",
    "full_name": "Ahmad Siswa",
    "role": "student",
    "birth_date": "2008-05-14"
  }
  ```
  *(Role dapat berupa `student` atau `teacher`)*
- **Response (201 Created)**:
  ```json
  {
    "message": "Register berhasil",
    "user": {
      "email": "siswa@example.com",
      "full_name": "Ahmad Siswa",
      "role": "student",
      "birth_date": "2008-05-14"
    }
  }
  ```

### 1.2 Login Pengguna
- **URL**: `/api/users/login/`
- **Method**: `POST`
- **Auth**: None (Public)
- **Request Body**:
  ```json
  {
    "email": "siswa@example.com",
    "password": "PasswordRahasia123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login berhasil",
    "user": {
      "email": "siswa@example.com",
      "full_name": "Ahmad Siswa",
      "role": "student",
      "is_verified": true
    },
    "tokens": {
      "refresh": "eyJhbGciOi...",
      "access": "eyJhbGciOi..."
    }
  }
  ```

### 1.3 Ambil Data Dashboard Siswa
- **URL**: `/api/users/dashboard/`
- **Method**: `GET`
- **Auth**: Bearer Token
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "full_name": "Ahmad Siswa",
      "email": "siswa@example.com",
      "role": "student",
      "is_verified": true,
      "profile_picture": "http://localhost:8000/media/profile_pics/avatar.jpg",
      "nisn": "1234567890",
      "grade": "11",
      "nip": null,
      "subject": null,
      "joined_classes": [ ... ]
    },
    "recommended_classes": [ ... ]
  }
  ```

### 1.4 Ambil & Perbarui Profil
- **URL**: `/api/users/profile/`
- **Method**: `GET` | `PATCH`
- **Auth**: Bearer Token
- **Content-Type**: `multipart/form-data` (bila mengunggah foto profil)
- **Payload PATCH (Contoh Siswa)**:
  - `full_name`: "Ahmad Siswa Baru"
  - `nisn`: "0098765432"
  - `grade`: "12"
  - `profile_picture`: [File gambar biner]
- **Payload PATCH (Contoh Guru)**:
  - `full_name`: "Budi Santoso, M.Pd"
  - `nip`: "198501012010011002"
  - `subject`: "Fisika"
  - `profile_picture`: [File gambar biner]
- **Response (200 OK)**: Data profil terbaru yang sudah diperbarui.

### 1.5 Ambil Statistik Dashboard Guru
- **URL**: `/api/users/dashboard/teacher/`
- **Method**: `GET`
- **Auth**: Bearer Token (`role: teacher`)
- **Response (200 OK)**:
  ```json
  {
    "activeClasses": 4,
    "totalStudents": 128,
    "assignmentsPending": 6
  }
  ```

### 1.6 Pengumuman Sistem Global
- **URL**: `/api/users/announcements/`
- **Method**: `GET` (Semua Pengguna Terautentikasi) | `POST` (Hanya Admin)
- **Payload POST (Admin)**:
  ```json
  {
    "title": "Jadwal Pemeliharaan Server",
    "content": "Server akan offline pada hari Minggu pukul 01:00 - 03:00 WIB.",
    "target_role": "all"
  }
  ```
  *(Nilai `target_role`: `all`, `student`, atau `teacher`)*
- **Response GET (200 OK)**: Array pengumuman yang relevan dengan peran user saat ini.

---

## 2. Class Management Endpoints

Prefix: `/api/classes/`

### 2.1 Daftar & Pembuatan Kelas
- **URL**: `/api/classes/`
- **Method**: `GET` | `POST`
- **Auth**: Bearer Token
- **Query Params (GET)**:
  - `mode=joined` (default: kelas yang diikuti siswa atau kelas buatan guru)
  - `mode=all` (semua kelas publik / rekomendasi berdasarkan tingkat kelas siswa)
- **Payload POST (Hanya Guru)**:
  ```json
  {
    "name": "Fisika Modern Kelas 11-IPA 1",
    "description": "Pembahasan Teori Relativitas dan Dualisme Gelombang Partikel",
    "grade": "11"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "e4b5b7b9-1234-4a5b-b987-0123456789ab",
    "name": "Fisika Modern Kelas 11-IPA 1",
    "description": "Pembahasan Teori Relativitas dan Dualisme Gelombang Partikel",
    "grade": "11",
    "teacher": 5,
    "teacher_name": "Budi Santoso, M.Pd",
    "students_count": 0,
    "progress": 0,
    "is_joined": true,
    "invite_code": "8A4F19B2",
    "created_at": "2026-10-05T10:00:00Z"
  }
  ```

### 2.2 Bergabung ke Kelas via Kode Undangan
- **URL**: `/api/classes/join/`
- **Method**: `POST`
- **Auth**: Bearer Token (`role: student`)
- **Request Body**:
  ```json
  {
    "invite_code": "8A4F19B2"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Berhasil bergabung ke kelas Fisika Modern Kelas 11-IPA 1"
  }
  ```

### 2.3 Detail, Edit, & Hapus Kelas
- **URL**: `/api/classes/<uuid:pk>/`
- **Method**: `GET` | `PATCH` | `DELETE`
- **Auth**: Bearer Token
- **Keterangan**: `PATCH` dan `DELETE` hanya dapat dilakukan oleh Guru pemilik kelas.

### 2.4 Daftar Siswa dalam Kelas
- **URL**: `/api/classes/<uuid:pk>/students/`
- **Method**: `GET`
- **Auth**: Bearer Token (Guru pemilik atau Siswa yang terdaftar)
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 12,
      "full_name": "Siti Nurhaliza",
      "email": "siti@example.com",
      "avatar": "http://localhost:8000/media/profile_pics/siti.png"
    }
  ]
  ```

### 2.5 Pengumuman Khusus Kelas
- **URL**: `/api/classes/<uuid:pk>/announcements/`
- **Method**: `GET` | `POST`
- **Auth**: Bearer Token
- **Payload POST (Guru Pemilik)**:
  ```json
  {
    "content": "Kuis Fisika Bab 2 akan dilaksanakan hari Kamis pukul 08:00 WIB."
  }
  ```

### 2.6 Keluar dari Kelas
- **URL**: `/api/classes/<uuid:pk>/leave/`
- **Method**: `POST`
- **Auth**: Bearer Token (`role: student`)
- **Response (200 OK)**:
  ```json
  {
    "message": "Berhasil keluar dari kelas."
  }
  ```

---

## 3. Material & Learning Endpoints

Prefix: `/api/materials/`

### 3.1 Daftar & Pembuatan Materi Pelajaran
- **URL**: `/api/materials/class/<uuid:class_id>/`
- **Method**: `GET` | `POST`
- **Auth**: Bearer Token
- **Format POST**: `multipart/form-data`
- **Payload Fields**:
  - `title` (string, wajib)
  - `content` (string HTML/Markdown, opsional)
  - `file` (file dokumen PDF/Docx, opsional)
  - `video_file` (file video mp4, opsional)
- **Otomasi AI**: Jika `file` dilampirkan namun `content` dikosongkan, sistem secara otomatis memanggil Gemini AI untuk mengekstrak dan menyusun modul pembelajaran terstruktur.

### 3.2 Detail, Edit, & Hapus Materi
- **URL**: `/api/materials/<uuid:pk>/`
- **Method**: `GET` | `PATCH` | `DELETE`
- **Auth**: Bearer Token

### 3.3 Tandai Materi Telah Selesai Dipelajari
- **URL**: `/api/materials/<uuid:material_id>/complete/`
- **Method**: `POST`
- **Auth**: Bearer Token (`role: student`)
- **Response (200 OK)**:
  ```json
  {
    "status": "marked as complete"
  }
  ```

### 3.4 Generator Konten Pembelajaran via AI
- **URL**: `/api/materials/generate-content/`
- **Method**: `POST`
- **Auth**: Bearer Token
- **Format**: `multipart/form-data`
- **Payload**:
  - `file`: Berkas PDF atau dokumen bahan ajar
- **Response (200 OK)**:
  ```json
  {
    "content": "# Rangkuman Hukum Newton\n\n## 1. Hukum I Newton...\n$$\\sum F = 0$$"
  }
  ```

---

## 4. Quiz & Assessment Endpoints

Prefix: `/api/quizzes/`

### 4.1 Manajemen Kuis oleh Guru (`/manage/`)
- **`GET /api/quizzes/manage/`**: Ambil daftar kuis buatan guru terkait.
- **`POST /api/quizzes/manage/`**: Buat kuis baru beserta daftar soal secara transaksional.
  - **Payload**:
    ```json
    {
      "title": "Kuis 1 Dinamika Partikel",
      "description": "Kuis mengenai Hukum Newton dan Gaya Gesek",
      "class_id": "e4b5b7b9-1234-4a5b-b987-0123456789ab",
      "duration_minutes": 45,
      "deadline": "2026-10-15T23:59:59Z",
      "max_attempts": 2,
      "is_active": true,
      "questions": [
        {
          "text": "Benda bermassa 5 kg ditarik dengan gaya 20 N. Berapa percepatannya?",
          "order": 1,
          "points": 10.0,
          "options": ["2 m/s²", "4 m/s²", "5 m/s²", "10 m/s²"],
          "answer": "4 m/s²"
        }
      ]
    }
    ```
- **`GET /api/quizzes/manage/<id>/`**: Ambil detail kuis lengkap untuk mode editing.
- **`PUT /api/quizzes/manage/<id>/`**: Perbarui kuis dan ganti soal-soal di dalamnya.
- **`DELETE /api/quizzes/manage/<id>/`**: Hapus kuis.
- **`GET /api/quizzes/manage/<id>/attempts/`**: Ambil rekap pengerjaan kuis siswa (nama siswa, avatar, nilai, percobaan ke berapa, waktu submit).

### 4.2 Generator Kuis dari Berkas Otomatis via AI
- **URL**: `/api/quizzes/manage/generate_from_file/`
- **Method**: `POST`
- **Auth**: Bearer Token (`role: teacher` atau `admin`)
- **Format**: `multipart/form-data`
- **Payload**:
  - `file`: Berkas PDF atau dokumen kumpulan soal / materi
  - `num_questions`: Jumlah soal yang diinginkan (default: 5)
- **Response (200 OK)**:
  ```json
  [
    {
      "text": "Besaran yang menyebabkan benda bergerak melingkar adalah...",
      "options": ["Gaya sentripetal", "Gaya gravitasi", "Gaya gesek statis", "Gaya normal"],
      "answer": "Gaya sentripetal",
      "points": 10,
      "order": 1
    }
  ]
  ```

### 4.3 Endpoint Kuis Siswa (`/student/`)
- **`GET /api/quizzes/student/`**: Daftar kuis aktif yang dapat dikerjakan siswa dari kelas yang diikutinya.
- **`GET /api/quizzes/student/<id>/`**: Detail kuis untuk dikerjakan (menyertakan teks pertanyaan & opsi, tanpa menyertakan kunci jawaban).
- **`POST /api/quizzes/student/<id>/submit/`**: Mengirimkan lembar jawaban kuis.
  - **Payload**:
    ```json
    {
      "answers": [
        {
          "question_id": "9a7f3421-....",
          "answer_text": "4 m/s²"
        }
      ]
    }
    ```
  - **Validasi**: Menolak submit jika siswa telah melampaui `max_attempts`.
  - **Response (201 Created)**:
    ```json
    {
      "id": "attempt-uuid",
      "quiz": "quiz-uuid",
      "quiz_title": "Kuis 1 Dinamika Partikel",
      "score": 100.0,
      "attempt_number": 1,
      "submitted_at": "2026-10-05T12:00:00Z"
    }
    ```
- **`GET /api/quizzes/student/history/`**: Riwayat pengerjaan seluruh kuis oleh siswa.

---

## 5. AI Chatbot (Tutor Sokratik) Endpoints

Prefix: `/api/chatbot/`

Modul tutor cerdas yang memanfaatkan model **Google Gemini 2.5 Flash Lite** dengan kepribadian "Guruku AI" (Sabar, Edukatif, Socratic Method, dan Format Rumus LaTeX `$$...$$`).

### 5.1 Daftar & Pembuatan Sesi Percakapan
- **URL**: `/api/chatbot/conversations/`
- **Method**: `GET` | `POST`
- **Auth**: Bearer Token
- **Payload POST**:
  ```json
  {
    "title": "Diskusi Rumus Efek Doppler"
  }
  ```
- **Response POST (201 Created)**:
  ```json
  {
    "conversation_id": 4
  }
  ```
  *(Sistem otomatis membuat pesan sambutan bot pertama)*

### 5.2 Detail Sesi Percakapan & Riwayat Chat
- **URL**: `/api/chatbot/conversations/<int:conversation_id>/`
- **Method**: `GET`
- **Auth**: Bearer Token
- **Response (200 OK)**:
  ```json
  {
    "id": 4,
    "title": "Diskusi Rumus Efek Doppler",
    "created_at": "2026-10-05T11:00:00Z",
    "messages": [
      {
        "id": 101,
        "role": "bot",
        "content": "Hallo, Ahmad! Saya Guruku AI, siap membantu belajarmu. Tanyakan apa saja!",
        "timestamp": "2026-10-05T11:00:01Z"
      }
    ]
  }
  ```

### 5.3 Kirim Pesan & Dapatkan Jawaban AI
- **URL**: `/api/chatbot/conversations/<int:conversation_id>/message/`
- **Method**: `POST`
- **Auth**: Bearer Token
- **Payload**:
  ```json
  {
    "message": "Halo Bu Guru, saya bingung rumus frekuensi yang didengar pendengar jika sumber bunyi mendekat."
  }
  ```
- **Logika Backend**: Mengambil riwayat pesan sebelumnya, meneruskannya ke Gemini API dengan System Prompt Sokratik, dan menyimpan pesan user serta jawaban bot ke database.
- **Response (200 OK)**:
  ```json
  {
    "user_message": {
      "id": 102,
      "role": "user",
      "content": "Halo Bu Guru, saya bingung rumus frekuensi yang didengar pendengar jika sumber bunyi mendekat.",
      "timestamp": "2026-10-05T11:01:00Z"
    },
    "bot_message": {
      "id": 103,
      "role": "bot",
      "content": "Halo Ahmad! Pertanyaan bagus sekali. Ingat konsep utamanya: saat sumber bunyi bergerak mendekat, gelombang bunyi akan termampatkan sehingga frekuensi yang terdengar menjadi lebih tinggi.\n\nRumus umumnya adalah:\n$$ f_p = \\left( \\frac{v \\pm v_p}{v \\mp v_s} \\right) f_s $$\n\nNah, jika pendengar diam ($v_p = 0$) dan sumber bunyi mendekat, tanda apa yang kita pakai untuk penyebutnya? Coba tebak!",
      "timestamp": "2026-10-05T11:01:03Z"
    }
  }
  ```

---

## 6. Admin Panel Endpoints

Prefix: `/api/admin/`

Endpoint khusus peran Administrator (`role: admin`) untuk mengawasi dan mengelola integritas data platform.

### 6.1 Statistik Platform
- **URL**: `/api/admin/stats`
- **Method**: `GET`
- **Auth**: Bearer Token (`role: admin`)
- **Response (200 OK)**:
  ```json
  {
    "total_users": 154,
    "total_students": 130,
    "total_teachers": 23,
    "total_classes": 18,
    "pending_verification": 7
  }
  ```

### 6.2 Antrean Verifikasi Pengguna
- **URL**: `/api/admin/verifications`
- **Method**: `GET`
- **Auth**: Bearer Token (`role: admin`)
- **Response (200 OK)**: Daftar akun guru & siswa yang memiliki atribut `is_verified: false` beserta data NIP/NISN untuk dicek keasliannya.

### 6.3 Verifikasi / Setujui Akun Pengguna
- **URL**: `/api/admin/<int:pk>/verify_user`
- **Method**: `POST`
- **Auth**: Bearer Token (`role: admin`)
- **Response (200 OK)**:
  ```json
  {
    "status": "verified",
    "user_id": 42
  }
  ```
