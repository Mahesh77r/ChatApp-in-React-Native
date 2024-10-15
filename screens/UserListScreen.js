import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import io from 'socket.io-client'; // Import Socket.io
import AsyncStorage from '@react-native-async-storage/async-storage'; // Use AsyncStorage for React Native

const socket = io('http://192.168.1.20:8000'); // Replace with your server's Socket.io endpoint

const UserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [userId,setUserId] = useState('');
  const [talkInGroup, setTalkInGroup] = useState(false);
  



  useEffect(() => {
    const fetchUsers = async () => {
      const id = await AsyncStorage.getItem('id');
      const dept = await AsyncStorage.getItem('dept');
      setUserId(id)
      socket.emit('loadUserByDepartment',{department:dept});
    };
  
    const fetchGroups = async () => {
      const id = await AsyncStorage.getItem('id');
      socket.emit('loadGroupChat', { members: id });
    };
  
    fetchUsers();
    fetchGroups();
  
    socket.on('loadUserByDepartment', async (loadedUsers) => {
      loadedUsers = loadedUsers.Users
      const id = await AsyncStorage.getItem('id');
      const filteredUsers = loadedUsers.filter(user => user._id.toString() !== id);
      setUsers(filteredUsers);
    });
  
    socket.on('loadGroupChat', (chatRooms) => {
      if (chatRooms.length === 0) {
        console.log('No rooms loaded');
      }
      setRooms(chatRooms.chatRooms);
    });
  
    return () => {
      socket.off('loadUserByDepartment');
      socket.off('loadGroupChat');
    };
  }, []);
  



  const handleUserPress = (user) => {
    setTalkInGroup(false); // Single chat
    navigation.navigate('Chat', { id:userId,userName: `${user.FirstName} ${user.LastName}`, userId: user._id, talkInGroup: talkInGroup });
  };

  const handleRoomPress = (room) => {
    setTalkInGroup(true); // Group chat
    navigation.navigate('Chat', { id:userId,roomName: room.roomName, roomId: room._id, roomMembers: room.members, talkInGroup: talkInGroup });
  };

 
  
  

  return (
    <View style={styles.container}>
      



      <Text style={styles.title}>Users and Groups</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleUserPress(item)} key={item._id}>
            <Text style={styles.user} key={item._id}>{item.FirstName} {item.LastName}</Text>
          </TouchableOpacity>
        )}
      />
      <Text style={styles.subtitle}>Groups</Text>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleRoomPress(item)} key={item._id}>
            <Text style={styles.group} key={item._id} >{item.roomName}</Text>
          </TouchableOpacity>
        )}
      />
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
  subtitle: {
    fontSize: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  user: {
    padding: 15,
    fontSize: 18,
    backgroundColor: '#00000',
    marginBottom: 10,
  },
  group: {
    padding: 15,
    fontSize: 18,
    backgroundColor: '#e9e9e9',
    marginBottom: 10,
  },
});

export default UserListScreen;



