import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BasicInfo = () => {

  return(
    <SafeAreaView edges={['top', 'bottom']} style={[styles.whole_page]}>
      <View style={styles.basic_habit}>
        <View style={styles.editIconRight}>
          <Text>Basic Information</Text>
          <Pressable onPress={()=> router.push('/(tabs)/home/basic_info_input')} style={styles.editIconRight}>
            <Text>Edit</Text>
            <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
          </Pressable>
        </View>
        <View style={styles.columnText}>
          <View style={styles.rowText}>
            <Text style={{flex:1}}>Name</Text>
            <Text style={{flex:1}}>Birthdate</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={{flex:1}}>Species</Text>
            <Text style={{flex:1}}>Breed</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={{flex:1}}>Sex</Text>
            <Text style={{flex:1}}>Weight</Text>
          </View>
        </View>
      </View>

      <View style={styles.basic_habit}>
        <View style={styles.editIconRight}>
          <Text>Personality and Habits</Text>
          <Pressable onPress={()=> router.push('/(tabs)/home/personality_habit_input')} style={styles.editIconRight}>
            <Text>Edit</Text>
            <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
          </Pressable>
        </View>
        <View style={styles.columnText}>
          <View>
            <Text>Temperament</Text>
          </View>
          <View style={styles.rowText}>
            <Text>Skills</Text>
          </View>
          <View style={styles.rowText}>
            <Text>Like</Text>
          </View>
          <View style={styles.rowText}>
            <Text>Dislike</Text>
          </View>
        </View>
      </View>

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

    basic_habit: {

      backgroundColor: 'white',
      width: '90%',
      borderRadius: 25,
      padding: 10,
      paddingInline: 20,
    },

    editIconRight: {

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:'space-between'
    },

    rowText:{

      flexDirection: 'row',
      width: '100%',
      justifyContent:'space-between',
    },

    columnText:{

      justifyContent: 'space-around',
      width: '100%',
    },
})

export default BasicInfo
