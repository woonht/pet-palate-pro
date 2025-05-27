import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const CustomLoader = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <View style={styles.loaderContainer}>
      <LottieView
        source={require('../assets/animations/loading.json')}
        autoPlay
        loop
        style={styles.loadingAnimation}
      />
      <Text style={styles.loaderText}>{message}</Text>
    </View>
  );
};

export default CustomLoader;

const styles = StyleSheet.create({
  loaderContainer: {

    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#FFF7F7',
  },

  loaderText: {
    
    marginTop: 10,
    fontSize: 24,
    color: '#666',
  },

  loadingAnimation: {

    width: '100%',
    height: '60%'
  }
});
