#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BrotherPrinter, NSObject)
RCT_EXTERN_METHOD(printSample:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end