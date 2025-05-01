// Create this file to interface with the native module
import { requireNativeModule } from 'expo-modules-core';

// This loads the native module object from the JSI framework
const BrotherPrinter = requireNativeModule('BrotherPrinter');

export default {
  searchPrinters: () => BrotherPrinter.searchPrinters(),
  printLabel: (printerIP: string, text: string, width: number, height: number) => 
    BrotherPrinter.printLabel(printerIP, text, width, height)
};