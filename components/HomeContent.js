import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground, FlatList, ActivityIndicator, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../screens/api';
import PostCard from '../screens/PostCard';

const HomeContent = ({ userData, navigation, refreshing, onRefresh }) => {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const { data } = await api.get('/posts');
      setPosts(data);
    } catch (err) {
      console.error('Error posts:', err);
      Alert.alert('Error', 'No se pudieron cargar los posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  return (
    <ScrollView 
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FFD700"]} />
      }
    >
      <Text style={styles.welcomeText}>¡Hola, <Text style={styles.userName}>{userData.nombre}</Text>!</Text>
      <View style={styles.featuredButtonsContainer}>
        <ImageBackground 
          source={{ uri: 'https://v0.blob.com/eVYC0.svg?height=300&width=600&text=Gym+Background' }} 
          style={styles.featuredBackground} 
          imageStyle={styles.featuredBackgroundImage}
        >
          <LinearGradient 
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']} 
            style={styles.featuredGradient}
          >
            <View style={styles.featuredButtonsRow}>
              <TouchableOpacity 
                style={styles.featuredButton} 
                onPress={() => navigation.navigate('Chat', {
                  communityId: userData.comunidad_id,
                  userName: userData.nombre,
                  communityName: userData.comunidad_nombre,
                  UserId: userData.id
                })}
              >
                <View style={styles.featuredButtonInner}>
                  <Ionicons name="chatbubbles" size={36} color="#FFD700" />
                  <Text style={styles.featuredButtonText}>CHAT</Text>
                  <Text style={styles.featuredButtonSubtext}>Conecta con tu comunidad</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.featuredButton} 
                onPress={() => navigation.navigate('Retos', {
                  communityId: userData.comunidad_id,
                  userName: userData.nombre,
                  communityName: userData.comunidad_nombre,
                })}
              >
                <View style={styles.featuredButtonInner}>
                  <Ionicons name="trophy" size={36} color="#FFD700" />
                  <Text style={styles.featuredButtonText}>RETOS</Text>
                  <Text style={styles.featuredButtonSubtext}>Supérate a ti mismo</Text>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
      
      <View style={styles.feedContainer}>
        <View style={styles.feedHeader}>
          <Ionicons name="newspaper-outline" size={24} color="#FFD700" />
          <Text style={styles.feedTitle}>Novedades</Text>
        </View>
        
        {loadingPosts ? (
          <View style={styles.feedLoading}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.feedLoadingText}>Cargando posts...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Ionicons name="alert-circle-outline" size={40} color="#666" />
            <Text style={styles.emptyFeedText}>No hay publicaciones disponibles</Text>
          </View>
        ) : (
          <FlatList 
            data={posts} 
            keyExtractor={item => item.id.toString()} 
            renderItem={({ item }) => <PostCard post={item} userId={userData.id} />} 
            contentContainerStyle={styles.feedList} 
            showsVerticalScrollIndicator={false} 
            scrollEnabled={false} 
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16
  },
  welcomeText: { 
    fontSize: 18, 
    color: '#FFFFFF', 
    marginBottom: 20 
  },
  userName: { 
    color: '#FFD700', 
    fontWeight: 'bold' 
  },
  featuredButtonsContainer: { 
    marginBottom: 24, 
    borderRadius: 16, 
    overflow: 'hidden', 
  },
  featuredBackground: { 
    height: 180 
  },
  featuredBackgroundImage: { 
    borderRadius: 16 
  },
  featuredGradient: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 16 
  },
  featuredButtonsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  featuredButton: { 
    width: '45%', 
    height: 130, 
    backgroundColor: 'rgba(30, 30, 30, 0.8)', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 215, 0, 0.5)' 
  },
  featuredButtonInner: { 
    alignItems: 'center' 
  },
  featuredButtonText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginTop: 12 
  },
  featuredButtonSubtext: { 
    color: '#BBBBBB', 
    fontSize: 10, 
    textAlign: 'center', 
    marginTop: 4 
  },
  feedContainer: { 
    flex: 1 
  },
  feedHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  feedTitle: { 
    color: '#FFFFFF', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginLeft: 8 
  },
  feedLoading: { 
    padding: 40, 
    alignItems: 'center' 
  },
  feedLoadingText: { 
    color: '#BBBBBB', 
    marginTop: 12 
  },
  emptyFeed: { 
    padding: 40, 
    alignItems: 'center', 
    backgroundColor: '#1E1E1E', 
    borderRadius: 12 
  },
  emptyFeedText: { 
    color: '#BBBBBB', 
    marginTop: 12 
  },
  feedList: { 
    paddingBottom: 20 
  },
});

export default HomeContent;