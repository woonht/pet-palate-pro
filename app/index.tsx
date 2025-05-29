import CustomLoader from '@/components/Custom_Loader'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

export default function Index() {

  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const checkLogin = async () => {
      try{
        GoogleSignin.configure({
          webClientId: '637482238294-n5ds4ua9tsu6m2tlpo407v2cuk60dv8k.apps.googleusercontent.com',
          offlineAccess: true,
        })
        
        const asyncisLogin = await AsyncStorage.getItem('login')
        const checkGoogleSignIn = GoogleSignin.getCurrentUser()
          
        const isLogin = checkGoogleSignIn !== null && asyncisLogin === 'true'
        
        setLoggedIn(isLogin)
        setLoading(false)
      }
      catch(e){
        console.error('Error: ', e)
      }
    }
    checkLogin()
  },[])

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync()
    }
  }, [loading]) // run automatically when loading changes

  if(loading){
    return <CustomLoader/>
  }

  return <Redirect href={ loggedIn ? '/(tabs)/home/pet_profile' : '/auth/sign_in'} />;
}
