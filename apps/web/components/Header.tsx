import Link from 'next/link';

export default function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b mb-4">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
        <div className="text-lg font-semibold">{title}</div>
        <Link href="/profile" className="text-sm text-brand">Profile</Link>
      </div>
    </header>
  );
}
