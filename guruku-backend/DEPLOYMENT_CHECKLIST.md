# Guruku.AI Backend — Deployment Checklist

Dokumen ini digunakan sebelum menjalankan backend pada server production.

## 1. Environment

- [ ] Salin `.env.example` menjadi `.env` pada server.
- [ ] Buat `SECRET_KEY` baru khusus production.
- [ ] Set `DEBUG=False`.
- [ ] Isi `ALLOWED_HOSTS` dengan hostname backend tanpa `http://`, port, atau path.
- [ ] Simpan `GEMINI_API_KEY` hanya pada environment/secret manager.
- [ ] Jangan commit `.env`, password, API key, JWT secret, atau token.

Contoh nilai production:

```env
DEBUG=False
ALLOWED_HOSTS=api.example.com
```

## 2. Database

- [ ] Gunakan database production terpisah dari development.
- [ ] Isi `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, dan `DB_PORT`.
- [ ] Aktifkan SQL mode ketat melalui `DB_SQL_MODE`.
- [ ] Jalankan migrasi:

```bash
python manage.py migrate
```

- [ ] Pastikan backup database terjadwal.
- [ ] Uji proses restore backup.

## 3. Redis dan rate limit

Untuk deployment multi-worker, isi:

```env
REDIS_URL=redis://127.0.0.1:6379/1
```

Redis digunakan sebagai shared cache untuk rate limit chatbot. Konfigurasi chatbot saat ini:

```env
CHATBOT_RATE_LIMIT_COUNT=20
CHATBOT_RATE_LIMIT_WINDOW=300
```

Artinya satu pengguna dibatasi 20 pesan dalam 5 menit.

Jika `REDIS_URL` kosong, aplikasi memakai `LocMemCache`. Fallback ini hanya sesuai untuk development atau satu proses aplikasi, bukan deployment multi-worker.

- [ ] Redis server berjalan.
- [ ] Backend dapat terhubung ke Redis.
- [ ] Rate limit diuji setelah deployment.
- [ ] Redis tidak diekspos langsung ke internet.

## 4. Upload dan media

- [ ] Pastikan `MEDIA_ROOT` dapat ditulis oleh proses aplikasi.
- [ ] Pastikan storage media memiliki backup.
- [ ] Pertahankan validasi ukuran, ekstensi, MIME type, dan signature file.
- [ ] File materi maksimal 10 MB secara default.
- [ ] Video materi maksimal 50 MB secara default.
- [ ] File generator AI maksimal 10 MB secara default.
- [ ] Pastikan temporary file generator dihapus setelah proses berhasil maupun gagal.
- [ ] Pertimbangkan object storage untuk deployment berskala besar.

## 5. Static files dan server aplikasi

Jalankan:

```bash
python manage.py collectstatic --noinput
python manage.py check --deploy
```

Gunakan Gunicorn atau server WSGI/ASGI production, bukan `runserver`.

Contoh:

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

- [ ] Gunicorn berjalan sebagai service.
- [ ] Reverse proxy (Nginx/Caddy) dikonfigurasi.
- [ ] HTTPS aktif.
- [ ] HTTP diarahkan ke HTTPS.
- [ ] Header keamanan dan ukuran request dikonfigurasi.

## 6. AI provider

- [ ] API key Gemini tersedia melalui environment.
- [ ] Model yang digunakan diverifikasi sesuai konfigurasi project.
- [ ] Timeout provider aktif (`GEMINI_REQUEST_TIMEOUT=30`).
- [ ] Error provider tidak menampilkan detail internal kepada pengguna.
- [ ] Logging provider tersimpan di server dan tidak memuat secret.
- [ ] Batas penggunaan dan biaya Gemini dipantau.

Automated test memakai mock dan tidak membuktikan koneksi Gemini production secara nyata. Lakukan smoke test terkontrol setelah API key production dipasang.

## 7. Security verification

- [ ] Admin endpoint hanya menerima role `admin`.
- [ ] Chatbot hanya menerima role `student` dan `teacher`.
- [ ] Materi dibatasi berdasarkan pemilik kelas/anggota kelas.
- [ ] Pengumuman dibatasi berdasarkan pemilik kelas/anggota kelas.
- [ ] Upload file tidak menerima path dari nama file pengguna.
- [ ] Detail exception tidak dikirim ke client.
- [ ] CORS, CSRF, dan authentication settings ditinjau untuk domain production.
- [ ] Dependency vulnerability scan dijalankan.

## 8. Verification commands

```bash
python manage.py check
python manage.py check --deploy
python manage.py test -v 1
```

Hasil suite terakhir pada environment development:

```text
System check identified no issues
Ran 62 tests
OK
```

## 9. Monitoring dan operasional

- [ ] Logging aplikasi dikumpulkan.
- [ ] Error 5xx dipantau.
- [ ] CPU, memory, disk, database, Redis, dan latency Gemini dipantau.
- [ ] Health check backend tersedia.
- [ ] Prosedur rollback disiapkan.
- [ ] Prosedur rotasi secret disiapkan.
- [ ] Backup database dan media diuji secara berkala.
