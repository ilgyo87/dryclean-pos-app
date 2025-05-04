// src/services/BrotherPrinter.ts
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

// Get the BrotherPrinter module
const { BrotherPrinter } = NativeModules;

// Create event emitter for handling printer events
const brotherPrinterEventEmitter = BrotherPrinter ? new NativeEventEmitter(BrotherPrinter) : null;

// Log available methods for debugging
console.log('BrotherPrinter module on import:', BrotherPrinter);
console.log('Available methods on BrotherPrinter:', BrotherPrinter ? Object.keys(BrotherPrinter) : 'Module not found');

// Printer model names
export enum BRLMPrinterModelName {
  QL_800 = 'QL_800',
  QL_810W = 'QL_810W',
  QL_820NWB = 'QL_820NWB',
  TD_2320D = 'TD_2320D_203',
  TD_2350D = 'TD_2350D_300',
}

// Printer label names
export enum BRLMPrinterLabelName {
  RollW62 = 'RollW62',
  RollW29 = 'RollW29',
  RollW62RB = 'RollW62RB',
  DieCutW62H29 = 'DieCutW62H29',
  DieCutW62H100 = 'DieCutW62H100',
}

// Printer connection port types
export enum BRLMPrinterPort {
  WIFI = 'wifi',
  BLUETOOTH = 'bluetooth',
  BLUETOOTH_LE = 'bluetoothLowEnergy',
  USB = 'usb',
}

// Define printer info interface
export interface PrinterInfo {
  model: string;
  ipAddress: string;
  serialNumber: string;
  nodeName: string;
  location?: string;
  macAddress?: string;
}

// Define channel result interface
export interface BRLMChannelResult {
  port: BRLMPrinterPort;
  modelName: string;
  serialNumber: string;
  macAddress: string;
  nodeName: string;
  location: string;
  channelInfo: string; // IP for WIFI, macAddress for Bluetooth, modelName for BLE
}

// Define basic printer settings
export interface BRLMPrinterSettings {
  numberOfCopies?: number;
  autoCut?: boolean;
  printQuality?: 'Best' | 'Fast';
}

// Define QL model settings
export interface BRLMPrinterQLModelSettings extends BRLMPrinterSettings {
  labelName: BRLMPrinterLabelName;
}

// Define search options
export interface BRLMSearchOption {
  port: BRLMPrinterPort;
  searchDuration?: number; // Seconds, default 15
}

// Define print options
export interface BRLMPrintOptions {
  modelName: BRLMPrinterModelName;
  port?: BRLMPrinterPort;
  channelInfo?: string;
  encodedImage: string; // base64 image data
  labelName: BRLMPrinterLabelName;
  numberOfCopies?: number;
  autoCut?: boolean;
  printQuality?: 'Best' | 'Fast';
}

// Event types
export enum BrotherPrintEvents {
  PRINTER_AVAILABLE = 'onPrinterAvailable',
  PRINT_SUCCESS = 'onPrint',
  PRINT_ERROR = 'onPrintError',
  PRINT_FAILED_COMMUNICATION = 'onPrintFailedCommunication',
}

// Error info interface
export interface ErrorInfo {
  message: string;
  code: number;
}

// Event listener handle
export interface EventListenerHandle {
  remove: () => void;
}

/**
 * Add event listener for printer events
 * @param eventName Event name
 * @param callback Callback function
 * @returns Event listener handle
 */
export const addListener = (
  eventName: BrotherPrintEvents,
  callback: (data: any) => void
): EventListenerHandle | null => {
  if (!brotherPrinterEventEmitter) {
    console.error('BrotherPrinter event emitter not available');
    return null;
  }

  const subscription = brotherPrinterEventEmitter.addListener(eventName, callback);
  return {
    remove: () => subscription.remove()
  };
};

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
 * Search for printers on the network
 * @param options Search options
 * @returns Promise<void>
 */
export const search = async (options: BRLMSearchOption): Promise<void> => {
  if (!BrotherPrinter || !BrotherPrinter.search) {
    if (BrotherPrinter?.discoverPrinters) {
      // Fall back to the old method if available
      console.log('Using fallback discoverPrinters method');
      BrotherPrinter.discoverPrinters(() => {});
      return;
    }
    console.error('BrotherPrinter.search is not available');
    return Promise.reject('BrotherPrinter.search is not available');
  }
  
  console.log('[BrotherPrinter] search called with options:', options);
  return BrotherPrinter.search(options);
};

/**
 * Cancel WiFi printer search
 * @returns Promise<void>
 */
export const cancelSearchWiFiPrinter = async (): Promise<void> => {
  if (!BrotherPrinter || !BrotherPrinter.cancelSearchWiFiPrinter) {
    console.error('BrotherPrinter.cancelSearchWiFiPrinter is not available');
    return Promise.reject('BrotherPrinter.cancelSearchWiFiPrinter is not available');
  }
  
  console.log('[BrotherPrinter] cancelSearchWiFiPrinter called');
  return BrotherPrinter.cancelSearchWiFiPrinter();
};

/**
 * Cancel Bluetooth printer search
 * @returns Promise<void>
 */
export const cancelSearchBluetoothPrinter = async (): Promise<void> => {
  if (!BrotherPrinter || !BrotherPrinter.cancelSearchBluetoothPrinter) {
    console.error('BrotherPrinter.cancelSearchBluetoothPrinter is not available');
    return Promise.reject('BrotherPrinter.cancelSearchBluetoothPrinter is not available');
  }
  
  console.log('[BrotherPrinter] cancelSearchBluetoothPrinter called');
  return BrotherPrinter.cancelSearchBluetoothPrinter();
};

/**
 * Print an image to a printer
 * @param options Print options
 * @returns Promise<void>
 */
export const printImage = async (options: BRLMPrintOptions): Promise<void> => {
  if (!BrotherPrinter || !BrotherPrinter.printImage) {
    // Try fallback to existing methods
    if (BrotherPrinter?.printToIP && options.channelInfo) {
      console.log('[BrotherPrinter] Using fallback printToIP method');
      return BrotherPrinter.printToIP(options.channelInfo);
    } else if (BrotherPrinter?.printSample) {
      console.log('[BrotherPrinter] Using fallback printSample method');
      return BrotherPrinter.printSample();
    }
    
    console.error('BrotherPrinter.printImage is not available');
    return Promise.reject('BrotherPrinter.printImage is not available');
  }
  
  console.log('[BrotherPrinter] printImage called with options:', options);
  return BrotherPrinter.printImage(options);
};

/**
 * Legacy: Print a sample label to the default printer
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
 * Legacy: Print a sample label to a specific printer IP
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
 * Legacy: Check printer connection
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
 * Legacy: Get last error from native module
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
 * Legacy: Get detailed printer information
 * @param ipAddress IP address of the printer
 * @returns Promise with detailed printer information
 */
export const getPrinterInfo = async (ipAddress: string): Promise<any> => {
  if (!BrotherPrinter || !BrotherPrinter.getPrinterInfo) {
    console.error('BrotherPrinter.getPrinterInfo is not available');
    return Promise.reject('BrotherPrinter.getPrinterInfo is not available');
  }
  console.log('[BrotherPrinter] getPrinterInfo called for', ipAddress);
  return BrotherPrinter.getPrinterInfo(ipAddress);
};

/**
 * Legacy: Get dummy printers for UI testing
 */
export const getDummyPrinters = async (): Promise<Array<PrinterInfo>> => {
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
  search,
  cancelSearchWiFiPrinter,
  cancelSearchBluetoothPrinter,
  printImage,
  addListener,
  // Legacy methods
  printSample,
  printToIP,
  checkPrinterConnection,
  getLastError,
  getPrinterInfo,
  getDummyPrinters,
};