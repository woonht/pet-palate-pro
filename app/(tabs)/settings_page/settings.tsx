import { Entypo, Feather, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"
import React, { useCallback, useEffect, useState } from "react"
import { Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native"
import { Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/app/auth_context"
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import Toast from 'react-native-toast-message'
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTextSize } from "@/app/text_size_context"
import Slider from '@react-native-community/slider'
import { useColorMode } from "@/app/color_mode"
import { getThemeColors } from "@/components/color_theme"

const SettingsPage = () => {

  const { user } = useAuth()
  const { setUser } = useAuth()

  const [isModeVisible, setModeIsVisible] = useState(false)
  const [descriptionVisible, setDescriptionVisible] = useState(false)
  const [colorVisible, setColorVisible] = useState(false)
  const [isDog, setIsDog] = useState(false)
  const [count, setCount] = useState(1)
  const [sliderVisible, setSliderVisible] = useState(false)
  const {textSize, setTextSize} = useTextSize()
  const [tempTextSize, setTempTextSize] = useState(textSize)
  const text = dynamicStyles(textSize)
  const { colorMode, changeColorMode } = useColorMode()
  const theme = getThemeColors(colorMode)
  const [loading, setLoading] = useState(false)
  const [inputVisible, setInputVisible] = useState(false)
  const [device, setDevice] = useState('')

  const options = [
    { label: 'Normal', value: 'normal' },
    { label: 'Red-Green Color Blindness', value: 'red-green' },
    { label: 'Blue-Yellow Color Blindness', value: 'blue-yellow' },
    { label: 'Monochromacy', value: 'mono' },
  ]

  useFocusEffect( // Auto-hide when navigating away from this screen
    useCallback(() => {
      return () => setDescriptionVisible(false); // Called when screen loses focus
    }, [])
  )

  const logout = async () => {
    try {
      setLoading(true)
      await GoogleSignin.signOut() // Sign out from Google
      setUser(null);               // Clear user context
      router.replace('/(tabs)/auth/sign_in') // Navigate to sign in screen      
      Toast.show({
          type: 'success',
          text1: 'Signed out successfully',
      })
    } 
    catch (error) {
      console.error('Error during logout:', error)
    }
    finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    if(sliderVisible){
      setTempTextSize(textSize)
    }
  },[sliderVisible])

  const savePetFeederDeviceToDatabase = async () => {
    const updatedUserData = {
      userID: user?.userID,
      name: user?.name,
      email: user?.email,
      password: '',
      formType: 'user_data',
      provider: user?.provider,
      device_id: device,
      isUpdate: true
    }

    try{
      const response = await fetch('https://appinput.azurewebsites.net/api/SaveUserData?',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedUserData)
      })

      const result = await response.json()
      console.log('Successfully update pet feeder id to database. ', result)
    }
    catch(e){
      console.error('Saving error to database: ', e)
    }
    finally{
      setLoading(false)
    }
  }

  return(
    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.settings}>
          <View style={styles.IconTextLeft}>
            <View>
              {user?.photo ? (
                <Image
                source={{ uri: user?.photo }}
                style={styles.profilePicture}
                />
              ) : (
                <Image
                source={require('../../../assets/images/defaultuserprofile.jpg')}
                style={styles.profilePicture}
                />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[text.settings_title, {fontWeight: 'bold'}]}>{user?.name || 'Guest'}</Text>
              <Text style={[styles.email, text.settings_text]}>{user?.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.settings}>

          <Pressable onPress={ () => router.push('/(tabs)/settings_page/notification') }>
            <View style={styles.rowSettings}>
              <View style={styles.IconTextLeft}>
                <Ionicons name="notifications" size={24} color="black" />
                <Text style={text.settings_text}>Notification</Text>
              </View> 
              <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
            </View>             
          </Pressable>
                
          <Pressable onPress={ ()=> router.push('/(tabs)/settings_page/automated_schedule') }>
            <View style={styles.rowSettings}>
              <View style={styles.IconTextLeft}>
                <MaterialIcons name="schedule" size={24} color="black" />
                <Text style={text.settings_text}>Automated Schedule</Text>
              </View> 
              <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
            </View>            
          </Pressable>
        
          <Pressable onPress={()=> setModeIsVisible(true)}>
              <View style={styles.rowSettings}>
                <View style={styles.IconTextLeft}>
                  <Feather name="percent" size={24} color="black" />
                  <Text style={text.settings_text}>Mode</Text>
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
                <Text style={[text.settings_title, {fontWeight: 'bold'}]}>Choose a Mode</Text>  
                <TouchableOpacity onPress={() => setModeIsVisible(false)}>
                  <Entypo name="cross" size={24} color="red" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={()=> setIsDog(!isDog)}>
                <View style={styles.popUpOption}>
                  <Text style={text.settings_text}>Dog</Text>
                  {isDog ? 
                  (<MaterialIcons name="radio-button-unchecked" size={24} color="black" />): 
                  <MaterialIcons name="radio-button-checked" size={24} color="black" />
                }
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> setIsDog(!isDog)}>
                <View style={styles.popUpOption}>
                  <Text style={text.settings_text}>Cat</Text>
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
              <Text style={text.settings_text}>Time</Text>
            </View> 
            <View style={styles.IconTextLeft}>
              <Pressable onPress={()=> setCount((count>1 ? count-1 : 1))}>
                  <FontAwesome name="minus-square" size={24} color="black" />
              </Pressable>
                  <Text>{count}</Text>
              <Pressable onPress={()=> setCount(count<12 ? count+1 : 12)}>
                  <FontAwesome name="plus-square" size={24} color="black" />
              </Pressable>
              <Pressable onPress={ () => setDescriptionVisible(!descriptionVisible)}>
                <Octicons name="question" size={24} color="#D3D3D3" />
              </Pressable>
            </View> 
          </View>

          {descriptionVisible && (
            <View style={styles.description}>
              <Text style={text.settings_text}>Give your pet a treat!</Text>
              <Text style={text.settings_text}>Maximum number of times per day where food can be automatically dispensed via camera detection when the surrounding is well-lit.</Text>
              <Text style={text.settings_text}>(+) - Increase the number of times per day.</Text>
              <Text style={text.settings_text}>(-) - Decrease the number of times per day.</Text>
            </View>
          )}
          
          <Pressable onPress={logout}>
            <View style={styles.rowSettings}>
              <View style={styles.IconTextLeft}>
                <MaterialCommunityIcons name="logout" size={24} color="red" />
                <Text style={text.settings_text}>Logout</Text>
              </View> 
            </View>            
          </Pressable>

        </View>

        <View style={styles.settings}>
          <Text style={[text.settings_title, {fontWeight: 'bold'}]}>Extra Settings</Text>
          
          <Pressable onPress={() => setSliderVisible(true)}>
            <View style={styles.rowSettings}>
              <View style={styles.IconTextLeft}>
                <MaterialCommunityIcons name="format-size" size={24} color="black" />
                <Text style={text.settings_text}>Text Size</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
            </View>
          </Pressable>
          
          <Modal
          animationType="fade"
          transparent={true}
          visible={sliderVisible}
          onRequestClose={() => setSliderVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.popUp}>

                <View style={styles.popUpOption}>
                  <Text style={[text.settings_title, {fontWeight:'bold'}]}>Text Size</Text>
                  <Pressable onPress={() => setSliderVisible(false)}>
                    <Entypo name="cross" size={24} color="red" />
                  </Pressable>              
                </View>

                <View style={styles.popUpOption}>
                  <Text style={{fontSize: tempTextSize}}>Preview Text: {tempTextSize}</Text>
                </View>

                <View style={styles.popUpOption}>
                  <Slider 
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={28}
                  step={1}
                  value={textSize}
                  onValueChange={value => setTempTextSize(value)}
                  ></Slider>
                </View>

                <View style={styles.rowSettings}>
                  <Pressable onPress={() => setSliderVisible(false)}>
                    <View style={styles.popUpOption}>
                      <Text style={text.settings_text}>Cancel</Text>
                    </View>              
                  </Pressable>
                  
                  <Pressable onPress={() => {setSliderVisible(false); setTextSize(tempTextSize)}}>
                    <View style={styles.popUpOption}>
                      <Text style={text.settings_text}>Save</Text>
                    </View>
                  </Pressable>
                </View>

              </View>
            </View>
          </Modal>

          <Pressable onPress={ () => setColorVisible(true) }>
            <View style={styles.rowSettings}>
              <View style={styles.IconTextLeft}>
                <MaterialIcons name="colorize" size={24} color="black" />
                <Text style={text.settings_text}>Color Palette</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
            </View>
          </Pressable>

          <Modal
          visible={colorVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setColorVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.popUp}>
              
                <View style={styles.popUpOption}>
                  <Text style={[text.settings_title, {fontWeight: 'bold'}]}>Color Palatte</Text>
                  <Pressable onPress={() => setColorVisible(false)}>
                    <Entypo name="cross" size={24} color="red" />
                  </Pressable>              
                </View>
                
                {options.map((options) => (
                  <Pressable key={options.value} onPress={() => changeColorMode(options.value)}>
                    <View style={styles.popUpOption}>
                      <Text style={[text.settings_text, {width: '90%'}]}>{options.label}</Text>
                      { colorMode == options.value ? 
                      (<MaterialIcons name="radio-button-checked" size={24} color="black" />): 
                      <MaterialIcons name="radio-button-unchecked" size={24} color="black" />
                    }
                    </View>
                  </Pressable>
                ))}

              </View>
            </View>
          </Modal>

          <Pressable onPress={() => setInputVisible(true)}>
            <View style={styles.rowSettings}>
                <View style={styles.IconTextLeft}>
                  <MaterialIcons name="device-hub" size={24} color="black" />
                  <Text style={text.settings_text}>Pet Feeder Device</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
            </View>
          </Pressable>

          <Modal
          transparent={true}
          animationType="fade"
          onRequestClose={() => setInputVisible(false)}
          visible={inputVisible}
          >
            <View style={styles.modalBackground}> 
              <View style={styles.popUp}>
                <View style={styles.popUpOption}>
                  <Text style={text.settings_text}>Pet Feeder Device</Text>
                  <Pressable onPress={() => setInputVisible(false)}>
                    <Entypo name="cross" size={24} color="red" />
                  </Pressable>   
                </View>

                <TextInput
                style={[styles.input, text.settings_text]}
                placeholder="pet_feeder_1"
                placeholderTextColor={'grey'}
                value={device}
                onChangeText={(text) => setDevice(text)}
                />

                <View style={styles.rowSettings}>
                  <Pressable onPress={() => setInputVisible(false)}>
                    <View style={styles.popUpOption}>
                      <Text style={text.settings_text}>Cancel</Text>
                    </View>              
                  </Pressable>
                  
                  <Pressable onPress={() => {setInputVisible(false); savePetFeederDeviceToDatabase()}}>
                    <View style={styles.popUpOption}>
                      <Text style={text.settings_text}>Save</Text>
                    </View>
                  </Pressable>
                </View>                  
              </View>
            </View>
          </Modal>

        </View>
      </ScrollView>
    </SafeAreaView>  
  )
}

const styles = StyleSheet.create({
  
  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
    paddingTop: 20,
    gap: 10,
  },

  scroll: {

    paddingTop: 10,
    alignItems: 'center',
    gap: 10,
  },
  
  settings:{

    backgroundColor: 'white',
    borderRadius: 25,
    width: '90%',
    paddingInline: 20,
    padding: 15,
    gap: 15,
  },

  profilePicture: {

    width: 80,
    height: 80,
    borderRadius: 40,
  },

  userInfo: {

    paddingInline: 10,
  },

  email:{

    color: 'grey',
  },
    
  fullImage: {
  
    width: '100%',
    height: '100%',
  },
  
  backgroundImage: {
    
    flex: 1,
  },

  exitImage: {

    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 50,
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
  
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
  },

  popUpOption: {

    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },

  description: {

    backgroundColor:'rgba(230, 230, 230, 0.9) 0)',
    paddingHorizontal: 10,
    padding: 5,
    borderRadius: 15,
    gap: 10
  },

  slider: {

    width: '100%',
    height: 40,
  },

  input: {

    height: 'auto',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginTop: 15,
    marginBottom: 15,
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

export default SettingsPage
