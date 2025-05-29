"use client"

import { useEffect, useState, useRef } from "react"
import {
  View,
  FlatList,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Keyboard,
  Platform,
} from "react-native"
import { db } from "./firebase"
import { ref, onValue, push, serverTimestamp, onDisconnect, set } from "firebase/database"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"

export default function ChatScreen({ route, navigation }) {
  const { communityId, userName, communityName } = route.params
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const flatListRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    const userStatusRef = ref(db, `communities/${communityId}/presence/${userName}`)

    set(userStatusRef, {
      online: true,
      lastSeen: serverTimestamp(),
    })

    onDisconnect(userStatusRef).update({
      online: false,
      lastSeen: serverTimestamp(),
    })

    const presenceRef = ref(db, `communities/${communityId}/presence`)
    return onValue(presenceRef, (snapshot) => {
      const data = snapshot.val() || {}
      const online = Object.entries(data)
        .filter(([_, status]) => status.online)
        .map(([username]) => username)

      setOnlineUsers(online)
    })
  }, [communityId, userName])

  useEffect(() => {
    const messagesRef = ref(db, `chats/${communityId}/messages`)

    return onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() || {}
      const parsed = Object.entries(data)
        .map(([id, msg]) => ({ id, ...msg }))
        .sort((a, b) => a.timestamp - b.timestamp)

      setMsgs(parsed)

      parsed.forEach((msg) => {
        const readStatusRef = ref(db, `chats/${communityId}/readStatus/${msg.id}/${userName}`)
        set(readStatusRef, true)
      })

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    })
  }, [communityId, userName])

  const [readStatus, setReadStatus] = useState({})
  useEffect(() => {
    const readStatusRef = ref(db, `chats/${communityId}/readStatus`)

    return onValue(readStatusRef, (snapshot) => {
      const data = snapshot.val() || {}
      setReadStatus(data)
    })
  }, [communityId])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
      },
    )

    return () => {
      keyboardDidShowListener.remove()
    }
  }, [])

  const send = () => {
    if (!text.trim()) return

    setIsTyping(true)

    const messagesRef = ref(db, `chats/${communityId}/messages`)
    const newMessageRef = push(messagesRef)

    set(newMessageRef, {
      text,
      userName,
      timestamp: serverTimestamp(),
    }).then(() => {
      const readStatusRef = ref(db, `chats/${communityId}/readStatus/${newMessageRef.key}/${userName}`)
      set(readStatusRef, true)
    })

    setText("")
    setIsTyping(false)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getReadStatus = (messageId) => {
    if (!readStatus[messageId]) return { readByMe: false, readByAll: false }

    const readers = Object.keys(readStatus[messageId])
    const readByMe = readers.includes(userName)

    const potentialReaders = [...new Set([...onlineUsers, ...Object.keys(readStatus[messageId])])]

    const relevantReaders = potentialReaders.filter((user) => user !== userName)

    const readByAll = relevantReaders.length > 0 && relevantReaders.every((user) => readers.includes(user))

    return { readByMe, readByAll }
  }

  const renderItem = ({ item, index }) => {
    const isMe = item.userName === userName
    const time = formatTime(item.timestamp)
    const initial = item.userName.charAt(0).toUpperCase()
    const { readByMe, readByAll } = getReadStatus(item.id)

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginVertical: 8,
          },
        ]}
      >
        <View style={[styles.messageHeader, { justifyContent: isMe ? "flex-end" : "flex-start" }]}>
          <Text style={styles.userName}>{isMe ? "Tú" : item.userName}</Text>
        </View>

        <View style={{ flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end" }}>
          {}
          <View style={[styles.avatar, { backgroundColor: generateColor(item.userName) }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
            <Text style={isMe ? styles.myMessageText : styles.theirMessageText}>{item.text}</Text>

            <View style={styles.messageFooter}>
              <Text style={styles.timeText}>{time}</Text>

              {}
              {isMe && (
                <View style={styles.readReceipts}>
                  {readByAll ? (
                    <MaterialIcons name="done-all" size={14} color="#64DD17" style={{ marginLeft: 4 }} />
                  ) : (
                    <MaterialIcons name="done" size={14} color="#BBBBBB" style={{ marginLeft: 4 }} />
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    )
  }

  const generateColor = (name) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    const h = (Math.abs(hash) % 60) + 40 
    const s = 80 + (Math.abs(hash) % 20) 
    const l = 45 + (Math.abs(hash) % 10) 

    return `hsl(${h}, ${s}%, ${l}%)`
  }

  const renderOnlineUsers = () => {
    if (onlineUsers.length === 0) {
      return <Text style={styles.headerSubtext}>Nadie en línea</Text>
    }

    if (onlineUsers.length === 1 && onlineUsers[0] === userName) {
      return <Text style={styles.headerSubtext}>Solo tú en línea</Text>
    }

    const otherUsers = onlineUsers.filter((user) => user !== userName)
    if (otherUsers.length === 0) {
      return <Text style={styles.headerSubtext}>Solo tú en línea</Text>
    }

    const displayUsers = otherUsers.slice(0, 2).join(", ")
    const remaining = otherUsers.length > 2 ? ` y ${otherUsers.length - 2} más` : ""

    return (
      <View style={styles.onlineContainer}>
        <View style={styles.onlineDot} />
        <Text style={styles.headerSubtext}>
          {displayUsers}
          {remaining} en línea
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>{communityName}</Text>
          {renderOnlineUsers()}
        </View>

        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.chatBody}>
        <FlatList
          ref={flatListRef}
          data={msgs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      </View>

      {}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={send}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>Enviando mensaje...</Text>
          <ActivityIndicator size="small" color="#FFD700" />
        </View>
      )}
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1A1A1A",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtext: {
    color: "#BBBBBB",
    fontSize: 12,
    marginTop: 2,
  },
  onlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#64DD17",
    marginRight: 6,
  },
  menuButton: {
    padding: 8,
  },
  chatBody: {
    flex: 1,
    backgroundColor: "#121212",
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 6,
    maxWidth: "100%",
  },
  messageHeader: {
    flexDirection: "row",
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  userName: {
    color: "#BBBBBB",
    fontSize: 12,
    fontWeight: "500",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  avatarText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: "75%",
  },
  myMessage: {
    backgroundColor: "#FFD700",
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopLeftRadius: 4,
  },
  theirMessage: {
    backgroundColor: "#2A2A2A",
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopLeftRadius: 4,
  },
  myMessageText: {
    color: "#000000",
    fontSize: 15,
  },
  theirMessageText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: "#AAAAAA",
  },
  readReceipts: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1A1A1A",
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  input: {
    color: "#FFFFFF",
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#FFD700",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  sendButtonDisabled: {
    backgroundColor: "#5A5A5A",
    opacity: 0.7,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "rgba(26, 26, 26, 0.8)",
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    borderRadius: 16,
  },
  typingText: {
    color: "#FFFFFF",
    marginRight: 8,
    fontSize: 12,
  },
})
