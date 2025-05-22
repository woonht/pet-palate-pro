import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { PlatformPressable } from "@react-navigation/elements";
import { router } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FoodDispense = () => {

  const sendDispenseCommand = async (command:string) => {
    try{
      const response = await fetch('https://control7968.azurewebsites.net/api/send-command?', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ command })
      })

      const result = await response.text()
      console.log('Command sent successfully.', result)
    }
    catch(e){
      console.error('Sending error: ', e)
    }
  }

  return(
    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
      <PlatformPressable onPress={ () => router.push('/(tabs)/manual/log') } style={styles.container}>
        <View style={styles.IconTextLeft}>
          <Text>Dispense Logs</Text>
          <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
        </View>
      </PlatformPressable>
      <PlatformPressable 
      onPress={() => sendDispenseCommand('dispense_food')}
      android_ripple={{ color:null }}
      style={styles.button}>
        <AntDesign name="pluscircle" size={150} color="#AA4600"/>
      </PlatformPressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  
  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
    alignItems:'center',
    paddingTop: 20,
  },

  container: {

    backgroundColor: 'white',
    borderRadius: 25,
    width: '90%',
    paddingInline: 20,
    padding: 15,
  },

  IconTextLeft: {
    
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent:'space-between'    
  },

  button: {
    
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
export default FoodDispense
