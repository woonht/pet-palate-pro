import { Stack } from "expo-router";
import React from "react";

const StackLayout = () => {

  return(
    <Stack screenOptions={{headerTitleAlign:'center',                    
                           headerStyle: {
                            backgroundColor: '#AA4600'
                          },
                        }}>
        <Stack.Screen name='dispense' options={{title:'Manual Food Dispensing'}}/>
        <Stack.Screen name='log' options={{title:'Dispense Logs'}}/>
    </Stack>
  )
}

export default StackLayout
