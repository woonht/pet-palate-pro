import { useTextSize } from "@/app/text_size_context";
import { Stack } from "expo-router";
import React, { useMemo } from "react";

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
        <Stack.Screen name='dispense' options={{title:'Manual Food Dispensing'}}/>
        <Stack.Screen name='log' options={{title:'Dispense Logs'}}/>
    </Stack>
  )
}

export default StackLayout
