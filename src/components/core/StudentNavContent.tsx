"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: Home },
  { href: '/student/request-exeat', label: 'Request Exeat', icon: Plus },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/student/help', label: 'Help', icon: HelpCircle },
];

export function StudentNavContent() {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <div className="mb-8 px-4">
        <Logo />
      </div>
      <nav className="flex-grow space-y-2 px-4">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start text-base",
              pathname === item.href ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted"
            )}
          >
            <Link href={item.href}>
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto px-4">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start text-base hover:bg-muted"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Log Out
        </Button>
      </div>
    </>
  );
}
