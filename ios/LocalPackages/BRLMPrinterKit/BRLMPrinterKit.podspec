Pod::Spec.new do |s|
  s.name             = 'BRLMPrinterKit'
  s.version          = '4.12.0'
  s.homepage         = 'https://support.brother.co.jp/j/s/support/html/mobilesdk/index.html'
  s.source           = { :path => '.' }
  s.summary          = "Pod for the BRLMPrinterKit / Brother's printers"
  s.description      = "This project is only a Pod for the Brother SDK v#{s.version}"
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { 'Masahiko Sakakibara' => 'sakakibara@rdlabo.jp' }
  s.ios.deployment_target = '11.0'
  s.ios.vendored_frameworks = 'BRLMPrinterKit.xcframework'
  s.pod_target_xcconfig = { 'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64' }
  s.user_target_xcconfig = { 'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64' }
end