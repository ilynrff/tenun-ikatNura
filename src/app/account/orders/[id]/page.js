import { Suspense } from 'react';
import OrderDetailPage from '@/components/account/OrderDetailPage';

export async function generateMetadata({ params }) {
  const resolvedParams = params ? await params : {};
  const orderId = resolvedParams?.id || '';

  return {
    title: `Detail Pesanan ${orderId} — Tenun Ikat Nura`,
    description: `Lihat status pemesanan, pelacakan pengiriman, dan rincian produk pesanan ${orderId} di Tenun Ikat Nura.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  const resolvedParams = params ? await params : {};
  const orderId = resolvedParams?.id || '';

  return (
    <Suspense fallback={null}>
      <OrderDetailPage orderId={orderId} />
    </Suspense>
  );
}

