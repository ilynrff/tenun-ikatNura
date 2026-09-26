import AdminLayout from '@/components/admin/AdminLayout';

export const metadata = {
  title: 'Admin Panel — Tenun Ikat Nura',
  description: 'Sistem Pengelolaan Katalog dan Produk Tenun Ikat Nura',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
