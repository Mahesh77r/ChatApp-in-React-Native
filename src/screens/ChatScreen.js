import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';  
import messaging from '@react-native-firebase/messaging';

const socket = io('http://192.168.1.25:8000'); // Update IP if necessary

const ChatScreen = ({ route }) => {
  const { id, userName, userId, roomId, talkInGroup, roomName } = route.params; 
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [fcmToken, setfcmToken] = useState('');

  useEffect(() => {
    fetchMessages();
    socket.on('loadMessages', (message) => {
      if (Array.isArray(message.messages)) {
        setMessages(message.messages);
        // setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else {
        console.error('Invalid message format:', message.messages);
      }
    });

    return () => {
      socket.off('loadMessages');
      setMessage('');
    };
  }, []);

// push notification 
  useEffect(() => {
    // Request permission to send notifications
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
      if (enabled) {
        console.log('Authorization status:', authStatus);
        // Now that permission is granted, get the token
        getFcmToken();
      }
    };
  
    // Get the device's FCM token
    const getFcmToken = async () => {
      try {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          setfcmToken(fcmToken)
          console.log('FCM Token:', fcmToken);
          // You can send this token to your backend server to store and use for push notifications
          // e.g., sendToServer(fcmToken);
        } else {
          console.log('No token received');
        }
      } catch (error) {
        console.error('Error fetching FCM token:', error);
      }
    };
  
    // Call the requestPermission function on component mount
    requestPermission();
  }, []);
  


  const fetchMessages = async () => {
    socket.emit('loadMessages', {
      sender: id,
      receiver: talkInGroup ? roomId : userId, 
      type: talkInGroup,
    });

    socket.on('loadMessages', (loadedMessages) => {
      setMessages(loadedMessages); 
    });
  };

  const handleSend = async () => {
    if (message.trim()) {
      const senderId = await AsyncStorage.getItem('id'); // Fetch the logged-in user's ID
      
      const messageData = {
        sender: senderId, 
        content: message,
        receiver: talkInGroup ? roomId : userId, 
        fcmtoken:fcmToken,
        type: talkInGroup ? 'group' : 'one',  
      };

      // Send the message to the backend via Socket.io
      socket.emit('sendMessage', messageData);

      // Add the message locally
      setMessages([...messages, messageData]);
      setMessage('');

    }
  };

  

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const senderId = await AsyncStorage.getItem('id');
      const fileData = {
        file: result, 
        sender: senderId, 
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
              <Text key={item._id}>{item.content}</Text> 
            ) : (
              <Text key={item._id}>File attached</Text> 
            )}
          </View>
        )}
      />

      <View style={styles.inputContainer} >
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
