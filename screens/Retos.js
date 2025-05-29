import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from './api';

const { width } = Dimensions.get('window');

const RetosComunidad = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [retos, setRetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activos'); 
  
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchRetosComunidad = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No hay token disponible');
          return;
        }

        const userResponse = await api.get('/usuarios/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usuario = userResponse.data;
        setUserData(usuario);

        const retosResponse = await api.get('/retos');
        const todosRetos = retosResponse.data;

        const retosFiltrados = todosRetos.filter(
          (reto) => reto.comunidad_id === usuario.comunidad_id
        );
        setRetos(retosFiltrados);
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'No se pudieron cargar los retos');
      } finally {
        setLoading(false);
      }
    };

    fetchRetosComunidad();
  }, []);

  const isRetoActivo = (reto) => {
    const today = new Date();
    const endDate = new Date(reto.fecha_fin);
    return endDate >= today;
  };

  const retosActivos = retos.filter(reto => isRetoActivo(reto));
  const retosVencidos = retos.filter(reto => !isRetoActivo(reto));

  const changeTab = (tab) => {
    Animated.spring(tabIndicatorPosition, {
      toValue: tab === 'activos' ? 0 : width / 2 - 32,
      useNativeDriver: true,
    }).start();
    setActiveTab(tab);
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };



  const getRetoColor = (puntos) => {
    if (puntos >= 100) return ['#FFD700', '#FFA000']; 
    if (puntos >= 50) return ['#C0C0C0', '#A0A0A0']; 
    return ['#CD7F32', '#A05A2C']; 
  };

  const getDaysInfo = (endDateStr) => {
    const today = new Date();
    const endDate = new Date(endDateStr);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return {
        text: `${diffDays} ${diffDays === 1 ? 'día' : 'días'} restantes`,
        isUrgent: diffDays <= 3,
        isPast: false
      };
    } else if (diffDays === 0) {
      return {
        text: "¡Último día!",
        isUrgent: true,
        isPast: false
      };
    } else {
      return {
        text: `Venció hace ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'día' : 'días'}`,
        isUrgent: false,
        isPast: true
      };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Cargando retos...</Text>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <Ionicons name="alert-circle-outline" size={60} color="#FFD700" />
        <Text style={styles.errorText}>No se pudo cargar la información del usuario.</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setLoading(true)}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Retos de Fitness</Text>
          <Text style={styles.headerSubtitle}>{userData.comunidad_nombre}</Text>
        </View>
        <View style={styles.logoPlaceholder}>
          {/* Aquí irá tu logo */}
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{retosActivos.length}</Text>
          <Text style={styles.statLabel}>Retos activos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{retosVencidos.length}</Text>
          <Text style={styles.statLabel}>Retos pasados</Text>
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => changeTab('activos')}
        >
          <Ionicons 
            name="flame" 
            size={18} 
            color={activeTab === 'activos' ? "#FFD700" : "#999"} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'activos' && styles.activeTabText
          ]}>
            Activos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => changeTab('vencidos')}
        >
          <Ionicons 
            name="time-outline" 
            size={18} 
            color={activeTab === 'vencidos' ? "#FFD700" : "#999"} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'vencidos' && styles.activeTabText
          ]}>
            Vencidos
          </Text>
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX: tabIndicatorPosition }]
            }
          ]} 
        />
      </View>
      
      <View style={styles.contentContainer}>
        {activeTab === 'activos' ? (
          retosActivos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={60} color="#666" />
              <Text style={styles.emptyText}>
                No hay retos activos disponibles para tu comunidad.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {retosActivos.map((reto, index) => {
                const daysInfo = getDaysInfo(reto.fecha_fin);
                
                return (
                  <TouchableOpacity 
                    key={reto.id} 
                    style={styles.cardWrapper}
                    onPress={() =>
                      navigation.navigate('VideosUpload', {
                        retoNombre: reto.nombre,
                        retoDescripcion: reto.descripcion,
                        usuarioNombre: userData.nombre,
                        comunidadId: userData.comunidad_id,
                        retoId: reto.id,
                        usuarioId: userData.id,
                      })
                    }
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#1E1E1E', '#252525']}
                      style={styles.card}
                    >
                      <View style={styles.cardHeader}>
                      

                        <View style={styles.cardTitleContainer}>
                          <Text style={styles.cardTitle}>{reto.nombre}</Text>
                          <View style={styles.pointsContainer}>
                            <LinearGradient
                              colors={getRetoColor(reto.puntos)}
                              style={styles.pointsBadge}
                            >
                              <Text style={styles.pointsText}>{reto.puntos} pts</Text>
                            </LinearGradient>
                          </View>
                        </View>
                      </View>
                      
                      <Text style={styles.cardDescription}>{reto.descripcion}</Text>
                      
                      <View style={styles.cardDateContainer}>
                        <View style={styles.dateItem}>
                          <Ionicons name="calendar-outline" size={16} color="#BBB" />
                          <Text style={styles.dateLabel}>Inicio:</Text>
                          <Text style={styles.dateText}>{formatDate(reto.fecha_inicio)}</Text>
                        </View>
                        
                        <View style={styles.dateItem}>
                          <Ionicons name="calendar" size={16} color="#BBB" />
                          <Text style={styles.dateLabel}>Fin:</Text>
                          <Text style={styles.dateText}>{formatDate(reto.fecha_fin)}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.timeRemainingContainer}>
                        <Ionicons 
                          name="time-outline" 
                          size={16} 
                          color={daysInfo.isUrgent ? "#FF4757" : "#FFD700"} 
                        />
                        <Text 
                          style={[
                            styles.timeRemainingText, 
                            daysInfo.isUrgent && styles.urgentTimeText
                          ]}
                        >
                          {daysInfo.text}
                        </Text>
                      </View>
                      
                      <View style={styles.cardFooter}>
                        <Text style={styles.completarText}>Completar reto</Text>
                        <Ionicons name="chevron-forward" size={20} color="#FFD700" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
              <View style={styles.bottomSpace} />
            </ScrollView>
          )
        ) : (
          retosVencidos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={60} color="#666" />
              <Text style={styles.emptyText}>
                No hay retos vencidos para mostrar.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {retosVencidos.map((reto, index) => {
                const daysInfo = getDaysInfo(reto.fecha_fin);
                
                return (
                  <View 
                    key={reto.id} 
                    style={styles.cardWrapper}
                  >
                    <LinearGradient
                      colors={['#1E1E1E', '#252525']}
                      style={[styles.card, styles.vencidoCard]}
                    >
                      <View style={styles.cardHeader}>
                      
                        <View style={styles.cardTitleContainer}>
                          <Text style={[styles.cardTitle, styles.vencidoTitle]}>{reto.nombre}</Text>
                          <View style={styles.pointsContainer}>
                            <View style={styles.vencidoPointsBadge}>
                              <Text style={styles.vencidoPointsText}>{reto.puntos} pts</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      
                      <Text style={[styles.cardDescription, styles.vencidoDescription]}>
                        {reto.descripcion}
                      </Text>
                      
                      <View style={styles.cardDateContainer}>
                        <View style={styles.dateItem}>
                          <Ionicons name="calendar-outline" size={16} color="#777" />
                          <Text style={[styles.dateLabel, styles.vencidoDateLabel]}>Inicio:</Text>
                          <Text style={[styles.dateText, styles.vencidoDateText]}>
                            {formatDate(reto.fecha_inicio)}
                          </Text>
                        </View>
                        
                        <View style={styles.dateItem}>
                          <Ionicons name="calendar" size={16} color="#777" />
                          <Text style={[styles.dateLabel, styles.vencidoDateLabel]}>Fin:</Text>
                          <Text style={[styles.dateText, styles.vencidoDateText]}>
                            {formatDate(reto.fecha_fin)}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.timeRemainingContainer}>
                        <Ionicons name="time-outline" size={16} color="#777" />
                        <Text style={styles.vencidoTimeText}>{daysInfo.text}</Text>
                      </View>
                      
                      <View style={styles.vencidoBadge}>
                        <Ionicons name="close-circle" size={16} color="#999" />
                        <Text style={styles.vencidoBadgeText}>Reto finalizado</Text>
                      </View>
                    </LinearGradient>
                  </View>
                );
              })}
              <View style={styles.bottomSpace} />
            </ScrollView>
          )
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#BBBBBB',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    color: '#BBBBBB',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#121212',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#FFD700',
    fontSize: 12,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#BBBBBB',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 4,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    zIndex: 1,
  },
  tabText: {
    color: '#999',
    marginLeft: 6,
    fontSize: 14,
  },
  activeTabText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    width: (width - 32) / 2,
    height: '100%',
    backgroundColor: '#252525',
    borderRadius: 6,
    zIndex: 0,
  },
  contentContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#BBBBBB',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  cardWrapper: {
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  vencidoCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vencidoIconContainer: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  vencidoTitle: {
    color: '#BBBBBB',
  },
  pointsContainer: {
    flexDirection: 'row',
  },
  pointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 12,
  },
  vencidoPointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#555',
  },
  vencidoPointsText: {
    color: '#DDD',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardDescription: {
    color: '#DDDDDD',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  vencidoDescription: {
    color: '#999',
  },
  cardDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    color: '#BBB',
    fontSize: 12,
    marginLeft: 4,
    marginRight: 4,
  },
  vencidoDateLabel: {
    color: '#777',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  vencidoDateText: {
    color: '#999',
  },
  timeRemainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeRemainingText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  urgentTimeText: {
    color: '#FF4757',
  },
  vencidoTimeText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  completarText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  vencidoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  vencidoBadgeText: {
    color: '#999',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 20,
  },
});

export default RetosComunidad;