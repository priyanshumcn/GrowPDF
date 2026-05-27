import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, BookOpen } from 'lucide-react';

// Minimal monochrome covers — no loud colors, just elegant texture + tone
const COVER_TONES = [
  { bg: '#1a1a2e', text: '#e8e4dc' },   // deep navy
  { bg: '#2d2d2d', text: '#f0ebe0' },   // charcoal
  { bg: '#3d3530', text: '#f5f0e8' },   // warm dark
  { bg: '#1e2a3a', text: '#e8edf5' },   // dark slate
  { bg: '#2a1e35', text: '#ede8f5' },   // dark plum
  { bg: '#1e352a', text: '#e8f5ed' },   // dark forest
  { bg: '#35251e', text: '#f5ede8' },   // dark clay
  { bg: '#252535', text: '#e8e8f5' },   // dark indigo
];

export const getCoverGradient = (id) => {
  const index = typeof id === 'number' ? id : (id?.toString().charCodeAt(0) || 0);
  return COVER_TONES[index % COVER_TONES.length];
};

const BookCover = ({ book, className = '' }) => {
  const tone = getCoverGradient(book?.id);

  if (book?.thumbnail) {
    return (
      <img
        src={book.thumbnail}
        alt={book?.title}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`w-full h-full flex flex-col justify-between p-4 relative overflow-hidden ${className}`}
      style={{ backgroundColor: tone.bg }}
    >
      {/* Subtle texture lines */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)',
      }} />
      {/* Spine line */}
      <div className="absolute left-5 top-0 bottom-0 w-px opacity-10" style={{ backgroundColor: tone.text }} />
      {/* Title */}
      <div className="relative z-10 mt-2">
        <p className="font-serif font-bold text-xs leading-snug line-clamp-4" style={{ color: tone.text, opacity: 0.92 }}>
          {book?.title}
        </p>
      </div>
      <div className="relative z-10">
        <p className="text-xs opacity-40 font-medium tracking-wide" style={{ color: tone.text }}>
          {book?.author}
        </p>
      </div>
    </div>
  );
};

const BookCard = ({ book, index = 0, linkPrefix = '/books' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.45 }}
      whileHover={{ y: -5 }}
      style={{ willChange: 'transform' }}
    >
      <Link to={`${linkPrefix}/${book.id}`} className="group block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300">
          {/* Cover */}
          <div className="aspect-[3/4] relative overflow-hidden">
            <BookCover book={book} />
            {/* Price badge */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-semibold text-primary shadow-sm">
              ${book.price}
            </div>
            {book.rentalPrice && (
              <div className="absolute top-3 left-3 bg-black/70 text-white/90 px-2 py-0.5 rounded-full text-xs">
                Rent ${book.rentalPrice}/d
              </div>
            )}
          </div>
          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold text-primary text-sm mb-0.5 line-clamp-1 group-hover:text-highlight transition-colors">
              {book.title}
            </h3>
            <p className="text-text-light text-xs mb-2">{book.author}</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${i < Math.floor(book.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                />
              ))}
              <span className="text-xs text-text-light ml-0.5">({book.reviews || 0})</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export { BookCover };
export default BookCard;
