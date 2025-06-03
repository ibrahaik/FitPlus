// AdminContent.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../screens/api';

const AdminContent = ({ userData, navigation, refreshing, onRefresh }) => {
  const [userCount, setUserCount] = useState(0);
  const [retoCount, setRetoCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token no disponible');

      const [usuariosRes, retosRes] = await Promise.all([
        api.get('/usuarios', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/retos',    { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setUserCount(Array.isArray(usuariosRes.data) ? usuariosRes.data.length : 0);
      setRetoCount(Array.isArray(retosRes.data)       ? retosRes.data.length    : 0);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            onRefresh();
            fetchStats();
          }}
          colors={['#FFD700']}
        />
      }
    >
      <Text style={styles.adminTitle}>Gestión de la Aplicación</Text>
      <Text style={styles.adminSubtitle}>Bienvenido, {userData.nombre}</Text>

      <View style={styles.adminButtonsContainer}>
        {/* Botones de navegación */}
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('CrearReto')}
        >
          <LinearGradient
            colors={['#333333', '#222222']}
            style={styles.adminButtonGradient}
          >
            <Ionicons name="trophy-outline" size={32} color="#FFD700" />
            <Text style={styles.adminButtonText}>Crear Nuevo Reto</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('ActualizarReto')}
        >
          <LinearGradient
            colors={['#333333', '#222222']}
            style={styles.adminButtonGradient}
          >
            <Ionicons name="refresh-outline" size={32} color="#FFD700" />
            <Text style={styles.adminButtonText}>Actualizar Reto</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('CheckVideo')}
        >
          <LinearGradient
            colors={['#333333', '#222222']}
            style={styles.adminButtonGradient}
          >
            <Ionicons name="videocam-outline" size={32} color="#FFD700" />
            <Text style={styles.adminButtonText}>Gestionar Vídeos</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('CreatePost', { user_id: userData.id })}
        >
          <LinearGradient
            colors={['#333333', '#222222']}
            style={styles.adminButtonGradient}
          >
            <Ionicons name="create-outline" size={32} color="#FFD700" />
            <Text style={styles.adminButtonText}>Crear Post</Text>
          </LinearGradient>

          
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('GestionarPosts', { user_id: userData.id })}
        >
          <LinearGradient
            colors={['#333333', '#222222']}
            style={styles.adminButtonGradient}
          >
            <Ionicons name="create-outline" size={32} color="#FFD700" />
            <Text style={styles.adminButtonText}>Gestionar Post</Text>
          </LinearGradient>

          
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('CreateProduct', { user_id: userData.id })}
        >
          <LinearGradient
            colors={['#333333', '#222222']}
            style={styles.adminButtonGradient}
          >
            <Ionicons name="create-outline" size={32} color="#FFD700" />
            <Text style={styles.adminButtonText}>Crear Producto</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('GestionarProductos', { user_id: userData.id })}
        >
          <LinearGradient
            colors={['#333333', '#222222']}
            style={styles.adminButtonGradient}
          >
            <Ionicons name="create-outline" size={32} color="#FFD700" />
            <Text style={styles.adminButtonText}>Gestionar Producto</Text>
          </LinearGradient>
        </TouchableOpacity>
       </View>

      
        
      <View style={styles.adminStatsContainer}>
        <Text style={styles.adminStatsTitle}>Estadísticas</Text>
        <View style={styles.adminStatsRow}>
          <View style={styles.adminStatCard}>
            <Ionicons name="people-outline" size={24} color="#FFD700" />
            {loadingStats ? (
              <Text style={styles.adminStatValue}>…</Text>
            ) : (
              <Text style={styles.adminStatValue}>{userCount}</Text>
            )}
            <Text style={styles.adminStatLabel}>Usuarios</Text>
          </View>
          <View style={styles.adminStatCard}>
            <Ionicons name="trophy-outline" size={24} color="#FFD700" />
            {loadingStats ? (
              <Text style={styles.adminStatValue}>…</Text>
            ) : (
              <Text style={styles.adminStatValue}>{retoCount}</Text>
            )}
            <Text style={styles.adminStatLabel}>Retos</Text>
          </View>
          <View style={styles.adminStatCard}>
            <Ionicons name="chatbubbles-outline" size={24} color="#FFD700" />
            <Text style={styles.adminStatValue}>--</Text>
            <Text style={styles.adminStatLabel}>Mensajes</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  adminTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  adminSubtitle: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 24,
  },
  adminButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  adminButton: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  adminButtonGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  adminStatsContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  adminStatsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  adminStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adminStatCard: {
    alignItems: 'center',
    width: '30%',
  },
  adminStatValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  adminStatLabel: {
    color: '#BBBBBB',
    fontSize: 12,
  },
});

export default AdminContent;
