import { AntDesign, FontAwesome6 } from "@expo/vector-icons"
import { PlatformPressable } from "@react-navigation/elements"
import React, { useCallback, useRef, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import Swipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuth } from "@/components/auth_context"
import { useFocusEffect } from "expo-router"
import CustomLoader from "@/components/Custom_Loader"
import { useDevices } from "@/components/device_context"

const AutomatedSchedule = () => {
  const [time, setTime] = useState(new Date())
  const [isVisible, setIsVisible] = useState(false)
  const [isToggle, setIsToggle] = useState<boolean[]>([])
  const [timelist, setTimeList] = useState<ScheduleType[]>([])
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const { activeDeviceId } = useDevices()
  
  type ScheduleType = {
    userID: string;
    timeID: string;
    time: Date;
    formType: string;
  }

  // refs to the Swipeable methods for each row
  const swipeableRefs = useRef<Array<SwipeableMethods | null>>([])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) // [] use system default locale (kl-GL)
  }

  const saveTimeList = async (toStore: {userID:string, timeID:string, time:string}[]) => {
    try {
      await AsyncStorage.setItem(`schedule_${user?.userID}_${activeDeviceId}`, JSON.stringify(toStore))
    } 
    catch (e) {
      console.error("Saving Error:", e)
    }
  }

  const loadTimeList = async () => {
    try {
      const stored = await AsyncStorage.getItem(`schedule_${user?.userID}_${activeDeviceId}`)
      if (!stored) return

      const parsed = JSON.parse(stored)

      let entries: ScheduleType[]

      if ( Array.isArray(parsed) && parsed.every((x) => x && typeof x === "object")) {
        entries = (parsed as { timeID: string; time: string }[]).map(
          ({ timeID, time }) => ({
            userID: user?.userID ?? "",
            timeID: timeID,
            time: new Date(time),
            formType: 'schedule'
          })
        )
      }   
      else {
        entries = []
      }

      setTimeList(entries)
      setIsToggle(new Array(entries.length).fill(false))
    } 
    catch (e) {
      console.error("Loading Error:", e)
    }
  }

  const saveTimeToDatabase = async (list:ScheduleType[]) => {
    const toStore = list.map((e) => ({ // use .map() when need to change the structure or format of the data before saving (.toISOstring())
      userID: user!.userID,
      timeID: e.timeID,
      time: e.time.toISOString(),
      formType: e.formType,
      device_id: activeDeviceId,
    }))

    console.log(toStore)

    try{
      await saveTimeList(toStore)
      const response = await fetch('https://appinput.azurewebsites.net/api/SaveSchedule?', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(toStore)
      })

      const text = await response.text()
      try {
        const result = text ? JSON.parse(text) : {}
        console.log('Time list successfully saved to database.', result)
      } 
      catch (e) {
        console.warn('Could not parse JSON from save response:', text)
      }
    }
    catch(e){
      console.error('Saving error: ', e)
    }
  }

  useFocusEffect(
    useCallback( () => {
      if (!user || !user.userID) {
        console.warn('User not available yet.');
        return
      }
      else{
        console.log(user)
      }

      const loadTimeFromDatabase = async () => {
        try{
          await loadTimeList()
          const formType = 'schedule'
          const response = await fetch(`https://appinput.azurewebsites.net/api/GetSchedule?userID=${user?.userID}&formType=${formType}&device_id=${activeDeviceId}`, {
            method: "GET",
            headers: {'Content-Type': 'application/json'}
          })
    
          const text = await response.text()
          const result = JSON.parse(text)
          console.log('Time list load successfully from database.', result)
          setLoading(false)
        }
        catch(e){
          console.error('Loading error: ', e)
        }
      }
      loadTimeFromDatabase()
    },[user]))

  const onChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (event.type === "dismissed") {
      setIsVisible(false)
      return
    }

    setIsVisible(false)

    if (selectedTime) {
      const newEntry: ScheduleType = {
        userID: user?.userID ?? "",
        timeID: Date.now().toString(),
        time: selectedTime,
        formType: 'schedule'
      }
      const updated = [...timelist, newEntry].sort(
        (a, b) => a.time.getTime() - b.time.getTime()
      )
      setTimeList(updated)
      saveTimeToDatabase(updated)
      setIsToggle(new Array(updated.length).fill(false))
      setTime(selectedTime)
    }
  }

  const toggleSwitch = (index: number) => {
    setIsToggle((toggles) =>
      toggles.map((v, i) => (i === index ? !v : v)) // .map() takes up 3 arguments (current_value, index, array)
    )
  }

  const removeTime = (index: number) => {
    const ref = swipeableRefs.current[index]
    if (ref) ref.close()

    deleteInDatabase(index)

    const updated = timelist.filter((_, i) => i !== index)
    setTimeList(updated)
    setIsToggle((t) => t.filter((_, i) => i !== index))
    saveTimeToDatabase(updated)
    swipeableRefs.current.splice(index, 1)
  }

  const deleteInDatabase = async (index: number) => {
    const entry = timelist[index]
    if (!entry) {
      console.log('!entry')
      return
    }
    try {
      const response = await fetch(`https://appinput.azurewebsites.net/api/DeleteSchedule?userID=${entry.userID}&timeID=${entry.timeID}&device_id=${activeDeviceId}`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: user?.userID,
          timeID: entry.timeID,
          formType: entry.formType,
        }),
      })

      const text = await response.text()
      try {
        const result = text ? JSON.parse(text) : {}
        console.log('Time entry successfully deleted from database.', result)
      } 
      catch (e) {
        console.warn('Could not parse delete response JSON:', text)
      }
    } 
    catch (e) {
      console.error('Deleting error: ', e)
    }
  }

  const renderRightActions = (index: number) => (
    <Pressable onPress={() => removeTime(index)} style={styles.removeButton}>
      <Text style={styles.removeText}>Remove</Text>
    </Pressable>
  )

  if(loading){
    return <CustomLoader/>
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.whole_page}>
      <PlatformPressable
        onPress={() => setIsVisible(true)}
        android_ripple={{ color: null }}
        style={styles.button}
      >
        <AntDesign name="pluscircle" size={75} color="#AA4600" />
      </PlatformPressable>

      {isVisible && (
        <DateTimePicker
          value={time}
          mode="time"
          display="spinner"
          is24Hour={true}
          minuteInterval={30}
          onChange={onChange}
        />
      )}

      {timelist.map((entry, index) => (
        <Swipeable
          key={entry.timeID}
          ref={(ref) => {
            // using { … } ensures this returns void
            swipeableRefs.current[index] = ref;
          }}
          renderRightActions={() => renderRightActions(index)}
        >
          <View style={styles.schedule}>
            <Text style={{ fontSize: 30 }}>{formatTime(entry.time)}</Text>
            <Pressable onPress={() => toggleSwitch(index)}>
              {isToggle[index] ? (
                <FontAwesome6 name="toggle-off" size={35} color="#AA4600" />
              ) : (
                <FontAwesome6 name="toggle-on" size={35} color="#AA4600" />
              )}
            </Pressable>
          </View>
        </Swipeable>
      ))}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  
  whole_page: { 
    flex: 1, 
    backgroundColor: "#FFF7ED" 
  },

  button: {
  
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    padding: 10,
    position: "absolute",
    bottom: 0,
  },
  
  schedule: {
  
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    alignItems: "center",
    width: "90%",
    paddingTop: 10,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  
  removeButton: {
  
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
    backgroundColor: "red",
  },
  
  removeText: { 
    
    fontWeight: "bold", 
    fontSize: 16 
  },
})

export default AutomatedSchedule
