import { useAuth } from '@/components/auth_context'
import CustomLoader from '@/components/Custom_Loader'
import { useDevices } from '@/components/device_context'
import { useTextSize } from '@/components/text_size_context'
import { AntDesign, Entypo } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, Modal, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Snackbar } from 'react-native-paper'

export const DeviceSwitcher = () => {
  
  const { devices, activeDeviceId, setActiveDevice, loadUserFeeders } = useDevices()
  const [loading, setLoading] = useState(true)
  const { textSize } = useTextSize()
  const text = dynamicStyles(textSize)
  const { user } = useAuth()
  const [inputVisible, setInputVisible] = useState(false)
  const [deviceName, setDeviceName] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [snackbar, setSnackbar] = useState('')
  const [snackbarVisible, setSnackbarVisible] = useState(false)
    
  type FeederDevice = {
    device_name: string;
    device_id: string;
  };

  useFocusEffect(
    useCallback (() => {
      if(user?.name){
        loadUserFeeders(user.name)
        setLoading(false)
      }
    },[user]))

  useEffect(() => {
    if(!user || !user.userID){
      console.warn('User not available yet.')
      setLoading(false)
    }
  })

  const checkDeviceIdRegister = async (deviceID:string) => {
    if(deviceId === '' || deviceName === ''){
      Alert.alert('Please fill up all the required fill.')
      return
    }

    try{
      const response = await fetch(`https://appinput.azurewebsites.net/api/GetDeviceRegistration?device_id=${deviceID}`,{
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      })

      const text = await response.text()

      if(!text){
        console.warn('No device registration data found.')
        setLoading(false)
        return
      }

      const result = JSON.parse(text)

      if(result.error){
        console.warn('Invalid device id.', result)
        setSnackbar('Invalid device id')
        setSnackbarVisible(true)
        setLoading(false)
        return
      }

      console.log('Device data: ', result)
      setInputVisible(false)
      savePetFeederDeviceToDatabase()
      updateDeviceRegistration(deviceID)
    }
    catch(e){
      console.error('Failed to get device registration data: ', e)
    }
    finally{
      setLoading(false)
    }
  }
  
  const savePetFeederDeviceToDatabase = async () => {
    try{
      const formType = 'user_data'
      const getresponse = await fetch(`https://appinput.azurewebsites.net/api/GetUserData?name=${user?.name}&formType=${formType}`, {
          method: 'GET',
          headers: {'Content-Type' : 'application/json'}
      })

      const text = await getresponse.text()
      const getresult = JSON.parse(text)
      console.log('User data successfully load: ', getresult)

      const existing_feeder:FeederDevice[] = getresult.user.feeder || []
      const new_feeder:FeederDevice = { device_name: deviceName, device_id: deviceId}
      
      const isDuplicate = existing_feeder.some(
        feeder => feeder.device_id === new_feeder.device_id 
      )

      const updatedFeederArray = isDuplicate
      ? existing_feeder
      : [...existing_feeder, new_feeder]

      const updatedUserData = {
        userID: user?.userID,
        name: user?.name,
        email: user?.email,
        password: getresult.user.password,
        formType: 'user_data',
        provider: user?.provider,
        feeder: updatedFeederArray,
        isUpdate: true
      }

      const postresponse = await fetch('https://appinput.azurewebsites.net/api/SaveUserData?',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedUserData)
      })

      const result = await postresponse.json()
      loadUserFeeders(user!.name)
      console.log('Successfully update pet feeder id to database. ', result)
    }
    catch(e){
      console.error('Saving error to database: ', e)
    }
    finally{
      setLoading(false)
    }
  }

  const updateDeviceRegistration = async (deviceID:string) => {
    const dataToUpdate = {
      device_id: deviceID,
      device_status: 'active',
    }

    try{
      const response = await fetch('https://appinput.azurewebsites.net/api/UpdateDeviceRegistration?', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dataToUpdate)
      })

      const result = await response.json()
      console.log('Update successfully: ', result)
    }
    catch (e){
      console.error('Update error: ', e)
    }
    finally{
      setLoading(false)
    }
  }

  const empty = () => {
    setDeviceId('')
    setDeviceName('')
  }

  const debug = () => {

    console.log(devices)
    console.log(activeDeviceId)
  }

  if(loading){
    return <CustomLoader/>
  }
  
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
      {devices.map(devices => (
        <View key={devices.device_id} style={styles.container}>
          <Pressable onPress={() => {setActiveDevice(devices.device_id); router.push('/(tabs)/home/pet_profile')}}>
            <Text style={[text.settings_title, {fontWeight:'bold'}]}>{devices.device_name}</Text>
          </Pressable>
        </View>
      ))}

      <Pressable onPress={() => debug()}>
        <Text>debugs</Text>
      </Pressable>

      <Pressable 
      android_ripple={{ color:null }}
      style={styles.button}
      onPress={() => setInputVisible(true)}
      >
        <AntDesign name="pluscircle" size={75} color="#AA4600"/>
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
              <Text style={[text.settings_title, {fontWeight: 'bold'}]}>Pet Feeder Device</Text>
              <Pressable onPress={() => [setInputVisible(false), empty()]}>
                <Entypo name="cross" size={24} color="red" />
              </Pressable>   
            </View>
            <View>
              <Text style={text.settings_text}>Device name: </Text>
              <TextInput
              style={[styles.input, text.settings_text]}
              placeholder="Pet feeder device name"
              placeholderTextColor={'grey'}
              value={deviceName}
              onChangeText={(text) => setDeviceName(text)}
              />                
            </View>
            <View>
              <Text style={text.settings_text}>Device ID: </Text>
              <TextInput
              style={[styles.input, text.settings_text]}
              placeholder="pet_feeder_1"
              placeholderTextColor={'grey'}
              value={deviceId}
              onChangeText={(text) => setDeviceId(text)}
              />
            </View>
            <View style={styles.rowSettings}>
              <Pressable onPress={() => [setInputVisible(false), empty()]}>
                <View style={styles.popUpOption}>
                  <Text style={text.settings_text}>Cancel</Text>
                </View>              
              </Pressable>
              
              <Pressable onPress={() => checkDeviceIdRegister(deviceId)}>
                <View style={styles.popUpOption}>
                  <Text style={text.settings_text}>Save</Text>
                </View>
              </Pressable>
            </View>    
          </View>

          <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{
            label: 'Close',
            onPress: () => setSnackbarVisible(false),
          }}>
            {snackbar}
          </Snackbar>

        </View>
      </Modal>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
    paddingTop: 20,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {

    backgroundColor: 'white',
    borderRadius: 25,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingInline: 20,
    padding: 10,
  },
    
  button: {
    
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    padding: 10,
    position: 'absolute',
    bottom: 0,
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

  input: {

    height: 'auto',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginTop: 5,
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

export default DeviceSwitcher
