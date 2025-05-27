import { router, useFocusEffect } from "expo-router"
import React, { useCallback, useEffect, useState } from "react"
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import 'expo-dev-client'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { useAuth } from "@/app/auth_context"
import Toast from 'react-native-toast-message'
import CustomLoader from "@/components/Custom_Loader"

const SignIn = () => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const { setUser } = useAuth()
    const [loading, setLoading] = useState(false)

    useFocusEffect(
        useCallback(() => {
                const emptySignInFill = () => {
                    setUsername('')
                    setPassword('')
                }
            emptySignInFill()
        },[]))

    useEffect(() => {
        GoogleSignin.configure({
        webClientId: '637482238294-n5ds4ua9tsu6m2tlpo407v2cuk60dv8k.apps.googleusercontent.com',
        offlineAccess: true,
        })
    }, [])
    
    const login = async () => {
        
        if(!username || !password){
            Alert.alert('Please enter a valid email or password.')
            return
        }

        setLoading(true)

        try{
            const formType = 'user_data'
            const response = await fetch(`https://appinput.azurewebsites.net/api/GetUserData?name=${username}&formType=${formType}`, {
                method: 'GET',
                headers: {'Content-Type' : 'application/json'}
            })

            const text = await response.text()
            const result = JSON.parse(text)
            console.log(result)

            if(username === result.user.name && password === result.user.password){
                setUser({
                    userID: result.user.userID,
                    name: result.user.name,
                    email: result.user.email,
                    photo: '',
                    provider: 'local',
                })
                router.push('/(tabs)/home/pet_profile')
                Toast.show({
                    type: 'success',
                    text1: 'Signed in successfully',
                })
            }
            else{
                Toast.show({
                    type: 'error',
                    text1: 'Invalid username or password',
                })  
            }
        }
        catch(e){
            Toast.show({
                type: 'error',
                text1: 'Login failed. Please sign up',
            });
        }
        finally{
            setLoading(false)
        }
    }

    const signUp = () => {
        try{
            setLoading(true)
            router.push('/(tabs)/auth/sign_up')
        }
        catch(e){
            console.error(e)
        }
        finally{
            setLoading(false)
        }
    }

    const signInWithGoogle = async () => {
        try {
            setLoading(true)
            await GoogleSignin.hasPlayServices()
            const result = await GoogleSignin.signIn()

            if (result.type === 'success') {
                const googleUser = {
                    userID: result.data.user.id,
                    name: result.data.user.name || '',
                    email: result.data.user.email,
                    photo: result.data.user.photo || '',
                    provider: 'google' as const,
                }
                setUser(googleUser); // save user globally
            }
            else{
                setLoading(false)
            }
            
            if (result && result.data?.user) {
                const { id, name, email } = result.data.user;
                const userData = {
                    userID: id,
                    name,
                    email,
                    password: '', // not needed for Google
                    formType: 'user_data',
                    provider: 'google',
                }
                
                try{
                    const response = await fetch('https://appinput.azurewebsites.net/api/SaveUserData?', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(userData)
                    })
                    
                    const save = await response.json()
                    console.log('Saved', save)
                    router.push('/(tabs)/home/pet_profile')
                    
                    Toast.show({
                        type: 'success',
                        text1: 'Signed in successfully',
                    })
                    console.log('Google sign in successful.')
                    console.log(result)
                }
                catch(e){
                    console.error('Google sign in data failed to save to database: ', e)
                }
            }
        } 
        catch (e) {
            console.error('Google sign in failed: ' ,e);
        }
        finally{
            setLoading(false)
        }
    }

    if(loading){
        return <CustomLoader/>
    }

    return(
        <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
            <View style={styles.icon_and_text}>
                <Image source={require('../../../assets/images/icon.png')} style={styles.icon}/>
                <Text style={styles.title_text}>Pet Palate Pro</Text>
            </View>
            <View style={styles.sign_in_info}>
                <View style={styles.sign_in_row}>
                    <Text style={styles.text}>Username: </Text>
                    <TextInput
                        style={styles.sign_in_input}
                        placeholder="Bla Bla Bla"
                        placeholderTextColor={'grey'}
                        value={username}
                        onChangeText={(text) => setUsername(text)}
                        />
                </View>
                <View style={styles.sign_in_row}>
                    <Text style={styles.text}>Password: </Text>
                    <TextInput
                        style={styles.sign_in_input}
                        placeholder="Enter your password"
                        placeholderTextColor={'grey'}
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        secureTextEntry
                        />
                </View>
                <Pressable onPress={login} style={styles.login_button}>
                    <Text style={styles.login_signup_text}>Log in</Text>
                </Pressable>
            </View>
            <Pressable onPress={signUp} style={styles.sign_up_button}>
                <Text style={styles.login_signup_text}>Sign Up</Text>
            </Pressable>
            <View>
                <Text style={styles.option_text}>--------------------or--------------------</Text>
            </View>
                <Pressable style={styles.google_sign_up_button} onPress={ () => signInWithGoogle() }>
                    <View style={styles.google_sign_up}>
                        <Image source={require('../../../assets/images/google.png')} style={styles.google_icon}/>
                        <Text style={styles.google_sign_up_text}>Login with Google</Text>
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
        justifyContent: 'center',
    },

    icon: {

        width: 180,
        height: 180,
    },

    icon_and_text: {
        
        justifyContent:'center',
        alignItems:'center',
        margin: 30,
        marginTop: 50,
        gap: 10,
    },

    title_text: {

        fontSize: 24,
        fontWeight: 'bold',
        width: '100%',
    },

    text: {

        fontSize: 18
    },

    sign_in_info: {

        backgroundColor: '#D9D9D9',
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        padding: 10,
        paddingTop: 20,
        paddingBottom: 20,
        gap:20,
    },

    sign_in_input: {

        borderRadius: 25,
        backgroundColor: 'white',
        flex: 1,
        fontSize: 18,
    },

    sign_in_row: {

        flexDirection: 'row',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: 'white',
        borderRadius: 25,
        paddingInline: 20,
    },
    
    login_signup_text: {
        
        alignSelf:'center', 
        color:'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    
    login_button: {

        backgroundColor: '#AA4600',
        padding: 5,
        borderRadius: 25,
        width: '50%',
    },

    sign_up_button: {

        backgroundColor: '#AA4600',
        padding: 5,
        margin: 30,
        marginBottom: 20,
        borderRadius: 25,
        width: '90%',
    },

    google_sign_up_button: {
        
        backgroundColor: 'white',
        padding: 10,
        marginTop: 20,
        width: '90%',
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 25,
    },
    
    google_sign_up: {

        flexDirection:'row',
        justifyContent: 'center',
        alignItems:'center',
        paddingHorizontal: 10,
    },

    google_icon: {

        width: 25,
        height: 25,
        position: 'absolute',
        left: 10,
    },

    google_sign_up_text: {
        
        fontSize: 16,
        fontWeight: '500',
    },

    option_text: {

        fontSize: 16,
        color: 'grey',
    },
})

export default SignIn