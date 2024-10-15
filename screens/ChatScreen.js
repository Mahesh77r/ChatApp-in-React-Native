import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Use AsyncStorage for React Native


const socket = io('http://192.168.1.20:8000'); // Replace with your backend URL

const ChatScreen = ({ route }) => {
  const { id, userName, userId, roomId, talkInGroup,roomName } = route.params; // Receiving group or user info
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  
    // Listen for new messages
    socket.on('loadMessages', (message) => {
      
      // Check if message.messages is an array
      if (Array.isArray(message.messages)) {
        setMessages(message.messages);
      } else {
        console.error('Invalid message format:', message.messages);
      }
    });
  
    return () => {
      // Cleanup listeners when component unmounts
      socket.off('loadMessages');
      setMessage(); // Make sure to handle this appropriately
    };
  }, []);
  

  // Function to fetch previous messages between two users or within a group
  const fetchMessages = async () => {
    socket.emit('loadMessages', {
      sender: id,
      receiver: talkInGroup ? roomId : userId, // Send room ID for group, user ID for single chat
      // type: talkInGroup,
    });

    socket.on('loadMessages', (loadedMessages) => {
      setMessages(loadedMessages); // Set messages in state
    });
  };

  const handleSend = async () => {
    if (message.trim()) {
      const senderId = await AsyncStorage.getItem('id'); 
      
      const messageData = {
        sender: senderId, // Replace with actual sender ID from AsyncStorage
        content: message,
        receiver: talkInGroup ? roomId : userId, // Send message to the room if it's a group chat
        type: talkInGroup ? '' : 'one', // Differentiate between one-on-one and group chat
      };

      // Emit message to the server
      socket.emit('sendMessage', messageData);

      // Update local state
      setMessages([...messages, messageData]);
      setMessage('');
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const senderId = await AsyncStorage.getItem('id'); // Await AsyncStorage call
      const fileData = {
        file: result, // This will be your selected file data
        sender: senderId, // Replace with actual sender ID from AsyncStorage
        receiver: talkInGroup ? roomId : userId,
        type: talkInGroup ? 'group' : 'one',
      };

      socket.emit('sendMessage', fileData);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled file picker');
      } else {
        throw err;
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat with {talkInGroup ? roomName : userName}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer} key={item._id}>
            {item.content ? (
              <Text>{item.content}</Text> // Render message content
            ) : (
              <Text>File attached</Text> // Placeholder for file attachments
            )}
          </View>
        )}
      />


      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
      <Button title="Attach File" onPress={handleFilePick} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
  },
  messageContainer: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    marginBottom: 10,
  },
});

export default ChatScreen;
