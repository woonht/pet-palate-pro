import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import { PlatformPressable } from "@react-navigation/elements";
import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from "@react-native-async-storage/async-storage";

const AutomatedSchedule = () => {

  const [time, setTime] = useState(new Date())
  const [isVisible, setIsVisible] = useState(false)
  const [isToggle, setIsToggle] = useState<boolean[]>([])
  const [timelist, setTimeList] = useState<Date[]>([])

  const swipeableRefs = useRef<Swipeable[]>([])

  const onChange = (event:DateTimePickerEvent, selectedTime?:Date) => { //? means property is optional, not provided then it will be undefined(sych as user tap "cancel")
    if (Platform.OS === 'android')
      setIsVisible(false) // On Android, hide after selection
    
    if (selectedTime) {
      const updatedTimeList = [...timelist, selectedTime].sort((a, b) => a.getTime() - b.getTime())
      setTimeList(updatedTimeList) //creating a new array by spreading the contents of prev (the previous array) and appending the time to the end of the new array.
      saveTimeList(updatedTimeList)
      const newToggles = new Array(updatedTimeList.length).fill(false);
      setIsToggle(newToggles);
    }
  }

  const toggleSwitch = (index: number) => {
    const updatedToggles = isToggle.map((item, i) => i === index ? !item : item); //if i equal to index, then item is true else false
    setIsToggle(updatedToggles);
  };
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); //[] is locale, eg. en-US, leaving it empty, the method will use the default locale
  }

  const removeTime = (index: number) => {
    const ref = swipeableRefs.current[index]
    if (ref) { // Close open swipeable before removing
      ref.close()
    }
    
    const updatedTimes = timelist.filter((_, i) => i !== index)
    const updatedToggles = isToggle.filter((_, i) => i !== index)
    setTimeList(updatedTimes)
    setIsToggle(updatedToggles)
    saveTimeList(updatedTimes)
    swipeableRefs.current.splice(index, 1) // Remove ref as well
  };
  
  const renderRightActions = (index: number) => (
    <Pressable onPress={() => removeTime(index)} style={styles.removeButton}>
      <Text style={styles.removeText}>Remove</Text>
    </Pressable>
  )

  const saveTimeList = async (list: Date[]) => {
    try {
      const stringList = list.map(d => d.toISOString()) // Convert Date objects to ISO strings
      await AsyncStorage.setItem('timelist', JSON.stringify(stringList))
      console.log('Data saved successfully.')
    } catch (e) {
      console.log('Saving Error: ', e)
    }
  };

  useEffect(() => {
    const loadTimeList = async () => {
      try {
        const storedTimeList = await AsyncStorage.getItem('timelist')
        if (storedTimeList) {
          const parsed: Date[] = JSON.parse(storedTimeList).map((d: string) => new Date(d))
          setTimeList(parsed)
          setIsToggle(new Array(parsed.length).fill(false))
          console.log('Data loaded successfully.')
        }
      } catch (e) {
        console.log('Loading Error: ', e)
      }
    };
    loadTimeList()
  }, [])
  
  return(
    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>

      <PlatformPressable 
      onPress={() => setIsVisible(true)}
      android_ripple={{ color:null }}
      style={styles.button}
      >
        <AntDesign name="pluscircle" size={75} color="#AA4600"/>
      </PlatformPressable>

      {isVisible && ( //if isVisible is true, render the <DateTimePicker/>
        <DateTimePicker
          value={time}
          mode="time" //only show time (no calendar/date)
          display={Platform.OS === 'ios' ? 'spinner' : 'compact'}
          is24Hour={true}
          onChange={onChange}
        />
      )}

      {timelist.map((time, index) => ( //.map(element[required], index[optional], array[rarely used]) element is the element in the array
        <Swipeable 
        key={index} 
        ref={(ref) => {if (ref) swipeableRefs.current[index] = ref}}
        renderRightActions={() => renderRightActions(index)}>
          <View style={styles.schedule}>
            <Text style={{ fontSize: 30 }}>{formatTime(time)}</Text>
            <Pressable onPress={() => toggleSwitch(index)}>
              {isToggle[index]
                ? <FontAwesome6 name="toggle-off" size={35} color="#AA4600" />
                : <FontAwesome6 name="toggle-on" size={35} color="#AA4600" />}
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
    backgroundColor: '#FFF7ED',
  },

  button: {
    
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    padding: 10,
    position: 'absolute',
    bottom: 0,
  },

  schedule:{

    flexDirection:'row',
    justifyContent:'space-between',
    alignSelf: 'center',
    alignItems: 'center',
    width: '90%',
    paddingTop: 10,
    borderBottomWidth: 1,
    paddingBottom: 10
  },

  removeButton:{

    justifyContent:'center',
    alignItems:'center',
    width: 100,
    height: '100%',
    backgroundColor: 'red',
  },

  removeText: {

    fontWeight:'bold',
    fontSize: 16
  }
})
export default AutomatedSchedule
