import React from "react";
import { Button, View, StyleSheet, Dimensions, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { Amplify } from "aws-amplify";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react-native";

import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

// Get device dimensions for responsive design
const { width, height } = Dimensions.get('window');
const isTablet = width > 768; // Common breakpoint for tablets

const SignOutButton = () => {
  const { signOut } = useAuthenticator();

  return (
    <View style={styles.signOutButton}>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <Authenticator.Provider>
        <Authenticator>
          <View style={[
            styles.container, 
            isTablet && styles.tabletContainer
          ]}>
            <View style={[
              styles.contentContainer,
              isTablet && styles.tabletContentContainer
            ]}>
              {/* Your app content here */}
              <SignOutButton />
            </View>
          </View>
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
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabletContentContainer: {
    maxWidth: 1024,
    width: '100%',
    alignSelf: 'center',
  },
  signOutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  }
});

export default App;