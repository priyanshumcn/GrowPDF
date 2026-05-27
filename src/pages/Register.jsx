import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, BookOpen, Building2, GraduationCap } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    upiId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) { setError('Please enter your name'); return; }
    if (!formData.email.trim()) { setError('Please enter your email'); return; }
    if (!formData.phone.trim()) { setError('Please enter your phone number'); return; }
    if (!formData.password) { setError('Please enter a password'); return; }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-text-light hover:text-highlight transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-soft">
          {step === 1 ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-highlight/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-highlight" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-primary mb-2">Join GrowPDF</h1>
                <p className="text-text-light">Tell us how you want to use the platform</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect('reader')}
                  className="w-full border-2 border-warm rounded-2xl p-6 text-left hover:border-highlight hover:bg-highlight/5 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-highlight/10 rounded-xl flex items-center justify-center group-hover:bg-highlight group-hover:text-white transition-colors flex-shrink-0">
                      <GraduationCap className="w-7 h-7 text-highlight group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary text-lg">Reader</h3>
                      <p className="text-text-light text-sm">Browse, read, and purchase books</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('publisher')}
                  className="w-full border-2 border-warm rounded-2xl p-6 text-left hover:border-highlight hover:bg-highlight/5 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors flex-shrink-0">
                      <Building2 className="w-7 h-7 text-accent group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary text-lg">Publisher</h3>
                      <p className="text-text-light text-sm">Upload and sell your books</p>
                    </div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-text-light hover:text-highlight transition-colors mb-4"
                >
                  ← Change role
                </button>
                <h1 className="text-3xl font-serif font-bold text-primary mb-2">Create Account</h1>
                <p className="text-text-light capitalize">Signing up as {role}</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-highlight transition-colors"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-highlight transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <p className="text-xs text-text-light mt-1">Temporary/disposable emails are not allowed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-highlight transition-colors"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:border-highlight transition-colors"
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-primary"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-highlight transition-colors"
                      placeholder="Repeat your password"
                      required
                    />
                  </div>
                </div>

                {role === 'publisher' && (
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">UPI ID (for payments)</label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3.5 focus:outline-none focus:border-highlight transition-colors"
                      placeholder="yourname@upi"
                    />
                    <p className="text-xs text-text-light mt-1">Required for receiving book sale payments</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-xl hover:bg-highlight transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <p className="text-center mt-6 text-text-light">
                Already have an account?{' '}
                <Link to="/login" className="text-highlight hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
