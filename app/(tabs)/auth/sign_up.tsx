import { router, useFocusEffect } from "expo-router"
import React, { useCallback, useState } from "react"
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { useAuth } from "@/components/auth_context"
import CustomLoader from "@/components/Custom_Loader"

const SignUp = () => {

    const [name, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const { setUser } = useAuth()
    const [loading, setLoading] = useState(false)

    useFocusEffect(
        useCallback( () => {
            emptySignInFill()
        },[]))

    const signUp = async () => {

        if (name == '' || email == '' || password == '' || confirm == ''){
            Alert.alert('Error', 'Please fill up the required fill.')
            return
        }
        if (password !== confirm){
            Alert.alert('Error' ,'Password do not match.')
        }    
        
        setLoading(true)
        const uniqueID = `${Date.now()}_${Math.floor(Math.random() * 100000)}`
        const userData = {
            userID: uniqueID,
            name,
            email,
            password,
            formType: 'user_data',
            provider: 'local'
        }

        try{
            const response = await fetch('https://appinput.azurewebsites.net/api/SaveUserData?', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userData)
            })

            if (response.status === 409) {
                // Conflict - username/email exists
                const errorData = await response.json()
                Alert.alert('Error', errorData.error)
                emptySignInFill()
                return
            }

            if (!response.ok) {
                // Handle other errors
                const errorData = await response.json()
                Alert.alert('Error', errorData.error)
                emptySignInFill()
                return
            }

            setUser({
                userID: uniqueID,
                name,
                email,
                photo: '',
                provider: 'local'
            })
        
            Toast.show({
                type: 'success',
                text1: 'Signed up successfully',
            })

            const result = await response.json()
            console.log('Saved: ', result)
            console.log('User data saved successfully to database')
            router.replace('/(tabs)/auth/sign_in')
        }
        catch(e){
            console.error('Saving error: ', e)
        }
        finally{
            setLoading(false)
        }
    }
    

    const toLogin = () => {

        router.replace('/(tabs)/auth/sign_in')
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
                finally{
                    setLoading(false)
                }
            }
        } 
        catch (e) {
            console.error('Google sign in failed: ' ,e)
            setLoading(false)
        }
    }

    const emptySignInFill = () => {
        setUsername('')
        setEmail('')
        setPassword('')
        setConfirm('')
    }    

    if(loading){
        console.log(loading)
        return <CustomLoader/>
    }

    return(
        <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
            <View>
                <Text style={styles.get_started_text}>Get Started</Text>
            </View>
            <View style={styles.sign_up_info}>
                <View>
                    <TextInput
                        style={styles.sign_up_input}
                        placeholder="Username"
                        placeholderTextColor={'grey'}
                        value={name}
                        onChangeText={(text) => setUsername(text)}
                        />
                </View>
                <View>
                    <TextInput
                        style={styles.sign_up_input}
                        placeholder="Email"
                        placeholderTextColor={'grey'}
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        />
                </View>
                <View>
                    <TextInput
                        style={styles.sign_up_input}
                        placeholder="Password"
                        placeholderTextColor={'grey'}
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        secureTextEntry
                        />
                </View>
                <View>
                    <TextInput
                        style={styles.sign_up_input}
                        placeholder="Confirm Password"
                        placeholderTextColor={'grey'}
                        value={confirm}
                        onChangeText={(text) => setConfirm(text)}
                        secureTextEntry
                        />
                </View>
                <Pressable onPress={signUp} style={styles.sign_up_button}>
                    <Text style={styles.sign_up_text}>Sign up</Text>
                </Pressable>
            </View>
            <View style={styles.to_login}>
                <Text>Already have an account? </Text>
                <Pressable onPress={toLogin}>
                    <Text style={styles.to_login_text}>Log in</Text>
                </Pressable>
            </View>
            <View>
                <Text style={styles.option_text}>--------------------or--------------------</Text>
            </View>
                <Pressable onPress={ () => signInWithGoogle() } style={styles.google_sign_up_button}>
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
        justifyContent:'center',
        alignItems: 'center',
    },

    get_started_text: {

        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40
    },

    sign_up_info: {

        backgroundColor: '#D9D9D9',
        width: '90%',
        borderRadius: 25,
        padding: 10,
        paddingTop: 20,
        paddingBottom: 20,
        gap:20,
    },

    sign_up_input: {

        borderRadius: 25,
        fontSize: 18,
        backgroundColor: 'white',
        paddingHorizontal: 15,
    },

    sign_up_text: {
        
        alignSelf:'center', 
        color:'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    
    sign_up_button: {

        backgroundColor: '#AA4600',
        padding: 5,
        borderRadius: 25,
        width: '50%',
        alignSelf:'center'
    },

    to_login: {

        marginTop: 10,
        flexDirection: 'row',
    },

    to_login_text: {

        color: 'blue',
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
        marginTop: 20,
    },
})

export default SignUp