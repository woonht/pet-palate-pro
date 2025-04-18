import { FontAwesome6 } from "@expo/vector-icons";
import { PlatformPressable } from "@react-navigation/elements";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Details = () => {

  return(
    <SafeAreaView style={styles.whole_page}>
      <View style={styles.button1}> 
        <PlatformPressable>
          <FontAwesome6 name="bowl-food" size={150} color="#AA4600" />
        </PlatformPressable>
      </View>
      <View style={styles.button2}>
        <PlatformPressable>
          <FontAwesome6 name="glass-water" size={150} color="#27ceff" />
        </PlatformPressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
},
  
  button1: {

    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  button2: {

    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  }
})

export default Details
