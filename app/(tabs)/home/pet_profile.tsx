import { FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {

    const [basic_info, setBasicInfo] = useState({   
      name:'',
      birthdate:'',
      species:'',
      sex:'',
      weight:'',
    })
    
    useFocusEffect(
        useCallback( () => {
            const loadPetInfo = async () => {
                try{
                    const storedInfo = await AsyncStorage.getItem('pet_info')
                    if(storedInfo)
                        setBasicInfo(JSON.parse(storedInfo))
                    console.log('Data load successfully.')
                }
                catch(e){
                    console.log('Loading Error: ', e)
                }
            }
            loadPetInfo()
        },[]))

    return(
        <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
            
            <View style={styles.basic_info}>
                <Image source={require('../../../assets/images/golden.jpg')} style={styles.image}/>
                <View style={styles.columnText}>
                    <Pressable onPress={ ()=> router.push('/(tabs)/home/basic_info') }>
                        <View style={styles.to_basic_info}>
                            <Text style={{fontWeight: 'bold', fontSize: 24}}>{basic_info.name || 'Name'}</Text> 
                            <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                        </View>
                    </Pressable>
                    <View style={styles.rowText}>
                        <View style={styles.IconTextLeft}>
                            <MaterialCommunityIcons name="gender-male-female" size={24} color="#AA4600" />
                            <Text>{basic_info.sex || 'Sex'}</Text>
                        </View>
                        <View style={styles.IconTextLeft}>
                            <FontAwesome name="birthday-cake" size={24} color="#AA4600" />
                            <Text>{basic_info.birthdate || 'DD-MM-YYYY'}</Text>
                        </View>
                    </View>
                    <View style={styles.rowText}>
                        <View style={styles.IconTextLeft}>
                            <MaterialCommunityIcons name="dna" size={24} color="#AA4600" />
                            <Text>{basic_info.species || 'Species'}</Text>
                        </View>
                        <View style={styles.IconTextLeft}>
                            <FontAwesome5 name="weight" size={24} color="#AA4600" />
                            <Text>{basic_info.weight || '0 kg'}</Text>
                        </View>
                    </View>
                </View>
            </View>
            
            <Pressable onPress={ ()=> router.push('/(tabs)/home/medical_record') }>
                <View style={styles.medical_record}>
                    <View style={styles.IconTextLeft}>
                        <FontAwesome5 name="book-medical" size={24} color="#AA4600" />
                        <Text>Medical Record</Text>
                    </View> 
                    <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                </View>            
            </Pressable>

            <Pressable onPress={ ()=> router.push('/(tabs)/home/prescription') }>
                <View style={styles.prescription}>
                    <View style={styles.IconTextLeft}>
                        <MaterialCommunityIcons name="pill" size={24} color="#AA4600" />
                        <Text>Prescription</Text>
                    </View> 
                    <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                </View>            
            </Pressable>
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
    
    basic_info: {
        
        backgroundColor: 'white',
        borderRadius: 25,
        width: '90%',
        height: '45%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        paddingInline: 20,
        padding: 10,
    },

    to_basic_info: {

        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems:'center',
    },

    medical_record:{

        backgroundColor: 'white',
        borderRadius: 25,
        width: '90%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingInline: 20,
        padding: 5
    },

    prescription: {

        backgroundColor: 'white',
        borderRadius: 25,
        width: '90%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingInline: 20,
        padding: 5
    },

    IconTextLeft: {

        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        flex: 1
    },

    image: {

        justifyContent:'center',
        alignItems:'center',
        borderRadius: 20,
    },

    columnText: {

        flex: 1,
        justifyContent: 'space-around',
    },
    
    rowText: {
        
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
})

export default Profile
