type Props = { rating: number; max?: number };

export default function RatingStars({ rating, max = 5 }: Props) {
  const items = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div className="flex gap-1 text-amber-500 text-sm" aria-label={`Rating ${rating} of ${max}`}>
      {items.map((n) => (
        <span key={n}>{n <= rating ? '★' : '☆'}</span>
      ))}
    </div>
  );
}
