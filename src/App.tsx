// src/App.tsx
import { Authenticator } from "@aws-amplify/ui-react-native";
import { Amplify } from "aws-amplify";
import React from "react";
import outputs from "../amplify_outputs.json";
import Dashboard from "./screens/Dashboard";

Amplify.configure(outputs);

const App = () => {
  return (
    <Authenticator.Provider>
      <Authenticator>
        <Dashboard />
      </Authenticator>
    </Authenticator.Provider>
  );
};

export default App;