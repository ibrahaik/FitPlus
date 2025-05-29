import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#FFD700" />
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#121212' 
  },
});

export default LoadingScreen;