import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Library, User, LogOut, Menu, X, Search, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${searchQuery}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass shadow-soft py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-highlight rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary font-serif">Grow<span className="text-highlight">PDF</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/books" className="text-text-light hover:text-highlight transition-colors duration-300 relative group">
              Browse Books
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-highlight transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/books?category=Technology" className="text-text-light hover:text-highlight transition-colors duration-300 relative group">
              Technology
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-highlight transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/books?category=Self-Help" className="text-text-light hover:text-highlight transition-colors duration-300 relative group">
              Self-Help
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-highlight transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-warm rounded-full transition-colors">
              <Search className="w-5 h-5 text-text-light" />
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/library" className="hidden md:flex p-2 hover:bg-warm rounded-full transition-colors">
                  <Library className="w-5 h-5 text-text-light" />
                </Link>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="w-10 h-10 bg-gradient-to-br from-highlight to-accent rounded-full flex items-center justify-center text-white font-semibold hover:shadow-glow transition-shadow">
                  {user.name?.charAt(0).toUpperCase()}
                </Link>
                <button onClick={logout} className="p-2 hover:bg-warm rounded-full transition-colors hidden md:block">
                  <LogOut className="w-5 h-5 text-text-light" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-text-light hover:text-highlight transition-colors">Sign In</Link>
                <Link to="/register" className="bg-primary text-white px-5 py-2.5 rounded-full hover:bg-highlight transition-all duration-300 hover:shadow-glow text-sm font-medium">
                  Get Started
                </Link>
              </div>
            )}

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2">
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-cream/95 backdrop-blur-sm flex items-start justify-center pt-32 animate-fade-in">
          <div className="w-full max-w-2xl px-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books, authors, topics..."
                className="w-full bg-white border-2 border-warm rounded-2xl px-6 py-4 pr-14 text-lg focus:outline-none focus:border-highlight transition-colors"
                autoFocus
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-highlight text-white rounded-xl">
                <Search className="w-5 h-5" />
              </button>
            </form>
            <button onClick={() => setSearchOpen(false)} className="mt-4 text-text-light hover:text-highlight transition-colors">
              Press ESC or click to close
            </button>
          </div>
        </div>
      )}

      {mobileMenu && (
        <div className="fixed inset-0 z-40 bg-cream pt-24 px-6 md:hidden animate-slide-in">
          <div className="flex flex-col gap-6">
            <Link to="/books" onClick={() => setMobileMenu(false)} className="text-2xl font-serif text-primary hover:text-highlight transition-colors">Browse Books</Link>
            <Link to="/books?category=Technology" onClick={() => setMobileMenu(false)} className="text-2xl font-serif text-primary hover:text-highlight transition-colors">Technology</Link>
            <Link to="/books?category=Self-Help" onClick={() => setMobileMenu(false)} className="text-2xl font-serif text-primary hover:text-highlight transition-colors">Self-Help</Link>
            <Link to="/books?category=Business" onClick={() => setMobileMenu(false)} className="text-2xl font-serif text-primary hover:text-highlight transition-colors">Business</Link>
            <hr className="border-warm" />
            {user ? (
              <>
                <Link to="/library" onClick={() => setMobileMenu(false)} className="text-xl text-text-light">My Library</Link>
                <Link to="/dashboard" onClick={() => setMobileMenu(false)} className="text-xl text-text-light">Dashboard</Link>
                <button onClick={() => { logout(); setMobileMenu(false); }} className="text-xl text-highlight text-left">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenu(false)} className="text-xl text-text-light">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenu(false)} className="bg-primary text-white px-6 py-3 rounded-full text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
