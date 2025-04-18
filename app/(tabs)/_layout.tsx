import TabBar from "@/components/TabBar";
import { Tabs } from "expo-router";
import React from "react";

const TabLayout = () => {

  return(
    <Tabs 
    tabBar={props=> <TabBar {...props}/>} 
    screenOptions={{tabBarLabel:'', 
                    headerShown: false
                  }}>
      <Tabs.Screen name="home"/>
      <Tabs.Screen name="manual"/>
      <Tabs.Screen name="food_water"/>
      <Tabs.Screen name="settings_page"/>
    </Tabs>
  ) 
}

export default TabLayout
