'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('reader');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, phone, password, role });
      router.push(role === 'publisher' ? '/dashboard' : '/books');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cream" />
            </div>
            <span className="font-serif font-bold text-2xl text-accent">GrowPDF</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-text">Create your account</h1>
          <p className="text-text-light text-sm mt-2">Step {step} of 2</p>
        </div>

        <div className="bg-cream border border-warm/60 rounded-2xl p-6 sm:p-8 shadow-soft overflow-hidden">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-serif text-xl font-semibold mb-1">I am a...</h2>
                <p className="text-text-light text-sm mb-5">Choose how you'll use GrowPDF</p>
                <div className="grid grid-cols-2 gap-3">
                  <RoleCard
                    active={role === 'reader'}
                    onClick={() => setRole('reader')}
                    title="Reader"
                    desc="Discover & read books"
                    icon="📖"
                  />
                  <RoleCard
                    active={role === 'publisher'}
                    onClick={() => setRole('publisher')}
                    title="Publisher"
                    desc="Upload & sell your work"
                    icon="✍️"
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-6 bg-primary text-cream font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:shadow-medium transition-shadow"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="step2"
                onSubmit={onSubmit}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <button type="button" onClick={() => setStep(1)} className="text-sm text-text-light hover:text-primary inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <Field icon={User} label="Full name" value={name} onChange={setName} placeholder="Jane Doe" required minLength={2} />
                <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
                <Field icon={Phone} label="Phone" type="tel" value={phone} onChange={setPhone} placeholder="+1 555 123 4567" required />
                <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 chars, with a number" required minLength={8} />
                <p className="text-[11px] text-text-light">Disposable emails and invalid phone numbers are blocked.</p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-cream font-semibold py-2.5 rounded-lg shadow-soft hover:shadow-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-text-light mt-6">
          Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

function RoleCard({ active, onClick, title, desc, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border-2 p-4 transition-all ${
        active ? 'border-primary bg-primary/5 shadow-soft' : 'border-warm hover:border-primary/40'
      }`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-serif font-semibold text-text flex items-center gap-2">
        {title}
        {active && <Check className="w-4 h-4 text-primary" />}
      </div>
      <div className="text-xs text-text-light mt-0.5">{desc}</div>
    </button>
  );
}

function Field({ icon: Icon, label, type = 'text', value, onChange, placeholder, required, minLength }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-warm bg-warm/30 focus:bg-cream focus:border-primary outline-none text-sm"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
