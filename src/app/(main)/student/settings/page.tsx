
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences.</p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <SettingsIcon className="mr-2 h-6 w-6 text-primary" />
            Account Settings
          </CardTitle>
          <CardDescription>Update your profile information and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" defaultValue={currentUser?.fullName} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue={currentUser?.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="matricNumber">Matric Number</Label>
            <Input id="matricNumber" defaultValue={currentUser?.matricNumber || 'N/A'} disabled />
          </div>
          
          <div className="border-t pt-6 space-y-4">
             <h3 className="text-lg font-semibold">Change Password</h3>
             <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
              </div>
              <Button disabled>Update Password (Coming Soon)</Button>
          </div>
           <div className="text-center text-muted-foreground pt-4">
            More settings will be available soon.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    