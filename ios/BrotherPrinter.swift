import Foundation
import React
import BRLMPrinterKit

@objc(BrotherPrinter)
class BrotherPrinter: NSObject, RCTBridgeModule {
    
    @objc
    static func moduleName() -> String! {
        return "BrotherPrinter"
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func constantsToExport() -> [AnyHashable : Any]! {
        return ["VERSION": "1.0.0"]
    }
    
    @objc
    func printSample(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        // For testing, use a hardcoded IP address - you'll need to replace this with your printer's IP
        let ipAddress = "192.168.4.128" // Replace with your printer's actual IP address
        
        print("Attempting to print to \(ipAddress)")
        
        guard let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first else {
            reject("DIRECTORY_ERROR", "Could not find documents directory", nil)
            return
        }
        
        let testImagePath = documentsPath + "/test_label.png"
        
        // Create a test image if it doesn't exist
        if !FileManager.default.fileExists(atPath: testImagePath) {
            self.createTestImage(atPath: testImagePath)
        }
        
        if self.printLabel(ipAddress: ipAddress, imagePath: testImagePath) {
            resolve("Print job sent successfully to \(ipAddress)")
        } else {
            reject("PRINT_ERROR", "Failed to print to \(ipAddress)", nil)
        }
    }
    
    // Create a simple test image for printing
    func createTestImage(atPath path: String) {
        let size = CGSize(width: 696, height: 300)
        UIGraphicsBeginImageContextWithOptions(size, false, 0)
        let context = UIGraphicsGetCurrentContext()!
        
        // Fill background white
        context.setFillColor(UIColor.white.cgColor)
        context.fill(CGRect(origin: .zero, size: size))
        
        // Add text
        let text = "Brother Printer Test Label"
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.boldSystemFont(ofSize: 24),
            .foregroundColor: UIColor.black
        ]
        
        let textSize = text.size(withAttributes: attributes)
        let textRect = CGRect(
            x: (size.width - textSize.width) / 2,
            y: (size.height - textSize.height) / 2,
            width: textSize.width,
            height: textSize.height
        )
        
        text.draw(in: textRect, withAttributes: attributes)
        
        // Add date/time
        let dateText = "Printed: \(Date())"
        let dateAttributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.systemFont(ofSize: 14),
            .foregroundColor: UIColor.darkGray
        ]
        
        let dateTextSize = dateText.size(withAttributes: dateAttributes)
        let dateTextRect = CGRect(
            x: (size.width - dateTextSize.width) / 2,
            y: textRect.maxY + 20,
            width: dateTextSize.width,
            height: dateTextSize.height
        )
        
        dateText.draw(in: dateTextRect, withAttributes: dateAttributes)
        
        // Get the image and save it
        if let image = UIGraphicsGetImageFromCurrentImageContext() {
            UIGraphicsEndImageContext()
            
            if let data = image.pngData() {
                try? data.write(to: URL(fileURLWithPath: path))
                print("Test image created at \(path)")
            }
        } else {
            UIGraphicsEndImageContext()
            print("Failed to create test image")
        }
    }
    
    func printLabel(ipAddress: String, imagePath: String) -> Bool {
        print("Creating printer channel to \(ipAddress)")
        
        // Create a channel with the printer's IP address
        let channel = BRLMChannel(wifiIPAddress: ipAddress)
        
        // Open the channel to the printer
        print("Opening printer channel")
        let generateResult = BRLMPrinterDriverGenerator.open(channel)
        
        // Check if the channel was opened successfully
        guard generateResult.error.code == BRLMOpenChannelErrorCode.noError, 
              let printerDriver = generateResult.driver else {
            print("Error - Open Channel: \(generateResult.error.code)")
            return false
        }
        
        // Make sure to close the channel when done
        defer {
            print("Closing printer channel")
            printerDriver.closeChannel()
        }
        
        // Create print settings
        print("Creating print settings")
        let printSettings = BRLMQLPrintSettings()
        
        // Configure the label size
        printSettings.labelSize = BRLMQLPrintSettingsLabelSize.rollW62
        
        // Additional settings
        printSettings.autoCut = true
        printSettings.cutAtEnd = true
        
        // Create URL from the image path
        print("Creating URL from image path: \(imagePath)")
        let imageURL = URL(fileURLWithPath: imagePath)
        
        // Print the image
        print("Sending print job to printer")
        let printError = printerDriver.printImage(with: imageURL, settings: printSettings)
        
        // Check if printing was successful
        if printError.code != BRLMPrintErrorCode.noError {
            print("Error - Print Image: \(printError.code)")
            return false
        } else {
            print("Success - Print Image")
            return true
        }
    }
}