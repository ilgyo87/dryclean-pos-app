#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BrotherPrinter, NSObject)

// Echo method for testing
RCT_EXTERN_METHOD(echo:(NSString *)message
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Get last error
RCT_EXTERN_METHOD(getLastError:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Print sample label
RCT_EXTERN_METHOD(printSample:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Print to specific IP
RCT_EXTERN_METHOD(printToIP:(NSString *)ipAddress
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Check printer connection
RCT_EXTERN_METHOD(checkPrinterConnection:(NSString *)ipAddress
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Get printer info
RCT_EXTERN_METHOD(getPrinterInfo:(NSString *)ipAddress
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Discover printers on network
RCT_EXTERN_METHOD(discoverPrinters:(RCTResponseSenderBlock)callback)

// Get dummy printers for testing
RCT_EXTERN_METHOD(getDummyPrinters:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
