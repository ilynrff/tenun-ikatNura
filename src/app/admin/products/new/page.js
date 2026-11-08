import { redirect } from 'next/navigation';
import { verifyServerAdmin } from '@/lib/auth';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = {
  title: 'Tambah Produk Baru — Admin Tenun Ikat Nura',
};

export default async function NewProductPage() {
  const { authorized } = await verifyServerAdmin();
  if (!authorized) {
    redirect('/login?redirect=/admin/products/new');
  }

  return <ProductForm isEdit={false} />;
}
