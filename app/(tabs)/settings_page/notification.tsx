import { FontAwesome6 } from "@expo/vector-icons"
import React, { useCallback, useEffect, useState } from "react"
import { Alert, Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Notifications from 'expo-notifications'
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTextSize } from "@/components/text_size_context"
import { useAuth } from "@/components/auth_context"
import { registerForPushNotificationsAsync } from "@/components/NotificationService"
import { useDevices } from "@/components/device_context"

  const Notification = () => {

    const [isEnable, setIsEnable] = useState(false)
    const [isEnableLevel, setIsEnableLevel] = useState(false)
    const [isEnableDispense, setIsEnableDispense] = useState(false)
    const [isEnableReminder, setIsEnableReminder] = useState(false)
    const [token, setToken] = useState('')
    const { textSize } = useTextSize()
    const text = dynamicStyles(textSize)
    const { user } = useAuth()
    const { activeDeviceId } = useDevices()
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }), 
    })

    useEffect( () => {
      const loadNotifcationSettings = async () => {
        try{
          const enable = await AsyncStorage.getItem(`isEnable_${user?.userID}_${activeDeviceId}`)
          const level = await AsyncStorage.getItem(`isEnableLevel_${user?.userID}_${activeDeviceId}`)
          const dispense = await AsyncStorage.getItem(`isEnableDispense_${user?.userID}_${activeDeviceId}`)
          const reminder = await AsyncStorage.getItem(`isEnableReminder_${user?.userID}_${activeDeviceId}`)

          if(enable)
            setIsEnable(JSON.parse(enable))
          if(level)
            setIsEnableLevel(JSON.parse(level))
          if(dispense)
            setIsEnableDispense(JSON.parse(dispense))
          if(reminder)
            setIsEnableReminder(JSON.parse(reminder))
          console.log('Settings load successfully.')
        }
        catch(e){
          console.log('Loading Error: ', e)
        }
      }
      loadNotifcationSettings()
    },[])
    
    const handleEnableNotification = async (enable:boolean) => {
      setIsEnable(enable)
      await AsyncStorage.setItem(`isEnable_${user?.userID}_${activeDeviceId}`, JSON.stringify(enable))

      if(enable){
        console.log('enable: ', enable)
        console.log('Notification enable')

        const expoToken = await registerForPushNotificationsAsync()

        if (!expoToken || expoToken.trim() === '') {
          Alert.alert('Expo token is empty, aborting save.');
          return;
        }

        if (expoToken) {
          setToken(expoToken)
          
          try{
            const updatedToken= {
              userID: user?.userID,
              device_id: activeDeviceId,
              formType: 'push_token',
              expoPushToken: expoToken,
              notification: isEnable,
              level_notification: isEnableLevel,
              dispense_notification: isEnableDispense,
            }

            const response = await fetch('https://appinput.azurewebsites.net/api/savepushtoken?',{
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(updatedToken)
            })

            const result = await response.json()
            console.log('Successfully update token to database. ', result)
          }
          catch(e){
            console.error('Saving error to database: ', e)
          }
        }

        handleLevelNotification(true)
        handleDispenseNotification(true)
        handleReminderNotification(true)

        await AsyncStorage.multiSet([
          [`isEnableLevel_${user?.userID}_${activeDeviceId}`, JSON.stringify(true)],
          [`isEnableDispense_${user?.userID}_${activeDeviceId}`, JSON.stringify(true)],
          [`isEnableReminder_${user?.userID}_${activeDeviceId}`, JSON.stringify(true)]
        ])
      }
      else{
        console.log('enable: ',enable)
        await Notifications.cancelAllScheduledNotificationsAsync()
        console.log('Notification disable')

        handleLevelNotification(false)
        handleDispenseNotification(false)
        handleReminderNotification(false)

        await AsyncStorage.multiRemove([
          `isEnableLevel_${user?.userID}_${activeDeviceId}`,
          `isEnableDispense_${user?.userID}_${activeDeviceId}`,
          `isEnableReminder_${user?.userID}_${activeDeviceId}`
        ])
      }
    } 
    
    const handleLevelNotification = async (enable:boolean) => {
      setIsEnableLevel(enable)
      await AsyncStorage.setItem(`isEnableLevel_${user?.userID}_${activeDeviceId}`, JSON.stringify(enable))
      
      if(enable === true){
        console.log('Food and Water Level Notification enable.')
      }
      else{
        console.log('Food and Water Level Notification disable.')
      }
    }

    const handleDispenseNotification = async (enable:boolean) => {
      setIsEnableDispense(enable)
      await AsyncStorage.setItem(`isEnableDispense_${user?.userID}_${activeDeviceId}`, JSON.stringify(enable))
      
      if(enable === true){
        console.log('Food Dispense Notification enable.')
      }
      else{
        console.log('Food and Water Level Notification disable.')
      }
    }

    const handleReminderNotification = async (enable:boolean) => {
      setIsEnableReminder(enable)
      await AsyncStorage.setItem(`isEnableRe  minder_${user?.userID}_${activeDeviceId}`, JSON.stringify(enable))

      if(enable == true) {
        
        console.log('Reminder Notification enable.')

        await scheduleNotifications({
          title: 'Weekly Reminder',
          body: 'Clean the device.',
          hour: 9,
          minute: 0,
          weekday: 1 // 1 - Sunday, 7 - Saturday
        })
      
        await scheduleNotifications({
          title: 'Daily Reminder',
          body: 'Please make sure that you have refill the food and water',
          hour: 8,
          minute: 0,
        })
      }
      else {
        console.log('Reminder Notification disable.')
      }
    }

    const scheduleNotifications = async ({
      title,
      body,
      hour,
      minute,
      weekday, // optional
      repeats = true,
    }: {
      title: string
      body: string
      hour: number
      minute: number
      weekday?: number
      repeats?: boolean
    }) => {
      if (weekday !== undefined) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            weekday,
            hour,
            minute,
            repeats,
          },
        })
      } 
      else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour,
            minute,
            repeats,
          },
        })
      }
    }

  useEffect( () => {
    const saveToken = async () => {
      try{
        const updatedToken= {
          userID: user?.userID,
          device_id: activeDeviceId,
          formType: 'push_token',
          expoPushToken: token,
          notification: isEnable,
          level_notification: isEnableLevel,
          dispense_notification: isEnableDispense,
        }
        const response = await fetch('https://appinput.azurewebsites.net/api/savepushtoken?',{
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(updatedToken)
        })
        const result = await response.json()
        console.log('Successfully update token to database. ', result)
      }
      catch(e){
        console.error('Saving error to database: ', e)
      }
    }
    saveToken()
    saveDeviceConfig()
  }, [token, isEnable, isEnableDispense, isEnableLevel])

  const saveDeviceConfig = async () => {
    try{
      const formType = 'device_config'
      const response = await fetch(`https://appinput.azurewebsites.net/api/GetDeviceConfig?userID=${user?.userID}&formType=${formType}&device_id=${activeDeviceId}`,{
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      })
      
      const text = await response.text()
      
      if(!text){
        console.warn('Empty response from backend')
        return
      }
      
      const result = JSON.parse(text)
      console.log('Successfully load device config: ', result)
      
      const deviceConfig = {
        userID: user?.userID,
        device_id: activeDeviceId,
        count: result.count,
        deviceMode: result.deviceMode,
        formType: result.formType,
        schedulelist: result.schedulelist,
        notification: isEnable,
        level_notification: isEnableLevel,
        dispense_notification: isEnableDispense,
      }
      
      try{
        const response = await fetch('https://appinput.azurewebsites.net/api/SaveDeviceConfig?', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(deviceConfig)
      })

        const result = await response.json()
        console.log('Data saved successfully: ', result)
      } 
      catch(e){
        console.error('Saving error: ', e)
      }
    }
    catch(e){
      console.error('Device config load error: ', e)
    }
  }
    
    return(
      <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>

        <View style={styles.enable}>
          <Pressable onPress={ () => handleEnableNotification(!isEnable) }>
            <View style={styles.option}>
              <Text style={text.settings_text}>Enable</Text>
              {isEnable ? 
              <FontAwesome6 name="toggle-on" size={35} color="#AA4600" />
              : <FontAwesome6 name="toggle-off" size={35} color="#AA4600" />
              }
            </View>
          </Pressable>
        </View>
            
        { isEnable && (

          <View style={styles.container}>
            
            <Pressable onPress={ () => handleLevelNotification(!isEnableLevel) }>
              <View style={styles.option}>
                <Text style={text.settings_text}>Food and Water Level</Text>
                {isEnableLevel ? 
                <FontAwesome6 name="toggle-on" size={35} color="#AA4600" />
                : <FontAwesome6 name="toggle-off" size={35} color="#AA4600" />
                }
              </View>
            </Pressable>

            <Pressable onPress={ () => handleDispenseNotification(!isEnableDispense) }>
              <View style={styles.option}>
                <Text style={text.settings_text}>Food Dispense</Text>
                {isEnableDispense ? 
                <FontAwesome6 name="toggle-on" size={35} color="#AA4600" />
                : <FontAwesome6 name="toggle-off" size={35} color="#AA4600" />
                }
              </View>
            </Pressable>

            <Pressable onPress={ () => handleReminderNotification(!isEnableReminder) }>
              <View style={styles.option}>
                <Text style={text.settings_text}>Reminder</Text>
                {isEnableReminder ? 
                <FontAwesome6 name="toggle-on" size={35} color="#AA4600" />
                : <FontAwesome6 name="toggle-off" size={35} color="#AA4600" />
                }
              </View>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    )
  }

  const styles = StyleSheet.create({
      
      whole_page: {

          flex: 1,
          backgroundColor: '#FFF7ED',
          alignItems: 'center',
          paddingTop: 20,
      },

      enable:{

        backgroundColor: 'white',
        borderRadius: 25,
        width: '90%',
        paddingInline: 20,
        padding: 15,
        marginBottom: 20,
      },

      container:{

        backgroundColor: 'white',
        borderRadius: 25,
        width: '90%',
        paddingInline: 20,
        padding: 15,
      },

      option: {

          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          padding: 5,
        },
  })

  const dynamicStyles = (textSize:number) => ({
  settings_text: {

    fontSize: textSize,
  },

  settings_title: {

    fontSize: textSize*1.2
  },
})

export default Notification