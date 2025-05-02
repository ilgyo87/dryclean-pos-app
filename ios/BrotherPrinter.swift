import Foundation
import BRLMPrinterKit

class BrotherPrinter {
    func printLabel(ipAddress: String, imagePath: String) -> Bool {
        // Create a channel with the printer's IP address
        let channel = BRLMChannel(wifiIPAddress: ipAddress)
        
        // Open the channel to the printer
        let generateResult = BRLMPrinterDriverGenerator.open(channel)
        
        // Check if the channel was opened successfully
        guard generateResult.error.code == BRLMOpenChannelErrorCode.noError, 
              let printerDriver = generateResult.driver else {
            print("Error - Open Channel: \(generateResult.error.code)")
            return false
        }
        
        // Make sure to close the channel when done
        defer {
            printerDriver.closeChannel()
        }
        
        // Create print settings
        // Avoid specifying a printer model since we can't determine the exact enum value
        let printSettings = BRLMQLPrintSettings()
        
        // Configure the label size
        printSettings.labelSize = BRLMQLPrintSettingsLabelSize.rollW62
        
        // Additional settings
        printSettings.autoCut = true
        printSettings.cutAtEnd = true
        
        // Create URL from the image path
        guard let imageURL = URL(string: imagePath) else {
            print("Error - Invalid image path")
            return false
        }
        
        // Print the image
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