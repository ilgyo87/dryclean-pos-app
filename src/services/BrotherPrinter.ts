// src/services/BrotherPrinter.ts
import { NativeModules } from 'react-native';
const { BrotherPrinter } = NativeModules;

export const printSample = async () => {
  try {
    const result = await BrotherPrinter.printSample();
    console.log(result);
  } catch (e) {
    console.error(e);
  }
};