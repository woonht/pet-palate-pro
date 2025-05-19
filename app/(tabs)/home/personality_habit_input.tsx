import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router"
import React, { useEffect, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/app/auth_context"

const UserInput = () => {
  const [input, setInput] = useState({
    
    temperament:'',
    skills:'',
    like:'',
    dislike:'',
  })
  const { user } = useAuth()

  const handleChange = (key:string, value:string) => {
      setInput(prev => ({ ...prev, [key]: value }))
  }

  const savePetPersonalityHabitToStorage = async () => {
    try{
      await AsyncStorage.setItem('pet_personality_habit', JSON.stringify(input))
      router.back()
      console.log('Data saved to Asyncstorage')
    }
    catch(e){
      console.log('Saving Error: ', e)
    }
  }

  useEffect( () => {
    const loadPetPersonalityHabit = async () => {
      try{
        const storedPersonalityHabit = await AsyncStorage.getItem('pet_personality_habit')
        if(storedPersonalityHabit)
          setInput(JSON.parse(storedPersonalityHabit))
        console.log('Data load successfully')
      }
      catch(e){
        console.log('Loading Error: ', e)
      }
    }
    loadPetPersonalityHabit()
  },[])

  const savePetPersonalityHabitToDatabase = async () => {
    const dataToSend = {
      ...input,
      userID: user?.user.id,
      formType: 'personality_habit'
    }
    
    try{
      await savePetPersonalityHabitToStorage()
      const response = await fetch('https://appinput.azurewebsites.net/api/SavePersonalityHabit?', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(dataToSend)
      })

      const result = await response.json()
      console.log("Saved:", result)
      console.log("Pet personality and habit successfully saved to database.")
    }
    catch(e){
      console.log(dataToSend)
      console.log("Failed to save data to database: ", e)
    }
  }

  const empty = () => {
    setInput({    
      temperament:'',
      skills:'',
      like:'',
      dislike:''})
  }

  return(

    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>

        <View style={styles.container}>
            <Text>Temperament:</Text>
            <TextInput
                style={styles.input}
                placeholder="Friendly, Playful"
                placeholderTextColor={'grey'}
                value={input.temperament}
                onChangeText={(text) => handleChange('temperament', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Skills:</Text>
            <TextInput
                style={styles.input}
                placeholder="Hand Shake, Sit, Stand"
                placeholderTextColor={'grey'}
                value={input.skills}
                onChangeText={(text) => handleChange('skills', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Like:</Text>
            <TextInput
                style={styles.input}
                placeholder="Ball, Park Walking"
                placeholderTextColor={'grey'}
                value={input.like}
                onChangeText={(text) => handleChange('like', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Dislike:</Text>
            <TextInput
                style={styles.input}
                placeholder="Thunder, Firework"
                placeholderTextColor={'grey'}
                value={input.dislike}
                onChangeText={(text) => handleChange('dislike', text)}
                />
        </View>        

        <Pressable onPress={savePetPersonalityHabitToDatabase}>
          <Text>Save</Text>
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
