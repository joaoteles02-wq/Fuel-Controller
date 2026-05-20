'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { hapticFeedback } from '@/lib/data';
import styles from './Login.module.css';

export default function Login() {
  const { login } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback('impactLight');
    
    const success = login(pin);
    
    if (!success) {
      setError('PIN de acesso incorreto');
      setPin('');
      hapticFeedback('error');
    } else {
      hapticFeedback('success');
    }
  };

  return null;
}
