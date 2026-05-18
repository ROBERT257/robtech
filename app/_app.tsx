import { Slot } from 'expo-router';
import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

export default function AppEntry() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isRegistered) {
    return <RegisterScreen onRegisterSuccess={() => setIsRegistered(true)} />;
  }
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }
  return <Slot />;
}
