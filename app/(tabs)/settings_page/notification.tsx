  import { FontAwesome6 } from "@expo/vector-icons"
  import React, { useEffect, useState } from "react"
  import { Pressable, StyleSheet, Text, View } from "react-native"
  import { SafeAreaView } from "react-native-safe-area-context"
  import * as Notifications from 'expo-notifications'
  import AsyncStorage from "@react-native-async-storage/async-storage"

  const Notification = () => {

    const [isEnable, setIsEnable] = useState(false)
    const [isEnableLevel, setIsEnableLevel] = useState(false)
    const [isEnableDispense, setIsEnableDispense] = useState(false)
    const [isEnableHydration, setIsEnableHydration] = useState(false)
    const [isEnableReminder, setIsEnableReminder] = useState(false)
  
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
          const enable = await AsyncStorage.getItem('isEnable')
          const level = await AsyncStorage.getItem('isEnableLevel')
          const dispense = await AsyncStorage.getItem('isEnableDispense')
          const hydration = await AsyncStorage.getItem('isEnableHydration')
          const reminder = await AsyncStorage.getItem('isEnableReminder')

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

        const { status: existingStatus } = await Notifications.getPermissionsAsync(); //checks whether the app already has permission to send notifications
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync(); //asks for permission if not already granted
          if (status !== 'granted') {
            alert('Please allow Pet Palate Pro to send you notifications');
          }
        }

        setIsEnableLevel(true)
        setIsEnableDispense(true)
        setIsEnableHydration(true)
        setIsEnableReminder(true)

        await AsyncStorage.multiSet([
          ['isEnableLevel', JSON.stringify(true)],
          ['isEnableDispense', JSON.stringify(true)],
          ['isEnableHydration', JSON.stringify(true)],
          ['isEnableReminder', JSON.stringify(true)]
        ])
      }
      else{
        console.log('enable: ',enable)
        await Notifications.cancelAllScheduledNotificationsAsync()
        console.log('Notification disable')

        setIsEnableLevel(false)
        setIsEnableDispense(false)
        setIsEnableHydration(false)
        setIsEnableReminder(false)

        await AsyncStorage.multiRemove([
          'isEnableLevel',
          'isEnableDispense',
          'isEnableHydration',
          'isEnableReminder'
        ])
      }
    } 
    
    const handleLevelNotification = async (enable:boolean) => {
      setIsEnableLevel(enable)
      await AsyncStorage.setItem('isEnableLevel', JSON.stringify(enable))
  
    }

    const handleDispenseNotification = async (enable:boolean) => {
      setIsEnableDispense(enable)
      await AsyncStorage.setItem('isEnableDispense', JSON.stringify(enable))

    }

    const handleHydrationNotification = async (enable:boolean) => {
      setIsEnableHydration(enable)
      await AsyncStorage.setItem('isEnableHydration', JSON.stringify(enable))

    }

    const handleReminderNotification = async (enable:boolean) => {
      setIsEnableReminder(enable)
      await AsyncStorage.setItem('isEnableReminder', JSON.stringify(enable))

      await scheduleNotifications({
        title: 'Weekly Reminder',
        body: 'Clean the device.',
        hour: 9,
        minute: 0,
        weekday: 1
      })
    }

    const scheduleNotifications = async ({
      title,
      body,
      hour,
      minute,
      weekday, // optional
      repeats = true,
    }: {
      title: string,
      body: string,
      hour: number,
      minute: number,
      weekday?: number, // 1 = Sunday, 7 = Saturday
      repeats?: boolean,
    }) => {
      const trigger: Notifications.CalendarTriggerInput = { // tells the system when to fire the notification
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats,
      };
    
      if (weekday) {
        trigger.weekday = weekday;
      }
    
      await Notifications.scheduleNotificationAsync({ // Creates the notification
        content: {
          title,
          body,
          sound: true,
        },
        trigger,
      })
    }
    
    return(
      <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>

        <View style={styles.enable}>
          <Pressable onPress={ () => handleEnableNotification(!isEnable) }>
            <View style={styles.option}>
              <Text>Enable</Text>
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
                <Text>Food and Water Level</Text>
                {isEnableLevel ? 
                <FontAwesome6 name="toggle-on" size={35} color="#AA4600" />
                : <FontAwesome6 name="toggle-off" size={35} color="#AA4600" />
                }
              </View>
            </Pressable>

            <Pressable onPress={ () => handleDispenseNotification(!isEnableDispense) }>
              <View style={styles.option}>
                <Text>Food Dispense</Text>
                {isEnableDispense ? 
                <FontAwesome6 name="toggle-on" size={35} color="#AA4600" />
                : <FontAwesome6 name="toggle-off" size={35} color="#AA4600" />
                }
              </View>
            </Pressable>

            <Pressable onPress={ () => handleHydrationNotification(!isEnableHydration) }>
              <View style={styles.option}>
                <Text>Hydration Monitoring</Text>
                {isEnableHydration ? 
                <FontAwesome6 name="toggle-on" size={35} color="#AA4600" />
                : <FontAwesome6 name="toggle-off" size={35} color="#AA4600" />
                }
              </View>
            </Pressable>

            <Pressable onPress={ () => handleReminderNotification(!isEnableReminder) }>
              <View style={styles.option}>
                <Text>Reminder</Text>
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

  export default Notification