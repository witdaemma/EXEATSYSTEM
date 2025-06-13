
"use client";

import Link from 'next/link';
import { LogOut, UserCircle, LayoutDashboard, Search, FilePlus, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from './Logo';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/lib/types';

const getInitials = (name: string = "") => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';
};

const getRoleBasedLinks = (role: UserRole | undefined) => {
  switch (role) {
    // Student links are handled by StudentSidebar
    case 'porter':
      return [{ href: '/porter/dashboard', label: 'Porter Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }];
    case 'hod':
      return [{ href: '/hod/dashboard', label: 'HOD Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }];
    case 'dsa':
      return [{ href: '/dsa/dashboard', label: 'DSA Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }];
    // Admin role removed
    default:
      return [];
  }
};


export function Header() {
  const { currentUser, logout } = useAuth();

  if (!currentUser || currentUser.role === 'student') { 
    // Header is not shown for students (they have a sidebar) or if no user
    return null;
  }

  const navLinks = getRoleBasedLinks(currentUser.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm print:hidden">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map(link => (
              <Button key={link.href} variant="ghost" asChild>
                <Link href={link.href} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  {link.icon}
                  {link.label}
                </Link>
              </Button>
            ))}
             <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <Search className="h-4 w-4" /> Verify Exeat
                </Link>
              </Button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {currentUser.role.toUpperCase()} Portal
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(currentUser.fullName)}`} alt={currentUser.fullName || "User"} data-ai-hint="user avatar" />
                  <AvatarFallback>{getInitials(currentUser.fullName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Settings and Help could be added here for staff if needed */}
              <DropdownMenuItem onClick={async () => await logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
