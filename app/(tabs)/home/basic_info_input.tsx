import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserInput = () => {

  const [input, setInput] = useState({
    name:'',
    birthdate:'',
    species:'',
    breed:'',
    sex:'',
    weight:'',
  })

  useEffect( () => {
    const loadPetInfoFromStorage = async () => {
      try{
        const storedInfo = await AsyncStorage.getItem('pet_info')
        if(storedInfo)
          setInput(JSON.parse(storedInfo))
        console.log('Data load successfully')
      }
      catch(e){
        console.log('Loading Error: ', e)
      }
    }
    loadPetInfoFromStorage()
  },[])
      
  const savePetInfoToStorage = async () => {
    try {
      await AsyncStorage.setItem('pet_info', JSON.stringify(input)) // save your object, without await, the code would continue before the fetch is complete, which would cause bugs or empty results.
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
    const dataToSend = {
      ...input,
      formType: "basic_info"  //choose either "basic_info", "medical_record", "personality_habit", "prescription"
    }

    try {
      await savePetInfoToStorage()
      const response = await fetch("https://appinput.azurewebsites.net/api/SavePetData?", { //fetch() is used to make a network request to the Azure Function backend, await until the backend respond
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),  
      });
  
      const result = await response.json()
      console.log("Saved:", result)
      console.log("Success", "Pet info saved to database.")
    } 
    catch (e) {
      console.log(dataToSend)
      console.log("Failed to save data.: ", e)
    }
  }

  const loadPetInfoFromDatabase = async () => {  
    try {
      const response = await fetch('https://appinput.azurewebsites.net/api/GetPetData', {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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
      }
  
    } catch (e) {
      console.error("Error loading pet info from database:", e)
    }
  }

  const empty = () => {
    setInput({    
      name:'',
      birthdate:'',
      species:'',
      breed:'',
      sex:'',
      weight:'',})
  }

  return(

    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>

        <View style={styles.container}>
            <Text>Name:</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter pet's name"
                value={input.name}
                onChangeText={(text) => handleChange('name', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Birthdate:</Text>
            <TextInput
                style={styles.input}
                placeholder="1-1-2020"
                value={input.birthdate}
                onChangeText={(text) => handleChange('birthdate', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Species:</Text>
            <TextInput
                style={styles.input}
                placeholder="Golden Retriever"
                value={input.species}
                onChangeText={(text) => handleChange('species', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Breed:</Text>
            <TextInput
                style={styles.input}
                placeholder="Dog"
                value={input.breed}
                onChangeText={(text) => handleChange('breed', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Sex:</Text>
            <TextInput
                style={styles.input}
                placeholder="Male"
                value={input.sex}
                onChangeText={(text) => handleChange('sex', text)}
                />
        </View>
        <View style={styles.container}>
            <Text>Weight:</Text>
            <TextInput
                style={styles.input}
                placeholder="25kg"
                value={input.weight}
                onChangeText={(text) => handleChange('weight', text)}
                />
        </View>

      <Pressable onPress={savePetInfoToDatabase}>
        <Text>Save</Text>
      </Pressable>
      <Pressable onPress={loadPetInfoFromDatabase}>
        <Text>Load from Database</Text>
      </Pressable>
      <Pressable onPress={empty}>
        <Text>Empty</Text>
      </Pressable>

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

    height: 40,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
})

export default UserInput
