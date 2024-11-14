import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Use AsyncStorage for React Native
import { loginUserNew } from '../service/authService'; // Assuming you have this function in your auth service
import { getFcmToken, requestUserPermission } from '../service/firebase'
const LoginScreen = ({ navigation }) => {
  const [loginData, setLoginData] = useState({
    EmployeeID: '',
    Password: '',
  });
  
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (name, value) => {
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const loginHandler = async () => {
    try {
      const Fcmtoken = await getFcmToken()
      setErrorMessage('');
      const loginDataWithToken = {
        ...loginData,
        FCMToken:Fcmtoken
      }
      const headers = {}; 
      const res = await loginUserNew(loginDataWithToken, headers);

      if (res.status === 200) {
        const token = res.data.token;
        const userId = res.data.loggedUser._id;
        const userName = res.data.loggedUser.FirstName;
        const dept = res.data.loggedUser.Department;
        
        await AsyncStorage.setItem('jwtToken', token);
        await AsyncStorage.setItem('name', userName);
        await AsyncStorage.setItem('dept', dept);
        await AsyncStorage.setItem('id', userId);

        
        navigation.navigate('UserList');
      } 
      else {
        setErrorMessage('EmployeeID or Password is wrong.');
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
        placeholder="Employee ID"
        value={loginData.EmployeeID}
        onChangeText={(value) => handleInputChange('EmployeeID', value)}
        autoCapitalize="none"
      />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={loginData.Password}
          onChangeText={(value) => handleInputChange('Password', value)}
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


