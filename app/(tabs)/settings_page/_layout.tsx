import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const StackLayout = () => {

  return(
    <GestureHandlerRootView>
      <Stack screenOptions={{headerTitleAlign:'center',                    
                            headerStyle: {
                              backgroundColor: '#AA4600'
                              },
                              
                            }}>
          <Stack.Screen name='settings' options={{title:'Settings'}}/>
          <Stack.Screen name='notification' options={{title:'Notification'}}/>
          <Stack.Screen name='automated_schedule' options={{title:'Automated Scheduling'}}/>
      </Stack>
    </GestureHandlerRootView>
  )
}

export default StackLayout
