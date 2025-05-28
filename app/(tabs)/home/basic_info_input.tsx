import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "@/app/auth_context"
import { useTextSize } from "@/app/text_size_context";
import CustomLoader from "@/components/Custom_Loader";

const UserInput = () => {

  const [input, setInput] = useState({
    name:'',
    birthdate:'',
    species:'',
    breed:'',
    sex:'',
    weight:'',
  })
  const { user } = useAuth()  
  const { textSize } = useTextSize()
  const text = dynamicStyles(textSize)
  const [loading, setLoading] = useState(true)

  const loadPetInfoFromStorage = async () => {
    try{
      const storedInfo = await AsyncStorage.getItem(`pet_info_${user?.userID}`)
      if(storedInfo)
        setInput(JSON.parse(storedInfo))
      console.log('Data load successfully')
    }
    catch(e){
      console.error('Loading Error: ', e)
    }
  }
      
  const savePetInfoToStorage = async () => {
    try {
      await AsyncStorage.setItem(`pet_info_${user?.userID}`, JSON.stringify(input)) // save your object, without await, the code would continue before the fetch is complete, which would cause bugs or empty results.
      router.back()
      console.log('Data saved to AsyncStorage!') // wait until the data is saved before printing
    } 
    catch (e) {
      console.error('Saving error:', e)
    }
  }

  const handleChange = (key:string, value:string) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  const savePetInfoToDatabase = async () => {

    const storedImage = await AsyncStorage.getItem(`pet_image_${user?.userID}`)

    const dataToSend = {
      ...input,
      userID: user?.userID,
      petImageUrl: storedImage ? JSON.parse(storedImage) : '',
      formType: "basic_info"  //choose either "basic_info", "medical_record", "personality_habit", "prescription"
    }

    try {
      await savePetInfoToStorage()
      const response = await fetch("https://appinput.azurewebsites.net/api/SavePetData?", { //fetch() is used to make a network request to the Azure Function backend, await until the backend respond
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),  
      })
  
      const result = await response.json()
      console.log("Saved:", result)
      console.log("Pet info saved successfully to database.")
    } 
    catch (e) {
      console.error("Failed to save data: ", e)
    }
  }

  useEffect( () => {
    const loadPetInfoFromDatabase = async () => {  
      if (!user || !user.userID) {
        console.warn('User not available yet.');
        return;
      }
      else{
        console.log(user)
      }

      try {
        await loadPetInfoFromStorage()
        const formType = 'basic_info'
        const response = await fetch(`https://appinput.azurewebsites.net/api/GetPetData?userID=${user.userID}&formType=${formType}`, {
          method: "GET",
          headers: { "Content-Type" : "application/json" },
        })
    
        const text = await response.text() // Read raw response
        console.log("Raw response text:", text) // Debug what was returned
    
        if (!text) {
          console.warn("Empty response received from backend.")
          return
        }
    
        const result = JSON.parse(text) // Only parse if not empty
  
        if (result.error) {
          console.warn("Server responded with error:", result.error)
          return
        }
    
        if (result && typeof result === "object") {
          setInput({
            name: result.name || '',
            birthdate: result.birthdate || '',
            species: result.species || '',
            breed: result.breed || '',
            sex: result.sex || '',
            weight: result.weight || '',
          })
          console.log("Pet info loaded:", result)
          setLoading(false)
        }
    
      } 
      catch (e) {
        console.error("Error loading pet info from database:", e)
      }
    }
    loadPetInfoFromDatabase()
  },[user]) // <-- re-run when user changes

  const empty = () => {
    Alert.alert('Warning!', 'Are you sure to clear all the input fill?', 
      [{text: 'No', style: "cancel"}, 
        {text: 'Clear', style: "destructive", onPress: () => setInput({ name:'', birthdate:'', species:'', breed:'' ,sex:'', weight:''} )}] )
  }

  if(loading){
    return <CustomLoader/>
  }

  return(

    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>

        <View style={styles.container}>
            <Text style={text.settings_text}>Name:</Text>
            <TextInput
                style={[styles.input, text.settings_text]}
                placeholder="Enter pet's name"
                placeholderTextColor={'grey'}
                value={input.name}
                onChangeText={(text) => handleChange('name', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text style={text.settings_text}>Birthdate:</Text>
            <TextInput
                style={[styles.input, text.settings_text]}
                placeholder="1-1-2020"
                placeholderTextColor={'grey'}
                value={input.birthdate}
                onChangeText={(text) => handleChange('birthdate', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text style={text.settings_text}>Species:</Text>
            <TextInput
                style={[styles.input, text.settings_text]}
                placeholder="Golden Retriever"
                placeholderTextColor={'grey'}
                value={input.species}
                onChangeText={(text) => handleChange('species', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text style={text.settings_text}>Breed:</Text>
            <TextInput
                style={[styles.input, text.settings_text]}
                placeholder="Dog"
                placeholderTextColor={'grey'}
                value={input.breed}
                onChangeText={(text) => handleChange('breed', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text style={text.settings_text}>Sex:</Text>
            <TextInput
                style={[styles.input, text.settings_text]}
                placeholder="Male"
                placeholderTextColor={'grey'}
                value={input.sex}
                onChangeText={(text) => handleChange('sex', text)}
                />
        </View>
        <View style={styles.container}>
            <Text style={text.settings_text}>Weight:</Text>
            <TextInput
                style={[styles.input, text.settings_text]}
                placeholder="25kg"
                placeholderTextColor={'grey'}
                value={input.weight}
                onChangeText={(text) => handleChange('weight', text)}
                />
        </View>

      <View style={styles.save_empty}>
        <Pressable onPress={empty}>
          <Text style={text.settings_text}>Empty</Text>
        </Pressable>
        <Pressable onPress={savePetInfoToDatabase}>
          <Text style={text.settings_text}>Save</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  
  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
    padding: 10
  },

  container: {    

    gap: 10,
  },

  input: {

    height: 'auto',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  save_empty: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
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

export default UserInput
