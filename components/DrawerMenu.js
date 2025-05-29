import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DrawerMenu = ({ userData, points, onProfilePress, onLogoutPress }) => {
  return (
    <View style={styles.drawerContainer}>
      <LinearGradient
        colors={['#121212', '#1E1E1E']}
        style={styles.drawerHeader}
      >
        <View style={styles.drawerUserInfo}>
          <View style={styles.drawerAvatar}>
            <Ionicons name="person" size={40} color="#121212" />
          </View>
          <View>
            <Text style={styles.drawerUserName}>{userData?.nombre || 'Usuario'}</Text>
            <Text style={styles.drawerUserRole}>
              {userData?.rol === 'admin' ? 'Administrador' : 'Usuario'}
            </Text>
          </View>
        </View>
        
        <View style={styles.drawerPointsContainer}>
          <Text style={styles.drawerPointsLabel}>Puntos:</Text>
          <Text style={styles.drawerPointsValue}>🪙 {points}</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.drawerMenu}>
        <TouchableOpacity 
          style={styles.drawerMenuItem}
          onPress={onProfilePress}
        >
          <Ionicons name="person" size={24} color="#FFD700" />
          <Text style={styles.drawerMenuItemText}>Mi Perfil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.drawerMenuItem}
          onPress={onLogoutPress}
        >
          <Ionicons name="log-out" size={24} color="#FF3B30" />
          <Text style={[styles.drawerMenuItemText, { color: '#FF3B30' }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  drawerHeader: {
    padding: 16,
    paddingTop: 48,
    paddingBottom: 24,
  },
  drawerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  drawerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  drawerUserName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  drawerUserRole: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  drawerPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  drawerPointsLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 8,
  },
  drawerPointsValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  drawerMenu: {
    flex: 1,
    padding: 16,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  drawerMenuItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 16,
  },
});

export default DrawerMenu;