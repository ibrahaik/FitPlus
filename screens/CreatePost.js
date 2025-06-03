"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as ImagePicker from "expo-image-picker"
import axios from "./api"

const CLOUDINARY_UPLOAD_PRESET = "fitplusvideos"
const CLOUDINARY_CLOUD_NAME = "ded9t7aan"

const CreatePostScreen = () => {
  const { user_id } = useRoute().params
  const navigation = useNavigation()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [mediaType, setMediaType] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)

  const pickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permisos denegados", "Necesitamos permiso para acceder a la galería")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    })

    if (result.cancelled) return

    const uri = result.assets[0].uri
    const type = result.assets[0].type
    const name = uri.split("/").pop()

    const formData = new FormData()
    formData.append("file", { uri, name, type: `${type}/${name.split(".").pop()}` })
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

    setUploading(true)
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type}/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (!data.secure_url) throw new Error("No se obtuvo URL de Cloudinary")

      setMediaUrl(data.secure_url)
      setMediaType(type)
      Alert.alert("Éxito", "Archivo subido correctamente")
    } catch (err) {
      console.error("Error subiendo a Cloudinary:", err)
      Alert.alert("Error", "No se pudo subir el archivo")
    } finally {
      setUploading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!title.trim() || !description.trim() || !mediaUrl || !mediaType) {
      Alert.alert("Error", "Por favor, complete todos los campos")
      return
    }

    const postData = {
      user_id,
      title: title.trim(),
      description: description.trim(),
      media_url: mediaUrl,
      media_type: mediaType,
    }

    setCreating(true)
    try {
      const res = await axios.post("/posts", postData)
      if (res.status === 201) {
        Alert.alert("Éxito", "Post creado correctamente", [
          {
            text: "OK",
            onPress: () => {
              setTitle("")
              setDescription("")
              setMediaUrl("")
              setMediaType("")
              navigation.goBack()
            },
          },
        ])
      } else {
        Alert.alert("Error", "No se pudo crear el post")
      }
    } catch (err) {
      console.error("Error creando post:", err)
      Alert.alert("Error", "Ocurrió un error al crear el post")
    } finally {
      setCreating(false)
    }
  }

  const clearMedia = () => {
    setMediaUrl("")
    setMediaType("")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Crear Post</Text>
          <Text style={styles.headerSubtitle}>Nuevo contenido</Text>
        </View>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Ionicons name="text-outline" size={16} color="#FFD700" /> Título
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe el título del post"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Ionicons name="document-text-outline" size={16} color="#FFD700" /> Descripción
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escribe la descripción del post"
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          <View style={styles.mediaContainer}>
            <Text style={styles.label}>
              <Ionicons name="image-outline" size={16} color="#FFD700" /> Multimedia
            </Text>

            {!mediaUrl ? (
              <TouchableOpacity
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={pickAndUpload}
                disabled={uploading}
              >
                <LinearGradient
                  colors={uploading ? ["#555", "#333"] : ["#FFD700", "#FFA000"]}
                  style={styles.uploadButtonGradient}
                >
                  {uploading ? (
                    <View style={styles.uploadingContainer}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.uploadingText}>Subiendo...</Text>
                    </View>
                  ) : (
                    <View style={styles.uploadContainer}>
                      <Ionicons name="cloud-upload-outline" size={24} color="#121212" />
                      <Text style={styles.uploadText}>Seleccionar archivo</Text>
                      <Text style={styles.uploadSubtext}>Imagen o video</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.mediaPreviewContainer}>
                {mediaType === "image" ? (
                  <Image source={{ uri: mediaUrl }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.videoPreview}>
                    <Ionicons name="play-circle" size={60} color="#FFD700" />
                    <Text style={styles.videoPreviewText}>Video listo</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.removeMediaButton} onPress={clearMedia}>
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>

                <View style={styles.mediaInfo}>
                  <Text style={styles.mediaTypeText}>Tipo: {mediaType === "image" ? "Imagen" : "Video"}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!title.trim() || !description.trim() || !mediaUrl || creating) && styles.createButtonDisabled,
          ]}
          onPress={handleCreatePost}
          disabled={!title.trim() || !description.trim() || !mediaUrl || creating}
        >
          <LinearGradient
            colors={
              !title.trim() || !description.trim() || !mediaUrl || creating ? ["#555", "#333"] : ["#4CD964", "#2ECC71"]
            }
            style={styles.createButtonGradient}
          >
            {creating ? (
              <View style={styles.creatingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.creatingText}>Creando post...</Text>
              </View>
            ) : (
              <View style={styles.createContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.createText}>Crear Post</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
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
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  charCount: {
    color: "#666",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  mediaContainer: {
    marginBottom: 24,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonGradient: {
    padding: 20,
    alignItems: "center",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadingText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "bold",
  },
  uploadContainer: {
    alignItems: "center",
  },
  uploadText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 8,
  },
  uploadSubtext: {
    color: "#121212",
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  mediaPreviewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  videoPreview: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#252525",
  },
  videoPreviewText: {
    color: "#FFFFFF",
    marginTop: 8,
    fontWeight: "bold",
  },
  removeMediaButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 4,
  },
  mediaInfo: {
    padding: 12,
    backgroundColor: "#1E1E1E",
  },
  mediaTypeText: {
    color: "#BBBBBB",
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  createButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonGradient: {
    padding: 16,
    alignItems: "center",
  },
  creatingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  creatingText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  createContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  createText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default CreatePostScreen
