'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import styles from '@/components/auth/AuthModal.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    login(email, password);
    router.push('/');
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 60px 20px', backgroundColor: '#ECE6DA' }}>
        <div className={styles.modal} style={{ position: 'relative', width: '460px' }}>
          <div className={styles.content}>
            <div className={styles.brandLabel}>Tenun Ikat Nura</div>
            <h1 className={styles.title}>WELCOME BACK</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label htmlFor="login-page-email" className={styles.label}>
                  Email
                </label>
                <input
                  id="login-page-email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="login-page-password" className={styles.label}>
                  Password
                </label>
                <input
                  id="login-page-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                />
              </div>

              <button
                type="button"
                onClick={() => alert('Lupa Password: Silakan hubungi Customer Service Admin WhatsApp Tenun Ikat Nura.')}
                className={styles.forgotLink}
              >
                Forgot Password?
              </button>

              <button type="submit" className={styles.submitBtn}>
                LOGIN
              </button>
            </form>

            <div className={styles.switchBox}>
              Don&apos;t have an account?
              <Link href="/register" className={styles.switchBtn}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
