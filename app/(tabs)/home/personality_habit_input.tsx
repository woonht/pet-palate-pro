import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserInput = () => {
    const [input, setInput] = useState({

        temperament:'',
        skills:'',
        like:'',
        dislike:'',
    })

    const handleChange = (key:string, value:string) => {
        setInput(prev => ({ ...prev, [key]: value }));
    };

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

  return(

    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>

        <View style={styles.container}>
            <Text>Temperament:</Text>
            <TextInput
                style={styles.input}
                placeholder="Friendly, Playful"
                value={input.temperament}
                onChangeText={(text) => handleChange('temperament', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Skills:</Text>
            <TextInput
                style={styles.input}
                placeholder="Hand Shake, Sit, Stand"
                value={input.skills}
                onChangeText={(text) => handleChange('skills', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Like:</Text>
            <TextInput
                style={styles.input}
                placeholder="Ball, Park Walking"
                value={input.like}
                onChangeText={(text) => handleChange('like', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Dislike:</Text>
            <TextInput
                style={styles.input}
                placeholder="Thunder, Firework"
                value={input.dislike}
                onChangeText={(text) => handleChange('dislike', text)}
                />
        </View>        

        <Pressable onPress={savePetPersonalityHabitToStorage}>
          <Text>Save</Text>
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
