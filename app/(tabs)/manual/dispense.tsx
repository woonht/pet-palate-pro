import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { PlatformPressable } from "@react-navigation/elements"
import { router, useFocusEffect } from "expo-router"
import React, { useCallback, useState } from "react"
import { Alert, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTextSize } from "@/components/text_size_context"
import CustomLoader from "@/components/Custom_Loader"
import { useDevices } from "@/components/device_context"
import { useAuth } from "@/components/auth_context"

const FoodDispense = () => {

  const { textSize } = useTextSize()
  const text = dynamicStyles(textSize)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { loadUserFeeders, activeDeviceId } = useDevices()
  
  useFocusEffect(
      useCallback(() => {
          if (user?.name) {
              loadUserFeeders(user.name)
          }
  }, [user]))

  const sendDispenseCommand = async () => {
    try{
      setLoading(true)
      const response = await fetch('https://control7968.azurewebsites.net/api/send-command?', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ command: 'dispense_food', deviceId: activeDeviceId })
      })

      const result = await response.text()

      if (response.ok) {
        console.log('Command sent successfully:', result)
      } 
      else {
        console.warn('Failed to send command:', result)
        Alert.alert('Device Offline', 'Please make sure your pet feeder device is connected to Wi-Fi.')
      }      
    }
    catch(e){
      console.error('Sending error: ', e)
    }
    finally{
      setLoading(false)
    }
  }

  const confirmDispense = async () => {
    Alert.alert('Food dispense confirmation', "Are you sure you want to dispense the food?", [
      {text: 'No', style: 'cancel'},
      {text: 'Yes', onPress: () => sendDispenseCommand()}
    ])
  }

  if(loading){
    return <CustomLoader/>
  }

  return(
    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
      <PlatformPressable onPress={ () => router.push('/(tabs)/manual/log') } style={styles.container}>
        <View style={styles.IconTextLeft}>
          <Text style={text.settings_text}>Dispense Logs</Text>
          <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
        </View>
      </PlatformPressable>
      <View style={styles.button}>
        <PlatformPressable 
          onPress={() => confirmDispense()}
        >
          <AntDesign name="pluscircle" size={150} color="#AA4600"/>
        </PlatformPressable>
      </View>
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
    position: 'absolute',
    top: '40%',
    justifyContent: 'center',
    alignSelf: 'center',
  }
})

const dynamicStyles = (textSize:number) => ({
  settings_text: {

    fontSize: textSize,
  },

  settings_title: {

    fontSize: textSize*1.2
  },
})

export default FoodDispense
