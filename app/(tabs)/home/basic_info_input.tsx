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

  return(

    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>

        <View style={styles.container}>
            <Text>Name:</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your name"
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

      <Pressable onPress={savePetInfoToStorage}>
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
