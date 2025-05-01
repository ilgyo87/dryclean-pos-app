//
//  BrotherPrinterModule.swift
//  drycleanposapp
//

import Foundation
import BRLMPrinterKit
import React

@objc(BrotherPrinterModule)
class BrotherPrinterModule: NSObject {

    // Keep the service logic separate for clarity
    private let printerService = BrotherPrinterService()

    // Expose a method to React Native
    @objc
    func printImageFromPath(_ imagePath: String,
                           resolver resolve: @escaping RCTPromiseResolveBlock,
                           rejecter reject: @escaping RCTPromiseRejectBlock) {

        // Convert the file path string to a URL
        let imageURL = URL(fileURLWithPath: imagePath)

        // Basic validation
        guard FileManager.default.fileExists(atPath: imagePath) else {
            let error = NSError(domain: "BrotherPrinterError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Image file not found at path: \(imagePath)"])
            reject("FILE_NOT_FOUND", "Image file not found", error)
            return
        }

        // Run printing on a background thread to avoid blocking the main React Native thread
        DispatchQueue.global(qos: .userInitiated).async {
            // --- Printing Logic using BrotherPrinterService ---
            let channel = BRLMChannel(wifiIPAddress: self.printerService.printerIPAddress)
            let generateResult = BRLMPrinterDriverGenerator.open(channel)

            guard generateResult.error.code == .noError, let printerDriver = generateResult.driver else {
                let errorCode = generateResult.error.code
                let errorMessage = self.printerService.getOpenChannelErrorMessage(errorCode)
                let error = NSError(domain: "BrotherPrinterError", code: Int(errorCode.rawValue), userInfo: [NSLocalizedDescriptionKey: errorMessage])
                DispatchQueue.main.async {
                    reject("CHANNEL_ERROR", errorMessage, error)
                }
                return
            }

            defer {
                printerDriver.closeChannel()
            }

            guard let printSettings = BRLMQLPrintSettings(defaultPrintSettingsWith: self.printerService.printerModel) else {
                let error = NSError(domain: "BrotherPrinterError", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not create print settings"])
                DispatchQueue.main.async {
                    reject("SETTINGS_ERROR", "Could not create print settings", error)
                }
                return
            }

            printSettings.labelSize = self.printerService.labelSize
            printSettings.autoCut = true

            let printError = printerDriver.printImage(with: imageURL, settings: printSettings)

            if printError.code != .noError {
                let errorCode = printError.code
                let errorMessage = self.printerService.getPrintImageErrorMessage(errorCode)
                let error = NSError(domain: "BrotherPrinterError", code: Int(errorCode.rawValue), userInfo: [NSLocalizedDescriptionKey: errorMessage])
                DispatchQueue.main.async {
                    reject("PRINT_ERROR", errorMessage, error)
                }
            } else {
                // Successfully sent print command
                DispatchQueue.main.async {
                    resolve("Print command sent successfully")
                }
            }
        }
    }

    // Required main queue setup method for React Native modules
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}

// The BrotherPrinterService class needs to be in the same file
class BrotherPrinterService {
    let printerIPAddress = "YOUR_PRINTER_IP_ADDRESS" // TODO: Replace with actual IP
    let printerModel: BRLMPrinterModel = .QL_820NWB
    let labelSize: BRLMQLPrintSettingsLabelSize = .rollW62

    // Updated error handling functions to return strings
    func getOpenChannelErrorMessage(_ code: BRLMOpenChannelErrorCode) -> String {
        switch code {
        case .noError: return "No error."
        // Add valid cases based on SDK documentation or further testing
        default: return "Opening channel failed with error code: \(code.rawValue)"
        }
    }

    func getPrintImageErrorMessage(_ code: BRLMPrintErrorCode) -> String {
        switch code {
        case .noError: return "No error."
        case .printerStatusErrorCommunicationError: return "Cannot communicate with the printer during printing."
        case .printerStatusErrorCoverOpen: return "Printer cover is open."
        // Add other valid cases based on SDK documentation or further testing
        default: return "Printing failed with error code: \(code.rawValue)"
        }
    }
}