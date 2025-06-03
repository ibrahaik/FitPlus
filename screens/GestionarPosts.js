"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import axios from "./api"

const GestionarPosts = () => {
  const navigation = useNavigation()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedPost, setExpandedPost] = useState(null)

  useEffect(() => {
    obtenerPosts()
  }, [])

  const obtenerPosts = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/posts")
      setPosts(response.data)
    } catch (error) {
      console.error("Error al obtener posts:", error)
      Alert.alert("Error", "No se pudieron obtener los posts")
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await obtenerPosts()
    setRefreshing(false)
  }

  const eliminarPost = async (postId, postTitle) => {
    Alert.alert("Confirmar eliminación", `¿Estás seguro de que quieres eliminar el post "${postTitle}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`/posts/${postId}`)
            Alert.alert("Éxito", "Post eliminado correctamente")
            obtenerPosts() // Recargar la lista
          } catch (error) {
            console.error("Error al eliminar post:", error)
            Alert.alert("Error", "No se pudo eliminar el post")
          }
        },
      },
    ])
  }

  const formatDate = (dateString) => {
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const toggleExpanded = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Cargando posts...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Gestionar Posts</Text>
          <Text style={styles.headerSubtitle}>{posts.length} posts totales</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{posts.filter((p) => p.media_type === "image").length}</Text>
          <Text style={styles.statLabel}>Imágenes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{posts.filter((p) => p.media_type === "video").length}</Text>
          <Text style={styles.statLabel}>Videos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{posts.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={60} color="#666" />
          <Text style={styles.emptyText}>No hay posts disponibles</Text>
          <Text style={styles.emptySubtext}>Los posts creados aparecerán aquí</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FFD700"]} tintColor="#FFD700" />
          }
        >
          {posts.map((post, index) => {
            const isExpanded = expandedPost === post.id

            return (
              <View key={post.id} style={styles.postCard}>
                <LinearGradient colors={["#1E1E1E", "#252525"]} style={styles.postGradient}>
                  <View style={styles.postHeader}>
                    <View style={styles.postHeaderLeft}>
                      <View style={styles.adminBadge}>
                        <Ionicons name="person" size={16} color="#FFD700" />
                        <Text style={styles.adminText}>Admin ID: {post.user_id}</Text>
                      </View>
                      <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
                    </View>

                    <View style={styles.postHeaderRight}>
                      <View
                        style={[
                          styles.mediaTypeBadge,
                          post.media_type === "image" ? styles.imageBadge : styles.videoBadge,
                        ]}
                      >
                        <Ionicons name={post.media_type === "image" ? "image" : "videocam"} size={14} color="#FFFFFF" />
                        <Text style={styles.mediaTypeText}>{post.media_type === "image" ? "Imagen" : "Video"}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.postTitle}>{post.title}</Text>

                  <TouchableOpacity onPress={() => toggleExpanded(post.id)} style={styles.expandButton}>
                    <Text style={[styles.postDescription, !isExpanded && styles.postDescriptionTruncated]}>
                      {post.description}
                    </Text>
                    <View style={styles.expandIndicator}>
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#FFD700" />
                      <Text style={styles.expandText}>{isExpanded ? "Ver menos" : "Ver más"}</Text>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.mediaContainer}>
                        <Text style={styles.mediaLabel}>Vista previa del contenido:</Text>
                        {post.media_type === "image" ? (
                          <Image source={{ uri: post.media_url }} style={styles.mediaPreview} />
                        ) : (
                          <View style={styles.videoPreview}>
                            <Ionicons name="play-circle" size={40} color="#FFD700" />
                            <Text style={styles.videoPreviewText}>Video</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.urlContainer}>
                        <Text style={styles.urlLabel}>URL del archivo:</Text>
                        <Text style={styles.urlText} numberOfLines={2}>
                          {post.media_url}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.postActions}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => {
                        // Aquí podrías navegar a una pantalla de detalle del post
                        Alert.alert("Info", `Post ID: ${post.id}\nTítulo: ${post.title}`)
                      }}
                    >
                      <Ionicons name="eye-outline" size={18} color="#4CD964" />
                      <Text style={styles.viewButtonText}>Ver detalles</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarPost(post.id, post.title)}>
                      <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                      <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            )
          })}
          <View style={styles.bottomSpace} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#BBBBBB",
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#FFD700",
    fontSize: 12,
  },
  refreshButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: "#FFD700",
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#BBBBBB",
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#333",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#BBBBBB",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  postCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  postGradient: {
    padding: 16,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  postHeaderLeft: {
    flex: 1,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  adminText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  postDate: {
    color: "#BBBBBB",
    fontSize: 12,
  },
  postHeaderRight: {
    alignItems: "flex-end",
  },
  mediaTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageBadge: {
    backgroundColor: "#4CD964",
  },
  videoBadge: {
    backgroundColor: "#FF9500",
  },
  mediaTypeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  postTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  expandButton: {
    marginBottom: 12,
  },
  postDescription: {
    color: "#DDDDDD",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  postDescriptionTruncated: {
    numberOfLines: 2,
  },
  expandIndicator: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  expandText: {
    color: "#FFD700",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "bold",
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  mediaContainer: {
    marginBottom: 16,
  },
  mediaLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  mediaPreview: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
  },
  videoPreview: {
    width: "100%",
    height: 150,
    backgroundColor: "#252525",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPreviewText: {
    color: "#FFFFFF",
    marginTop: 8,
    fontWeight: "bold",
  },
  urlContainer: {
    backgroundColor: "#252525",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  urlLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  urlText: {
    color: "#BBBBBB",
    fontSize: 11,
    fontFamily: "monospace",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 217, 100, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  viewButtonText: {
    color: "#4CD964",
    fontWeight: "bold",
    marginLeft: 6,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontWeight: "bold",
    marginLeft: 6,
  },
  bottomSpace: {
    height: 20,
  },
})

export default GestionarPosts
