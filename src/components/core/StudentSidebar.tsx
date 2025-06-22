
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, ListChecks, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: Home },
  { href: '/student/request-exeat', label: 'Request Exeat', icon: Plus },
  { href: '/student/dashboard', label: 'My Requests', icon: ListChecks }, // Points to dashboard as it shows requests
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/student/help', label: 'Help', icon: HelpCircle },
];

export function StudentSidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card p-4 shadow-md print:hidden">
      <div className="mb-8">
        <Logo />
      </div>
      <nav className="flex-grow space-y-2">
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
      <div className="mt-auto">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start text-base hover:bg-muted"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Log Out
        </Button>
      </div>
    </aside>
  );
}
