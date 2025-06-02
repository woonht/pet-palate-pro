import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './auth_context';

// Define the structure of a feeder device
type FeederDevice = {
    device_id: string;
    device_name: string;
    lastSeen?: string;
};

// Define the shape of the context
type DeviceContextType = {
    devices: FeederDevice[];
    activeDeviceId: string | null;
    setActiveDevice: (deviceId: string) => void;
    loadUserFeeders: (userId: string) => Promise<void>;
};

interface DeviceProviderProps {
  children: ReactNode;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

// Custom hook for convenience
export const useDevices = () => {
    const context = useContext(DeviceContext);
    if (!context) throw new Error('useDevices must be used within DeviceProvider');
    return context;
};

// Provider component
export const DeviceProvider = ({ children }: DeviceProviderProps) => {
  const { user } = useAuth(); // get the logged-in user
  const [devices, setDevices] = useState<FeederDevice[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

  const setActiveDevice = (deviceId: string) => setActiveDeviceId(deviceId);

  const loadUserFeeders = async (username: string) => {
    try {
      const response = await fetch(`https://appinput.azurewebsites.net/api/GetUserData?name=${username}&formType=user_data`);
      const result = await response.json();

      if (result.user?.feeder?.length) {
        console.log('Feeder devices:', JSON.stringify(result.user.feeder, null, 2));
        setDevices(result.user.feeder);
      } 
      else {
        console.log('No feeders found.');
        setDevices([]);
        setActiveDeviceId(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to load feeder devices.');
      console.error(error);
    }
  };

  // 🔁 Auto-load feeders when user is available
  useEffect(() => {
    if (user?.name) {
      loadUserFeeders(user.name);
    }
  }, [user]);

  return (
    <DeviceContext.Provider value={{ devices, activeDeviceId, setActiveDevice, loadUserFeeders }}>
      {children}
    </DeviceContext.Provider>
  );
};
