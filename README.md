# REMOTION-StoryTelling

Workspace **Remotion (React + TypeScript)** modular untuk memproduksi video *storytelling* vertikal **9:16 (`1080×1920`, `30fps`)** yang menggabungkan gaya visual **HD-2D / 2.5D Diorama**, **Stickman B1 Minimal Line Art**, dan **2.5D Motion Graphics**, dilengkapi **Social App SafeZone** serta *local Agent Skill* hemat token untuk **Codex**.

---

## Fitur Utama

1. **Modular per Topik, Multi-Episode, dan Terpisah per Part (`topics/<topic>/episodes/<episode>/parts/`):**
   - Setiap topik memiliki folder terisolasi di `src/topics/<topic>/` dan aset media eksternal di `public/topics/<topic>/`.
   - Satu topik dapat memiliki banyak episode (`ep-01`, `ep-02`, dst.), dan setiap episode dipecah menjadi komponen *part* kecil (`Part01*.tsx`, `Part02*.tsx`, ...).
   - Komponen di dalam suatu topik dapat dipakai lintas topik melalui *path alias* `@topics/<topic>/components/*`, sementara primitif inti tersedia di `@engine/*`.
2. **Alur Audio Eksternal per Part (Dengan atau Tanpa Caption):**
   - File audio yang sudah dipecah dari luar (`01-*.mp3|wav`, `02-*.mp3|wav`, ...) cukup diletakkan di `public/topics/<topic>/<episode>/parts/`.
   - Skrip `npm run sync -- <topic>/<episode>` menghitung durasi tiap audio secara *pure-JS* (tanpa wajib menginstal `ffprobe` global di Windows `PATH`) dan menyusun timeline `<TransitionSeries>` secara otomatis.
   - **Caption Opsional:** Mendukung file `<stem>.srt`, `<stem>.json`, *inline* `<CaptionOverlay>`, maupun video tanpa caption sama sekali.
3. **Hybrid Visual Engine & Composable Scene Archetypes (`src/engine/`):**
   - **Style Presets & Typography Scale (`@engine/theme`):** 4 preset terpadu (`hd2d-cinematic`, `b1-editorial`, `neo-25d-dark`, `neo-25d-light`) dengan `TYPE_SCALE` khusus layar ponsel (`hero: 84px` s.d. `caption: 32px`).
   - **4 Scene Archetypes (`@engine/archetypes/*`):** `<TitleHookScene>`, `<ComparisonCardsScene>`, `<ProcessFlowScene>`, dan `<SpotlightCalloutScene>`.
   - **4-Beat Choreography & Camera Rig (`@engine/motion/*`):** `SPRINGS`, `computePartBeats()`, `<CameraRig25D>`, `<Connector25D>`.
   - **HD-2D / 2.5D Kit (`@engine/hd2d/*`):** `GroundPlane`, `GroundItem`, `Billboard`, `Room` (3D *shadow-box diorama*), `HD2DOverlay` (*tilt-shift blur*, *vignette*, *color grade*), `DynamicLight`, `Rain`, `Embers`, `Dust`, dan `Px` (*pixel-grid SVG renderer*).
   - **Stickman B1 Kit (`@engine/stickman/*`):** `<Stickman>` SVG parametrik (`pose`, `expression`, `facing`, `handTarget`) serta `<PaperCard>`, `<SketchArrow>`, `<SketchCircle>`, dan `<InkUnderline>`, plus `<PaperStageOverlay />`.
4. **Caption-Aware 9:16 Social SafeZone (`<SafeStage>` & `<SafeLayout>`):**
   - Melindungi elemen penting dan teks dari area tombol/UI TikTok, Instagram Reels, dan YouTube Shorts (`Top UI`, `Right Action Stack`, `Bottom Description`) serta otomatis menghindari tabrakan dengan posisi subtitle aktif (`top-safe` / `bottom-safe`), lengkap dengan *toggle* `showSafeZones` di Remotion Studio.
5. **Token-Optimized Codex Skill & Style Auditor (`.agents/skills/remotion-storytelling/`):**
   - Dilengkapi *Art Direction Playbook* (`references/art-direction-playbook.md`) dan skrip audit statis `npm run audit-style` untuk memvalidasi determinisme, ukuran font (`>= 28px`), dan kepatuhan SafeZone sebelum masuk ke Remotion Studio.

---

## Struktur Direktori

```text
REMOTION-StoryTelling/
├── .agents/skills/remotion-storytelling/  # Local Codex Skill + CLI scripts
│   ├── SKILL.md
│   ├── references/
│   │   ├── art-direction-playbook.md      # Typography scale, 4-beat pacing & color governance
│   │   ├── engine-api.md                  # Components, archetypes & props reference
│   │   ├── safezone-motion.md             # 9:16 SafeZone coords & HD-2D motion rules
│   │   └── workflow.md                    # External audio -> scaffold -> sync -> Studio
│   └── scripts/
│       ├── audio-duration.mjs             # Pure-JS WAV/MP3 duration parser
│       ├── audit-style.mjs                # Static style, fontSize & SafeZone auditor
│       ├── registry.mjs                   # Auto-generates topic/part registries
│       ├── scaffold.mjs                   # CLI scaffolder for topics/episodes/parts
│       └── sync-episode.mjs               # CLI audio + optional caption synchronizer
├── AGENTS.md                              # Root instructions for Codex
├── HOW_TO_RUN.md                          # Detailed setup, Studio preview, render & troubleshooting guide
├── public/
│   ├── fonts/                             # Local WOFF2 fonts (Plus Jakarta Sans, Silkscreen)
│   └── topics/
│       └── safe-room/ep-01/               # External script, BGM, and per-part audio/captions
│           ├── script.md
│           └── parts/
│               ├── 01-cold-path.mp3
│               ├── 02-relief.mp3
│               ├── 03-signals.mp3
│               ├── 04-meaning.mp3
│               └── 05-loop-path.mp3
├── src/
│   ├── Root.tsx                           # Registers <Folder> per topic, episodes & part previews
│   ├── engine/                            # Shared HD-2D, Stickman B1, 2.5D, archetypes, SafeStage/SafeLayout
│   │   ├── archetypes/                    # TitleHookScene, ComparisonCardsScene, ProcessFlowScene, SpotlightCalloutScene
│   │   ├── audio/                         # PartAudio, CaptionOverlay, PartCaptionTrack
│   │   ├── episode/                       # EpisodePlayer, resolveParts, episode.types
│   │   ├── hd2d/                          # world, HD2DOverlay, DynamicLight, ParticleField, Px
│   │   ├── layout/                        # SafeStage, SafeLayout, BackgroundLayer, PaperStageOverlay
│   │   ├── motion/                        # choreography (SPRINGS, computePartBeats), CameraRig25D, Connector25D
│   │   ├── motion25d/                     # Card25D, KineticText
│   │   └── stickman/                      # Stickman, HandDrawnProps
│   └── topics/
│       └── safe-room/                     # Migrated HD-2D Safe Room topic
│           ├── components/                # Reusable topic components (@topics/safe-room/components/*)
│           └── episodes/ep-01/
│               ├── episode.data.json      # Auto-generated by npm run sync
│               ├── Episode.tsx
│               └── parts/                 # Modular per-part scene components
│                   ├── Part01ColdPath.tsx
│                   ├── Part02Relief.tsx
│                   ├── Part03Signals.tsx
│                   ├── Part04Meaning.tsx
│                   └── Part05LoopPath.tsx
└── tests/                                 # Automated Node test suite
```

---

## Panduan Penggunaan Cepat (*Workflow*)

> Untuk panduan instalasi, kontrol Remotion Studio, contoh prompt Codex, dan *troubleshooting* Windows secara lengkap, lihat **[HOW_TO_RUN.md](HOW_TO_RUN.md)**.

### 1. Menjalankan Live Preview (Remotion Studio)
```bash
npm run dev
```
Di sidebar Studio, kamu bisa membuka:
- **`safe-room` -> `safe-room-ep-01`**: Memutar satu episode penuh (`54,49 detik` / `1637 frame`) lengkap dengan 5 *part* audio.
- **`safe-room` -> `ep-01` -> `parts` -> `safe-room-ep-01-part-01` s.d. `05`**: Mempreview masing-masing *part* secara terisolasi.
- Gunakan panel **Props** di kanan Studio untuk menyalakan `showSafeZones` (garis bantu area aman TikTok/Reels/Shorts), `showCaptions`, `captionPlacement` (`"top-safe"` atau `"bottom-safe"`), dan `hd2dOverlay`.

### 2. Membuat Topik atau Episode Baru
```bash
# Membuat topik/episode baru dengan 4 part (style: hybrid | hd2d | b1-stickman)
npm run scaffold -- nama-topik/ep-01 --parts 4 --style hybrid

# Menambahkan 1 part baru ke episode yang sudah ada
npm run scaffold -- nama-topik/ep-01 --add-part --style hd2d
```

### 3. Menyinkronkan Audio Eksternal & Caption Opsional
Letakkan potongan audio per-*part* dengan awalan nomor urut (`01-intro.mp3`, `02-isi.wav`, dst.) di `public/topics/<topik>/<episode>/parts/`.
- *(Opsional)* Jika ada caption eksternal, letakkan file dengan nama sama (`01-intro.srt` atau `01-intro.json`) di folder yang sama.
- *(Opsional)* Jika ada musik latar, letakkan `bgm.mp3` atau `bgm.wav` di `public/topics/<topik>/<episode>/`.

Lalu jalankan:
```bash
npm run sync -- nama-topik/ep-01
```
Perintah ini akan memperbarui `src/topics/nama-topik/episodes/ep-01/episode.data.json` dengan `durationInFrames` yang presisi untuk setiap *part*.

### 4. Mengedit Adegan dengan Codex
Cukup minta Codex membaca `public/topics/<topik>/<episode>/script.md` dan mengedit `src/topics/<topik>/episodes/<episode>/parts/PartXX.tsx`. Karena adanya skill di `.agents/skills/remotion-storytelling/`, Codex akan langsung menggunakan komponen `@engine/*` dan `@topics/*` tanpa memuat aturan yang membebani token.

### 5. Verifikasi, Audit Style & Render Video (MP4)
```bash
# Audit konsistensi style, ukuran font ponsel, dan SafeZone
npm run audit-style

# Jalankan ESLint + TypeScript typecheck dan unit tests
npm run lint
npm test

# Render satu episode penuh ke MP4
npx remotion render safe-room-ep-01 out/safe-room-ep-01.mp4

# Render satu part saja untuk pengecekan cepat
npx remotion render safe-room-ep-01-part-01 out/part-01.mp4
```

---

## Catatan Troubleshooting di Windows

- Selalu hentikan `npm run dev` (Remotion Studio) dengan `Ctrl+C` di terminal agar *child process* browser tertutup secara bersih.
- Jika proses render sempat *crash* dan mengunci folder `.remotion` di Windows, hentikan *orphaned headless browser* dengan perintah:
  ```powershell
  Stop-Process -Name "chrome-headless-shell" -Force
  ```
