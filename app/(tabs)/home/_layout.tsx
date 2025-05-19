import { Stack } from "expo-router";
import React from "react";

const StackLayout = () => {

  return(
    <Stack screenOptions={{headerTitleAlign:'center',                    
                           headerStyle: {
                            backgroundColor: '#AA4600'
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
