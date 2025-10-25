import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'https://dklemailservice.onrender.com/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}, isTestMode = false) {
  const token = await AsyncStorage.getItem('authToken');
  
  // Debug: Log token presence (NOT the actual token!)
  console.log('API Call:', endpoint, 'Token:', token ? `${token.substring(0, 20)}...` : 'NONE');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isTestMode ? { 'X-Test-Mode': 'true' } : {}),
    ...options.headers,
  };
  
  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  
  // Debug: Log response status
  console.log('API Response:', endpoint, 'Status:', response.status);
  
  let errorMsg = '';
  if (response.status === 400) errorMsg = 'Ongeldige request (400)';
  if (response.status === 401) errorMsg = 'Niet geauthenticeerd (401)';
  if (response.status === 403) errorMsg = 'Geen toestemming (403)';
  if (response.status === 404) errorMsg = 'Niet gevonden (404)';
  if (response.status === 500) errorMsg = 'Server fout (500)';
  if (!response.ok) throw new Error(errorMsg || `API error: ${response.status}`);
  return response.json();
}