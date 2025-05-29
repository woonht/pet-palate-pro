import { Stack } from "expo-router"
import React, { useMemo } from "react"
import { useTextSize } from "@/components/text_size_context"
import { GestureHandlerRootView } from "react-native-gesture-handler"

const StackLayout = () => {

  const { textSize } = useTextSize()
  const headerKey = useMemo(() => `header-${textSize}`, [textSize]) // Force re-render when textSize changes
  const adjustedFontSize = Math.min(Math.round(textSize * 1.5), 30)

  return(
    <GestureHandlerRootView>
      <Stack key={headerKey} 
             screenOptions={{headerTitleAlign:'center',                    
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
