import { Entypo, Feather, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsPage = () => {

  const [isNotifyVisible, setNotifyIsVisible] = useState(false)
  const [isEnable, setIsEnable] = useState(false)
  const [isModeVisible, setModeIsVisible] = useState(false)
  const [isDog, setIsDog] = useState(false)
  const [count, setCount] = useState(1)

  const logout = () => {
    router.replace('/(tabs)/auth/sign_in')
  }

  return(
    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>

      <View style={styles.more_settings}>
       
        <Pressable onPress={ () => setNotifyIsVisible(true) }>
          <View style={styles.rowSettings}>
            <View style={styles.IconTextLeft}>
              <Ionicons name="notifications" size={24} color="black" />
              <Text>Notification</Text>
            </View> 
            <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
          </View>            
        </Pressable>

        <Modal
        animationType="fade"
        transparent={true}
        visible= {isNotifyVisible}
        onRequestClose={ () => setNotifyIsVisible(false) }
        >
          <View style={styles.modalBackground}>
            <View style={styles.popUp}>

              <View style={styles.popUpOption}> 
                <Text>Notification</Text>  
                <TouchableOpacity onPress={() => setNotifyIsVisible(false)}>
                  <Entypo name="cross" size={24} color="red" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={()=> setIsEnable(!isEnable)}>
                <View style={styles.popUpOption}>
                  <Text>Enable</Text>
                  {isEnable ? 
                  (<MaterialIcons name="radio-button-checked" size={24} color="black" />): 
                  <MaterialIcons name="radio-button-unchecked" size={24} color="black" />
                  }
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> setIsEnable(!isEnable)}>
                <View style={styles.popUpOption}>
                  <Text>Disable</Text>
                  {isEnable ? 
                  (<MaterialIcons name="radio-button-unchecked" size={24} color="black" />): 
                  <MaterialIcons name="radio-button-checked" size={24} color="black" />
                  }
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
       
        <Pressable onPress={ ()=> router.push('/(tabs)/settings_page/automated_schedule') }>
          <View style={styles.rowSettings}>
            <View style={styles.IconTextLeft}>
              <MaterialIcons name="schedule" size={24} color="black" />
              <Text>Automated Schedule</Text>
            </View> 
            <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
          </View>            
        </Pressable>
       
        <Pressable onPress={()=> setModeIsVisible(true)}>
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
        visible={isModeVisible}
        onRequestClose={() => setModeIsVisible(false)}
        >
        <View style={styles.modalBackground}>
          <View style={styles.popUp}>

            <View style={styles.popUpOption}> 
              <Text>Choose a Mode</Text>  
              <TouchableOpacity onPress={() => setModeIsVisible(false)}>
                <Entypo name="cross" size={24} color="red" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={()=> setIsDog(!isDog)}>
              <View style={styles.popUpOption}>
                <Text>Dog</Text>
                {isDog ? 
                (<MaterialIcons name="radio-button-unchecked" size={24} color="black" />): 
                <MaterialIcons name="radio-button-checked" size={24} color="black" />
                }
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=> setIsDog(!isDog)}>
              <View style={styles.popUpOption}>
                <Text>Cat</Text>
                {isDog ? 
                (<MaterialIcons name="radio-button-checked" size={24} color="black" />): 
                <MaterialIcons name="radio-button-unchecked" size={24} color="black" />
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
        
        <Pressable onPress={logout}>
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
