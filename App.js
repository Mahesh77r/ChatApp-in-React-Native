import React,{useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import UserListScreen from './src/screens/UserListScreen';
import ChatScreen from './src/screens/ChatScreen';
import { requestUserPermission,getToken, notificationListener } from './src/service/firebase';
import { Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';

const Stack = createStackNavigator();


export default function App() {

  
  useEffect(() => {
    // Request permissions and get FCM token
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
      if (enabled) {
        getFcmToken();
      }
    };
  
    const getFcmToken = async () => {
      try {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
        }
      } catch (error) {
        console.error('Error fetching FCM token:', error);
      }
    };

    const one =messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage.notification);
    });
  
    const two = messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage.notification);
      }
    });
  
    // Foreground message handler
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      
      // Show an alert or update your state to show notification
      Alert.alert('Notification', remoteMessage.notification?.body || 'New message received');
    });
  
    requestPermission();
  
    // Cleanup
    return () => {
      unsubscribe();  // Unsubscribe from foreground messages
      one();
      two();
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
