//
//  BrotherPrinterService.swift
//  YourXcodeProjectName
//
//  Created by Manus AI on [Date]
//  Copyright © [Year] Your Company Name. All rights reserved.
//

import Foundation
import BRLMPrinterKit // Import the Brother SDK framework

class BrotherPrinterService {

    // --- Configuration ---
    // Replace with your printer's actual IP address
    let printerIPAddress = "YOUR_PRINTER_IP_ADDRESS" // e.g., "192.168.1.100"
    // Specify the correct model for your printer
    let printerModel: BRLMPrinterModel = .QL_820NWB
    // Specify the correct label size you are using
    let labelSize: BRLMQLPrintSettingsLabelSize = .rollW62 // Example: 62mm continuous roll. Check SDK for other sizes.

    // --- Print Function ---
    func printImage(imageURL: URL) {
        print("Attempting to print image from URL: \(imageURL.path)")

        // 1. Create a communication channel (using Wi-Fi in this example)
        let channel = BRLMChannel(wifiIPAddress: printerIPAddress)

        // 2. Open the channel and get the printer driver
        let generateResult = BRLMPrinterDriverGenerator.open(channel)

        // Check for channel opening errors (uses BRLMOpenChannelError)
        guard generateResult.error.code == .noError, let printerDriver = generateResult.driver else {
            print("Error - Open Channel: \(generateResult.error.code)")
            // Use specific handler for open channel errors
            handleOpenChannelError(generateResult.error)
            return
        }
        print("Successfully opened channel to printer.")

        // Ensure the driver is closed when the function exits
        defer {
            printerDriver.closeChannel()
            print("Closed printer channel.")
        }

        // 3. Create Print Settings
        guard let printSettings = BRLMQLPrintSettings(defaultPrintSettingsWith: printerModel) else {
            print("Error - Could not create print settings for model: \(printerModel.rawValue)")
            return
        }

        // Customize settings as needed:
        printSettings.labelSize = labelSize
        printSettings.autoCut = true
        print("Configured print settings for label size: \(labelSize.rawValue)")

        // 4. Print the image
        print("Sending image to printer...")
        // This function returns BRLMPrintError
        let printError = printerDriver.printImage(with: imageURL, settings: printSettings)

        // 5. Check for printing errors (uses BRLMPrintError)
        if printError.code != .noError {
            print("Error - Print Image: \(printError.code)")
            // Use specific handler for print image errors
            handlePrintImageError(printError)
        } else {
            print("Success - Print command sent to printer.")
        }
    }

    // --- Error Handling Helper for Open Channel Errors ---
    private func handleOpenChannelError(_ error: BRLMOpenChannelError) {
        var errorMessage = "An unknown channel error occurred."
        // Use BRLMOpenChannelErrorCode enum for switching
        // Updated based on user's specific compiler errors (previous cases were invalid)
        switch error.code {
        case .noError:
            errorMessage = "No error."
        // Removed .ChannelTimeout (invalid)
        // Removed .printerNotFound (invalid)
        // Removed .connectionError (invalid)
        // Add other valid cases from BRLMOpenChannelErrorCode if known or needed
        default:
            errorMessage = "Opening channel failed with error code: \(error.code.rawValue)"
        }
        print("Open Channel Error Details: \(errorMessage)")
        // Consider showing an alert to the user
    }

    // --- Error Handling Helper for Print Image Errors ---
    private func handlePrintImageError(_ error: BRLMPrintError) {
        var errorMessage = "An unknown printing error occurred."
        // Use BRLMPrintErrorCode enum for switching
        // Updated based on user's specific compiler errors
        switch error.code {
        case .noError:
            errorMessage = "No error."
        case .printerStatusErrorCommunicationError: // Corrected case based on compiler error
            errorMessage = "Cannot communicate with the printer during printing."
        case .printerStatusErrorCoverOpen: // Corrected case based on compiler error
            errorMessage = "Printer cover is open."
        // Removed .wrongLabel (invalid)
        // Add other valid cases from BRLMPrintErrorCode if known or needed
        default:
            // Provide the raw value for unhandled errors
            errorMessage = "Printing failed with error code: \(error.code.rawValue)"
        }
        print("Printing Error Details: \(errorMessage)")
        // Consider showing an alert to the user
    }

    // --- Example Usage (within a ViewController or similar) ---
    /*
    func triggerPrint() {
        // Get the URL of the image you want to print
        guard let imageURL = Bundle.main.url(forResource: "YourImageName", withExtension: "png") else {
            print("Error: Image file not found in bundle.")
            return
        }

        let printerService = BrotherPrinterService()

        DispatchQueue.global(qos: .userInitiated).async {
            printerService.printImage(imageURL: imageURL)
        }
    }
    */
}

