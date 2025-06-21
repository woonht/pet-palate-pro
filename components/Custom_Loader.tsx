import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

type CustomLoaderProps = {
  message?: string;
  color?: string;
  size?: 'small' | 'large';
  backgroundColor?: string;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
};

const CustomLoader: React.FC<CustomLoaderProps> = ({
  message = 'Loading...',
  color = 'orange',
  size = 'large',
  backgroundColor = '#FFF7F7',
  textStyle,
  containerStyle,
}) => {
  return (
    <View style={[styles.loaderContainer, { backgroundColor }, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
      <Text style={[styles.loaderText, textStyle]} accessibilityRole="text">
        {message}
      </Text>
    </View>
  );
};

export default CustomLoader;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
});
