import { FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { router, useFocusEffect } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import React, { useCallback, useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View, Image, Platform, Alert, Modal, ImageBackground, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/components/auth_context"
import { useTextSize } from "@/components/text_size_context"
import CustomLoader from "@/components/Custom_Loader"
import { useDevices } from "@/components/device_context"
import * as FileSystem from 'expo-file-system'

const Profile = () => {

    const [basic_info, setBasicInfo] = useState({   
      name:'',
      birthdate:'',
      species:'',
      breed: '',
      sex:'',
      weight:'',
    })
    const [image, setImage] = useState<string | undefined>(undefined) // string for uri, null means no image selected initially
    const defaultprofile = require('../../../assets/images/defaultprofile.jpg')
    const [profilePictureVisible, setProfilePictureVisible] = useState(false)
    const [menuVisible, setMenuVisible] = useState(false)
    const { width, height } = useWindowDimensions()
    const { user } = useAuth()  
    const { textSize } = useTextSize()
    const text = dynamicStyles(textSize)
    const [loading, setLoading] = useState(true)
    const { loadUserFeeders, activeDeviceId } = useDevices()

    useFocusEffect(
        useCallback(() => {
            if (user?.name) {
                loadUserFeeders(user.name)
            }
    }, [user, activeDeviceId]))

    useEffect(() => { //useEffect only runs once and will not run again if the component is kept in memory (using expo router), eg. pet_profile -> basic_info -> pet_profile, update in basic_info will not update pet_profile because pet_profile is kept in memory
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

        console.log(result)
        
        if (!result.canceled) {
            const uri = result.assets[0].uri // for SDK 48 and later
            setImage(uri)
            savePetImageToDatabase(uri)
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
            savePetImageToDatabase('')
        }
        else{
            Alert.alert('The image now is the default profile image.')
        }
        setMenuVisible(false)
    }

    const savePetImage = async (image_uri:string) => {
        try{
            await AsyncStorage.setItem(`pet_image_${user?.userID}_${activeDeviceId}`, JSON.stringify(image_uri))
            console.log('Image saved to AsyncStorage.')
        }
        catch(e){
            console.error('Saving Error: ', e)
        }
    }

    const savePetImageToDatabase = async (imageUri: string) => {
        try {
            const fileName = imageUri.split('/').pop() || `pet_${Date.now()}.jpg`;
            const mimeType = 'image/jpeg'; // You can use a library to detect mime type if needed

            const formData = new FormData();
            formData.append('userID', user?.userID ?? '');
            formData.append('device_id', activeDeviceId ?? '');
            formData.append('file', {
            uri: imageUri,
            name: fileName,
            type: mimeType,
            } as any); // workaround for TypeScript

            const response = await fetch('https://appinput.azurewebsites.net/api/UploadPetImage', {
                method: 'POST',
                body: formData,
                // Don't set headers manually — fetch will set Content-Type correctly for FormData
            });

            const text = await response.text(); // Get raw response first
            let json;

            try {
            json = JSON.parse(text); // Try parsing it
            } catch (parseError) {
            console.error('❌ Failed to parse JSON:', parseError);
            console.error('Raw response:', text);
            return;
            }

            if (response.ok) {
            console.log('Successfully updated pet image in database:', json);
            // Optionally update UI with result.imageUrl
            } 
            else {
            console.error('Failed to upload image:', json);
            }
        } 
        catch (error) {
            console.error('Error uploading pet image:', error);
        }
        finally{
            setLoading(false)
        }
    }

    const loadPetImage = async () => {
        try{
            const storedImage = await AsyncStorage.getItem(`pet_image_${user?.userID}_${activeDeviceId}`)
            if (storedImage){
                setImage(JSON.parse(storedImage))
            }
            console.log('Image load successfully')
        }
        catch(e){
            console.error('Loading error: ', e)
        }
        finally{
            setLoading(false)
        }
    }
    
    const loadPetInfo = async () => {
        try{
            const storedInfo = await AsyncStorage.getItem(`pet_info_${user?.userID}_${activeDeviceId}`)
            if(storedInfo)
                setBasicInfo(JSON.parse(storedInfo))
            console.log('Data load successfully.')
        }
        catch(e){
            console.error('Loading Error: ', e)
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
            const response = await fetch(`https://appinput.azurewebsites.net/api/GetPetData?userID=${user.userID}&formType=${formType}&device_id=${activeDeviceId}`, {
                method: "GET",
                headers: { "Content-Type" : "application/json" },
            })
        
            const text = await response.text() // Read raw response
            console.log("Raw response text:", text) // Debug what was returned
        
            if (!text) {
                console.warn("Empty response received from backend.")
                setBasicInfo({
                    name: '',
                    birthdate: '',
                    species: '',
                    breed: '',
                    sex: '',
                    weight: '',
                })
                setImage(undefined)
                setLoading(false)
                return
            }
        
            const result = JSON.parse(text) // Only parse if not empty
    
            if (result.error) {
                console.warn("Server responded with error:", result.error)
                setBasicInfo({
                    name: '',
                    birthdate: '',
                    species: '',
                    breed: '',
                    sex: '',
                    weight: '',
                })
                setImage(undefined)
                setLoading(false)
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
                setImage(result.petImageUrl)
                console.log("Pet info loaded:", result)
                setLoading(false)
            }
        } 
        catch (e) {
            console.error("Error loading pet info from database:", e)
        }
    }

    useFocusEffect( // useFocusEffect runs everytime when navigated to the page regardless the component is kept in memory anot, eg. pet_profile -> basic_info -> pet_profile, update in basic_info will update pet_profile
        useCallback(() => {
            const fetchData = async () => {
                await loadPetImage()
                await loadPetInfoFromDatabase()
            }
            fetchData()
        },[user, activeDeviceId]))

    if(loading){
        return <CustomLoader/>
    }

    return(
        <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
            
            <View style={styles.basic_info}>
                <View>
                    <View style={styles.imageContainer}>
                        <Image source={ image ? { uri: image } : defaultprofile } style={[styles.image, !image && styles.defaultImage]}/>
                        <Pressable onPress={ () => setMenuVisible(true) } style={styles.imagePosition}>
                            <Octicons name="image" size={24} color="black" />
                        </Pressable>
                    </View>

                    <View style={styles.columnText}>
                        <Pressable onPress={ ()=> router.push('/(tabs)/home/basic_info') }>
                            <View style={styles.to_basic_info}>
                                <Text style={[text.settings_title, {fontWeight:'bold'}]}>{basic_info.name || 'Name'}</Text> 
                                <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                            </View>
                        </Pressable>
                        <View style={styles.rowText}>
                            <View style={styles.IconTextLeft_BasicInfo}>
                                <MaterialCommunityIcons name="gender-male-female" size={24} color="#AA4600" />
                                <Text style={text.settings_text}>{basic_info.sex || 'Sex'}</Text>
                            </View>
                            <View style={styles.IconTextLeft_BasicInfo}>
                                <FontAwesome name="birthday-cake" size={24} color="#AA4600" />
                                <Text style={text.settings_text}>{basic_info.birthdate || 'DD-MM-YYYY'}</Text>
                            </View>
                        </View>
                        <View style={styles.rowText}>
                            <View style={styles.IconTextLeft_BasicInfo}>
                                <MaterialCommunityIcons name="dna" size={24} color="#AA4600" />
                                <Text style={text.settings_text}>{basic_info.species || 'Species'}</Text>
                            </View>
                            <View style={styles.IconTextLeft_BasicInfo}>
                                <FontAwesome5 name="weight" size={24} color="#AA4600" />
                                <Text style={text.settings_text}>{basic_info.weight || '0 kg'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
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
                                <Text style={[styles.popUpText, text.settings_text]}>Choose from Album</Text>
                            </View>
                        </Pressable>
                        <Pressable onPress={ () => viewImage()}>
                            <View style={styles.popUpOption}>
                                <Text style={[styles.popUpText, text.settings_text]}>View image</Text>
                            </View>
                        </Pressable>
                        <Pressable onPress={ backToDefault }>
                            <View style={styles.popUpOption}>
                                <Text style={[styles.popUpText, text.settings_text]}>Return to default</Text>
                            </View>
                        </Pressable>
                        <Pressable onPress={ () => setMenuVisible(false) }>
                            <View style={styles.popUpOption}>
                                <Text style={[styles.popUpText, text.settings_text]}>Cancel</Text>
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
            
            <Pressable onPress={ ()=> router.push('/(tabs)/home/medical_record') }>
                <View style={styles.medical_record}>
                    <View style={styles.IconTextLeft}>
                        <FontAwesome5 name="book-medical" size={24} color="#AA4600" />
                        <Text style={text.settings_text}>Medical Record</Text>
                    </View> 
                    <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
                </View>            
            </Pressable>

            <Pressable onPress={ ()=> router.push('/(tabs)/home/prescription') }>
                <View style={styles.prescription}>
                    <View style={styles.IconTextLeft}>
                        <MaterialCommunityIcons name="pill" size={24} color="#AA4600" />
                        <Text style={text.settings_text}>Prescription</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        paddingInline: 20,
        padding: 10,
    },

    imageContainer: {
    
        position: 'relative',
        marginBottom: 15, 
    },

    to_basic_info: {

        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems:'center',
        marginBottom: 10,
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

    IconTextLeft_BasicInfo: {

        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        width: '44%',
    },

    IconTextLeft: {

        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        flex: 1, 
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

        justifyContent: 'space-around',
    },
    
    rowText: {
        
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
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

const dynamicStyles = (textSize:number) => ({
  settings_text: {

    fontSize: textSize,
  },

  settings_title: {

    fontSize: textSize*1.2
  },
})

export default Profile
