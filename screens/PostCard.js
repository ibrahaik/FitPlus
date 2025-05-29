import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import api from './api';

const PostCard = ({ post, userId }) => {
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const heartScale = new Animated.Value(1);
  
  useEffect(() => {
    setLoading(true);
    
    api.get(`/likes/${post.id}`)
      .then(({ data }) => {
        setLikesCount(data.likes_count);
        setUserLiked(data.user_liked);
      })
      .catch(err => console.error('Error al cargar likes:', err));

    api.get(`/comments/${post.id}`)
      .then(({ data }) => {
        setComments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar comentarios:', err);
        setLoading(false);
      });
  }, []);

  const toggleLike = async () => {
    try {
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      if (userLiked) {
        await api.delete('/likes', { data: { post_id: post.id, user_id: userId } });
        setLikesCount(likesCount - 1);
      } else {
        await api.post('/likes', { post_id: post.id, user_id: userId });
        setLikesCount(likesCount + 1);
      }
      setUserLiked(!userLiked);
    } catch (err) {
      console.error('Error al cambiar like:', err);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/comments', { post_id: post.id, user_id: userId, text: commentText });
      setComments(prev => [...prev, data]);
      setCommentText('');
    } catch (err) {
      console.error('Error al enviar comentario:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.authorContainer}>
          <View style={styles.authorAvatar}>
            <Ionicons name="person" size={16} color="#121212" />
          </View>
          <View>
            <Text style={styles.authorName}>{post.author_name || 'Admin'}</Text>
            <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.title}>{post.title}</Text>
      
      {post.description && (
        <Text style={styles.description}>{post.description}</Text>
      )}

      {}
      {loading ? (
        <View style={styles.mediaLoading}>
          <ActivityIndicator color="#FFD700" />
        </View>
      ) : post.media_type === 'image' ? (
        <Image 
          source={{ uri: post.media_url }} 
          style={styles.media} 
          resizeMode="cover"
        />
      ) : (
        <Video
          source={{ uri: post.media_url }}
          style={styles.media}
          useNativeControls
          resizeMode="contain"
          posterSource={{ uri: 'https://v0.blob.com/eVYC0.svg?height=200&width=400&text=Video+Thumbnail' }}
          posterStyle={styles.media}
        />
      )}

      <View style={styles.interactionBar}>
        <TouchableOpacity onPress={toggleLike} style={styles.likeButton}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons 
              name={userLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={userLiked ? "#FF4757" : "#BBBBBB"} 
            />
          </Animated.View>
          <Text style={[styles.likeCount, userLiked && styles.likedText]}>
            {likesCount}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.commentButton}
          onPress={() => setShowComments(!showComments)}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#BBBBBB" />
          <Text style={styles.commentCount}>{comments.length}</Text>
        </TouchableOpacity>
      </View>
      
      {showComments && (
        <View style={styles.commentsSection}>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Escribe un comentario..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              onPress={submitComment} 
              style={styles.commentButton} 
              disabled={submitting || !commentText.trim()}
            >
              {submitting ? (
                <ActivityIndicator color="#FFD700" size="small" />
              ) : (
                <Ionicons name="send" size={20} color="#FFD700" />
              )}
            </TouchableOpacity>
          </View>
          
          {comments.length > 0 ? (
            <View style={styles.commentsList}>
              {comments.map(c => (
                <View key={c.id} style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Ionicons name="person" size={14} color="#121212" />
                  </View>
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUser}>{c.user_name}</Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noCommentsText}>
              No hay comentarios. ¡Sé el primero en comentar!
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  postDate: {
    color: '#999',
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    padding: 12,
    paddingBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#BBBBBB',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  mediaLoading: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#252525',
  },
  media: {
    width: '100%',
    height: 200,
    backgroundColor: '#252525',
  },
  interactionBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  likeCount: {
    color: '#BBBBBB',
    marginLeft: 6,
    fontSize: 14,
  },
  likedText: {
    color: '#FF4757',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    color: '#BBBBBB',
    marginLeft: 6,
    fontSize: 14,
  },
  commentsSection: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#252525',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#FFFFFF',
    marginRight: 8,
  },
  commentsList: {
    marginTop: 8,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 8,
    paddingHorizontal: 12,
  },
  commentUser: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  noCommentsText: {
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default PostCard;