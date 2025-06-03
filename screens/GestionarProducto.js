"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as ImagePicker from "expo-image-picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "./api"

const CLOUDINARY_UPLOAD_PRESET = "fitplusvideos"
const CLOUDINARY_CLOUD_NAME = "ded9t7aan"

const GestionarProductos = () => {
  const navigation = useNavigation()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Estados del formulario
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precioPuntos, setPrecioPuntos] = useState("")
  const [stock, setStock] = useState("")
  const [imagenUrl, setImagenUrl] = useState("")

  useEffect(() => {
    obtenerProductos()
  }, [])

  const obtenerProductos = async () => {
    try {
      setLoading(true)
      const response = await api.get("/productos")
      setProductos(response.data)
    } catch (error) {
      console.error("Error al obtener productos:", error)
      Alert.alert("Error", "No se pudieron obtener los productos")
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await obtenerProductos()
    setRefreshing(false)
  }

  const seleccionarProducto = (producto) => {
    setSelectedProduct(producto)
    setNombre(producto.nombre)
    setDescripcion(producto.descripcion || "")
    setPrecioPuntos(producto.precio_puntos.toString())
    setStock(producto.stock.toString())
    setImagenUrl(producto.imagen_url)
  }

  const limpiarFormulario = () => {
    setSelectedProduct(null)
    setNombre("")
    setDescripcion("")
    setPrecioPuntos("")
    setStock("")
    setImagenUrl("")
  }

  const pickAndUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permisos denegados", "Necesitamos permiso para acceder a la galería")
      return
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
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (!data.secure_url) throw new Error("No se obtuvo URL de Cloudinary")

      setImagenUrl(data.secure_url)
      Alert.alert("Éxito", "Imagen subida correctamente")
    } catch (err) {
      console.error("Error subiendo imagen:", err)
      Alert.alert("Error", "No se pudo subir la imagen")
    } finally {
      setUploading(false)
    }
  }

  const actualizarProducto = async () => {
    if (!selectedProduct) return

    if (!nombre.trim() || !precioPuntos || !stock || !imagenUrl) {
      Alert.alert("Error", "Por favor, complete todos los campos obligatorios")
      return
    }

    setUpdating(true)
    try {
      const token = await AsyncStorage.getItem("token")
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio_puntos: Number.parseInt(precioPuntos),
        stock: Number.parseInt(stock),
        imagen_url: imagenUrl,
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      await api.put(`/productos/${selectedProduct.id}`, payload, { headers })

      Alert.alert("Éxito", "Producto actualizado correctamente")
      limpiarFormulario()
      obtenerProductos()
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      Alert.alert("Error", "No se pudo actualizar el producto")
    } finally {
      setUpdating(false)
    }
  }

  

  const formatPrice = (precio) => {
    return `${precio} pts`
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
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
          <Text style={styles.headerTitle}>Gestionar Productos</Text>
          <Text style={styles.headerSubtitle}>{productos.length} productos totales</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{productos.filter((p) => p.stock > 0).length}</Text>
          <Text style={styles.statLabel}>En stock</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{productos.filter((p) => p.stock === 0).length}</Text>
          <Text style={styles.statLabel}>Agotados</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{productos.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.productosListContainer}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="cube-outline" size={18} color="#FFD700" /> Seleccionar Producto
          </Text>

          {productos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={60} color="#666" />
              <Text style={styles.emptyText}>No hay productos disponibles</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#FFD700"]}
                  tintColor="#FFD700"
                />
              }
            >
              {productos.map((producto) => (
                <TouchableOpacity
                  key={producto.id}
                  onPress={() => seleccionarProducto(producto)}
                  style={[styles.productCard, selectedProduct?.id === producto.id && styles.productCardSelected]}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={selectedProduct?.id === producto.id ? ["#FFD700", "#FFA000"] : ["#1E1E1E", "#252525"]}
                    style={styles.productGradient}
                  >
                    <View style={styles.productHeader}>
                      <Image source={{ uri: producto.imagen_url }} style={styles.productImage} />
                      <View style={styles.productInfo}>
                        <Text
                          style={[
                            styles.productName,
                            selectedProduct?.id === producto.id && styles.productNameSelected,
                          ]}
                        >
                          {producto.nombre}
                        </Text>
                        <Text
                          style={[
                            styles.productDescription,
                            selectedProduct?.id === producto.id && styles.productDescriptionSelected,
                          ]}
                        >
                          {producto.descripcion || "Sin descripción"}
                        </Text>
                        <View style={styles.productDetails}>
                          <View style={styles.priceContainer}>
                            <Text
                              style={[
                                styles.productPrice,
                                selectedProduct?.id === producto.id && styles.productPriceSelected,
                              ]}
                            >
                              {formatPrice(producto.precio_puntos)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.stockBadge,
                              producto.stock === 0 ? styles.stockBadgeEmpty : styles.stockBadgeAvailable,
                            ]}
                          >
                            <Text style={styles.stockText}>Stock: {producto.stock}</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.productActions}>
                      <TouchableOpacity style={styles.editButton} onPress={() => seleccionarProducto(producto)}>
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color={selectedProduct?.id === producto.id ? "#121212" : "#4CD964"}
                        />
                        <Text
                          style={[
                            styles.editButtonText,
                            selectedProduct?.id === producto.id && styles.editButtonTextSelected,
                          ]}
                        >
                          Editar
                        </Text>
                      </TouchableOpacity>

                     
                
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {selectedProduct && (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.formContainer}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="create-outline" size={18} color="#FFD700" /> Editar Producto
            </Text>

            <ScrollView style={styles.formScrollContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del producto"
                  placeholderTextColor="#666"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descripción del producto"
                  placeholderTextColor="#666"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.numberRow}>
                <View style={styles.numberInputContainer}>
                  <Text style={styles.inputLabel}>Precio (puntos) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#666"
                    value={precioPuntos}
                    keyboardType="numeric"
                    onChangeText={setPrecioPuntos}
                  />
                </View>

                <View style={styles.numberInputContainer}>
                  <Text style={styles.inputLabel}>Stock *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#666"
                    value={stock}
                    keyboardType="numeric"
                    onChangeText={setStock}
                  />
                </View>
              </View>

              <View style={styles.imageContainer}>
                <Text style={styles.inputLabel}>Imagen del producto *</Text>
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
                        <Text style={styles.uploadingText}>Subiendo...</Text>
                      </View>
                    ) : (
                      <View style={styles.uploadContainer}>
                        <Ionicons name="cloud-upload-outline" size={20} color="#121212" />
                        <Text style={styles.uploadText}>{imagenUrl ? "Cambiar imagen" : "Seleccionar imagen"}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {imagenUrl && (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imagenUrl }} style={styles.imagePreview} />
                  </View>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, updating && styles.actionButtonDisabled]}
                  onPress={actualizarProducto}
                  disabled={updating}
                >
                  <LinearGradient
                    colors={updating ? ["#555", "#333"] : ["#4CD964", "#2ECC71"]}
                    style={styles.actionButtonGradient}
                  >
                    {updating ? (
                      <View style={styles.buttonContent}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.buttonText}>Actualizando...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Actualizar Producto</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={limpiarFormulario}>
                  <LinearGradient colors={["#666", "#444"]} style={styles.actionButtonGradient}>
                    <View style={styles.buttonContent}>
                      <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Cancelar</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
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
  content: {
    flex: 1,
    flexDirection: "row",
  },
  productosListContainer: {
    flex: 1,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: "#333",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#BBBBBB",
    fontSize: 16,
    marginTop: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  productCardSelected: {
    elevation: 6,
    shadowOpacity: 0.5,
  },
  productGradient: {
    padding: 16,
  },
  productHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  productNameSelected: {
    color: "#121212",
  },
  productDescription: {
    fontSize: 12,
    color: "#BBBBBB",
    marginBottom: 8,
  },
  productDescriptionSelected: {
    color: "#121212",
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD700",
  },
  productPriceSelected: {
    color: "#121212",
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockBadgeAvailable: {
    backgroundColor: "rgba(76, 217, 100, 0.2)",
  },
  stockBadgeEmpty: {
    backgroundColor: "rgba(255, 59, 48, 0.2)",
  },
  stockText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  productActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 217, 100, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  editButtonText: {
    color: "#4CD964",
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 12,
  },
  editButtonTextSelected: {
    color: "#121212",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 12,
  },
  deleteButtonTextSelected: {
    color: "#121212",
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formScrollContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  numberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  numberInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  imageContainer: {
    marginBottom: 24,
  },
  uploadButton: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonGradient: {
    padding: 12,
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
    flexDirection: "row",
    alignItems: "center",
  },
  uploadText: {
    color: "#121212",
    fontWeight: "bold",
    marginLeft: 8,
  },
  imagePreviewContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  buttonContainer: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonGradient: {
    padding: 16,
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
})

export default GestionarProductos
