import React from 'react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { uiCopy } from '@/lib/uiCopy';

interface LoginButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function LoginButton({ 
  variant = 'default', 
  size = 'default',
  showIcon = true,
  className = ''
}: LoginButtonProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const disabled = isLoggingIn;

  const handleAuth = async () => {
    if (isAuthenticated) {
      // Log out and clear all cached data
      await clear();
      queryClient.clear();
    } else {
      // Log in
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        // Handle edge case where user is already authenticated
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const buttonText = isLoggingIn 
    ? uiCopy.auth.loggingIn 
    : isAuthenticated 
      ? uiCopy.auth.logout 
      : uiCopy.auth.login;

  const Icon = isLoggingIn ? Loader2 : isAuthenticated ? LogOut : LogIn;

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <Icon className={`h-4 w-4 mr-2 ${isLoggingIn ? 'animate-spin' : ''}`} />}
      {buttonText}
    </Button>
  );
}
