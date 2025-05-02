import { NativeModules } from 'react-native';
const { BrotherPrinter } = NativeModules;

export const printSample = async () => {
  try {
    console.log("Attempting to print...");
    console.log("Available modules:", Object.keys(NativeModules));
    const result = await BrotherPrinter.printSample();
    console.log("Print result:", result);
    return result;
  } catch (e) {
    console.error("Printing error:", e);
    throw e;
  }
};