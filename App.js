import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import UserListScreen from './src/screens/UserListScreen';
import ChatScreen from './src/screens/ChatScreen';
import { getFcmToken, notificationListener } from './src/service/firebase';

const Stack = createStackNavigator();

export default function App() {
console.log("first")
  useEffect(() => {

    getFcmToken();
    notificationListener();
    // Cleanup
    return () => {
      notificationListener();
    };
  }, []);



  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="UserList" component={UserListScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
