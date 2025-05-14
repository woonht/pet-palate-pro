import { AntDesign, FontAwesome6 } from "@expo/vector-icons"
import { PlatformPressable } from "@react-navigation/elements"
import React, { useEffect, useRef, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import Swipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable"
import AsyncStorage from "@react-native-async-storage/async-storage"

type Entry = {
  id: string;
  time: Date;
};

const STORAGE_KEY = "timelist";

const AutomatedSchedule = () => {
  const [time, setTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [isToggle, setIsToggle] = useState<boolean[]>([]);
  const [timelist, setTimeList] = useState<Entry[]>([]);

  // refs to the Swipeable methods for each row
  const swipeableRefs = useRef<Array<SwipeableMethods | null>>([]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const saveTimeList = async (list: Entry[]) => {
    try {
      // persist as [{ id, time: ISOString }]
      const toStore = list.map((e) => ({
        id: e.id,
        time: e.time.toISOString(),
      }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.log("Saving Error:", e);
    }
  };

  const loadTimeList = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);

      let entries: Entry[];

      // old format was simply an array of ISO strings
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        entries = (parsed as string[]).map((iso) => ({
          id: Date.now().toString() + Math.random(),
          time: new Date(iso),
        }));
      }
      // new format is array of {id, time}
      else if (
        Array.isArray(parsed) &&
        parsed.every((x) => x && typeof x === "object")
      ) {
        entries = (parsed as { id: string; time: string }[]).map(
          ({ id, time }) => ({
            id,
            time: new Date(time),
          })
        );
      } else {
        entries = [];
      }

      setTimeList(entries);
      setIsToggle(new Array(entries.length).fill(false));
    } catch (e) {
      console.log("Loading Error:", e);
    }
  };

  useEffect(() => {
    loadTimeList();
  }, []);

  const onChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (event.type === "dismissed") {
      setIsVisible(false);
      return;
    }

    setIsVisible(false);

    if (selectedTime) {
      const newEntry: Entry = {
        id: Date.now().toString(),
        time: selectedTime,
      };
      const updated = [...timelist, newEntry].sort(
        (a, b) => a.time.getTime() - b.time.getTime()
      );
      setTimeList(updated);
      saveTimeList(updated);
      setIsToggle(new Array(updated.length).fill(false));
      setTime(selectedTime);
    }
  };

  const toggleSwitch = (index: number) => {
    setIsToggle((toggles) =>
      toggles.map((v, i) => (i === index ? !v : v))
    );
  };

  const removeTime = (index: number) => {
    const ref = swipeableRefs.current[index];
    if (ref) ref.close();

    const updated = timelist.filter((_, i) => i !== index);
    setTimeList(updated);
    setIsToggle((t) => t.filter((_, i) => i !== index));
    saveTimeList(updated);
    swipeableRefs.current.splice(index, 1);
  };

  const renderRightActions = (index: number) => (
    <Pressable onPress={() => removeTime(index)} style={styles.removeButton}>
      <Text style={styles.removeText}>Remove</Text>
    </Pressable>
  );

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
          onChange={onChange}
        />
      )}

      {timelist.map((entry, index) => (
        <Swipeable
          key={entry.id}
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
