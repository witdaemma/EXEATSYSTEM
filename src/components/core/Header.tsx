"use client";

import Link from 'next/link';
import { LogOut, UserCircle, LayoutDashboard, Search, FilePlus } from 'lucide-react';
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
import { UserRole } from '@/lib/types';

const getInitials = (name: string = "") => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const getRoleBasedLinks = (role: UserRole | undefined) => {
  switch (role) {
    case 'student':
      return [
        { href: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
        { href: '/student/request-exeat', label: 'Request Exeat', icon: <FilePlus /> },
      ];
    case 'porter':
      return [{ href: '/porter/dashboard', label: 'Pending Requests', icon: <LayoutDashboard /> }];
    case 'hod':
      return [{ href: '/hod/dashboard', label: 'Review Requests', icon: <LayoutDashboard /> }];
    case 'dsa':
      return [{ href: '/dsa/dashboard', label: 'Finalize Exeats', icon: <LayoutDashboard /> }];
    case 'admin':
      return [{ href: '/admin/verify', label: 'Verify Exeat', icon: <Search /> }];
    default:
      return [];
  }
};


export function Header() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return null; // Or a loading state/redirect handled by layout
  }

  const navLinks = getRoleBasedLinks(currentUser.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
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
                  <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(currentUser.fullName)}`} alt={currentUser.fullName} data-ai-hint="user avatar" />
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
              <DropdownMenuItem onClick={logout}>
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
