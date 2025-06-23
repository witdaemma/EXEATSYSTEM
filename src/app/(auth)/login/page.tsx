
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/core/Logo';
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from '@/lib/types';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, sendPasswordReset } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const user = await login(values.email, values.password);
      if (user) {
        toast({ title: "Login Successful", description: `Welcome back, ${user.fullName || user.email}!` });
        // Redirection logic is now primarily handled by src/app/page.tsx or AuthenticatedLayout
        // But we can still provide a default push here.
        switch (user.role as UserRole) {
          case 'student':
            router.push('/student/dashboard');
            break;
          case 'porter':
            router.push('/porter/dashboard');
            break;
          case 'hod':
            router.push('/hod/dashboard');
            break;
          case 'dsa':
            router.push('/dsa/dashboard');
            break;
          default:
            router.push('/'); 
        }
      } else {
        // This path might not be reached if Firebase throws an error first
        toast({ variant: "destructive", title: "Login Failed", description: "Invalid email or password." });
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred.";
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = "Invalid email or password.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Too many login attempts. Please try again later.";
            break;
          default:
            errorMessage = "Login failed. Please try again.";
        }
      }
      toast({ variant: "destructive", title: "Login Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = form.getValues("email");
    if (!email || !z.string().email().safeParse(email).success) {
      toast({ variant: "destructive", title: "Forgot Password", description: "Please enter a valid email address first."});
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      toast({ title: "Password Reset Email Sent", description: "If an account exists for this email, a password reset link has been sent." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Sending Reset Email", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-fit">
            <Logo />
          </div>
          <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@mtu.edu.ng" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm h-auto py-0"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Student?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
           <p className="text-xs text-muted-foreground">
            Porter/HOD/DSA should use provided credentials.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
