import { useAuth } from "@/components/auth_context"
import { useTextSize } from "@/components/text_size_context"
import CustomLoader from "@/components/Custom_Loader"
import { FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "expo-router"
import React, { useCallback, useState } from "react"
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useDevices } from "@/components/device_context"
import Tooltip from 'react-native-walkthrough-tooltip'

const Monitor = () => {

  const [food , setFood] = useState('Not Detected')
  const [water, setWater] = useState('Not Detected')
  const [light, setLight] = useState(false)
  const { textSize } = useTextSize()
  const text = dynamicStyles(textSize)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { loadUserFeeders, activeDeviceId } = useDevices()
  const [refreshing, setRefreshing] = useState(false)
  const [online, setOnline] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
 
  useFocusEffect(
      useCallback(() => {
          if (user?.name) {
              loadUserFeeders(user.name)
          }
  }, [user]))

  const sendSignalToGetLevel = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://control7968.azurewebsites.net/api/send-command?", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "refresh", deviceId: activeDeviceId }),
      })

      if (!response.ok) {
        console.error("❌ Server error response.")
        setOnline(false)
        setLoading(false)
        return
      }
      const result = await response.json()
      setFood(result.response.payload.food_level)        
      setWater(result.response.payload.water_level)
      
      if(result.response.payload.feeder_mode === 'SCHEDULE'){
        setLight(false)
        setOnline(false)
      }
      else if(result.response.payload.feeder_mode === 'AI'){
        setLight(true)
        setOnline(true)
      }
      console.log("✅ Success:", result);
    } 
    catch (e) {
      console.error("❌ Network or parsing error:", e)
      Alert.alert("Error", "Something went wrong while sending the command.");
    }
    finally{
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await sendSignalToGetLevel()
      }
      fetchData()
    },[user, activeDeviceId]))

  const onRefresh = useCallback( async () => {
    setRefreshing(true)
    await sendSignalToGetLevel()
    setRefreshing(false)
  }, [sendSignalToGetLevel])

  if(loading){
    return <CustomLoader message="Loading device status..."/>
  }

  return(
    <SafeAreaView style={styles.whole_page}>
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {online ? (
          <View style={styles.status}>
            <Tooltip
              isVisible={showTooltip}
              content={<Text style={text.settings_text}>Device is online.</Text>}
              placement="left"
              onClose={() => setShowTooltip(false)}
            >
              <FontAwesome name="dot-circle-o" size={24} color="green" onPress={ () => setShowTooltip(true)}/>
            </Tooltip>
          </View>
        ): (
          <View style={styles.status}>
            <Tooltip
              isVisible={showTooltip}
              content={ <Text>Device is offline.</Text> }
              placement="left"
              contentStyle={{ backgroundColor: '#c7c6c3' }} 
              backgroundColor=""
              onClose={() => setShowTooltip(false)}
            >
              <FontAwesome name="dot-circle-o" size={24} color="#fc7303" onPress={ () => setShowTooltip(true)}/>
            </Tooltip>   
          </View>
        )}
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
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  
  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
  },

  scroll: {
    
    paddingTop: 10,
    flex: 1,
  },

  status: {

    justifyContent:'center',
    alignItems:'flex-end',
    padding: 10
  },

  tooltip: {

  },
  
  icon: {

    flex: 1,
    bottom: 40,
  },

  food_icon: {

    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },  
  
  water_icon: {

    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },  
  
  light_icon: {

    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
