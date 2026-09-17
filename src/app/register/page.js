'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import styles from '@/components/auth/AuthModal.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password) return;
    register({ fullName, email, phone, password });
    router.push('/');
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 60px 20px', backgroundColor: '#ECE6DA' }}>
        <div className={styles.modal} style={{ position: 'relative', width: '460px' }}>
          <div className={styles.content}>
            <div className={styles.brandLabel}>Tenun Ikat Nura</div>
            <h1 className={styles.title}>CREATE YOUR ACCOUNT</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label htmlFor="reg-page-name" className={styles.label}>
                  Full Name
                </label>
                <input
                  id="reg-page-name"
                  type="text"
                  required
                  placeholder="Nama Lengkap Anda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="reg-page-email" className={styles.label}>
                  Email
                </label>
                <input
                  id="reg-page-email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="reg-page-phone" className={styles.label}>
                  Phone Number
                </label>
                <input
                  id="reg-page-phone"
                  type="tel"
                  required
                  placeholder="0812-XXXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="reg-page-password" className={styles.label}>
                  Password
                </label>
                <input
                  id="reg-page-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                CREATE ACCOUNT
              </button>
            </form>

            <div className={styles.switchBox}>
              Already have an account?
              <Link href="/login" className={styles.switchBtn}>
                Login
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
