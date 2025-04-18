import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { PlatformPressable } from "@react-navigation/elements";
import React, { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Prescription = () => {

  const [isVisible, setIsVisible] = useState(false)

  const [popUpInput, setInput] = useState({

    vaccine:'',
    description:'',
    vet:'',
    date:'',
  })

  const handleChange = (key:string, value:string) => {
    setInput(prev => ({...prev, [key]: value}))
  }

  type PrescriptionRecord = {
    
    id: string;
    vaccine: string;
    description: string;
    vet: string;
    date: string;
  };

  const [prescription, setPrescription] = useState<PrescriptionRecord[]>([])

  const handleSave = () => {

    if(!popUpInput.vaccine || !popUpInput.vet || !popUpInput.date){
      Alert.alert("Please fill in all required table.")
      return
    }
    
    const newPrescription = {
      id: Date.now().toString(),
      ...popUpInput,
    }
    
    setPrescription(prev => [...prev, newPrescription])

    setInput({ vaccine: '', vet: '', date: '', description: '' })
    setIsVisible(false)
  }

  const handleDelete = (id: string) => {
    setPrescription(prev => prev.filter(item => item.id !== id));
  };

  return(
    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
      <ScrollView contentContainerStyle={styles.scroll}>
      {prescription.map((item) => (
        <View key={item.id} style={styles.record}>
          <View style={styles.recordTitleIconLeft}>
            <MaterialCommunityIcons name="pill" size={40} color="black" />
            <Text style={styles.recordTitle}>{item.vaccine}</Text>
          </View>
          {item.description ? <Text style={{color:'rgba(0,0,0,0.7)'}}>{item.description}</Text> : null}
          <Text>{item.vet}</Text>
          <Text>Expires: {item.date}</Text>

          <Pressable onPress={() => handleDelete(item.id)} style={styles.remove}>
            <Text style={{color:'red', fontSize: 20}}>Remove</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>

      <PlatformPressable 
      onPress={() => setIsVisible(true)}
      android_ripple={{ color:null }}
      style={styles.button}
      >
        <AntDesign name="pluscircle" size={75} color="#AA4600"/>
      </PlatformPressable>

      <Modal 
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.popUp}> 
            <View style={styles.popUpTitle}>
              <Text style={styles.popUpTitleText}>Prescription</Text>
            </View>

            <View style={styles.popUpContainer}>
              <Text>Pills</Text>
              <TextInput
              style={styles.popUpInput}
              placeholder="vaccine"
              value={popUpInput.vaccine}
              onChangeText={(text) => handleChange('vaccine', text)}
              />
            </View>

            <View style={styles.popUpContainer}>
              <Text>Vet</Text>
              <TextInput
              style={styles.popUpInput}
              placeholder="Vet"
              value={popUpInput.vet}
              onChangeText={(text) => handleChange('vet', text)}
              />

            </View>
            <View style={styles.popUpContainer}>
              <Text>Expires</Text>
              <TextInput
              style={styles.popUpInput}
              placeholder="1-1-2020"
              value={popUpInput.date}
              onChangeText={(text) => handleChange('date', text)}
              />
            </View>

            <View style={styles.popUpContainer}>
              <Text>Description</Text>
              <TextInput
              style={styles.popUpInput}
              placeholder="Description"
              value={popUpInput.description}
              onChangeText={(text) => handleChange('description', text)}
              />

            </View>
            <View style={styles.popUp_done_cancel}>
              <Pressable onPress={ () => {setIsVisible(false)
                                          setInput({ vaccine: '', vet: '', date: '', description: '' })
                                          } 
                                  }>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={ () => handleSave()}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  
  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  
  scroll: {
    
    paddingTop: 10,
    alignItems: 'center',
    gap: 10,
  },

  button: {
    
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    padding: 10,
    position: 'absolute',
    bottom: 0,
  },

  modalBackground: {

    justifyContent:'center',
    alignItems:'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  
  popUpContainer: {

    gap:10,
  },

  popUp: {
  
    width: 350,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
  },

  popUpTitle:{

    justifyContent:'center',
    alignItems:'center',
    paddingBottom: 10,
  },

  popUpTitleText:{

    fontWeight: 'bold',
    fontSize: 20,
  },

  popUpInput: {

    height: 40,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  popUp_done_cancel: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  record: {

    backgroundColor: 'white',
    justifyContent: 'center',
    width: '90%',
    padding: 10,
    paddingHorizontal: 25,
    borderRadius: 15,
    gap: 10
  },

  recordTitleIconLeft: {

    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  recordTitle: {

    fontWeight: 'bold',
    fontSize: 32,
  },

  remove: {

    alignSelf: 'flex-end',
  },
})
export default Prescription
