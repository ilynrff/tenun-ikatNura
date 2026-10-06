import { Suspense } from 'react';
import CheckoutPage from '@/components/checkout/CheckoutPage';

export const metadata = {
  title: 'Checkout — Tenun Ikat Nura',
  description: 'Selesaikan pemesanan karya busana tenun ikat warisan Nusantara dengan mudah dan aman.',
};

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CheckoutPage />
    </Suspense>
  );
}
