import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeHeader = ({ userData, points, loadingPoints, onMenuPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={onMenuPress}
      >
        <Ionicons name="menu" size={24} color="#FFD700" />
      </TouchableOpacity>
      
      <View>
        <Text style={styles.headerTitle}>BANANA FIT</Text>
        <Text style={styles.headerSubtitle}>
          {userData.rol === 'admin' ? 'Panel de Administración' : userData.comunidad_nombre}
        </Text>
      </View>
      
      <View style={styles.pointsBadge}>
        {loadingPoints ? (
          <ActivityIndicator size="small" color="#121212" />
        ) : (
          <Text style={styles.pointsText}>🪙 {points}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#333' 
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: { 
    color: '#FFD700', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  headerSubtitle: { 
    color: '#BBBBBB', 
    fontSize: 12 
  },
  pointsBadge: { 
    backgroundColor: '#FFD700', 
    borderRadius: 12, 
    paddingHorizontal: 8, 
    paddingVertical: 4 
  },
  pointsText: { 
    color: '#121212', 
    fontWeight: 'bold' 
  },
});

export default HomeHeader;