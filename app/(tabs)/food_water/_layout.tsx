import { Stack } from "expo-router";
import React from "react";

const StackLayout = () => {

  return(
    <Stack screenOptions={{headerTitleAlign:'center',                    
                           headerStyle: {
                            backgroundColor: '#AA4600'
                          },
                        }}>
        <Stack.Screen name='level' options={{title:'Food and Water Level'}}/>
    </Stack>
  )
}

export default StackLayout
