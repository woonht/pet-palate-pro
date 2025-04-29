import { router } from "expo-router"
import React, { useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const SignUp = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const signUp = () => {

        router.replace('/(tabs)/auth/sign_in')
    }

    const toLogin = () => {

        router.replace('/(tabs)/auth/sign_in')
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
                        placeholder="Email"
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        />
                </View>
                <View>
                    <TextInput
                        style={styles.sign_up_input}
                        placeholder="Password"
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        secureTextEntry
                        />
                </View>
                <View>
                    <TextInput
                        style={styles.sign_up_input}
                        placeholder="Confirm Password"
                        value={password}
                        onChangeText={(text) => setPassword(text)}
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
})

export default SignUp