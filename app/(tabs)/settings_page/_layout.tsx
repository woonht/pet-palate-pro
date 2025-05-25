import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTextSize } from "@/app/text_size_context"

const StackLayout = () => {

  const { textSize } = useTextSize()
  const adjustedFontSize = Math.min(Math.round(textSize * 1.5), 30)

  return(
    <GestureHandlerRootView>
      <Stack screenOptions={{headerTitleAlign:'center',                    
                            headerStyle: {
                              backgroundColor: '#AA4600'
                            },
                            headerTitleStyle: {
                              fontSize: adjustedFontSize
                            }
                            }}>
          <Stack.Screen name='settings' options={{title:'Settings'}}/>
          <Stack.Screen name='notification' options={{title:'Notification'}}/>
          <Stack.Screen name='automated_schedule' options={{title:'Automated Scheduling'}}/>
      </Stack>
    </GestureHandlerRootView>
  )
}

export default StackLayout
