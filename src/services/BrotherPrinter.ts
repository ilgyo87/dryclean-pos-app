import { NativeModules } from 'react-native';

// Get the BrotherPrinter module
const { BrotherPrinter } = NativeModules;

// Log all available methods for debugging
console.log('BrotherPrinter module on import:', BrotherPrinter);
console.log('Available methods on BrotherPrinter:', BrotherPrinter ? Object.keys(BrotherPrinter) : 'Module not found');
console.log('All NativeModules:', Object.keys(NativeModules));

// Define printer info interface
export interface PrinterInfo {
  model: string;
  ipAddress: string;
  serialNumber: string;
  nodeName: string;
}

// Define detailed printer info interface
export interface DetailedPrinterInfo {
  model: number;
  modelName: string;
  isReady: boolean;
  isHeadOpen: boolean;
  isPaperEmpty: boolean;
  isCoverOpen: boolean;
  isBatteryEmpty: boolean;
  isBusy: boolean;
  errorCode: number;
  ipAddress: string;
}

/**
 * Simple echo function to test if the native module is working
 * @param message Message to echo
 * @returns Promise with echoed message
 */
export const echo = (message: string): Promise<string> => {
  if (!BrotherPrinter || !BrotherPrinter.echo) {
    console.error('BrotherPrinter.echo is not available');
    return Promise.reject('BrotherPrinter.echo is not available');
  }
  
  console.log('Calling echo with:', message);
  return BrotherPrinter.echo(message);
};

/**
 * Discover printers on the network
 * @param callback Callback function to receive the discovered printers
 */
export const discoverPrinters = (callback: (printers: any[]) => void): void => {
  if (!BrotherPrinter || !BrotherPrinter.discoverPrinters) {
    console.error('BrotherPrinter.discoverPrinters is not available');
    callback([]);
    return;
  }
  
  console.log('Calling discoverPrinters...');
  try {
    BrotherPrinter.discoverPrinters((results: any) => {
      console.log('Discovery callback received:', results);
      if (Array.isArray(results) && results.length > 0) {
        callback(results[0]); // The first item contains the printer array
      } else {
        callback([]);
      }
    });
  } catch (e) {
    console.error('Error calling discoverPrinters:', e);
    callback([]);
  }
};

/**
 * Print a sample label to the default printer
 * @returns Promise with result message
 */
export const printSample = async (): Promise<string> => {
  if (!BrotherPrinter || !BrotherPrinter.printSample) {
    console.error('BrotherPrinter.printSample is not available');
    return Promise.reject('BrotherPrinter.printSample is not available');
  }
  
  console.log('[BrotherPrinter] printSample called');
  return BrotherPrinter.printSample();
};

/**
 * Print a sample label to a specific printer IP
 * @param ipAddress IP address of the printer
 * @returns Promise with result message
 */
export const printToIP = async (ipAddress: string): Promise<string> => {
  if (!BrotherPrinter || !BrotherPrinter.printToIP) {
    console.error('BrotherPrinter.printToIP is not available');
    return Promise.reject('BrotherPrinter.printToIP is not available');
  }
  
  console.log('[BrotherPrinter] printToIP called', ipAddress);
  return BrotherPrinter.printToIP(ipAddress);
};

/**
 * Check printer connection
 * @param ipAddress IP address of the printer
 * @returns Promise with connection status
 */
export const checkPrinterConnection = async (ipAddress: string): Promise<boolean> => {
  if (!BrotherPrinter || !BrotherPrinter.checkPrinterConnection) {
    console.error('BrotherPrinter.checkPrinterConnection is not available');
    return Promise.reject('BrotherPrinter.checkPrinterConnection is not available');
  }
  console.log('[BrotherPrinter] checkPrinterConnection called', ipAddress);
  return BrotherPrinter.checkPrinterConnection(ipAddress);
};

/**
 * Get last error from native module
 */
export const getLastError = async (): Promise<string> => {
  if (!BrotherPrinter || !BrotherPrinter.getLastError) {
    console.error('BrotherPrinter.getLastError is not available');
    return Promise.reject('BrotherPrinter.getLastError is not available');
  }
  console.log('[BrotherPrinter] getLastError called');
  return BrotherPrinter.getLastError();
};

/**
 * Get detailed printer information
 * @param ipAddress IP address of the printer
 * @returns Promise with detailed printer information
 */
export const getPrinterInfo = async (ipAddress: string): Promise<DetailedPrinterInfo> => {
  if (!BrotherPrinter || !BrotherPrinter.getPrinterInfo) {
    console.error('BrotherPrinter.getPrinterInfo is not available');
    return Promise.reject('BrotherPrinter.getPrinterInfo is not available');
  }
  console.log('[BrotherPrinter] getPrinterInfo called for', ipAddress);
  return BrotherPrinter.getPrinterInfo(ipAddress);
};

/**
 * Get dummy printers for UI testing
 */
export const getDummyPrinters = async (): Promise<Array<{ model: string; ipAddress: string; serialNumber: string; nodeName: string }>> => {
  if (!BrotherPrinter || !BrotherPrinter.getDummyPrinters) {
    console.error('BrotherPrinter.getDummyPrinters is not available');
    return Promise.reject('BrotherPrinter.getDummyPrinters is not available');
  }
  console.log('[BrotherPrinter] getDummyPrinters called');
  return BrotherPrinter.getDummyPrinters();
};

// Export all functions from the module
export default {
  echo,
  discoverPrinters,
  printSample,
  printToIP,
  checkPrinterConnection,
  getLastError,
  getPrinterInfo,
  getDummyPrinters,
  // Include any constants from the native module
  getConstants: BrotherPrinter?.getConstants
};