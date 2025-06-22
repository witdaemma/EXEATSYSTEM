
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import { Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import type { UpdatePasswordData, UpdateProfileData } from '@/lib/types';

// Schema for updating profile (just full name)
const profileSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters.' }),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// Schema for updating password
const passwordSchema = z.object({
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { currentUser, firebaseUser, updateUserPassword, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: currentUser?.fullName || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmitProfile = async (values: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    try {
      const updateData: UpdateProfileData = { fullName: values.fullName };
      await updateUserProfile(updateData);
      toast({ title: "Success", description: "Profile updated successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onSubmitPassword = async (values: PasswordFormValues) => {
    if (!firebaseUser) {
      toast({ variant: "destructive", title: "Error", description: "Not authenticated." });
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const updateData: UpdatePasswordData = { newPassword: values.newPassword };
      await updateUserPassword(updateData);
      toast({ title: "Success", description: "Password updated successfully." });
      passwordForm.reset();
    } catch (error: any) {
      let errorMessage = "Failed to update password.";
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = "This operation is sensitive. Please log out and log back in to change your password.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and profile information.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Information Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <SettingsIcon className="mr-2 h-6 w-6 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <FormLabel>Email Address</FormLabel>
                  <Input type="email" value={currentUser?.email || ''} disabled />
                </div>
                {currentUser?.role === 'student' && (
                  <div className="space-y-2">
                    <FormLabel>Matric Number</FormLabel>
                    <Input value={currentUser?.matricNumber || 'N/A'} disabled />
                  </div>
                )}
                 <div className="space-y-2">
                    <FormLabel>Role</FormLabel>
                    <Input value={currentUser?.role.toUpperCase() || 'N/A'} disabled />
                  </div>
                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Change Password</CardTitle>
            <CardDescription>Update your login password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
