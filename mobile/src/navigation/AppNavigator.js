import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

import MapScreen from '../screens/MapScreen';
import RapidDetailScreen from '../screens/RapidDetailScreen';
import AuthScreen from '../screens/AuthScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={({ navigation }) => ({
            headerShown: false,
            headerRight: () => (
              <TouchableOpacity
                onPress={() =>
                  isAuthenticated ? logout() : navigation.navigate('Auth')
                }
                style={{ marginRight: 15 }}
              >
                <Text style={{ color: '#667eea', fontWeight: '600' }}>
                  {isAuthenticated ? 'Logout' : 'Login'}
                </Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="RapidDetail"
          component={RapidDetailScreen}
          options={{
            title: 'Rapid Details',
            headerStyle: {
              backgroundColor: '#667eea',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
