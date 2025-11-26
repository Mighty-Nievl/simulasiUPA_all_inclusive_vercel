# Simulasi UPA PERADI ⚖️

**Sistem Pembelajaran Gamifikasi untuk Ujian Profesi Advokat**

Aplikasi simulasi ujian interaktif yang dirancang untuk membantu calon advokat mempersiapkan diri menghadapi Ujian Profesi Advokat (UPA) PERADI. Dibangun dengan teknologi web modern untuk memberikan pengalaman belajar yang *engaging*, cepat, dan efektif.

![Preview Aplikasi](https://www.simupa.web.id/opengraph-image.png)

## ✨ Fitur Utama

* **📚 Bank Soal Premium**: 200 soal terupdate yang mencakup 8 materi hukum utama sesuai kisi-kisi PERADI.
* **🎮 Gamification System**:
  * **Sesi Bertahap**: Materi dibagi menjadi 20 sesi (10 soal/sesi) agar tidak membosankan.
  * **Instant Feedback**: Penjelasan langsung muncul jika jawaban salah.
  * **Hybrid Sync (Offline-First)**: Progress tersimpan otomatis di LocalStorage (cepat) dan tersinkronisasi ke Database (aman) saat online.
  * **Celebration Effects**: Efek confetti saat berhasil menyelesaikan sesi dengan nilai sempurna.
* **🎨 UI/UX Modern**:
  * **Global Dark Mode**: Tampilan elegan yang nyaman di mata, konsisten di seluruh halaman.
  * **Responsive Design**: Optimal di Desktop, Tablet, dan Mobile.
  * **Smooth Animations**: Transisi antar soal yang halus menggunakan `framer-motion`.
* **🔐 Secure Auth**: Login aman menggunakan Google OAuth & Email via Supabase.

## 🛠️ Teknologi yang Digunakan

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
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

3. **Konfigurasi Environment**
    Buat file `.env` di root project dan tambahkan konfigurasi berikut:

    ```env
    # Domain Configuration
    NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
    NEXT_PUBLIC_APP_URL=http://localhost:3000

    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4. **Setup Database (Supabase)**
    Jalankan script SQL yang ada di file `supabase_schema.sql` pada SQL Editor di Dashboard Supabase Anda untuk membuat tabel `user_progress` dan mengaktifkan fitur sinkronisasi.

5. **Jalankan Development Server**

    ```bash
    pnpm dev
    ```

6. **Buka di Browser**
    Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

## 📂 Struktur Project

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/             # API Routes (Questions, Sync, Auth)
│   ├── app/             # Application Subdomain Pages (Dashboard/Exam)
│   ├── auth/            # Auth Callback Routes
│   ├── daftar/          # Registration Page
│   ├── login/           # Login Page
│   ├── globals.css      # Global styles & Tailwind directives
│   ├── layout.tsx       # Root layout with ThemeProvider
│   └── page.tsx         # Landing page
├── components/          # React components
│   ├── ExamSimulation.tsx # Core exam logic & UI
│   └── ThemeProvider.tsx  # Global dark mode context
├── data/                # Static data
│   └── questions.json   # Database soal (JSON format)
├── lib/                 # Utility functions
│   ├── auth.ts          # Auth helpers (Cookies)
│   ├── config.ts        # App configuration & constants
│   ├── progress.ts      # Logic progress & sync
│   └── supabase/        # Supabase clients (Client/Server/Middleware)
└── middleware.ts        # Domain routing middleware
```

## 📝 Lisensi

Project ini dibuat untuk tujuan edukasi.

**Developer**: [Mighty-Nievl](https://github.com/Mighty-Nievl)
**Tahun**: 2025
