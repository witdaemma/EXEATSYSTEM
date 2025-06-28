"use client";

import { StudentNavContent } from './StudentNavContent';

export function StudentSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r bg-card py-4 shadow-md print:hidden md:flex">
      <StudentNavContent />
    </aside>
  );
}
