import { Entypo, Feather, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsPage = () => {

  const [isVisible, setIsVisible] = useState(false)
  const [isToggle, setIsToggle] = useState(false)
  const [count, setCount] = useState(1)

  return(
    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>

      <View style={styles.more_settings}>
       
        <Pressable onPress={ ()=> router.push('/(tabs)/settings_page/notification') }>
          <View style={styles.rowSettings}>
            <View style={styles.IconTextLeft}>
              <Ionicons name="notifications" size={24} color="black" />
              <Text>Notification</Text>
            </View> 
            <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
          </View>            
        </Pressable>
       
        <Pressable onPress={ ()=> router.push('/(tabs)/settings_page/automated_schedule') }>
          <View style={styles.rowSettings}>
            <View style={styles.IconTextLeft}>
              <MaterialIcons name="schedule" size={24} color="black" />
              <Text>Automated Schedule</Text>
            </View> 
            <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
          </View>            
        </Pressable>
       
        <Pressable onPress={()=> setIsVisible(true)}>
            <View style={styles.rowSettings}>
              <View style={styles.IconTextLeft}>
                <Feather name="percent" size={24} color="black" />
                <Text>Mode</Text>
              </View> 
              <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
            </View>            
        </Pressable>

        <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
        >
        <View style={styles.modalBackground}>
          <View style={styles.popUp}>

            <View style={styles.popUpOption}> 
              <Text>Choose a Mode</Text>  
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Entypo name="cross" size={24} color="red" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={()=> setIsToggle(!isToggle)}>
              <View style={styles.popUpOption}>
                <Text>Dog</Text>
                {isToggle ? 
                (<MaterialIcons name="radio-button-checked" size={24} color="black" />): 
                <MaterialIcons name="radio-button-unchecked" size={24} color="black" />
                }
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=> setIsToggle(!isToggle)}>
              <View style={styles.popUpOption}>
                <Text>Cat</Text>
                {isToggle ? 
                (<MaterialIcons name="radio-button-unchecked" size={24} color="black" />): 
                <MaterialIcons name="radio-button-checked" size={24} color="black" />
                }
              </View>
            </TouchableOpacity>


          </View>
        </View>
      </Modal>

        <View style={styles.rowSettings}>
          <View style={styles.IconTextLeft}>
            <MaterialCommunityIcons name="timer-sand" size={24} color="black" />
            <Text>Time</Text>
          </View> 
          <View style={styles.IconTextLeft}>
            <Pressable onPress={()=> setCount((count>1 ? count-1 : 1))}>
                <FontAwesome name="minus-square" size={24} color="black" />
            </Pressable>
                <Text>{count}</Text>
            <Pressable onPress={()=> setCount(count<12 ? count+1 : 12)}>
                <FontAwesome name="plus-square" size={24} color="black" />
            </Pressable>
          </View>            
        </View>
        
        <Pressable>
          <View style={styles.rowSettings}>
            <View style={styles.IconTextLeft}>
              <MaterialCommunityIcons name="logout" size={24} color="red" />
              <Text>Logout</Text>
            </View> 
          </View>            
        </Pressable>

      </View>
    </SafeAreaView>
      
  )
}

const styles = StyleSheet.create({
  
  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    paddingTop: 20,
    gap: 10,
  },
  
  more_settings:{

    backgroundColor: 'white',
    borderRadius: 25,
    width: '90%',
    paddingInline: 20,
    padding: 15,
    gap: 15,
  },

  IconTextLeft: {
    
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  rowSettings: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalBackground: {
  
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  popUp: {
  
    width: 250,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
  },

  popUpOption: {

    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 5,
  },
})
export default SettingsPage
