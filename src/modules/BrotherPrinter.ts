// src/modules/BrotherPrinter.ts
import { NativeModules } from 'react-native';

const { BrotherPrinter } = NativeModules;

// Log if module is available for debugging
if (!BrotherPrinter) {
  console.error('BrotherPrinter native module not found. Make sure it is properly linked.');
}

interface PrinterInfo {
  name: string;
  model: string;
  ipAddress: string;
}

interface SearchResult {
  printers: PrinterInfo[];
}

export default {
  searchPrinters: async (): Promise<SearchResult> => {
    if (!BrotherPrinter) {
      console.error('BrotherPrinter module not available');
      return { printers: [] };
    }
    try {
      return await BrotherPrinter.searchPrinters();
    } catch (error) {
      console.error('Error searching for printers:', error);
      return { printers: [] };
    }
  },
  
  printLabel: async (
    printerIP: string, 
    text: string, 
    width: number, 
    height: number
  ): Promise<boolean> => {
    if (!BrotherPrinter) {
      console.error('BrotherPrinter module not available');
      return false;
    }
    try {
      return await BrotherPrinter.printLabel(printerIP, text, width, height);
    } catch (error) {
      console.error('Error printing label:', error);
      return false;
    }
  }
};