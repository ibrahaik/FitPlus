"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImagePicker from "expo-image-picker"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import api from "./api"

const CLOUDINARY_UPLOAD_PRESET = "fitplusvideos"
const CLOUDINARY_CLOUD_NAME = "ded9t7aan"

export default function CreateProductScreen() {
  const navigation = useNavigation()

  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precioPuntos, setPrecioPuntos] = useState("")
  const [stock, setStock] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)

  const pickAndUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      return Alert.alert("Permisos denegados", "Necesitamos permiso para acceder a la galería")
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    })
    if (result.cancelled) return

    const uri = result.assets[0].uri
    const name = uri.split("/").pop()
    const type = `image/${name.split(".").pop()}`

    const formData = new FormData()
    formData.append("file", { uri, name, type })
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

    setUploading(true)
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!data.secure_url) throw new Error("No se obtuvo URL de Cloudinary")
      setImageUrl(data.secure_url)
      Alert.alert("Éxito", "Imagen subida correctamente")
    } catch (err) {
      console.error("Error subiendo imagen:", err)
      Alert.alert("Error", "No se pudo subir la imagen")
    } finally {
      setUploading(false)
    }
  }

  const handleCreate = async () => {
    if (!nombre.trim() || !precioPuntos || !stock || !imageUrl) {
      return Alert.alert("Error", "Completa todos los campos obligatorios y sube una imagen")
    }

    setCreating(true)
    try {
      const token = await AsyncStorage.getItem("token")
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio_puntos: Number.parseInt(precioPuntos, 10),
        stock: Number.parseInt(stock, 10),
        imagen_url: imageUrl,
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      const { data } = await api.post("/productos", payload, { headers })
      Alert.alert("Éxito", `Producto "${data.nombre}" creado correctamente`, [
        {
          text: "OK",
          onPress: () => {
            setNombre("")
            setDescripcion("")
            setPrecioPuntos("")
            setStock("")
            setImageUrl("")
            navigation.goBack()
          },
        },
      ])
    } catch (err) {
      console.error(err)
      Alert.alert("Error", err.response?.data?.error || "No se pudo crear el producto")
    } finally {
      setCreating(false)
    }
  }

  const clearImage = () => {
    setImageUrl("")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Crear Producto</Text>
          <Text style={styles.headerSubtitle}>Nuevo producto</Text>
        </View>

        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.flex}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Ionicons name="cube-outline" size={16} color="#FFD700" /> Nombre *
              </Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej. Banda Elástica"
                placeholderTextColor="#666"
                maxLength={100}
              />
              <Text style={styles.charCount}>{nombre.length}/100</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Ionicons name="document-text-outline" size={16} color="#FFD700" /> Descripción
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Detalles del producto..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                maxLength={300}
              />
              <Text style={styles.charCount}>{descripcion.length}/300</Text>
            </View>

            <View style={styles.numberRow}>
              <View style={styles.numberInputContainer}>
                <Text style={styles.label}>
                  <Ionicons name="diamond-outline" size={16} color="#FFD700" /> Precio (puntos) *
                </Text>
                <TextInput
                  style={styles.input}
                  value={precioPuntos}
                  onChangeText={setPrecioPuntos}
                  placeholder="100"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.numberInputContainer}>
                <Text style={styles.label}>
                  <Ionicons name="layers-outline" size={16} color="#FFD700" /> Stock *
                </Text>
                <TextInput
                  style={styles.input}
                  value={stock}
                  onChangeText={setStock}
                  placeholder="10"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.imageContainer}>
              <Text style={styles.label}>
                <Ionicons name="image-outline" size={16} color="#FFD700" /> Imagen del producto *
              </Text>

              {!imageUrl ? (
                <TouchableOpacity
                  style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                  onPress={pickAndUploadImage}
                  disabled={uploading}
                >
                  <LinearGradient
                    colors={uploading ? ["#555", "#333"] : ["#FFD700", "#FFA000"]}
                    style={styles.uploadButtonGradient}
                  >
                    {uploading ? (
                      <View style={styles.uploadingContainer}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.uploadingText}>Subiendo imagen...</Text>
                      </View>
                    ) : (
                      <View style={styles.uploadContainer}>
                        <Ionicons name="cloud-upload-outline" size={32} color="#121212" />
                        <Text style={styles.uploadText}>Seleccionar imagen</Text>
                        <Text style={styles.uploadSubtext}>Toca para abrir la galería</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={clearImage}>
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                  <View style={styles.imageInfo}>
                    <Text style={styles.imageInfoText}>Imagen lista para usar</Text>
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
              (!nombre.trim() || !precioPuntos || !stock || !imageUrl || creating) && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!nombre.trim() || !precioPuntos || !stock || !imageUrl || creating}
          >
            <LinearGradient
              colors={
                !nombre.trim() || !precioPuntos || !stock || !imageUrl || creating
                  ? ["#555", "#333"]
                  : ["#4CD964", "#2ECC71"]
              }
              style={styles.createButtonGradient}
            >
              {creating ? (
                <View style={styles.creatingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.creatingText}>Creando producto...</Text>
                </View>
              ) : (
                <View style={styles.createContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.createText}>Crear Producto</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  flex: {
    flex: 1,
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
  numberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  numberInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  imageContainer: {
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
    padding: 32,
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
    marginTop: 12,
  },
  uploadSubtext: {
    color: "#121212",
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  imagePreviewContainer: {
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
  removeImageButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 4,
  },
  imageInfo: {
    padding: 12,
    backgroundColor: "#1E1E1E",
  },
  imageInfoText: {
    color: "#4CD964",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
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
