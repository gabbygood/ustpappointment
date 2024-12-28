import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Feather } from '@expo/vector-icons';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='house.fill' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='appointments'
        options={{
          tabBarLabel: 'Appnmts',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name='fact-check' size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='services'
        options={{
          title: 'Service',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name='design-services' size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='notifications'
        options={{
          title: 'Notify',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name='notifications' size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Feather name='user' size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
