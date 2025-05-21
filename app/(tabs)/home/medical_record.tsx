import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { PlatformPressable } from "@react-navigation/elements"
import React, { useCallback, useEffect, useState } from "react"
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/app/auth_context"
import { useFocusEffect } from "expo-router"

const Medical = () => {

  const [isVisible, setIsVisible] = useState(false)
  const [popUpInput, setInput] = useState({
    medical_record:'',
    description:'',
    vet:'',
    date:'',
  })
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecordType[]>([])
  const { user } = useAuth()

  type MedicalRecordType = {
    userID: string;
    timeID: string;
    formType: string;
    medical_record: string;
    description: string;
    vet: string;
    date: string;
  };  
  
  const handleChange = (key:string, value:string) => {
    setInput(prev => ({...prev, [key]: value}))
  }

  const saveToStorage = async (newMedicalRecord:MedicalRecordType) => {

    if(!popUpInput.medical_record || !popUpInput.vet || !popUpInput.date){
      Alert.alert("Please fill in all required table.")
      return
    }

    const updatedMedicalRecord = [...medicalRecord, newMedicalRecord]

    try{
      await AsyncStorage.setItem(`medicalRecord_${user?.userID}`, JSON.stringify(updatedMedicalRecord))
      setMedicalRecord(updatedMedicalRecord)
      console.log('Data save successfully.')
    }
    catch(e){
      console.log('Saving Error: ', e)
    }
  }

  const loadMedicalRecord = async () => {
    try{
      const storedMedicalRecord = await AsyncStorage.getItem(`medicalRecord_${user?.userID}`)
      if(storedMedicalRecord)
        setMedicalRecord(JSON.parse(storedMedicalRecord))
      console.log('Data load successfully.')
    }
    catch(e){
      console.log('Loading Error: ', e)
    }
  }

  const handleDelete = async (id: string) => {
    try{
      const updatedMedicalRecord = medicalRecord.filter(item => item.timeID !== id)
      await AsyncStorage.setItem(`medicalRecord_${user?.userID}`, JSON.stringify(updatedMedicalRecord))
      setMedicalRecord(updatedMedicalRecord)
      console.log('Data delete successfully.')
    }
    catch(e){
      console.log('Deleting Error: ', e)
    }
  }

  const saveToDatabase = async () => {
    const dataToSend = {
      ...popUpInput,
      timeID: Date.now().toString(),
      userID: user!.userID,
      formType: 'medical_record'
    }
  
    try {
      await saveToStorage(dataToSend)
      const response = await fetch("https://appinput.azurewebsites.net/api/SaveMedicalRecord?", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })
    
      const text = await response.text()
      const result = JSON.parse(text)

      console.log("Saved to database:", result)
    } 
    catch (e) {
      console.error("Failed to save medical record:", e)
    }
    setInput({ medical_record: '', vet: '', date: '', description: '' })
    setIsVisible(false)
  }

  useFocusEffect(
    useCallback( () => {
      if (!user || !user.userID) {
        console.warn('User not available yet.');
        return;
      }
      else{
        console.log(user)
      }

      const loadFromDatabase = async () => { 
        try {
          await loadMedicalRecord() 
          const formType = 'medical_record'
          const response = await fetch(`https://appinput.azurewebsites.net/api/GetPetMedicalRecord?userID=${user?.userID}&formType=${formType}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
      
          // Check if response is OK before parsing
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(errorText || 'Failed to load medical record')
          }
      
          const result = await response.json()
          console.log("Medical record loaded:", result)
      
          if (result && Array.isArray(result)) {
            setMedicalRecord(result)
            await AsyncStorage.setItem('prescriptionRecord', JSON.stringify(result))
          } else if (result && typeof result === "object") {
            const prescriptionsArray = [result]
            setMedicalRecord(prescriptionsArray)
            await AsyncStorage.setItem('prescriptionRecord', JSON.stringify(prescriptionsArray))
          } else {
            throw new Error('Invalid response format')
          }
        } 
        catch (e) {
          console.warn("Error loading medical record from database:", e)
        }
      }
      loadFromDatabase()
    },[user]))

  const deleteInDatabase = async ( timeID:string ) => {
    try{
      await handleDelete(timeID)
      console.log('timeID', timeID)
      console.log('userID', user?.userID)
      const response = await fetch(`https://appinput.azurewebsites.net/api/DeleteMedicalRecord?userID=${user?.userID}&timeID=${timeID}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
      })
      const resultText = await response.text()

      if (!response.ok) {
        throw new Error(resultText || 'Failed to delete medical record')
      }

      // Only parse JSON if body is not empty
      if (resultText.trim()) {
        const result = JSON.parse(resultText)
        console.log('Deleted from database:', result)
      } else {
        console.log('Deleted from database: No response body')
      }
    }
    catch(e){
      console.error('Deleting error: ', e)
    }
  }

  return(
    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
      <ScrollView contentContainerStyle={styles.scroll}>

      {medicalRecord.map((item) => (
        <View key={item.timeID} style={styles.record}>
          <View style={styles.recordTitleIconLeft}>
            <MaterialCommunityIcons name="pill" size={40} color="black" />
            <Text style={styles.recordTitle}>{item.medical_record}</Text>
          </View>
          {item.description ? <Text style={{color:'rgba(0,0,0,0.7)'}}>{item.description}</Text> : null}
          <Text>{item.vet}</Text>
          <Text>Expires: {item.date}</Text>

          <Pressable onPress={() => deleteInDatabase(item.timeID)} style={styles.remove}>
            <Text style={{color:'red', fontSize: 20}}>Remove</Text>
          </Pressable>
        </View>
      ))}
      </ScrollView>

      <PlatformPressable 
      onPress={() => setIsVisible(true)}
      android_ripple={{ color:null }}
      style={styles.button}
      >
        <AntDesign name="pluscircle" size={75} color="#AA4600"/>
      </PlatformPressable>

      <Modal 
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.popUp}> 
            <View style={styles.popUpTitle}>
              <Text style={styles.popUpTitleText}>Medical</Text>
            </View>

            <View style={styles.popUpContainer}>
              <Text>Medical Record</Text>
              <TextInput
              style={styles.popUpInput}
              placeholder="Medical record"
              value={popUpInput.medical_record}
              onChangeText={(text) => handleChange('medical_record', text)}
              />
            </View>

            <View style={styles.popUpContainer}>
              <Text>Vet</Text>
              <TextInput
              style={styles.popUpInput}
              placeholder="Vet"
              value={popUpInput.vet}
              onChangeText={(text) => handleChange('vet', text)}
              />

            </View>
            <View style={styles.popUpContainer}>
              <Text>Date</Text>
              <TextInput
              style={styles.popUpInput}
              placeholder="1-1-2020"
              value={popUpInput.date}
              onChangeText={(text) => handleChange('date', text)}
              />
            </View>

            <View style={styles.popUpContainer}>
              <Text>Description</Text>
              <TextInput
              style={styles.popUpInput}
              placeholder="Description"
              value={popUpInput.description}
              onChangeText={(text) => handleChange('description', text)}
              />

            </View>
            <View style={styles.popUp_done_cancel}>
              <Pressable onPress={ () => {setIsVisible(false)
                                          setInput({ medical_record: '', vet: '', date: '', description: '' })
                                          } 
                                  }>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={ () => saveToDatabase()}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  
  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
},

  scroll: {

    paddingTop: 10,
    alignItems: 'center',
    gap: 10,
  },

  button: {
    
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    padding: 10,
    position: 'absolute',
    bottom: 0,
  },

  modalBackground: {

    justifyContent:'center',
    alignItems:'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  
  popUpContainer: {

    gap:10,
  },

  popUp: {
  
    width: 350,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
  },

  popUpTitle:{

    justifyContent:'center',
    alignItems:'center',
    paddingBottom: 10,
  },

  popUpTitleText:{

    fontWeight: 'bold',
    fontSize: 20,
  },

  popUpInput: {

    height: 40,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  popUp_done_cancel: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  record: {

    backgroundColor: 'white',
    justifyContent: 'center',
    width: '90%',
    padding: 10,
    paddingHorizontal: 25,
    borderRadius: 15,
    gap: 10
  },

  recordTitleIconLeft: {

    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  recordTitle: {

    fontWeight: 'bold',
    fontSize: 32,
  },

  remove: {

    alignSelf: 'flex-end',
  },
})
export default Medical
