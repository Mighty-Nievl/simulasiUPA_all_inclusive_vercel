# Simulasi UPA PERADI ⚖️

**Sistem Pembelajaran Gamifikasi untuk Ujian Profesi Advokat**

Aplikasi simulasi ujian interaktif yang dirancang untuk membantu calon advokat mempersiapkan diri menghadapi Ujian Profesi Advokat (UPA) PERADI. Dibangun dengan teknologi web modern untuk memberikan pengalaman belajar yang *engaging*, cepat, dan efektif.

![Preview Aplikasi](https://www.simupa.web.id/opengraph-image.png)

## ✨ Fitur Utama

* **📚 Bank Soal Premium**: 200 soal terupdate yang mencakup 8 materi hukum utama sesuai kisi-kisi PERADI.
* **🎮 Gamification System**:
  * **Sesi Bertahap**: Materi dibagi menjadi 20 sesi (10 soal/sesi) agar tidak membosankan.
  * **Instant Feedback**: Penjelasan langsung muncul jika jawaban salah.
  * **Progress Tracking**: Simpan progress belajar Anda secara otomatis.
  * **Celebration Effects**: Efek confetti saat berhasil menyelesaikan sesi dengan nilai sempurna.
* **🎨 UI/UX Modern**:
  * **Global Dark Mode**: Tampilan elegan yang nyaman di mata untuk belajar malam hari.
  * **Responsive Design**: Optimal di Desktop, Tablet, dan Mobile.
  * **Smooth Animations**: Transisi antar soal yang halus menggunakan `framer-motion`.
* **⚡ Performa Tinggi**: Dibangun dengan Next.js 15 untuk loading super cepat.

## 🛠️ Teknologi yang Digunakan

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
* **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Cara Menjalankan Project

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal Anda:

1. **Clone Repository**

    ```bash
    git clone https://github.com/username/simulasi-upa.git
    cd simulasi-upa
    ```

2. **Install Dependencies**
    Pastikan Anda sudah menginstall Node.js dan pnpm.

    ```bash
    pnpm install
    ```

3. **Jalankan Development Server**

    ```bash
    pnpm dev
    ```

4. **Buka di Browser**
    Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

## 📂 Struktur Project

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/             # API Routes (Questions, Submit, Reset)
│   ├── globals.css      # Global styles & Tailwind directives
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   └── ExamSimulation.tsx # Core exam logic & UI
├── data/                # Static data
│   └── questions.json   # Database soal (JSON format)
└── lib/                 # Utility functions
    └── progress.ts      # Logic progress & local storage
```

## 📝 Lisensi

Project ini dibuat untuk tujuan edukasi.

**Developer**: Rezal Helvin Bramantara, S.H.
**Tahun**: 2025
