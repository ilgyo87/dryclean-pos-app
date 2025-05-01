// BrotherPrinterModule.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BrotherPrinterModule, NSObject)

RCT_EXTERN_METHOD(printImageFromPath:(NSString *)imagePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end