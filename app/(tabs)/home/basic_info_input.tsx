import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserInput = () => {

    const [input, setInput] = useState({

        name:'',
        birthdate:'',
        species:'',
        breed:'',
        sex:'',
        weight:'',
    })

    const handleChange = (key:string, value:string) => {
        setInput(prev => ({ ...prev, [key]: value }));
    };

  return(

    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
      <ScrollView>

        <View style={styles.container}>
            <Text>Name:</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={input.name}
                onChangeText={(text) => handleChange('name', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Birthdate:</Text>
            <TextInput
                style={styles.input}
                placeholder="1-1-2020"
                value={input.birthdate}
                onChangeText={(text) => handleChange('birthdate', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Species:</Text>
            <TextInput
                style={styles.input}
                placeholder="Golden Retriever"
                value={input.species}
                onChangeText={(text) => handleChange('species', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Breed:</Text>
            <TextInput
                style={styles.input}
                placeholder="Dog"
                value={input.breed}
                onChangeText={(text) => handleChange('breed', text)}
                />
        </View>        
        <View style={styles.container}>
            <Text>Sex:</Text>
            <TextInput
                style={styles.input}
                placeholder="Male"
                value={input.sex}
                onChangeText={(text) => handleChange('sex', text)}
                />
        </View>
        <View style={styles.container}>
            <Text>Weight:</Text>
            <TextInput
                style={styles.input}
                placeholder="25kg"
                value={input.weight}
                onChangeText={(text) => handleChange('weight', text)}
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
