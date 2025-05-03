import Foundation
import UIKit
import React

// The Brother SDK is imported via the BrotherPrinterBridging.h bridging header
// No direct import needed in this Swift file

@objc(BrotherPrinter)
class BrotherPrinter: NSObject, RCTBridgeModule {
    
    // Track the last error for debugging purposes
    var lastError: String = "No error"
    
    @objc
    static func moduleName() -> String! {
        return "BrotherPrinter"
    }
    
    // This is important - tells React Native if the module needs to be initialized on the main thread
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    // Export constants to JavaScript
    @objc
    func constantsToExport() -> [AnyHashable : Any]! {
        return ["VERSION": "1.0.0"]
    }
    
    // MARK: - React Native Methods
    
    @objc
    func echo(_ message: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("Echo function called with: \(message)")
        resolve("Echo: \(message)")
    }
    
    @objc
    func getLastError(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(lastError)
    }
    
    @objc
    func printSample(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // For testing, use a hardcoded IP address
        let ipAddress = "192.168.4.128" // Replace with your printer's actual IP address
        
        print("Attempting to print to \(ipAddress)")
        
        guard let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first else {
            reject("DIRECTORY_ERROR", "Could not find documents directory", nil)
            return
        }
        
        let testImagePath = documentsPath + "/test_label.png"
        
        // Always create a fresh test image
        if !self.createTestImage(atPath: testImagePath) {
            reject("IMAGE_ERROR", "Failed to create test image: \(self.lastError)", nil)
            return
        }
        
        // Double-check the file exists
        if !FileManager.default.fileExists(atPath: testImagePath) {
            reject("FILE_ERROR", "Test image file does not exist at \(testImagePath)", nil)
            return
        }
        
        if self.printLabel(ipAddress: ipAddress, imagePath: testImagePath) {
            resolve("Print job sent successfully to \(ipAddress)")
        } else {
            reject("PRINT_ERROR", "Failed to print to \(ipAddress): \(self.lastError)", nil)
        }
    }
    
    @objc
    func printToIP(_ ipAddress: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("Attempting to print to provided IP: \(ipAddress)")
        
        guard let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first else {
            reject("DIRECTORY_ERROR", "Could not find documents directory", nil)
            return
        }
        
        let testImagePath = documentsPath + "/test_label.png"
        
        // Always create a fresh test image
        if !self.createTestImage(atPath: testImagePath) {
            reject("IMAGE_ERROR", "Failed to create test image: \(self.lastError)", nil)
            return
        }
        
        // Double-check the file exists
        if !FileManager.default.fileExists(atPath: testImagePath) {
            reject("FILE_ERROR", "Test image file does not exist at \(testImagePath)", nil)
            return
        }
        
        if self.printLabel(ipAddress: ipAddress, imagePath: testImagePath) {
            resolve("Print job sent successfully to \(ipAddress)")
        } else {
            reject("PRINT_ERROR", "Failed to print to \(ipAddress): \(self.lastError)", nil)
        }
    }
    
    @objc
    func checkPrinterConnection(_ ipAddress: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Create a channel with the printer's IP address
        let channel = BRLMChannel(wifiIPAddress: ipAddress)
        
        // Try to open the channel to the printer
        let generateResult = BRLMPrinterDriverGenerator.open(channel)
        
        // Check if the channel was opened successfully
        if generateResult.error.code == BRLMOpenChannelErrorCode.noError, let printerDriver = generateResult.driver {
            // Get printer status
            let statusResult = printerDriver.getPrinterStatus()
            
            // Close the channel
            printerDriver.closeChannel()
            
            if statusResult.error.code == BRLMGetStatusErrorCode.noError {
                resolve(true)
            } else {
                self.lastError = "Failed to get printer status: \(statusResult.error.code.rawValue)"
                resolve(false)
            }
        } else {
            self.lastError = "Failed to connect to printer: \(generateResult.error.code.rawValue)"
            resolve(false)
        }
    }
    
    @objc
    func getPrinterInfo(_ ipAddress: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Create a channel with the printer's IP address
        let channel = BRLMChannel(wifiIPAddress: ipAddress)
        
        // Open the channel to the printer
        let generateResult = BRLMPrinterDriverGenerator.open(channel)
        
        // Check if the channel was opened successfully
        guard generateResult.error.code == BRLMOpenChannelErrorCode.noError, let printerDriver = generateResult.driver else {
            let errorMessage = "Failed to connect to printer: \(generateResult.error.code.rawValue)"
            self.lastError = errorMessage
            reject("CONNECTION_ERROR", errorMessage, nil)
            return
        }
        
        // Make sure to close the channel when done
        defer {
            printerDriver.closeChannel()
        }
        
        // Get printer status
        let statusResult = printerDriver.getPrinterStatus()
        if statusResult.error.code != BRLMGetStatusErrorCode.noError {
            let errorMessage = "Failed to get printer status: \(statusResult.error.code.rawValue)"
            self.lastError = errorMessage
            reject("STATUS_ERROR", errorMessage, nil)
            return
        }
        
        guard let status = statusResult.status else {
            let errorMessage = "Failed to get printer status information"
            self.lastError = errorMessage
            reject("STATUS_ERROR", errorMessage, nil)
            return
        }
        
        // Check error code to determine printer state
        let isPaperEmpty = status.errorCode == BRLMPrinterStatusErrorCode.BRLMPrinterStatusErrorCodeNoPaper
        let isCoverOpen = status.errorCode == BRLMPrinterStatusErrorCode.BRLMPrinterStatusErrorCodeCoverOpen
        let isBusy = status.errorCode == BRLMPrinterStatusErrorCode.BRLMPrinterStatusErrorCodeBusy
        let isBatteryEmpty = status.errorCode == BRLMPrinterStatusErrorCode.BRLMPrinterStatusErrorCodeBatteryEmpty
        let isReady = status.errorCode == BRLMPrinterStatusErrorCode.BRLMPrinterStatusErrorCodeNoError
        
        // Get printer model
        let printerModel = status.model
        
        // Create a dictionary with printer information
        let printerInfo: [String: Any] = [
            "model": printerModel.rawValue,
            "modelName": self.getModelName(for: printerModel),
            "isReady": isReady,
            "isPaperEmpty": isPaperEmpty,
            "isCoverOpen": isCoverOpen,
            "isBatteryEmpty": isBatteryEmpty,
            "isBusy": isBusy,
            "errorCode": status.errorCode.rawValue,
            "ipAddress": ipAddress
        ]
        
        resolve(printerInfo)
    }
    
    @objc
    func discoverPrinters(_ callback: @escaping RCTResponseSenderBlock) {
        // Create a mutable array to store discovered printers
        var discoveredPrinters: [[String: String]] = []
        
        // Create search options
        let option = BRLMNetworkSearchOption()
        option.searchDuration = 10
        
        // Start the search
        let result = BRLMPrinterSearcher.startNetworkSearch(option) { (channel) in
            // This closure is called for each printer found
            
            // Extract printer information from the channel
            let ipAddress = channel.ipAddress ?? "Unknown"
            let nodeName = channel.nodeName ?? "Unknown"
            let location = channel.location ?? "Unknown"
            let serialNumber = channel.serialNumber ?? "Unknown"
            let modelName = channel.modelName ?? "Unknown"
            
            // Create a dictionary for this printer
            let printerInfo: [String: String] = [
                "model": modelName,
                "ipAddress": ipAddress,
                "location": location,
                "serialNumber": serialNumber,
                "nodeName": nodeName
            ]
            
            discoveredPrinters.append(printerInfo)
        }
        
        // Check if the search started successfully
        if result.error.code != BRLMOpenChannelErrorCode.noError {
            self.lastError = "Failed to start printer search: \(result.error.code.rawValue)"
            
            // Return dummy printers for testing when search fails
            let dummyPrinters: [[String: String]] = [
                ["model": "QL-820NWB", "ipAddress": "192.168.1.100", "serialNumber": "DUMMY001", "nodeName": "Brother QL-820NWB"],
                ["model": "QL-1110NWB", "ipAddress": "192.168.1.101", "serialNumber": "DUMMY002", "nodeName": "Brother QL-1110NWB"]
            ]
            
            callback([dummyPrinters])
            return
        }
        
        // Wait for the search to complete
        DispatchQueue.main.asyncAfter(deadline: .now() + 10.5) {
            // Stop the search after the timeout
            BRLMPrinterSearcher.cancelNetworkSearch()
            
            // If no printers were found, return dummy printers for testing
            if discoveredPrinters.isEmpty {
                let dummyPrinters: [[String: String]] = [
                    ["model": "QL-820NWB", "ipAddress": "192.168.1.100", "serialNumber": "DUMMY001", "nodeName": "Brother QL-820NWB"],
                    ["model": "QL-1110NWB", "ipAddress": "192.168.1.101", "serialNumber": "DUMMY002", "nodeName": "Brother QL-1110NWB"]
                ]
                discoveredPrinters = dummyPrinters
            }
            
            // Return the discovered printers
            callback([discoveredPrinters])
        }
    }
    
    @objc
    func getDummyPrinters(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let printers: [[String: String]] = [
            ["model": "QL-820NWB", "ipAddress": "192.168.1.100", "serialNumber": "DUMMY001", "nodeName": "Brother QL-820NWB"],
            ["model": "QL-1110NWB", "ipAddress": "192.168.1.101", "serialNumber": "DUMMY002", "nodeName": "Brother QL-1110NWB"]
        ]
        resolve(printers)
    }
    
    // MARK: - Helper Methods
    
    private func getModelName(for model: BRLMPrinterModel) -> String {
        let series = BRLMPrinterClassifier.classifyPrinterSerieseFromModel(model)
        switch series {
        case .BRLMPrinterClassifierSeriesPJ:
            return "PJ Series"
        case .BRLMPrinterClassifierSeriesRJ:
            return "RJ Series"
        case .BRLMPrinterClassifierSeriesTD:
            return "TD Series"
        case .BRLMPrinterClassifierSeriesPT:
            return "PT Series"
        case .BRLMPrinterClassifierSeriesQL:
            return "QL Series"
        case .BRLMPrinterClassifierSeriesMW:
            return "MW Series"
        case .BRLMPrinterClassifierSeriesUnknown:
            return "Unknown Series (\(model.rawValue))"
        @unknown default:
            return "Unknown Series (\(model.rawValue))"
        }
    }
    
    private func getPrintSettings(for printerModel: BRLMPrinterModel) -> BRLMPrintSettingsProtocol {
        let series = BRLMPrinterClassifier.classifyPrinterSerieseFromModel(printerModel)
        
        switch series {
        case .BRLMPrinterClassifierSeriesQL:
            let settings = BRLMQLPrintSettings()
            settings.labelSize = .rollW62
            settings.autoCut = true
            settings.cutAtEnd = true
            return settings
        case .BRLMPrinterClassifierSeriesPT:
            let settings = BRLMPTPrintSettings()
            settings.labelSize = .width24mm
            settings.autoCut = true
            return settings
        case .BRLMPrinterClassifierSeriesRJ:
            let settings = BRLMRJPrintSettings()
            return settings
        case .BRLMPrinterClassifierSeriesPJ:
            let settings = BRLMPJPrintSettings()
            settings.paperSize = .a4Letter
            return settings
        case .BRLMPrinterClassifierSeriesTD:
            let settings = BRLMTDPrintSettings()
            return settings
        default:
            // Default to QL printer settings if model is unknown
            let settings = BRLMQLPrintSettings()
            settings.labelSize = .rollW62
            settings.autoCut = true
            settings.cutAtEnd = true
            return settings
        }
    }
    
    private func printLabel(ipAddress: String, imagePath: String) -> Bool {
        // First check if the file exists
        if !FileManager.default.fileExists(atPath: imagePath) {
            self.lastError = "Image file not found at \(imagePath)"
            return false
        }
        
        // Check file size and permissions
        do {
            let attributes = try FileManager.default.attributesOfItem(atPath: imagePath)
            let fileSize = attributes[.size] as? UInt64 ?? 0
            
            if fileSize == 0 {
                self.lastError = "Image file is empty"
                return false
            }
        } catch {
            self.lastError = "Could not get file attributes: \(error)"
            return false
        }

        // Create a channel with the printer's IP address
        let channel = BRLMChannel(wifiIPAddress: ipAddress)

        // Open the channel to the printer
        let generateResult = BRLMPrinterDriverGenerator.open(channel)

        // Check if the channel was opened successfully
        guard generateResult.error.code == BRLMOpenChannelErrorCode.noError,
              let printerDriver = generateResult.driver else {
            self.lastError = "Failed to open printer channel: Error \(generateResult.error.code.rawValue)"
            return false
        }

        // Make sure to close the channel when done
        defer {
            printerDriver.closeChannel()
        }
        
        // Check printer status before proceeding
        let statusResult = printerDriver.getPrinterStatus()
        if statusResult.error.code != BRLMGetStatusErrorCode.noError {
            self.lastError = "Failed to get printer status: \(statusResult.error.code.rawValue)"
            return false
        }
        
        guard let status = statusResult.status else {
            self.lastError = "Failed to get printer status information"
            return false
        }
        
        // Check if the printer is ready based on error code
        if status.errorCode != BRLMPrinterStatusErrorCode.BRLMPrinterStatusErrorCodeNoError {
            self.lastError = "Printer not ready: \(status.errorCode.rawValue)"
            
            // Provide more specific error information based on error code
            switch status.errorCode {
            case BRLMPrinterStatusErrorCode.BRLMPrinterStatusErrorCodeNoPaper:
                self.lastError = "Printer is out of paper"
            case BRLMPrinterStatusErrorCode.BRLMPrinterStatusErrorCodeCoverOpen:
                self.lastError = "Printer cover is open"
            case BRLMPrinterStatusErrorCode.BRLMPrinterStatusErrorCodeBusy:
                self.lastError = "Printer is busy"
            case BRLMPrinterStatusErrorCode.BRLMPrinterStatusErrorCodeBatteryEmpty:
                self.lastError = "Printer battery is empty"
            default:
                self.lastError = "Printer error: \(status.errorCode.rawValue)"
            }
            
            return false
        }
        
        // Get printer model from status
        let printerModel = status.model
        
        // Create appropriate print settings based on the printer model
        let printSettings = getPrintSettings(for: printerModel)

        // Create URL from the image path
        let imageURL = URL(fileURLWithPath: imagePath)
        
        // Try to load the image to verify it's valid
        if let imageData = try? Data(contentsOf: imageURL),
           let _ = UIImage(data: imageData) {
            // Image loaded successfully
        } else {
            self.lastError = "Could not load image from path"
            return false
        }

        // Print the image
        let printError = printerDriver.printImageWithURL(imageURL, settings: printSettings)

        // Check if printing was successful
        if printError.code != BRLMPrintErrorCode.BRLMPrintErrorCodeNoError {
            self.lastError = "Print error: \(printError.code.rawValue)"
            
            // Provide more detailed error information
            switch printError.code {
            case BRLMPrintErrorCode.BRLMPrintErrorCodePrinterStatusErrorPaperEmpty:
                self.lastError = "Printer is out of paper"
            case BRLMPrintErrorCode.BRLMPrintErrorCodePrinterStatusErrorCoverOpen:
                self.lastError = "Printer cover is open"
            case BRLMPrintErrorCode.BRLMPrintErrorCodePrinterStatusErrorCommunicationError:
                self.lastError = "Communication error with printer"
            case BRLMPrintErrorCode.BRLMPrintErrorCodePrintSettingsError:
                self.lastError = "Invalid print settings for this printer model"
            case BRLMPrintErrorCode.BRLMPrintErrorCodeFilepathURLError:
                self.lastError = "Invalid file path"
            case BRLMPrintErrorCode.BRLMPrintErrorCodePrinterStatusErrorBatteryWeak:
                self.lastError = "Printer battery is weak"
            default:
                self.lastError = "Unknown error code: \(printError.code.rawValue)"
            }
            
            return false
        } else {
            return true
        }
    }
    
    private func createTestImage(atPath path: String) -> Bool {
        let size = CGSize(width: 696, height: 300)
        UIGraphicsBeginImageContextWithOptions(size, false, 0)
        guard let context = UIGraphicsGetCurrentContext() else {
            self.lastError = "Failed to create graphics context"
            return false
        }
        
        // Fill the background
        context.setFillColor(UIColor.white.cgColor)
        context.fill(CGRect(origin: .zero, size: size))
        
        // Draw a border
        context.setStrokeColor(UIColor.black.cgColor)
        context.setLineWidth(2.0)
        context.stroke(CGRect(x: 1, y: 1, width: size.width - 2, height: size.height - 2))
        
        // Add a title
        let text = "DryClean POS Test Label"
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.boldSystemFont(ofSize: 30),
            .foregroundColor: UIColor.black
        ]
        
        let textSize = text.size(withAttributes: attributes)
        let textRect = CGRect(
            x: (size.width - textSize.width) / 2,
            y: 50,
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
        var success = false
        if let image = UIGraphicsGetImageFromCurrentImageContext() {
            UIGraphicsEndImageContext()
            
            if let data = image.pngData() {
                do {
                    try data.write(to: URL(fileURLWithPath: path))
                    success = true
                } catch {
                    self.lastError = "Failed to save image: \(error)"
                }
            } else {
                self.lastError = "Failed to create PNG data from image"
            }
        } else {
            UIGraphicsEndImageContext()
            self.lastError = "Failed to create test image"
        }
        
        return success
    }
}
