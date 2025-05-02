import React from "react";
import { Button, StyleSheet, View } from "react-native";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react-native";
import { Amplify } from "aws-amplify";

import outputs from "./amplify_outputs.json";

Amplify.configure(outputs);

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
    <Authenticator.Provider>
      <Authenticator>
        <SignOutButton />
      </Authenticator>
    </Authenticator.Provider>
  );
};

const styles = StyleSheet.create({
  signOutButton: {
    alignSelf: "flex-end",
  },
});

export default App;