// app/layout.tsx
import React from 'react'
import { Slot } from 'expo-router'
import { AuthProvider } from './auth_context'
import Toast from 'react-native-toast-message'
import { TextSizeProvider } from './text_size_context'
import { ColorModeProvider } from './color_mode'

export default function RootLayout() {
  return (
    <AuthProvider>
      <TextSizeProvider>
        <ColorModeProvider>
          <Slot/>
          <Toast/>
        </ColorModeProvider>
      </TextSizeProvider>
    </AuthProvider>
  );
}
