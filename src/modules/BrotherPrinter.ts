// src/modules/BrotherPrinter.ts
import { NativeModules } from 'react-native';

const { BrotherPrinterModule } = NativeModules;

// Log if module is available for debugging
if (!BrotherPrinterModule) {
  console.error('BrotherPrinterModule native module not found. Make sure it is properly linked.');
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
  printImageFromPath: async (imagePath: string): Promise<string> => {
    if (!BrotherPrinterModule) {
      console.error('BrotherPrinterModule not available');
      return Promise.reject('Module not available');
    }
    try {
      return await BrotherPrinterModule.printImageFromPath(imagePath);
    } catch (error) {
      console.error('Error printing image:', error);
      return Promise.reject(error);
    }
  }
};