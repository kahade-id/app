// ⚠️  L-1 WARNING: ALL DATA IN THIS FILE IS PLACEHOLDER/FICTIONAL.
// This includes: team member names, blog articles, testimonials, company statistics,
// phone numbers, and social media links. Every value must be replaced with real data
// before this app is deployed to production. Using fake data in production is misleading
// to users and may create legal/compliance issues.
// Search for "PLACEHOLDER" below to find all values that need updating.

// PLACEHOLDER DATA — All values below are placeholder/example data for development.
// Replace with real values before production deployment.

export const site = {
  name: "Kahade",
  tagline: "Platform Escrow P2P",
  description: "Platform escrow untuk transaksi online yang aman. Dana ditahan sampai transaksi selesai.",
  url: "https://kahade.id",
  email: "support@kahade.id",
  phone: "0800-1234-5678",
  address: "Jl. Sudirman No. 123, Jakarta Pusat",
  socials: {
    instagram: "https://instagram.com/kahade.id",
    twitter: "https://twitter.com/kahade_id",
    linkedin: "https://linkedin.com/company/kahade",
    youtube: "https://youtube.com/@kahade",
  },
};

export const navItems = [
  {
    label: "Fitur",
    dropdown: [
      {
        group: "Produk",
        items: [
          { icon: "Shield", label: "Escrow Aman", desc: "Dana terlindungi sampai transaksi selesai", href: "/#keamanan" },
          { icon: "DeviceMobile", label: "Aplikasi Mobile", desc: "Transaksi dari mana saja", href: "/support" },
          { icon: "Globe", label: "Website", desc: "Akses dari browser Anda", href: "/" },
        ],
      },
      {
        group: "Untuk Siapa",
        items: [
          { icon: "Users", label: "Untuk Pembeli", desc: "Lindungi pembayaran Anda", href: "/#problem" },
          { icon: "ChartBar", label: "Untuk Penjual", desc: "Tingkatkan kepercayaan pembeli", href: "/#problem" },
        ],
      },
    ],
  },
  {
    label: "Harga",
    href: "/#harga",
  },
  {
    label: "Tentang",
    dropdown: [
      {
        group: "Perusahaan",
        items: [
          { icon: "Globe", label: "Tentang Kami", desc: "Cerita dan visi Kahade", href: "/about" },
          { icon: "Users", label: "Karir", desc: "Bergabung dengan tim kami", href: "/careers" },
        ],
      },
      {
        group: "Bantuan",
        items: [
          { icon: "Question", label: "Pusat Bantuan", desc: "FAQ dan panduan", href: "/support" },
          { icon: "DeviceMobile", label: "Hubungi Kami", desc: "Tim support 24/7", href: "/contact" },
        ],
      },
    ],
  },
  {
    label: "Blog",
    href: "/blog",
  },
];

export const footerLinks = {
  PRODUK: [
    { label: "Aplikasi Mobile", href: "/features#mobile" },
    { label: "Aplikasi Web", href: "/features#web" },
    { label: "Fitur", href: "/features" },
    { label: "Harga & Paket", href: "/pricing" },
    { label: "Keamanan", href: "/security" },
  ],
  BANTUAN: [
    { label: "Pusat Bantuan", href: "/support" },
    { label: "Pertanyaan Umum", href: "/faq" },
    { label: "Kontak Kami", href: "/contact" },
    { label: "Kirim Masukan", href: "/contact#feedback" },
    { label: "Status Sistem", href: "/status" },
  ],
  PERUSAHAAN: [
    { label: "Tentang Kami", href: "/about" },
    { label: "Karier", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Media Kit", href: "/media-kit" },
  ],
  LEGAL: [
    { label: "Syarat Layanan", href: "/terms" },
    { label: "Kebijakan Privasi", href: "/privacy" },
    { label: "Kebijakan Cookie", href: "/cookies" },
    { label: "Ketentuan Escrow", href: "/escrow-terms" },
    { label: "Kebijakan Pencegahan Penipuan", href: "/anti-fraud" },
  ],
};

// PLACEHOLDER — Stats below are example values for development/demo purposes.
export const companyStats = [
  { value: "10K+", label: "Pengguna Aktif" },
  { value: "Rp 50M+", label: "Dana Terlindungi" },
  { value: "99.9%", label: "Transaksi Sukses" },
  { value: "24/7", label: "Dukungan" },
];

// PLACEHOLDER — Team members below are fictional for development purposes.
export const teamMembers = [
  { name: "Ahmad Fauzi", role: "CEO & Co-Founder", bio: "Pengalaman 10+ tahun di fintech", linkedin: "#" },
  { name: "Sarah Wijaya", role: "CTO & Co-Founder", bio: "Former engineer di perusahaan teknologi", linkedin: "#" },
  { name: "Budi Santoso", role: "Head of Product", bio: "Passion di UX dan produk", linkedin: "#" },
  { name: "Dewi Kusuma", role: "Head of Operations", bio: "Fokus pada kepuasan pelanggan", linkedin: "#" },
];

export const values = [
  { title: "Keamanan", description: "Keamanan pengguna dan dana adalah prioritas utama kami." },
  { title: "Transparansi", description: "Tidak ada biaya tersembunyi, tidak ada proses yang tidak jelas." },
  { title: "Inovasi", description: "Kami terus berinovasi untuk menyederhanakan proses escrow." },
  { title: "Kepercayaan", description: "Kami membangun kepercayaan melalui layanan yang berkualitas." },
];

// PLACEHOLDER — Blog articles below are example content for development purposes.
export const blogArticles = [
  { id: "1", title: "Panduan: Cara Menggunakan Escrow untuk Transaksi Online", excerpt: "Pelajari langkah demi langkah cara menggunakan escrow untuk melindungi transaksi Anda.", category: "Panduan", readTime: "5 menit", author: "Tim Kahade", date: "1 Maret 2024", featured: true },
  { id: "2", featured: false, title: "10 Tips Aman Bertransaksi Online", excerpt: "Tips praktis untuk menjaga keamanan saat berbelanja atau berjualan online.", category: "Tips", readTime: "4 menit", author: "Ahmad Fauzi", date: "28 Februari 2024" },
  { id: "3", featured: false, title: "Kahade Mengumumkan Pendanaan Seri A", excerpt: "Kami berhasil mengamankan pendanaan untuk ekspansi dan pengembangan produk.", category: "Update", readTime: "3 menit", author: "Sarah Wijaya", date: "25 Februari 2024" },
  { id: "4", featured: false, title: "Cara Meningkatkan Kepercayaan Pembeli", excerpt: "Strategi efektif untuk membangun kepercayaan dan meningkatkan penjualan.", category: "Bisnis", readTime: "6 menit", author: "Budi Santoso", date: "20 Februari 2024" },
  { id: "5", featured: false, title: "Kisah Sukses: UMKM yang Berkembang", excerpt: "Cerita inspiratif dari UMKM yang berhasil mengembangkan bisnis dengan escrow.", category: "Kisah", readTime: "7 menit", author: "Dewi Kusuma", date: "15 Februari 2024" },
  { id: "6", featured: false, title: "Memahami Mekanisme Penyelesaian Sengketa", excerpt: "Penjelasan detail tentang bagaimana sistem penyelesaian sengketa kami bekerja.", category: "Panduan", readTime: "8 menit", author: "Tim Legal", date: "10 Februari 2024" },
];

// PLACEHOLDER — Job listings below are fictional for development purposes.
export const jobListings = [
  { id: "1", title: "Senior Frontend Engineer", department: "Engineering", location: "Jakarta / Remote", type: "Full-time", description: "Bantu kami membangun interface yang menakjubkan.", requirements: ["5+ tahun pengalaman React/TypeScript", "Pengalaman dengan Next.js", "Pemahaman UX/UI"] },
  { id: "2", title: "Backend Engineer", department: "Engineering", location: "Jakarta", type: "Full-time", description: "Bangun sistem escrow yang aman dan reliable.", requirements: ["3+ tahun pengalaman Go/Node.js", "Pengalaman dengan PostgreSQL", "Pemahaman distributed systems"] },
  { id: "3", title: "Product Manager", department: "Product", location: "Jakarta", type: "Full-time", description: "Pimpin pengembangan produk yang memudahkan pengguna.", requirements: ["3+ tahun pengalaman PM", "Pengalaman di fintech/e-commerce", "Kemampuan analitis kuat"] },
  { id: "4", title: "Customer Success", department: "Operations", location: "Jakarta", type: "Full-time", description: "Bantu pengguna mendapatkan pengalaman terbaik.", requirements: ["2+ tahun pengalaman customer service", "Problem-solving", "Komunikasi yang baik"] },
];

export const helpCategories = [
  { id: "getting-started", icon: "Rocket", title: "Memulai", description: "Panduan untuk pengguna baru", articles: ["Cara membuat akun", "Verifikasi identitas", "Transaksi pertama"] },
  { id: "transactions", icon: "ArrowsClockwise", title: "Transaksi", description: "Mengelola transaksi", articles: ["Membuat transaksi", "Mengirim dana", "Mengkonfirmasi penerimaan"] },
  { id: "payments", icon: "CreditCard", title: "Pembayaran", description: "Metode pembayaran dan biaya", articles: ["Metode pembayaran", "Biaya transaksi", "Refund"] },
  { id: "security", icon: "Shield", title: "Keamanan", description: "Tips dan informasi keamanan", articles: ["Verifikasi identitas", "Enkripsi data", "Laporkan penipuan"] },
  { id: "disputes", icon: "Scales", title: "Sengketa", description: "Penyelesaian masalah", articles: ["Mengajukan sengketa", "Proses mediasi", "Keputusan"] },
  { id: "account", icon: "User", title: "Akun", description: "Pengaturan akun", articles: ["Ubah profil", "Pengaturan keamanan", "Menutup akun"] },
];

export const faqData: Record<string, { q: string; a: string }[]> = {
  umum: [
    { q: "Apa itu Kahade?", a: "Kahade adalah platform escrow yang membantu melindungi transaksi online. Dana ditahan sampai transaksi selesai dan kedua pihak menyetujui." },
    { q: "Bagaimana cara kerja escrow?", a: "Pembeli kirim dana ke rekening escrow Kahade. Dana ditahan sampai pembeli terima dan konfirmasi barang. Baru kemudian dana dilepas ke penjual." },
    { q: "Apakah Kahade aman?", a: "Ya, Kahade menggunakan enkripsi tinggi dan rekening escrow terpisah untuk melindungi dana Anda. Kami juga terdaftar dan diawasi oleh regulator." },
  ],
  transaksi: [
    { q: "Berapa lama dana disimpan?", a: "Dana bisa disimpan maksimal 30 hari untuk transaksi standar. Jika lebih dari itu, transaksi akan otomatis dibatalkan dan dana dikembalikan." },
    { q: "Metode pembayaran apa yang tersedia?", a: "Kami mendukung transfer bank, Virtual Account, QRIS, dan dompet digital (GoPay, OVO, DANA, ShopeePay)." },
    { q: "Bagaimana jika penjual tidak kirim barang?", a: "Jika penjual tidak kirim dalam waktu yang disepakati, pembeli bisa ajukan pembatalan untuk pengembalian dana." },
  ],
  biaya: [
    { q: "Berapa biaya menggunakan Kahade?", a: "Biaya platform adalah 2.5% dari nilai transaksi, minimum Rp 2.500 dan maksimum Rp 250.000." },
    { q: "Apakah ada biaya pembatalan?", a: "Tidak ada biaya pembatalan jika transaksi dibatalkan sebelum penjual konfirmasi pengiriman." },
    { q: "Siapa yang membayar biaya?", a: "Biaya bisa ditanggung pembeli, penjual, atau dibagi sesuai kesepakatan." },
  ],
  keamanan: [
    { q: "Bagaimana data saya dilindungi?", a: "Data Anda dienkripsi saat dikirim dan disimpan. Kami juga menerapkan verifikasi identitas untuk semua pengguna." },
    { q: "Apa yang terjadi jika ada sengketa?", a: "Tim mediasi Kahade akan meninjau bukti dari kedua pihak dan membuat keputusan yang adil dalam 3-5 hari kerja." },
    { q: "Apakah Kahade terdaftar?", a: "Ya, Kahade terdaftar dan mematuhi regulasi yang berlaku di Indonesia." },
  ],
};

// PLACEHOLDER — Testimonials below are fictional for development/demo purposes.
export const testimonials = [
  { id: 1, name: "Rizky Maulana", role: "Pedagang Online", location: "Jakarta", rating: 5, text: "Sudah 3 tahun jualan online, baru sekarang bisa tidur tenang. Dana masuk ke escrow dulu, barang saya kirim, begitu pembeli konfirmasi baru cair.", amount: "Rp 18.5jt", txLabel: "Transaksi terlindungi" },
  { id: 2, name: "Siti Rahayu", role: "Pengusaha UMKM", location: "Surabaya", rating: 5, text: "Saya sempat ragu di awal, ternyata jauh melampaui ekspektasi. Uang saya dijaga ketat, proses transparan, dan tim support responsif.", amount: "Rp 47.2jt", txLabel: "Total transaksi aman" },
  { id: 3, name: "Bagas Prasetyo", role: "Freelancer", location: "Bandung", rating: 5, text: "Beli laptop second senilai 12 juta lewat Kahade. Barang datang sesuai deskripsi, kondisi mulus. Tenang dan aman.", amount: "Rp 12jt", txLabel: "Pembelian terlindungi" },
  { id: 4, name: "Diana Putri", role: "Content Creator", location: "Yogyakarta", rating: 5, text: "Jualan preset dan template digital, pembayarannya selalu lewat sini sekarang. Klien lebih percaya, konversi naik 40%.", amount: "Rp 8.3jt", txLabel: "Produk digital terjual" },
  { id: 5, name: "Fajar Nugroho", role: "Importir", location: "Medan", rating: 5, text: "Kami pakai Kahade untuk ratusan transaksi per bulan. Integrasinya mudah, dokumentasinya lengkap.", amount: "Rp 280jt", txLabel: "Volume bulan ini" },
  { id: 6, name: "Mega Lestari", role: "Reseller", location: "Semarang", rating: 5, text: "Pertama kali beli barang branded dari reseller yang belum saya kenal. Khawatir kena tipu, tapi pakai escrow jadi aman.", amount: "Rp 3.8jt", txLabel: "Pembelian fashion aman" },
  { id: 7, name: "Andri Syaputra", role: "Toko Gadget", location: "Makassar", rating: 5, text: "Penjualan lintas kota jadi lebih aman karena pembayaran ditahan dulu sampai barang diterima. Repeat order makin sering.", amount: "Rp 21.7jt", txLabel: "Omzet tersalurkan" },
];

export const partnerTypes = [
  {
    title: "Mitra Marketplace",
    description: "Integrasikan escrow Kahade ke platform marketplace Anda untuk memberikan keamanan transaksi.",
    benefits: [
      "Integrasi API yang mudah",
      "Dokumentasi lengkap",
      "Support teknis 24/7",
      "Revenue sharing",
    ],
    cta: "Jadi Mitra",
    url: "/contact",
  },
  {
    title: "Mitra Pembayaran",
    description: "Jadikan metode pembayaran Anda tersedia di platform Kahade.",
    benefits: [
      "Akses ke ribuan transaksi",
      "Proses settlement cepat",
      "Dashboard monitoring",
      "Promosi brand",
    ],
    cta: "Pelajari",
    url: "/contact",
  },
  {
    title: "Mitra Teknologi",
    description: "Berkolaborasi dalam pengembangan solusi escrow yang inovatif.",
    benefits: [
      "Akses sandbox environment",
      "Technical workshops",
      "Co-marketing opportunities",
      "Early access fitur baru",
    ],
    cta: "Hubungi",
    url: "/contact",
  },
];

// FIX: pressResources previously used url: "#" which scrolls to page top on click.
// Replaced with null to indicate not-yet-available download links. The press/page.tsx
// component handles null href gracefully (renders non-interactive element).
export const pressResources = [
  {
    title: "Logo Kit",
    description: "Logo Kahade dalam berbagai format (PNG, SVG, EPS)",
    size: "ZIP, 5MB",
    url: null as string | null,
  },
  {
    title: "Brand Guidelines",
    description: "Panduan penggunaan brand dan visual identity",
    size: "PDF, 2MB",
    url: null as string | null,
  },
  {
    title: "Press Kit",
    description: "Informasi perusahaan, foto tim, dan fact sheet",
    size: "ZIP, 15MB",
    url: null as string | null,
  },
  {
    title: "Fact Sheet",
    description: "Data dan statistik perusahaan terkini",
    size: "PDF, 1MB",
    url: null as string | null,
  },
];
