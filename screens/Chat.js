// Chat.js
import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, TextInput, Button, Text } from 'react-native';
import { db } from './firebase';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen({ route }) {
  const { communityId, userName, communityName } = route.params;
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    const messagesRef = ref(db, `chats/${communityId}/messages`);
    return onValue(messagesRef, snapshot => {
      const data = snapshot.val() || {};
      const parsed = Object.entries(data)
        .map(([id, msg]) => ({ id, ...msg }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setMsgs(parsed);
    });
  }, [communityId]);

  const send = () => {
    if (!text.trim()) return;
    const messagesRef = ref(db, `chats/${communityId}/messages`);
    push(messagesRef, {
      text,
      userName,
      timestamp: serverTimestamp(),
    });
    setText('');
  };

  const renderItem = ({ item }) => {
    const isMe = item.userName === userName;
    const time = item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '';
    const initial = item.userName.charAt(0).toUpperCase();

    return (
      <View style={{
        flexDirection: isMe ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        marginVertical: 4,
      }}>
        {}
        <View style={{
          backgroundColor: '#ddd',
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 8,
        }}>
          <Text>{initial}</Text>
        </View>

        {}
        <View style={{
          backgroundColor: isMe ? '#007aff' : '#e5e5ea',
          padding: 8,
          borderRadius: 12,
          maxWidth: '75%',
        }}>
          <Text style={{ color: isMe ? '#fff' : '#000' }}>{item.text}</Text>
          <Text style={{ fontSize: 10, color: isMe ? '#eee' : '#555', alignSelf: 'flex-end' }}>
            {time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={{ flex: 1, padding: 8 }}>
      <FlatList
        ref={flatListRef}
        data={msgs}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderRadius: 20, padding: 8, marginRight: 8 }}
          value={text}
          onChangeText={setText}
          placeholder="Mensaje..."
        />
        <Button title="Enviar" onPress={send} />
      </View>
    </View>
    </SafeAreaView>
  );
}