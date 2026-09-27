import ProductForm from '@/components/admin/ProductForm';

export const metadata = {
  title: 'Tambah Produk Baru — Admin Tenun Ikat Nura',
};

export default function NewProductPage() {
  return <ProductForm isEdit={false} />;
}
