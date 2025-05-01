import React from "react";
import { Button, View, StyleSheet, Dimensions, Platform, NativeModules } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import BrotherPrinterTest from "./BrotherPrinterTest";

import { Amplify } from "aws-amplify";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react-native";
import { useEffect } from "react";
import { Text } from "react-native";

import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

// Get device dimensions for responsive design
const { width, height } = Dimensions.get('window');
// Better iPad detection
const isTablet = Platform.OS === 'ios' && Platform.isPad || (width > 768 && height > 500);

const SignOutButton = () => {
  const { signOut } = useAuthenticator();

  return (
    <View style={styles.signOutButton}>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
};

const App = () => {
  // Re-calculate dimensions on component mount and layout changes
  const [dimensions, setDimensions] = React.useState({ 
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height 
  });

  useEffect(() => {
    console.log("Available native modules:", Object.keys(NativeModules));
  }, []);

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    
    return () => subscription?.remove();
  }, []);

  // Dynamically determine if tablet based on current dimensions
  const currentIsTablet = Platform.OS === 'ios' && Platform.isPad || 
                         (dimensions.width > 768 && dimensions.height > 500);

  return (
    <SafeAreaProvider>
      <Authenticator.Provider>
        <Authenticator>
          <SafeAreaView style={[
            styles.container, 
            currentIsTablet && styles.tabletContainer
          ]}>
            <View style={[
              styles.contentContainer,
              currentIsTablet && styles.tabletContentContainer
            ]}>
              {/* Brother Printer Test UI */}
              <View style={{ flex: 1, width: '100%' }}>
                <Text style={{ textAlign: 'center', marginBottom: 8 }}>Testing Native Modules</Text>
                <BrotherPrinterTest />
              </View>
              <SignOutButton />
            </View>
          </SafeAreaView>
        </Authenticator>
      </Authenticator.Provider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabletContainer: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  tabletContentContainer: {
    width: '100%',
    alignSelf: 'center',
    // Removed maxWidth constraint to allow full tablet width
  },
  signOutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  }
});

export default App;