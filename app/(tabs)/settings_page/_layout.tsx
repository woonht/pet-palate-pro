import { Stack } from "expo-router";
import React from "react";

const StackLayout = () => {

  return(
    <Stack screenOptions={{headerTitleAlign:'center',                    
                           headerStyle: {
                            backgroundColor: '#AA4600'
                          },
                          
                        }}>
        <Stack.Screen name='settings' options={{title:'Settings'}}/>
        <Stack.Screen name='notification' options={{title:'Notification'}}/>
        <Stack.Screen name='automated_schedule' options={{title:'Automated Scheduling'}}/>
    </Stack>
  )
}

export default StackLayout
