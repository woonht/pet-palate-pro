import React, { useCallback, useEffect, useState } from "react"
import { Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/app/auth_context"
import { useFocusEffect } from "expo-router"
import CustomLoader from "@/components/Custom_Loader"
import { useTextSize } from "@/app/text_size_context"

const Logs = () => {

  const [log, setLog] = useState<LogType>({ 
    photo:[],
    time: [],
  })
  const [pictureVisible, setPictureVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const {textSize, setTextSize} = useTextSize()
  const text = dynamicStyles(textSize)

  type LogType = {
    photo: string[],
    time: string[]
  }

  const getDeviceidFromDatabase = async () => {
    const formType = 'user_data'
    const response = await fetch(`https://appinput.azurewebsites.net/api/GetUserData?name=${user?.name}&formType=${formType}`, {
      method: "GET",
      headers: {'Content-Type': 'application/json'}
    })
    
    const text = await response.text()
    const result = JSON.parse(text)
    const deviceID = result.user.device_id
    return deviceID
  } 

  useFocusEffect( 
    useCallback(() => {
    const getLogsFromDatabase = async () => {
      if (!user || !user.userID) {
        console.warn('User not available yet.');
        return;
      }
      else{
        console.log(user)
      }
    
      try{
        const deviceID = await getDeviceidFromDatabase()
        const response = await fetch(`https://yolo-detection-function.azurewebsites.net/api/get_logs?deviceID=${deviceID}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      })
      
        const text = await response.text()
        const result = JSON.parse(text)
        console.log(result) // result = [{ blob_url: 'photo1.jpg' }, { blob_url: 'photo2.jpg' },]
        
        if (result && Array.isArray(result)){
          const allTime = result.map(x => x.timestamp)
          const allPhotos = result.map(x => x.blob_url) // allPhotos = ['photo1.jpg', 'photo2.jpg']
          setLog({
            photo: allPhotos,
            time: allTime
          })
          setLoading(false)
        }
      }
      catch(e){
        console.error('Logs loading error: ', e)
      }
    }
    getLogsFromDatabase()
  },[user]))

  const formatTimestamp = (time:string) => {
    const date = new Date(time)
    const formattedDate = date.toLocaleDateString()
    const formattedTime = date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    return `${formattedDate} ${formattedTime}`
  }

  return(
    <SafeAreaView edges={['top', 'bottom']} style={styles.whole_page}>
        {loading ? (
          <CustomLoader message="Loading Logs..."/>
            ) :  (
          <ScrollView>
            <View style={styles.container}>
            {log.photo.map((photoUrl, index) => (
              <View style={styles.photo_container} key={index}>
                <View>
                  <Text style={[text.settings_title, {fontWeight: 'bold'}]}>Log {index+1}</Text>
                  <Text style={text.settings_text}>{formatTimestamp(log.time[index])}</Text>
                </View>
                <View style={styles.vertical_line}>
                  <Pressable onPress={() => {
                    setPictureVisible(true)
                    setSelectedImage(photoUrl)
                  }}>
                    <Image
                      source={{ uri: photoUrl }}
                      style={styles.image}
                      resizeMode="cover"
                      />
                  </Pressable>
                </View>
              </View>
            ))}
            </View>
          </ScrollView>
        )}

      <Modal
          visible= {pictureVisible}
          transparent= {false}
          animationType="fade"
          onRequestClose={ () => setPictureVisible(false) }
      >
        <ImageBackground source={{uri:selectedImage || ''}} style={styles.backgroundImage} blurRadius={10}>
            <View style={styles.modalBackground}>
                {selectedImage && ( // only evaluate and render what's after && if image is truthy
                    <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
                )}
                <Pressable onPress={() => setPictureVisible(false)} style={styles.exitImage}>
                    <Text>X</Text>
                </Pressable>
            </View>
        </ImageBackground>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  
  whole_page: {

    flex: 1,
    backgroundColor: '#FFF7ED',
    paddingTop: 20,
  },

  container: {

    width: '100%',
    borderRadius: 25,
    paddingInline: 20,
    padding: 15,
  },
  
  photo_container: {
    
    backgroundColor: 'white',
    borderRadius: 25,
    paddingInline: 20,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent:'space-between',
  },

  image: {
   
    width: 90,
    height: 90,
    borderRadius: 15,
  },

  vertical_line: {

    borderLeftWidth: 1,
    paddingLeft: 15,
    borderColor: 'grey',
  },

  fullImage: {
    
    width: '100%',
    height: '100%',
  },

  backgroundImage: {

    flex: 1,
  },
  
  modalBackground: {

    justifyContent: 'flex-end',
    alignItems:'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  exitImage: {

    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 50,
  },

  loaderContainer: {
    
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  loaderText: {
    
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
})

const dynamicStyles = (textSize:number) => ({
  settings_text: {

    fontSize: textSize,
  },

  settings_title: {

    fontSize: textSize*1.2
  },
})

export default Logs
