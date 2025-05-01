// BrotherPrinter.m
#import <React/RCTBridgeModule.h>

// Expose the Swift class BrotherPrinter to Objective-C / React Native
@interface RCT_EXTERN_MODULE(BrotherPrinter, NSObject)

// Expose the printImageFromPath method
// It takes the image path (String), a resolver, and a rejecter
RCT_EXTERN_METHOD(printImageFromPath:(NSString *)imagePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Declare the requiresMainQueueSetup method if needed (as defined in Swift)
+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end

