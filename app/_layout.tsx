// app/layout.tsx
import React from 'react'
import { Slot } from 'expo-router'
import { AuthProvider } from '../components/auth_context'
import Toast from 'react-native-toast-message'
import { TextSizeProvider } from '../components/text_size_context'
import { DeviceProvider } from '@/components/device_context'
import { PaperProvider } from 'react-native-paper' 

export default function RootLayout() {
  return (
    <AuthProvider>
      <DeviceProvider>
        <PaperProvider>
          <TextSizeProvider>
            <Slot/>
            <Toast/>
          </TextSizeProvider>
        </PaperProvider>
      </DeviceProvider>
    </AuthProvider>
  );
}
