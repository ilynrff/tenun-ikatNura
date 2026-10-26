/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // Izinkan Next.js Image Optimizer merender gambar dari Supabase Storage
    // proyek ini. Hanya host spesifik proyek yang diizinkan (bukan wildcard).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eieyzehxptpfhyzvbnms.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
