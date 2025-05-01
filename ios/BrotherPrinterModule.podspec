Pod::Spec.new do |s|
  s.name         = "BrotherPrinterModule"
  s.version      = "1.0.0"
  s.summary      = "Brother Printer Expo Module"
  s.description  = "A native module for Brother Printer integration via Expo Modules API."
  s.homepage     = "https://your-homepage.com"
  s.license      = { :type => "MIT", :file => "LICENSE" }
  s.author       = { "Your Name" => "your@email.com" }
  s.platform     = :ios, "13.0"
  s.source       = { :path => "." }
  s.source_files = "BrotherPrinterModule.swift"
  s.dependency   = "ExpoModulesCore"
  s.swift_version = "5.0"
end