import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router} from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/app/auth_context"
import { useTextSize } from "@/app/text_size_context";
import CustomLoader from "@/components/Custom_Loader";

const BasicInfo = () => {

  const [basic_info, setBasicInfo] = useState({
    name:'',
    birthdate:'',
    species:'',
    breed:'',
    sex:'',
    weight:'',
  })
  const [personality_habit, setPersonalityHabit] = useState({
    temperament:'',
    skills:'',
    like:'',
    dislike:'',
  })
  const { user } = useAuth()  
  const { textSize } = useTextSize()
  const text = dynamicStyles(textSize)
  const [loading, setLoading] = useState(true)

  const loadPetInfo = async () => {
    try {
      const storedInfo = await AsyncStorage.getItem('pet_info')
      if (storedInfo) {
        setBasicInfo(JSON.parse(storedInfo))
        console.log('Data load successfully')
      }
    } 
    catch (e) {
      console.error('Loading error:', e)
    }
  }
  
  const loadPetPersonalityHabit = async () => {
    try{
      const storedPersonalityHabit = await AsyncStorage.getItem('pet_personality_habit')
      if(storedPersonalityHabit)
        setPersonalityHabit(JSON.parse(storedPersonalityHabit))
    }
    catch(e){
      console.log('Loading error: ', e)
    }
  }

  const loadPetInfoFromDatabase = async () => {  
    if (!user || !user.userID) {
      console.warn('User not available yet.');
      return;
    }
    else{
      console.log(user)
    }
    try {
      await loadPetInfo()
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
        setBasicInfo({
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

  const loadPetPersonalityHabitFromDatabase = async () => {  
    if (!user || !user.userID) {
      console.warn('User not available yet.');
      return;
    }
    else{
      console.log(user)
    }
    try {
      await loadPetPersonalityHabit()
      const formType = 'personality_habit'
      const response = await fetch(`https://appinput.azurewebsites.net/api/GetPetPersonalityHabit?userID=${user.userID}&formType=${formType}`, {
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
        setPersonalityHabit({
          temperament: result.temperament || '',
          skills: result.skills || '',
          like: result.like || '',
          dislike: result.dislike || '',
        })
        console.log("Pet personality and habit loaded:", result)
      }
  
    } catch (e) {
      console.error("Error loading pet personality and habit from database:", e)
    }
  }

  useFocusEffect(
    useCallback(() => {
      // Call async functions inside a synchronous callback
      const fetchData = async () => {
        await loadPetInfoFromDatabase()
        await loadPetPersonalityHabitFromDatabase()
        setLoading(false)
      }
      fetchData()
    }, [user])
  )

  if(loading){
    return <CustomLoader/>
  }

  return(
    <SafeAreaView edges={['top', 'bottom']} style={[styles.whole_page]}>
      <ScrollView contentContainerStyle={styles.scroll}>
      
        <View style={styles.basic_habit_container}>
          <View style={styles.title_info_separate}>
            <View style={styles.editIconRight}>
              <Text style={[styles.basic_info_title, text.settings_title]}>Basic Information</Text>
              <Pressable onPress={()=> router.push('/(tabs)/home/basic_info_input')} style={styles.editIconRight}>
                <Text style={text.settings_text}>Edit</Text>
                <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
              </Pressable>
            </View>

            <View style={styles.columnText}>
              <View style={styles.rowText}>
              
                <View style={{flex: 1}}>
                  <View style={styles.textIcon}>
                    <MaterialCommunityIcons name="tag-text" size={24} color="#AA4600" />                  
                    <View>
                      <Text style={[styles.basic_info, text.settings_subtitle]}>Name</Text>
                      <Text style={text.settings_text}>{basic_info.name || 'Bobby'}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={{flex: 1}}> 
                  <View style={styles.textIcon}>
                    <FontAwesome name="birthday-cake" size={24} color="#AA4600" />
                    <View>
                      <Text style={[styles.basic_info, text.settings_subtitle]}>Birthdate</Text>
                      <Text style={text.settings_text}>{basic_info.birthdate || 'DD-MM-YYYY'}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.rowText}>
                
                <View style={{flex: 1}}>
                  <View style={styles.textIcon}>
                    <MaterialCommunityIcons name="dna" size={24} color="#AA4600" />                
                    <View>
                      <Text style={[styles.basic_info, text.settings_subtitle]}>Species</Text>
                      <Text style={text.settings_text}>{basic_info.species || 'Dog'}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={{flex: 1}}>
                  <View style={styles.textIcon}>
                    <FontAwesome5 name="dog" size={24} color="#AA4600" />
                    <View>
                      <Text style={[styles.basic_info, text.settings_subtitle]}>Breed</Text>
                      <Text style={text.settings_text}>{basic_info.breed || 'Golden Retriever'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.rowText}>

                <View style={{flex:1}}>
                  <View style={styles.textIcon}>
                    <MaterialCommunityIcons name="gender-male-female" size={24} color="#AA4600" />
                    <View>
                      <Text style={[styles.basic_info, text.settings_subtitle]}>Sex</Text>
                      <Text style={text.settings_text}>{basic_info.sex || 'Male'}</Text>
                    </View>
                  </View>
                </View>

                <View style={{flex:1}}>
                  <View style={styles.textIcon}>
                    <FontAwesome5 name="weight" size={24} color="#AA4600" />
                    <View>
                      <Text style={[styles.basic_info, text.settings_subtitle]}>Weight</Text>
                      <Text style={text.settings_text}>{basic_info.weight || '0 kg'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.basic_habit_container}>
          <View style={styles.title_info_separate}>
            <View style={styles.editIconRight}>
              <Text style={[styles.basic_info_title, text.settings_title]}>Personality and Habits</Text>
              <Pressable onPress={()=> router.push('/(tabs)/home/personality_habit_input')} style={styles.editIconRight}>
                <Text style={text.settings_text}>Edit</Text>
                <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
              </Pressable>
            </View>
            <View style={styles.columnText}>
              <View style={styles.textIcon}>
                <FontAwesome5 name="list-alt" size={24} color="#AA4600" />
                <View>
                  <Text style={[styles.basic_info, text.settings_subtitle]}>Temperament</Text>
                  <Text style={text.settings_text}>{personality_habit.temperament || 'Friendly'}</Text>
                </View>
              </View>
              <View style={styles.textIcon}>
                <FontAwesome name="book" size={24} color="#AA4600" />
                <View>
                  <Text style={[styles.basic_info, text.settings_subtitle]}>Skills</Text>
                  <Text style={text.settings_text}>{personality_habit.skills || 'Hand Shake'}</Text>
                </View>
              </View>
              <View style={styles.textIcon}>
                <Ionicons name="heart" size={24} color="#AA4600" />
                <View>
                  <Text style={[styles.basic_info, text.settings_subtitle]}>Like</Text>
                  <Text style={text.settings_text}>{personality_habit.like || 'Walk in park'}</Text>
                </View>
              </View>
              <View style={styles.textIcon}>
                <Ionicons name="heart-dislike" size={24} color="#AA4600" />
                <View>
                  <Text style={[styles.basic_info, text.settings_subtitle]}>Dislike</Text>
                  <Text style={text.settings_text}>{personality_habit.dislike || 'Thunder'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
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

    scroll: {

      paddingTop: 10,
      alignItems: 'center',
      gap: 10,
    },

    basic_habit_container: {

      backgroundColor: 'white',
      width: '95%',
      borderRadius: 25,
      padding: 10,
      paddingInline: 20,
    },

    editIconRight: {

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:'space-between',
      flexWrap: 'wrap',
    },

    textIcon: {

      flexDirection:'row',
      alignItems: 'center',
      gap: 10,
      width: '90%'
    },

    rowText:{

      flexDirection: 'row',
      width: '100%',
      justifyContent:'space-between',
    },

    columnText:{

      justifyContent: 'space-around',
      width: '100%',
      gap: 10,
    },

    basic_info_title: {

      fontWeight: 'bold',
    },    
    
    basic_info: {

      fontWeight: 'bold',
    },

    title_info_separate:{

      gap: 20    
    },
})

const dynamicStyles = (textSize:number) => ({
  settings_text: {

    fontSize: textSize,
  },

  settings_subtitle: {

    fontSize: textSize*1.2
  },  
  
  settings_title: {

    fontSize: textSize*1.4
  },
})

export default BasicInfo
