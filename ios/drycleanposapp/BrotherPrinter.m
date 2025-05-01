// BrotherPrinter.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BrotherPrinter, NSObject)

RCT_EXTERN_METHOD(searchPrinters:
                  (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(printLabel:(NSString *)printerIP
                  text:(NSString *)text
                  width:(nonnumber *)width
                  height:(nonnumber *)height
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end