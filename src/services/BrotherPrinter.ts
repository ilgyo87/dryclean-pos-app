import { NativeModules } from 'react-native';
const { BrotherPrinter } = NativeModules;

console.log('BrotherPrinter module on import:', BrotherPrinter);

export interface PrinterInfo {
  model: string;
  ipAddress: string;
  serialNumber: string;
  nodeName: string;
}

export const discoverPrinters = (): Promise<PrinterInfo[]> => {
  if (!BrotherPrinter || !BrotherPrinter.discoverPrinters) {
    console.error('Printer discovery is not available');
    return Promise.reject('Printer discovery is not available');
  }
  
  return new Promise((resolve, reject) => {
    BrotherPrinter.discoverPrinters((printers: PrinterInfo[]) => {
      console.log('Discovered printers:', printers);
      resolve(printers);
    });
  });
};

export const printSample = async () => {
  if (!BrotherPrinter) {
    console.error('BrotherPrinter module is not available');
    return Promise.reject('BrotherPrinter module is not available');
  }
  
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