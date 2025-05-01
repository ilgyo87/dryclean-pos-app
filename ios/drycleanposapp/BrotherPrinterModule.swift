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
        //    For Bluetooth: Use BRLMChannel(bluetoothSerialNumber: "YourPrinterSerialNumber")
        //    Note: Bluetooth requires pairing and might need MFi setup (check Brother docs).
        let channel = BRLMChannel(wifiIPAddress: printerIPAddress)

        // 2. Open the channel and get the printer driver
        let generateResult = BRLMPrinterDriverGenerator.open(channel)

        guard generateResult.error.code == .noError, let printerDriver = generateResult.driver else {
            print("Error - Open Channel: \(generateResult.error.code)")
            // Provide more specific error feedback if possible
            handlePrintError(generateResult.error)
            return
        }
        print("Successfully opened channel to printer.")

        // Ensure the driver is closed when the function exits
        defer {
            printerDriver.closeChannel()
            print("Closed printer channel.")
        }

        // 3. Create Print Settings
        //    Use BRLMQLPrintSettings for QL series printers.
        guard let printSettings = BRLMQLPrintSettings(defaultPrintSettingsWith: printerModel) else {
            print("Error - Could not create print settings for model: \(printerModel.rawValue)")
            return
        }

        // Customize settings as needed:
        printSettings.labelSize = labelSize
        printSettings.autoCut = true // Enable auto-cutting if desired
        // printSettings.resolution = .high // Set resolution if needed (default is usually fine)
        // printSettings.printQuality = .highQuality // Adjust print quality
        // ... explore other settings in BRLMQLPrintSettings ...
        print("Configured print settings for label size: \(labelSize.rawValue)")

        // 4. Print the image
        //    Use printImage(with: url, settings: printSettings)
        //    To print a PDF, use printPDF(with: url, settings: printSettings)
        print("Sending image to printer...")
        let printError = printerDriver.printImage(with: imageURL, settings: printSettings)

        // 5. Check for printing errors
        if printError.code != .noError {
            print("Error - Print Image: \(printError.code)")
            handlePrintError(printError)
        } else {
            print("Success - Print command sent to printer.")
            // Note: Success here means the command was sent. Actual printing status might need separate checks if available.
        }
    }

    // --- Error Handling Helper ---
    private func handlePrintError(_ error: BRLMPrintError) {
        // You can expand this function to provide user-friendly error messages
        // based on the BRLMPrintErrorCode enum.
        var errorMessage = "An unknown printing error occurred."
        switch error.code {
        case .noError:
            errorMessage = "No error."
        case .timeout:
            errorMessage = "Communication timeout."
        case .badPaperSize:
            errorMessage = "Incorrect paper size specified."
        case .printerBusy:
            errorMessage = "Printer is busy."
        case .communicationError:
            errorMessage = "Cannot communicate with the printer (check connection, IP address, power)."
        case .setInformationError:
            errorMessage = "Error setting printer information."
        case .noPaper:
            errorMessage = "Printer is out of paper/labels."
        case .coverOpen:
            errorMessage = "Printer cover is open."
        // ... add more cases based on BRLMPrintErrorCode ...
        default:
            errorMessage = "Printing failed with error code: \(error.code.rawValue)"
        }
        print("Printing Error Details: \(errorMessage)")
        // Here you might want to show an alert to the user
        // Alert.alert("Printing Error", errorMessage, preferredStyle: .alert).addAction(...) etc.
    }

    // --- Example Usage (within a ViewController or similar) ---
    /*
    func triggerPrint() {
        // Get the URL of the image you want to print
        // This could be from the app's bundle, documents directory, or photo library
        guard let imageURL = Bundle.main.url(forResource: "YourImageName", withExtension: "png") else {
            print("Error: Image file not found in bundle.")
            // Show error to user
            return
        }

        let printerService = BrotherPrinterService()
        
        // Run printing on a background thread to avoid blocking the main thread
        DispatchQueue.global(qos: .userInitiated).async {
            printerService.printImage(imageURL: imageURL)
            
            // If you need to update UI after printing, dispatch back to the main thread
            // DispatchQueue.main.async {
            //    self.updatePrintStatusLabel("Print job sent.")
            // }
        }
    }
    */
}


