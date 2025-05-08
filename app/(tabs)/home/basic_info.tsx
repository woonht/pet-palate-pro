import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router} from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";

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

  useFocusEffect(
    useCallback(() => {
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
  
    loadPetInfo()
  }, []))
  
  useFocusEffect(
    useCallback( () => {
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
      loadPetPersonalityHabit()
    }, []))

  return(
    <SafeAreaView edges={['top', 'bottom']} style={[styles.whole_page]}>
      <View style={styles.basic_habit_container}>
        <View style={styles.title_info_separate}>
          <View style={styles.editIconRight}>
            <Text style={styles.basic_info_title}>Basic Information</Text>
            <Pressable onPress={()=> router.push('/(tabs)/home/basic_info_input')} style={styles.editIconRight}>
              <Text>Edit</Text>
              <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
            </Pressable>
          </View>

          <View style={styles.columnText}>
            <View style={styles.rowText}>
            
              <View style={{flex: 1}}>
                <View style={styles.textIcon}>
                  <MaterialCommunityIcons name="tag-text" size={24} color="#AA4600" />                  
                  <View>
                    <Text style={styles.basic_info}>Name</Text>
                    <Text>{basic_info.name || 'Bobby'}</Text>
                  </View>
                </View>
              </View>
              
              <View style={{flex: 1}}> 
                <View style={styles.textIcon}>
                  <FontAwesome name="birthday-cake" size={24} color="#AA4600" />
                  <View>
                    <Text style={styles.basic_info}>Birthdate</Text>
                    <Text>{basic_info.birthdate || 'DD-MM-YYYY'}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.rowText}>
              
              <View style={{flex: 1}}>
                <View style={styles.textIcon}>
                  <MaterialCommunityIcons name="dna" size={24} color="#AA4600" />                
                  <View>
                    <Text style={styles.basic_info}>Species</Text>
                    <Text>{basic_info.species || 'Dog'}</Text>
                  </View>
                </View>
              </View>
              
              <View style={{flex: 1}}>
                <View style={styles.textIcon}>
                  <FontAwesome5 name="dog" size={24} color="#AA4600" />
                  <View>
                    <Text style={styles.basic_info}>Breed</Text>
                    <Text>{basic_info.breed || 'Golden Retriever'}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.rowText}>

              <View style={{flex:1}}>
                <View style={styles.textIcon}>
                  <MaterialCommunityIcons name="gender-male-female" size={24} color="#AA4600" />
                  <View>
                    <Text style={styles.basic_info}>Sex</Text>
                    <Text>{basic_info.sex || 'Male'}</Text>
                  </View>
                </View>
              </View>

              <View style={{flex:1}}>
                <View style={styles.textIcon}>
                  <FontAwesome5 name="weight" size={24} color="#AA4600" />
                  <View>
                    <Text style={styles.basic_info}>Weight</Text>
                    <Text>{basic_info.weight || '0 kg'}</Text>
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
            <Text style={styles.basic_info_title}>Personality and Habits</Text>
            <Pressable onPress={()=> router.push('/(tabs)/home/personality_habit_input')} style={styles.editIconRight}>
              <Text>Edit</Text>
              <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
            </Pressable>
          </View>
          <View style={styles.columnText}>
            <View style={styles.textIcon}>
              <FontAwesome5 name="list-alt" size={24} color="#AA4600" />
              <View>
                <Text style={styles.basic_info}>Temperament</Text>
                <Text>{personality_habit.temperament || 'Friendly'}</Text>
              </View>
            </View>
            <View style={styles.textIcon}>
              <FontAwesome name="book" size={24} color="#AA4600" />
              <View>
                <Text style={styles.basic_info}>Skills</Text>
                <Text>{personality_habit.skills || 'Hand Shake'}</Text>
              </View>
            </View>
            <View style={styles.textIcon}>
              <Ionicons name="heart" size={24} color="#AA4600" />
              <View>
                <Text style={styles.basic_info}>Like</Text>
                <Text>{personality_habit.like || 'Walk in park'}</Text>
              </View>
            </View>
            <View style={styles.textIcon}>
              <Ionicons name="heart-dislike" size={24} color="#AA4600" />
              <View>
                <Text style={styles.basic_info}>Dislike</Text>
                <Text>{personality_habit.dislike || 'Thunder'}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

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

    basic_habit_container: {

      backgroundColor: 'white',
      width: '90%',
      borderRadius: 25,
      padding: 10,
      paddingInline: 20,
    },

    editIconRight: {

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:'space-between',
    },

    textIcon: {

      flexDirection:'row',
      alignItems: 'center',
      gap: 10,
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
      fontSize: 24
    },    
    
    basic_info: {

      fontWeight: 'bold',
      fontSize: 18
    },

    title_info_separate:{

      gap: 20    
    },
})

export default BasicInfo
