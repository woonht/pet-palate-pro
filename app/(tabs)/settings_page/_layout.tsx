import { Stack } from "expo-router"
import React, { useMemo } from "react"
import { useTextSize } from "@/app/text_size_context"

const StackLayout = () => {

  const { textSize } = useTextSize()
  const headerKey = useMemo(() => `header-${textSize}`, [textSize]) // Force re-render when textSize changes
  const adjustedFontSize = Math.min(Math.round(textSize * 1.5), 30)

  return(
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
  )
}

export default StackLayout
