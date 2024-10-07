import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Use AsyncStorage for React Native
import { loginUserNew } from '../service/authService'; // Assuming you have this function in your auth service

const LoginScreen = ({ navigation }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  const [errorMessage, setErrorMessage] = useState('');



  const handleInputChange = (name, value) => {
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const loginHandler = async () => {
    // This will be equivalent to `e.preventDefault()` in React web
    try {
      // Simulating toast-like behavior by clearing error messages before login
      setErrorMessage('');
      // Assume loginUserNew is a service function that handles API calls for login
      const headers = {}; // Add headers if necessary
      const res = await loginUserNew(loginData, headers);

      if (res.status === 200) {
        const token = res.data.user.token;
        const userId = res.data.user._id;
        const userName = res.data.user.name;

        // Store login details in AsyncStorage (React Native's version of localStorage)
        await AsyncStorage.setItem('jwtToken', token);
        await AsyncStorage.setItem('name', userName);
        console.log(userId)
        await AsyncStorage.setItem('id', userId);

        // Navigate to UserList page after successful login
        navigation.navigate('UserList');
      } 
      else {
        setErrorMessage('Email or Password is wrong.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('An error occurred during login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={loginData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={loginData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          autoCapitalize="none"
        />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Button title="Login" onPress={loginHandler} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;
