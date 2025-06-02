import { Stack } from "expo-router";
import React, { useMemo } from "react";

const StackLayout = () => {
  
  return(
    <Stack screenOptions={{headerTitleAlign:'center',                    
                           headerStyle: {
                            backgroundColor: '#AA4600'
                          },
    }}>      
      <Stack.Screen name="sign_in" options={{headerShown: false}}/>
      <Stack.Screen name="sign_up" options={{headerShown: false}}/>
      <Stack.Screen name="device_switcher" options={{title: 'Device Switcher'}}/>
    </Stack>
  )
}

export default StackLayout
