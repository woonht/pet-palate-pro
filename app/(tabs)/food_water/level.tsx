import { useAuth } from "@/app/auth_context"
import { useTextSize } from "@/app/text_size_context"
import CustomLoader from "@/components/Custom_Loader"
import { FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "expo-router"
import React, { useCallback, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const Monitor = () => {

  const [food , setFood] = useState('Not Detected')
  const [water, setWater] = useState('Not Detected')
  const [light, setLight] = useState(false)
  const { textSize } = useTextSize()
  const text = dynamicStyles(textSize)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const foodLevel = async () => {
    try{
      const response = await fetch('', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      })

      const text = await response.text()
      
      if(!text){
        console.warn('Empty response received')
        return
      }

      const result = JSON.parse(text)

      if (result.error) {
          console.warn("Server responded with error:", result.error)
          return
      }
    
      if (result && typeof result === "object") {
        setFood(`${result.food_level}%` || 'Not detected')
        console.log("Food level info loaded:", result)
      }      
    }
    catch(e){
      console.error('Failed to get food level info: ', e)
    }
    finally{ 
      setLoading(false)
    }
  }

  const waterLevel = async () => {
    try{
      const response = await fetch('', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      })

      const text = await response.text()
      
      if(!text){
        console.warn('Empty response received')
        return
      }

      const result = JSON.parse(text)

      if (result.error) {
          console.warn("Server responded with error:", result.error)
          return
      }
    
      if (result && typeof result === "object") {
        setFood(result.water_level || '')
        console.log("Water level info loaded:", result)
      }
    }
    catch(e){
      console.error('Failed to get water level info: ', e)
    }
    finally{ 
      setLoading(false)
    }
  }

  const lightLevel = async () => {
    try{
      const response = await fetch('', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      })

      const text = await response.text()
      
      if(!text){
        console.warn('Empty response received')
        return
      }

      const result = JSON.parse(text)

      if (result.error) {
          console.warn("Server responded with error:", result.error)
          return
      }
    
      if (result && typeof result === "object") {
        setFood(result.light_level || '')
        console.log("Light level info loaded:", result)
      }
    }
    catch(e){
      console.error('Failed to get light density info: ', e)
    }
    finally{ 
      setLoading(false)
    }
  }

  // useFocusEffect(
  //   useCallback(() => {
  //     const fetchData = async () => {
  //       await foodLevel()
  //       await waterLevel()
  //       await lightLevel()
  //     }
  //     fetchData()
  //   },[user]))

  if(!loading){
    return <CustomLoader/>
  }

  return(
    <SafeAreaView style={styles.whole_page}>
      <View style={styles.icon}>
        <View style={styles.food_icon}> 
            <FontAwesome6 name="bowl-food" size={100} color="#AA4600" />
            <Text style={text.settings_text}>{food}</Text>
        </View>
        <View style={styles.water_icon}>
            <FontAwesome6 name="glass-water" size={100} color="#27ceff" />
            <Text style={text.settings_text}>{water}</Text>
        </View>  

        {light ? (
          <View style={styles.light_icon}>
              <FontAwesome name="sun-o" size={100} color="#f27d0f" />
              <Text style={text.settings_text}>Sufficient light, AI-Detected Feeding Active</Text>
          </View>      
        ) : (
          <View style={styles.light_icon}>
              <Ionicons name="moon" size={100} color="#f2ea0f" />
              <View style={styles.text}>
                <Text style={text.settings_text}>Insufficient light, Scheduled Feeding Active</Text>
              </View>
          </View>    
        )}    
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  
  icon: {

    flex: 1,
    bottom: 40,
  },

  food_icon: {

    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },  
  
  water_icon: {

    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },  
  
  light_icon: {

    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  text: {

    width: '80%',    
  }
})

const dynamicStyles = (textSize:number) => ({
  settings_text: {

    fontSize: textSize,
    textAlign: "center" as "center"
  },

  settings_title: {

    fontSize: textSize*1.2
  },
})

export default Monitor
