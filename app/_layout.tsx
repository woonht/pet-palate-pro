// app/layout.tsx
import React from 'react'
import { Slot } from 'expo-router'
import { AuthProvider } from './auth_context'
import Toast from 'react-native-toast-message'
import { TextSizeProvider } from './text_size_context'

export default function RootLayout() {
  return (
    <AuthProvider>
      <TextSizeProvider>
        <Slot/>
        <Toast/>
      </TextSizeProvider>
    </AuthProvider>
  );
}
