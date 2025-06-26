import Link from 'next/link';
import { MountainSnow } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-headline font-semibold text-primary">
      <MountainSnow className="h-7 w-7" />
      <span>MTUEXCEAT</span>
    </Link>
  );
}
