import { useTextSize } from "@/components/text_size_context";
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
                           },
                           navigationBarColor: '#FFF7ED'
                        }}>
        <Stack.Screen name='pet_profile' options={{title:'Pet Profile'}}/>
        <Stack.Screen name='basic_info' options={{title:'Pet Details'}}/>
        <Stack.Screen name='medical_record' options={{title:'Medical Record'}}/>
        <Stack.Screen name='prescription' options={{title:'Prescription'}}/>
        <Stack.Screen name='basic_info_input' options={{title:'Basic Information'}}/>
        <Stack.Screen name='personality_habit_input' options={{title:'Personality and Habit'}}/>
    </Stack>
  )
}

export default StackLayout
