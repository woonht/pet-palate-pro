import { router } from "expo-router"
import React, { useState } from "react"
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import 'expo-dev-client'

const SignIn = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    
    const login = () => {
        
        if(!email || !password){
            Alert.alert('Please enter a valid email or password.')
        }
        else{
            router.push('/(tabs)/home/pet_profile')
        }
    }

    const signUp = () => {

        router.push('/(tabs)/auth/sign_up')
    }

    return(
        <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
            <View style={styles.icon_and_text}>
                <Image source={require('../../../assets/images/icon.png')} style={styles.icon}/>
                <Text style={styles.title_text}>Pet Palate Pro</Text>
            </View>
            <View style={styles.sign_in_info}>
                <View style={styles.sign_in_row}>
                    <Text style={styles.text}>Email: </Text>
                    <TextInput
                        style={styles.sign_in_input}
                        placeholder="123@gmail.com"
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        />
                </View>
                <View style={styles.sign_in_row}>
                    <Text style={styles.text}>Password: </Text>
                    <TextInput
                        style={styles.sign_in_input}
                        placeholder="Enter your password"
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
                <Pressable style={styles.google_sign_up_button}>
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