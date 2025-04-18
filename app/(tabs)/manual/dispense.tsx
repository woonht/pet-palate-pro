import { AntDesign } from "@expo/vector-icons";
import { PlatformPressable } from "@react-navigation/elements";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsPage = () => {

  return(
    <SafeAreaView edges={['top', 'bottom']} style={[styles.button, styles.whole_page]}>
      <PlatformPressable 
      onPress={() => Alert.alert('Food Dispense')}
      android_ripple={{ color:null }}>
        <AntDesign name="pluscircle" size={150} color="#AA4600"/>
      </PlatformPressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  
  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
},

  button: {
    
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
export default SettingsPage
