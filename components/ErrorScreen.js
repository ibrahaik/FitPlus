import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ErrorScreen = ({ onRetry }) => (
  <View style={styles.errorContainer}>
    <Ionicons name="alert-circle-outline" size={60} color="#FFD700" />
    <Text style={styles.errorText}>No se pudo cargar la información del usuario.</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Reintentar</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#121212', 
    padding: 20 
  },
  errorText: { 
    color: '#BBBBBB', 
    fontSize: 16, 
    textAlign: 'center', 
    marginVertical: 20 
  },
  retryButton: { 
    backgroundColor: '#FFD700', 
    padding: 12, 
    borderRadius: 8 
  },
  retryButtonText: { 
    color: '#121212', 
    fontWeight: 'bold' 
  },
});

export default ErrorScreen;