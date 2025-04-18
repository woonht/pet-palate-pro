import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserInput = () => {

    const [input, setInput] = useState({

        temperament:'',
        skills:'',
        like:'',
        dislike:'',
    })

    const handleChange = (key:string, value:string) => {
        setInput(prev => ({ ...prev, [key]: value }));
    };

  return(

    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
      <ScrollView>

        <View style={styles.container}>
            <Text>Temperament:</Text>
            <TextInput
                style={styles.input}
                placeholder="Friendly, Playful"
                value={input.temperament}
                onChangeText={(text) => handleChange('temperament', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Skills:</Text>
            <TextInput
                style={styles.input}
                placeholder="Hand Shake, Sit, Stand"
                value={input.skills}
                onChangeText={(text) => handleChange('skills', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Like:</Text>
            <TextInput
                style={styles.input}
                placeholder="Ball, Park Walking"
                value={input.like}
                onChangeText={(text) => handleChange('like', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Dislike:</Text>
            <TextInput
                style={styles.input}
                placeholder="Thunder, Firework"
                value={input.dislike}
                onChangeText={(text) => handleChange('dislike', text)}
                />
        </View>        
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  
  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
    padding: 10
  },

  container: {    

    gap: 10,
  },

  input: {

    height: 40,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
})

export default UserInput
