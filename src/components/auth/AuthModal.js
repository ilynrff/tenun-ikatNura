'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, setAuthModalMode, closeAuthModal, login, register } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    login(loginEmail, loginPassword);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPhone || !regPassword) return;
    register({
      fullName: regFullName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    });
  };

  return (
    <div className={styles.backdrop} onClick={closeAuthModal} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={closeAuthModal} aria-label="Tutup form">
          &times;
        </button>

        <div className={styles.content}>
          <div className={styles.brandLabel}>Tenun Ikat Nura</div>

          {authModalMode === 'login' ? (
            /* LOGIN FORM */
            <>
              <h2 className={styles.title}>WELCOME BACK</h2>
              <form onSubmit={handleLoginSubmit} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-login-email" className={styles.label}>
                    Email
                  </label>
                  <input
                    id="modal-login-email"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-login-password" className={styles.label}>
                    Password
                  </label>
                  <input
                    id="modal-login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => alert('Fitur Lupa Password: Silakan hubungi Customer Service Admin WhatsApp Tenun Ikat Nura.')}
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
                <button
                  type="button"
                  onClick={() => setAuthModalMode('register')}
                  className={styles.switchBtn}
                >
                  Create Account
                </button>
              </div>
            </>
          ) : (
            /* REGISTER FORM - ONLY 4 FIELDS: Full Name, Email, Phone Number, Password */
            <>
              <h2 className={styles.title}>CREATE YOUR ACCOUNT</h2>
              <form onSubmit={handleRegisterSubmit} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-reg-name" className={styles.label}>
                    Full Name
                  </label>
                  <input
                    id="modal-reg-name"
                    type="text"
                    required
                    placeholder="Nama Lengkap Anda"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-reg-email" className={styles.label}>
                    Email
                  </label>
                  <input
                    id="modal-reg-email"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-reg-phone" className={styles.label}>
                    Phone Number
                  </label>
                  <input
                    id="modal-reg-phone"
                    type="tel"
                    required
                    placeholder="0812-XXXX-XXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-reg-password" className={styles.label}>
                    Password
                  </label>
                  <input
                    id="modal-reg-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  CREATE ACCOUNT
                </button>
              </form>

              <div className={styles.switchBox}>
                Already have an account?
                <button
                  type="button"
                  onClick={() => setAuthModalMode('login')}
                  className={styles.switchBtn}
                >
                  Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
