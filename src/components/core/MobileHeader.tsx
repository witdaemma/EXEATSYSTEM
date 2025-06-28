"use client";

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { StudentNavContent } from './StudentNavContent';
import { Logo } from './Logo';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm md:hidden print:hidden">
      <Logo />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-64 flex-col bg-card p-0">
           <div className="flex h-full flex-col py-4" onClick={() => setIsOpen(false)}>
             <StudentNavContent />
           </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
