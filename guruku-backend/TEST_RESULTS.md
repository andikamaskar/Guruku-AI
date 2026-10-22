# Guruku.AI — Test Results

Dokumen ini merangkum skenario pengujian backend yang dijalankan menggunakan virtual environment project.

## Ringkasan terakhir

```text
Django check: lulus
Backend test suite: 62 test, OK
```

Test menggunakan mock untuk Gemini. Tidak ada API key atau request Gemini nyata yang dipakai oleh automated test.

## Matriks pengujian

| No | Area | Skenario | Expected result | Actual result | Status |
|---:|---|---|---|---|---|
| 1 | Chatbot | Student mengirim pertanyaan edukatif | Request diproses dan pesan tersimpan | Sesuai | Lulus |
| 2 | Chatbot | Teacher menggunakan chatbot | Request diizinkan | Sesuai | Lulus |
| 3 | Chatbot | Admin menggunakan chatbot | Ditolak | HTTP 403 | Lulus |
| 4 | Chatbot | Pertanyaan out-of-scope | Ditolak dan tidak disimpan | HTTP 400, tidak disimpan | Lulus |
| 5 | Chatbot | Pertanyaan unsafe | Ditolak dan tidak disimpan | HTTP 400, tidak disimpan | Lulus |
| 6 | Chatbot | Pesan kosong | Ditolak sebelum AI/rate limit | HTTP 400 | Lulus |
| 7 | Chatbot | Pesan melebihi batas | Ditolak | HTTP 400 | Lulus |
| 8 | Chatbot | Lebih dari 20 pesan/5 menit | Request berikutnya ditolak | HTTP 429 | Lulus |
| 9 | Chatbot | History recent dan history lama terpilih | History digabung, deduplikasi, dibatasi | Sesuai | Lulus |
| 10 | Chatbot | ID pesan dari conversation lain | Pesan asing diabaikan | Sesuai | Lulus |
| 11 | Chatbot | Classifier provider gagal | Fallback ambiguous/lanjut klarifikasi | Sesuai | Lulus |
| 12 | Chatbot | Tutor provider gagal | Pesan error aman dikembalikan | Sesuai | Lulus |
| 13 | Materials | Guru pemilik membaca materi | Diizinkan | HTTP 200 | Lulus |
| 14 | Materials | Siswa anggota membaca materi | Diizinkan | HTTP 200 | Lulus |
| 15 | Materials | Siswa bukan anggota membaca materi | Ditolak | HTTP 403 | Lulus |
| 16 | Materials | Siswa mengubah/menghapus materi | Ditolak | HTTP 403 | Lulus |
| 17 | Materials | Progress siswa bukan anggota | Ditolak | HTTP 403 | Lulus |
| 18 | Materials | File kosong | Ditolak | HTTP 400 | Lulus |
| 19 | Materials | File terlalu besar | Ditolak | HTTP 400 | Lulus |
| 20 | Materials | PDF valid berdasarkan signature | Diterima | HTTP 201 | Lulus |
| 21 | Materials | PDF palsu | Ditolak | HTTP 400 | Lulus |
| 22 | Materials | DOCX rusak | Ditolak | HTTP 400 | Lulus |
| 23 | Materials | Temporary file generator gagal diproses | Tetap dihapus | Sesuai | Lulus |
| 24 | Classes | Guru pemilik membaca pengumuman | Diizinkan | HTTP 200 | Lulus |
| 25 | Classes | Siswa anggota membaca pengumuman | Diizinkan | HTTP 200 | Lulus |
| 26 | Classes | Siswa bukan anggota membaca pengumuman | Ditolak | HTTP 403 | Lulus |
| 27 | Admin | Admin membaca statistik | Diizinkan | HTTP 200 | Lulus |
| 28 | Admin | Guru/siswa mengakses admin endpoint | Ditolak | HTTP 403 | Lulus |
| 29 | Database | SQL mode ketat aktif | Django check/test tanpa warning strict mode | Sesuai | Lulus |
| 30 | Cache | Redis tidak dikonfigurasi | Fallback LocMemCache bekerja | Sesuai | Lulus |

## Perintah verifikasi

Dari direktori `guruku-backend`:

```bash
./venv/Scripts/python.exe manage.py check
./venv/Scripts/python.exe manage.py test -v 1
```

## Batasan pengujian

- Gemini API nyata belum dipanggil dalam automated test.
- Redis server nyata belum diuji dalam sesi terakhir; yang diverifikasi adalah fallback cache lokal.
- Test database menggunakan MariaDB lokal.
- Pengujian frontend dan perangkat mobile tidak termasuk suite backend.
