import { AntDesign, FontAwesome6 } from "@expo/vector-icons"
import { PlatformPressable } from "@react-navigation/elements"
import React, { useCallback, useRef, useState } from "react"
import { Alert, Pressable, StyleSheet, Text, View } from "react-native"
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
    timeID: string;
    time: Date;
    isEnable: boolean;
  }

  // refs to the Swipeable methods for each row
  const swipeableRefs = useRef<Array<SwipeableMethods | null>>([])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) // [] use system default locale (kl-GL)
  }

  const saveTimeList = async (toStore: {timeID:string, time:string}[]) => {
    try {
      await AsyncStorage.setItem(`schedule_${user?.userID}_${activeDeviceId}`, JSON.stringify(toStore))
    } 
    catch (e) {
      console.error("Saving Error:", e)
    }
    finally{
      setLoading(false)
    }
  }

  const loadTimeList = async () => {
    try {
      const stored = await AsyncStorage.getItem(`schedule_${user?.userID}_${activeDeviceId}`)
      if (!stored) {
        setLoading(false)
        return
      }

      const parsed = JSON.parse(stored)

      let entries: ScheduleType[]

      if ( Array.isArray(parsed) && parsed.every((x) => x && typeof x === "object")) {
        entries = (parsed as { timeID: string; time: string; isEnable?: boolean }[]).map(
          ({ timeID, time, isEnable }) => ({
            timeID: timeID,
            time: new Date(time),
            isEnable: typeof isEnable === "boolean" ? isEnable : true
          })
        )
      }   
      else {
        entries = []
      }

      setTimeList(entries)
      setIsToggle(entries.map((entry) => entry.isEnable))
    } 
    catch (e) {
      console.error("Loading Error:", e)
    }
    finally{
      setLoading(false)
    }
  }

  const saveTimeToDatabase = async (list:ScheduleType[]) => {  
    try{
      const formType = 'device_config'
      const response = await fetch(`https://appinput.azurewebsites.net/api/GetDeviceConfig?userID=${user?.userID}&formType=${formType}&device_id=${activeDeviceId}`,{
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      })
      
      const text = await response.text()
      
      if(!text){
        console.warn('Empty response from backend')
        setLoading(false)
        return
      }
      
      const result = JSON.parse(text)
      console.log('Successfully load device config: ', result)

      const toStoreTime = list.map((e) => ({ // use .map() when need to change the structure or format of the data before saving (.toISOstring())
        timeID: e.timeID,
        time: e.time.toISOString(),
        isEnable: e.isEnable,
      }))
  
      const toStore = {
        userID: result.userID,
        device_id: result.device_id,
        count: result.count,
        deviceMode: result.deviceMode,
        formType: result.formType,
        schedulelist: toStoreTime,
      }
      console.log(toStore)

      try{
        await saveTimeList(toStoreTime)
        const response = await fetch('https://appinput.azurewebsites.net/api/SaveDeviceConfig?', {
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
    catch(e){
      console.error('Device config load error: ', e)
    }
    finally{
      setLoading(false)
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
          const formType = 'device_config'
          const response = await fetch(`https://appinput.azurewebsites.net/api/GetDeviceConfig?userID=${user?.userID}&formType=${formType}&device_id=${activeDeviceId}`,{
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
          })

          const text = await response.text()
          
          if(!text){
            console.warn('Empty response from backend')
            setLoading(false)
            return
          }

          const result = JSON.parse(text)
          console.log('Successfully load device config: ', result)

          if (Array.isArray(result.schedulelist)) {
            const entries: ScheduleType[] = result.schedulelist.map(
              ({ timeID, time, isEnable }: { timeID: string; time: string; isEnable: boolean }) => ({
                timeID,
                time: new Date(time),
                isEnable: isEnable ?? false,
              })
            )
            setTimeList(entries)
            setIsToggle(entries.map((entry) => entry.isEnable))
          }
        }
        catch(e){
          console.error('Device config load error: ', e)
        }
        finally{
          setLoading(false)
        }
      }
      loadTimeFromDatabase()
    },[user]))

    const sendSignalToRpi = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://control7968.azurewebsites.net/api/send-command?", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "refresh", deviceId: activeDeviceId }),
      })
    
      if (!response.ok) {
        console.error("❌ Server error response")
        setLoading(false)
        return
      }
      const result = await response.json()
      console.log("✅ Success:", result);
    } 
    catch (e) {
      console.error("❌ Sending error:", e)
      Alert.alert("Error", "Something went wrong while sending the command.");
    }
    finally{
      setLoading(false)
    }
  }

  const onChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (event.type === "dismissed") {
      setIsVisible(false)
      return
    }

    setIsVisible(false)

    if (selectedTime) {
      // Normalize selected time to hours and minutes only
      const selectedHour = selectedTime.getHours()
      const selectedMinute = selectedTime.getMinutes()

      const isDuplicate = timelist.some(({ time }) => {
        return time.getHours() === selectedHour && time.getMinutes() === selectedMinute
      })

      if (isDuplicate) {
        Alert.alert("Duplicate Time", "This time has already been added.")
        return
      }

      const newEntry: ScheduleType = {
        timeID: Date.now().toString(),
        time: selectedTime,
        isEnable: true,
      }

      const updated = [...timelist, newEntry].sort(
        (a, b) => {
        const aMinutes = a.time.getHours() * 60 + a.time.getMinutes()
        const bMinutes = b.time.getHours() * 60 + b.time.getMinutes()
        return aMinutes - bMinutes
      })

      setTimeList(updated)
      saveTimeToDatabase(updated)
      setIsToggle((prevToggles) => [...prevToggles, true])
      setTime(selectedTime)
      sendSignalToRpi()
    }
  }

  const toggleSwitch = (index: number) => {
    setIsToggle((toggles) =>
      toggles.map((v, i) => (i === index ? !v : v)) // .map() takes up 3 arguments (current_value, index, array)
    )

    setTimeList((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        isEnable: !updated[index].isEnable,
      }
      saveTimeToDatabase(updated)
      return updated
    })
  }

  const removeTime = (index: number) => {
    const ref = swipeableRefs.current[index]
    if (ref) ref.close()

    const updated = timelist.filter((_, i) => i !== index)
    setTimeList(updated)
    setIsToggle((t) => t.filter((_, i) => i !== index))
    saveTimeToDatabase(updated)
    swipeableRefs.current.splice(index, 1)
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
                <FontAwesome6 name="toggle-on" size={35} color="#AA4600" />
              ) : (
                <FontAwesome6 name="toggle-off" size={35} color="#AA4600" />
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
