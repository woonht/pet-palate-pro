import { FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { router, useFocusEffect } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import React, { useCallback, useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View, Image, Platform, Alert, Modal, ImageBackground, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const Profile = () => {

    const [basic_info, setBasicInfo] = useState({   
      name:'',
      birthdate:'',
      species:'',
      sex:'',
      weight:'',
    })
    const [image, setImage] = useState<string | undefined>(undefined) // string for uri, null means no image selected initially
    const defaultprofile = require('../../../assets/images/defaultprofile.jpg')
    const [profilePictureVisible, setProfilePictureVisible] = useState(false)
    const [menuVisible, setMenuVisible] = useState(false)
    const { width, height } = useWindowDimensions()

    useEffect(() => {
        (async () => {
          if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); // pop up
            if (status !== 'granted') {
              alert('Sorry, we need camera roll permissions to make this work!');
            }
          }
        })()
      }, [])

    const pickImage = async () => {

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true, // allow user to crop
            aspect: [4, 3], // width:height ratio
            quality: 1, // 1 - max quality, 0 - min quality
        })

        console.log(result);
        
        if (!result.canceled) {
            const uri = result.assets[0].uri // for SDK 48 and later
            setImage(uri)
            savePetImage(uri)
        }
        setMenuVisible(false)
    }  

    const viewImage = () => {
        if (image) {
            setProfilePictureVisible(true)
        }
        else {
            Alert.alert('No profile image', 'No custom image to preview.');
        }    
        setMenuVisible(false)
    }

    const backToDefault = () => {

        if(image){ // image not null
            setImage(undefined)
        }
        else{
            Alert.alert('The image now is the default profile image.')
        }
        setMenuVisible(false)
    }

    const savePetImage = async (image_uri:string) => {
        try{
            await AsyncStorage.setItem('pet_image', JSON.stringify(image_uri))
            console.log('Image saved to AsyncStorage.')
        }
        catch(e){
            console.log('Saving Error: ', e)
        }
    }

    useEffect(() => { //useEffect only runs once and will not run again if the component is kept in memory (using expo router), eg. pet_profile -> basic_info -> pet_profile, update in basic_info will not update pet_profile because pet_profile is kept in memory
        const loadPetImage = async () => {
            try{
                const storedImage = await AsyncStorage.getItem('pet_image')
                if (storedImage){
                    setImage(JSON.parse(storedImage))
                }
                console.log('Image load successfully')
            }
            catch(e){
                console.log('Loading error: ', e)
            }
        }
        loadPetImage()
    }, [])
    
    useFocusEffect( // useFocusEffect runs everytime when navigated to the page regardless the component is kept in memory anot, eg. pet_profile -> basic_info -> pet_profile, update in basic_info will update pet_profile
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
                <View>
                    <Image source={ image ? { uri: image } : defaultprofile } style={[styles.image, !image && styles.defaultImage]}/>
                    <Pressable onPress={ () => setMenuVisible(true) } style={styles.imagePosition}>
                        <Octicons name="image" size={24} color="black" />
                    </Pressable>
                </View>

                <Modal
                    animationType="fade"
                    transparent={true}
                    onRequestClose={ () => setMenuVisible(false) }
                    visible={menuVisible}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.popUp}>
                            <Pressable onPress={ () => pickImage()}>
                                <View style={styles.popUpOption}>
                                    <Text style={styles.popUpText}>Choose from Album</Text>
                                </View>
                            </Pressable>
                            <Pressable onPress={ () => viewImage()}>
                                <View style={styles.popUpOption}>
                                    <Text style={styles.popUpText}>View image</Text>
                                </View>
                            </Pressable>
                            <Pressable onPress={ backToDefault }>
                                <View style={styles.popUpOption}>
                                    <Text style={styles.popUpText}>Return to default</Text>
                                </View>
                            </Pressable>
                            <Pressable onPress={ () => setMenuVisible(false) }>
                                <View style={styles.popUpOption}>
                                    <Text style={styles.popUpText}>Cancel</Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

                <Modal
                    visible= {profilePictureVisible}
                    transparent= {false}
                    animationType="fade"
                    onRequestClose={ () => setProfilePictureVisible(false) }
                    >
                    <ImageBackground source={{uri:image}} style={styles.backgroundImage} blurRadius={10}>
                        <View style={styles.modalBackground}>
                            {image && ( // only evaluate and render what's after && if image is truthy
                                <Image source={{ uri: image }} style={styles.fullImage} resizeMode="contain" />
                            )}
                            <Pressable onPress={() => setProfilePictureVisible(false)} style={styles.exitImage}>
                                <Text>X</Text>
                            </Pressable>
                        </View>
                    </ImageBackground>
                </Modal>

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
        height: '52%',
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

        width: 330,
        height: 230,
        backgroundColor: 'grey',
        borderRadius: 20,
    },

    defaultImage: {

        opacity: 0.4,
        width: 350,
    },

    imagePosition: {

        justifyContent:'center',
        alignItems:'center',
        borderRadius: 20,
        position: 'absolute',
        top: 10,
        right: 20,
    },

    fullImage: {
    
        width: '100%',
        height: '100%',
    },

    backgroundImage: {

        flex: 1,
    },

    exitImage: {

        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 10,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 50,
    },
 
    columnText: {

        flex: 1,
        justifyContent: 'space-around',
    },
    
    rowText: {
        
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    modalBackground: {

        justifyContent: 'flex-end',
        alignItems:'center',
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },

    popUp: {
  
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        bottom: 65,
        padding: 10,
    },

    popUpOption: {

        alignItems:'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },

    popUpText: {

        paddingVertical: 10,
        fontSize: 16,
    },
})

export default Profile
