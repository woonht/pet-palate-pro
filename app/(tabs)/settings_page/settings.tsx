import { Entypo, Feather, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"
import React, { useCallback, useEffect, useState } from "react"
import { Alert, Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native"
import { Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/components/auth_context"
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import Toast from 'react-native-toast-message'
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTextSize } from "@/components/text_size_context"
import Slider from '@react-native-community/slider'
import CustomLoader from "@/components/Custom_Loader"
import { useDevices } from "@/components/device_context"

const SettingsPage = () => {

  const { user } = useAuth()
  const { setUser } = useAuth()

  const [isModeVisible, setModeIsVisible] = useState(false)
  const [descriptionVisible, setDescriptionVisible] = useState(false)
  const [isDog, setIsDog] = useState(false)
  const [count, setCount] = useState(1)
  const [sliderVisible, setSliderVisible] = useState(false)
  const {textSize, setTextSize} = useTextSize()
  const [tempTextSize, setTempTextSize] = useState(textSize)
  const text = dynamicStyles(textSize)
  const [loading, setLoading] = useState(false)
  const [inputVisible, setDeviceVisible] = useState(false)
  const [device, setDevice] = useState<FeederDevice[]>([])
  const { loadUserFeeders, activeDeviceId } = useDevices()

  type FeederDevice = {
    device_name: string;
    device_id: string;
  };

  useFocusEffect(
      useCallback(() => {
          if (user?.name) {
              loadUserFeeders(user.name)
          }
  }, [user]))

  useFocusEffect( // Auto-hide when navigating away from this screen
    useCallback(() => {
      return () => setDescriptionVisible(false); // Called when screen loses focus
    }, [])
  )

  const switchAccount = async () => {
    try {
      setLoading(true)
      router.replace('/(tabs)/auth/device_switcher') // Navigate to sign in screen      
    } 
    catch (error) {
      console.error('Error during switching:', error)
    }
    finally{
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await GoogleSignin.signOut() // Sign out from Google
      setUser(null) // Clear user context
      
      await AsyncStorage.setItem('login', 'false')

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

  const saveTextSize = async () => {
    try{
      setLoading(true)
      setTextSize(tempTextSize)
      await AsyncStorage.setItem(`text_size_${user?.userID}`, JSON.stringify(textSize))
    }
    catch(e){
      console.error('Saving error: ', e)
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

  useFocusEffect(
    useCallback(() => {
      const getPetFeederDeviceToDatabase = async () => {
        try{
          setLoading(true)
          const formType = 'user_data'
          const response = await fetch(`https://appinput.azurewebsites.net/api/GetUserData?name=${user?.name}&formType=${formType}`, {
              method: 'GET',
              headers: {'Content-Type' : 'application/json'}
          })
    
          const result = await response.json()
          console.log('Successfully load data: ', result)
    
          if(result && result.user && result.user.feeder){
            const deviceArray = Array.isArray(result.user.feeder)
            ? [result.user.feeder]
            : result.user.feeder
            setDevice(deviceArray)
            console.log('Device array: ', deviceArray)
          }
        }
        catch(e){
          console.error('Loading error from database: ', e)
        }
        finally{
          setLoading(false)
        }
      }
      getPetFeederDeviceToDatabase()
    },[user, activeDeviceId]))

  const removeDeviceID = async (device_idToRemove:string, status:string) => {
    try{
      setLoading(true)
      const dataToSend = {
        device_id: device_idToRemove,
        device_status: status,
      }
      
      const updateresponse = await fetch(`https://appinput.azurewebsites.net/api/UpdateDeviceRegistration?`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dataToSend)
      })

      const result = await updateresponse.json()
      console.log('Device updated successfully: ', result)
      
      const formType = 'user_data'
      const getresponse = await fetch(`https://appinput.azurewebsites.net/api/GetUserData?name=${user?.name}&formType=${formType}`, {
          method: 'GET',
          headers: {'Content-Type' : 'application/json'}
      })

      const text = await getresponse.text()
      const getresult = JSON.parse(text)
      console.log('User data successfully load: ', getresult)

      const flattenDevices = device.flat()
      const filteredDevices = flattenDevices.filter(d => d.device_id !== device_idToRemove)
      
      const updatedUserData = {
        userID: user?.userID,
        name: user?.name,
        email: user?.email,
        password: getresult.user.password,
        formType: 'user_data',
        provider: user?.provider,
        feeder: filteredDevices,
        isUpdate: true
      }

      const removedresponse = await fetch('https://appinput.azurewebsites.net/api/SaveUserData?', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedUserData)
      })
      
      const removeresult = await removedresponse.json()
      setDevice(filteredDevices)
      console.log('Device removed successfully: ', removeresult)
      
    }
    catch(e){
      console.error('Removing error: ', e)
    }
    finally{
      router.replace('/(tabs)/auth/device_switcher')
      setLoading(false)
    }
  }

  const confirmationToRemove = (device_idToRemove:string) => {
    Alert.alert('Select Device Status', `Choose the status for this device:`, 
      [{text: 'Cancel', style:'cancel'},
       {text: 'Broken', onPress: () => confirmRemoval(device_idToRemove, 'Broken')},
       {text: 'Unbind', onPress: () => confirmRemoval(device_idToRemove, 'unbind')}
      ])
  }
      
  const confirmRemoval = (device_idToRemove:string, status:string) => {
    Alert.alert('Removing Device', `Are you confirm to remove the device as ${status}?`, 
      [{text: 'No', style: 'cancel'},
      {text: 'Yes', style: 'destructive', onPress: () => {removeDeviceID(device_idToRemove, status); setDeviceVisible(false)} }])
  }

  const debug = () => {
    console.log(device);
    const flattenDevices = device.flat();
    const filteredDevices = flattenDevices.filter(d => d.device_id !== activeDeviceId);
    console.log(filteredDevices);
  }

  if(loading){
    return <CustomLoader/>
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

          <Pressable onPress={switchAccount}>
            <View style={styles.rowSettings}>
              <View style={styles.IconTextLeft}>
                <MaterialCommunityIcons name="account-switch-outline" size={24} color="black" />
                <Text style={text.settings_text}>Switch device</Text>
              </View> 
            </View>            
          </Pressable>
          
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
                  
                  <Pressable onPress={() => {setSliderVisible(false); saveTextSize()}}>
                    <View style={styles.popUpOption}>
                      <Text style={text.settings_text}>Save</Text>
                    </View>
                  </Pressable>
                </View>

              </View>
            </View>
          </Modal>

          <Pressable onPress={() => setDeviceVisible(true)}>
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
          onRequestClose={() => setDeviceVisible(false)}
          visible={inputVisible}
          >
            <View style={styles.modalBackground}> 
              <View style={styles.popUp}>
                <View style={styles.popUpOption}>
                  <Text style={[text.settings_title, {fontWeight: 'bold'}]}>Pet Feeder Device</Text>
                  <Pressable onPress={() => setDeviceVisible(false)}>
                    <Entypo name="cross" size={24} color="red" />
                  </Pressable>   
                </View>

                {device.flat().map((devices, index) => ( // since it is a nested array therefore need to flaten it first
                  <View key={devices.device_id}>
                    <View style={styles.popUpOption}>
                      <View style={styles.devices}>
                        <Text style={text.settings_text}>{index+1}. </Text>
                        <Text style={text.settings_text}>{devices.device_name}</Text>
                      </View>
                      <Pressable onPress={() => confirmationToRemove(devices.device_id)}>
                        <Text style={[text.settings_text, {color: 'red'}]}>Remove</Text>
                      </Pressable>
                    </View>           
                    <View style={styles.devices_id}>
                      <Text style={[text.settings_text, {color:'grey'}]}>ID: {devices.device_id}</Text>
                    </View>  
                  </View>
                ))}
              </View>
            </View>

          </Modal>

          <Pressable>
            <View style={styles.rowSettings}>
                <View style={styles.IconTextLeft}>
                  <MaterialIcons name="question-mark" size={24} color="black" />
                  <Text style={text.settings_text}>FAQ</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
            </View>
          </Pressable>

          <Pressable onPress={debug}>
            <View style={styles.rowSettings}>
                <View style={styles.IconTextLeft}>
                  <MaterialIcons name="question-mark" size={24} color="black" />
                  <Text style={text.settings_text}>debug</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
            </View>
          </Pressable>
                
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
    marginTop: 5,
    marginBottom: 15,
  },

  devices: {

    flexDirection: 'row',
    gap: 5,
  },

  devices_id: {

    flexDirection: 'column',
    paddingHorizontal: 50,
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
