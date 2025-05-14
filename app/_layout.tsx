// app/layout.tsx
import React from 'react'
import { Slot } from 'expo-router'
import { AuthProvider } from './auth_context'
import Toast from 'react-native-toast-message'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot/>
      <Toast/>
    </AuthProvider>
  );
}
