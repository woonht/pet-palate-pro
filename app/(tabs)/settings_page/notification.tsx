import { FontAwesome6 } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Notifications from 'expo-notifications'
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTextSize } from "@/components/text_size_context"
import { useAuth } from "@/components/auth_context"

  const Notification = () => {

    const [isEnable, setIsEnable] = useState(false)
    const [isEnableLevel, setIsEnableLevel] = useState(false)
    const [isEnableDispense, setIsEnableDispense] = useState(false)
    const [isEnableHydration,setIsEnableHydration] = useState(false)
    const [isEnableReminder, setIsEnableReminder] = useState(false)
    const { textSize } = useTextSize()
    const text = dynamicStyles(textSize)
    const { user } = useAuth()
    
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
          const enable = await AsyncStorage.getItem(`isEnable_${user?.userID}`)
          const level = await AsyncStorage.getItem(`isEnableLevel_${user?.userID}`)
          const dispense = await AsyncStorage.getItem(`isEnableDispense_${user?.userID}`)
          const hydration = await AsyncStorage.getItem(`isEnableHydration_${user?.userID}`)
          const reminder = await AsyncStorage.getItem(`isEnableReminder_${user?.userID}`)

          if(enable)
            setIsEnable(JSON.parse(enable))
          if(level)
            setIsEnableLevel(JSON.parse(level))
          if(dispense)
            setIsEnableDispense(JSON.parse(dispense))
          if(hydration)
            setIsEnableHydration(JSON.parse(hydration))
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
      await AsyncStorage.setItem('isEnable', JSON.stringify(enable))

      if(enable){
        console.log('enable: ', enable)
        console.log('Notification enable')

        const { status: existingStatus } = await Notifications.getPermissionsAsync(); // checks whether the app already has permission to send notifications
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync(); // asks for permission if not already granted, popup (only appear the first time)
          if (status !== 'granted') {
            alert('Please allow Pet Palate Pro to send you notifications');
          }
        }

        handleLevelNotification(true)
        handleDispenseNotification(true)
        handleHydrationNotification(true)
        handleReminderNotification(true)

        await AsyncStorage.multiSet([
          [`isEnableLevel_${user?.userID}`, JSON.stringify(true)],
          [`isEnableDispense_${user?.userID}`, JSON.stringify(true)],
          [`isEnableHydration_${user?.userID}`, JSON.stringify(true)],
          [`isEnableReminder_${user?.userID}`, JSON.stringify(true)]
        ])
      }
      else{
        console.log('enable: ',enable)
        await Notifications.cancelAllScheduledNotificationsAsync()
        console.log('Notification disable')

        handleLevelNotification(false)
        handleDispenseNotification(false)
        handleHydrationNotification(false)
        handleReminderNotification(false)

        await AsyncStorage.multiRemove([
          `isEnableLevel_${user?.userID}`,
          `isEnableDispense_${user?.userID}`,
          `isEnableHydration_${user?.userID}`,
          `isEnableReminder_${user?.userID}`
        ])
      }
    } 
    
    const handleLevelNotification = async (enable:boolean) => {
      setIsEnableLevel(enable)
      await AsyncStorage.setItem(`isEnableLevel_${user?.userID}`, JSON.stringify(enable))
  
    }

    const handleDispenseNotification = async (enable:boolean) => {
      setIsEnableDispense(enable)
      await AsyncStorage.setItem(`isEnableDispense_${user?.userID}`, JSON.stringify(enable))

    }

    const handleHydrationNotification = async (enable:boolean) => {
      setIsEnableHydration(enable)
      await AsyncStorage.setItem(`isEnableHydration_${user?.userID}`, JSON.stringify(enable))

    }

    const handleReminderNotification = async (enable:boolean) => {
      setIsEnableReminder(enable)
      await AsyncStorage.setItem(`isEnableReminder_${user?.userID}`, JSON.stringify(enable))

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
      const now = new Date()
      const target = new Date()
      target.setHours(hour)
      target.setMinutes(minute)
      target.setSeconds(0)

      console.log('Now Time:', now.getHours(), ':', now.getMinutes());
      console.log('Target Time:', target.getHours(), ':', target.getMinutes());

      // If target time is in the past, schedule for next day
      if (target <= now) {
        target.setDate(target.getDate() + 1)
      }
      
      // Calculate difference in seconds, ensure it is integer
      const secondsUntilTrigger = Math.floor((target.getTime() - now.getTime()) / 1000)

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilTrigger,
          repeats,
        },
      })
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

            <Pressable onPress={ () => handleHydrationNotification(!isEnableHydration) }>
              <View style={styles.option}>
                <Text style={text.settings_text}>Hydration Monitoring</Text>
                {isEnableHydration ? 
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