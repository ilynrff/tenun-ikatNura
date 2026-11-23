import { Suspense } from 'react';
import OrdersListPage from '@/components/account/OrdersListPage';

export const metadata = {
  title: 'Pesanan Saya — Tenun Ikat Nura',
  description: 'Pantau riwayat pemesanan, status pengiriman, dan rincian produk busana tenun Anda di Tenun Ikat Nura.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrdersListPage />
    </Suspense>
  );
}

