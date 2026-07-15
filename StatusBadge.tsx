import { Star, StarHalf } from 'lucide-react';

export default function StarRating({ rating, size = 15 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`Calificación: ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <Star key={i} size={size} fill="currentColor" strokeWidth={0} />;
        if (i === full && half) return <StarHalf key={i} size={size} fill="currentColor" strokeWidth={0} />;
        return <Star key={i} size={size} className="text-white/15" fill="currentColor" strokeWidth={0} />;
      })}
    </span>
  );
}
