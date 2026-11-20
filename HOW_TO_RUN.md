# Panduan Menjalankan Proyek (`HOW_TO_RUN.md`)

Panduan langkah demi langkah untuk menjalankan, membuat episode baru, mempreview, dan merender video di workspace **REMOTION-StoryTelling**.

---

## 1. Prasyarat (*Prerequisites*)

Pastikan mesin kamu memiliki:
- **Node.js `>= 20`** (direkomendasikan `v20.19+`, `v22.13+`, atau `v24+`)
- **npm** (bawaan Node.js)
- **Git**
- *(Opsional)* **FFprobe / FFmpeg** di `PATH`: hanya diperlukan jika kamu memakai file audio `.m4a` atau `.ogg`. Untuk file **`.mp3`** dan **`.wav`**, skrip `npm run sync` menghitung durasi murni di Node.js tanpa butuh `ffprobe`.

---

## 2. Setup Pertama Kali

Jika baru pertama kali clone atau `node_modules` belum terpasang:

```bash
npm install
```

Verifikasi bahwa seluruh test dan linter berjalan normal:

```bash
npm test
npm run lint
npm run audit-style
```

---

## 3. Menjalankan Live Preview (Remotion Studio)

Untuk melihat hasil video secara interaktif per-frame tanpa perlu render MP4:

```bash
npm run dev
```

Di dalam **Remotion Studio** (browser):
1. Buka sidebar kiri untuk memilih komposisi:
   - **Episode penuh:** misalnya `safe-room` → **`safe-room-ep-01`**
   - **Per-part terisolasi:** misalnya `safe-room` → `ep-01` → `parts` → **`safe-room-ep-01-part-01`**
2. Gunakan panel **Props** di sebelah kanan untuk menguji tampilan:
   - `showSafeZones`: nyalakan (`true`) untuk menampilkan garis batas aman UI **TikTok / Instagram Reels / YouTube Shorts** dan area subtitle. *(Pastikan kembali ke `false` saat render final.)*
   - `showCaptions`: menyalakan/mematikan tampilan subtitle.
   - `captionPlacement`: memindahkan subtitle antara `"top-safe"` atau `"bottom-safe"` (layout `<SafeLayout>` otomatis menyesuaikan posisi konten agar tidak tertabrak).
   - `stylePreset`: memilih preset tema (`"hd2d-cinematic"`, `"b1-editorial"`, `"neo-25d-dark"`, `"neo-25d-light"`).
   - `finishing` / `hd2dOverlay`: mengatur efek *overlay* (`"auto"`, `"hd2d"`, `"paper"`, `"none"`).
   - `bgmVolume`: mengatur volume musik latar (`0` – `1`).

---

## 4. Alur Membuat Topik & Episode Baru (Hemat Token)

### Langkah 1 — *Scaffold* Struktur Folder
Buat topik/episode baru dengan menentukan slug (huruf kecil & tanda hubung `-`), jumlah part, dan gaya awal (`hybrid`, `hd2d`, atau `b1-stickman`):

```bash
npm run scaffold -- cara-kerja-internet/ep-01 --parts 4 --style hybrid
```

Jika nanti butuh menambah part baru ke episode yang sudah ada:
```bash
npm run scaffold -- cara-kerja-internet/ep-01 --add-part --style hybrid
```

### Langkah 2 — Masukkan Audio Eksternal (+ Caption/Naskah Opsional)
Taruh file audio yang sudah kamu pecah per-part di `public/topics/<topik>/<episode>/parts/` dengan awalan angka urut (`01-`, `02-`, dst.):

```text
public/topics/cara-kerja-internet/ep-01/
├── script.md              # Opsional: teks naskah / arahan visual untuk Codex
├── bgm.mp3                # Opsional: musik latar (bgm.mp3 atau bgm.wav)
└── parts/
    ├── 01-pembuka.mp3     # Wajib: audio Part 1 (.mp3, .wav, .m4a, atau .ogg)
    ├── 01-pembuka.srt     # Opsional: file subtitle Part 1 (.srt atau .json)
    ├── 02-isi.mp3         # Valid tanpa file .srt/.json
    └── ...
```

### Langkah 3 — Sinkronkan Durasi & Caption (`sync`)
Jalankan perintah ini setiap kali kamu menambah atau mengganti file audio/`.srt`:

```bash
npm run sync -- cara-kerja-internet/ep-01
```

Skrip ini akan menghitung `durationInFrames` akurat tiap part dan menyimpannya ke `src/topics/<topik>/episodes/<episode>/episode.data.json`.

### Langkah 4 — Authoring Visual per-Part dengan Codex
Minta Codex mengedit hanya file `PartXX.tsx` yang dituju (tidak perlu membaca episode lain). Contoh prompt:

> *"Baca `public/topics/cara-kerja-internet/ep-01/script.md` dan `episode.data.json`, lalu kerjakan `Part01.tsx` dan `Part02.tsx` menggunakan preset `neo-25d-light` dengan `<TitleHookScene>` dan `<Stickman>`."*

*(Jika kamu menambah atau mengganti nama file `PartXX*.tsx` secara manual, jalankan `npm run scaffold -- --registry` agar `parts.generated.ts` ikut ter-update.)*

### Langkah 5 — Audit & Verifikasi Sebelum Render
```bash
npm run audit-style   # Cek determinisme, fontSize >= 28px, dan kepatuhan SafeZone
npm run lint          # Cek ESLint + TypeScript (tsc --noEmit)
npm test              # Jalankan automated tests
```

---

## 5. Render Video ke MP4 / Gambar

Jika hasil preview di Remotion Studio (`npm run dev`) sudah memuaskan, render ke file MP4 di folder `out/`:

```bash
# Render 1 episode penuh
npx remotion render safe-room-ep-01 out/safe-room-ep-01.mp4

# Render 1 part tertentu saja (lebih cepat untuk cek hasil)
npx remotion render safe-room-ep-01-part-01 out/safe-room-ep-01-part-01.mp4

# Render 1 frame still PNG (contoh frame ke-90)
npx remotion still safe-room-ep-01 out/frame-90.png --frame=90
```

*(Pastikan `showSafeZones` bernilai `false` pada `defaultProps` atau lewat `--props='{"showSafeZones":false}'` saat merender video final.)*

---

## 6. Troubleshooting di Windows

- **Menghentikan Remotion Studio:** Selalu tutup `npm run dev` dengan menekan `Ctrl + C` di terminal lalu tunggu prosesnya selesai secara bersih.
- **Folder `node_modules` atau `.remotion` terkunci saat ingin dihapus:** Biasanya disebabkan oleh proses *orphan* `chrome-headless-shell.exe` yang masih berjalan di latar belakang. Hentikan dulu via PowerShell:
  ```powershell
  Stop-Process -Name "chrome-headless-shell" -Force
  ```
- **Error saat `npm run sync`:** Pastikan semua file audio di `parts/` diawali angka positif unik (`01-...`, `02-...`) dan apabila memakai `.srt`, format waktunya valid (`HH:MM:SS,mmm --> HH:MM:SS,mmm`).
