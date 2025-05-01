require "json"

package = JSON.parse(File.read(File.join(__dir__, "..", "package.json")))

Pod::Spec.new do |s|
  s.name         = "BrotherPrinterModule"
  s.version      = "4.3.1"
  s.summary      = "Brother Printer SDK"
  s.description  = "Brother Printer SDK for iOS"
  s.homepage     = "https://support.brother.com"
  s.license      = { :type => "Commercial", :text => "Brother SDK" }
  s.author       = { "Brother" => "support@brother.com" }
  s.platform     = :ios, "13.0"
  s.source       = { :path => "." }
  # Source files for your native module bridge and implementation
  # Adjust if your files are named differently or in subdirectories
  s.source_files = "*.{h,m,swift}"

  # React Native dependencies
  s.dependency "React-Core"
  # Add other React Native dependencies if your module uses them directly
  # s.dependency "React-RCTText", etc.

  # --- IMPORTANT: Brother SDK Framework Dependency ---
  # This line tells Cocoapods where to find the Brother SDK framework.
  # It assumes you have placed BRLMPrinterKit.xcframework inside a "Frameworks" folder
  # within the same directory as this podspec file (e.g., ios/Frameworks/BRLMPrinterKit.xcframework).
  # *** ADJUST THIS PATH if you place the framework elsewhere. ***
  s.vendored_frameworks = "Frameworks/BRLMPrinterKit.xcframework"

  # If your module uses Swift
  # s.swift_version = "5.0" # Specify your Swift version if needed

  # Required if using Swift and bridging headers
  # s.pod_target_xcconfig = { "SWIFT_OBJC_BRIDGING_HEADER" => "YourProjectName-Bridging-Header.h" }

end

