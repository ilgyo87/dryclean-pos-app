package com.expo_iggy.drycleanposapp

import android.util.Log
import com.brother.ptouch.sdk.Printer
import com.brother.ptouch.sdk.PrinterInfo
import com.brother.ptouch.sdk.PrinterStatus
import com.brother.ptouch.sdk.NetPrinter
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = BrotherPrinterModule.NAME)
class BrotherPrinterModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        const val NAME = "BrotherPrinter"
        private const val TAG = "BrotherPrinterModule"
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun searchPrinters(promise: Promise) {
        Thread {
            try {
                val printerList = WritableNativeArray()
                val netPrinter = NetPrinter()
                val printers = netPrinter.discoverNetPrinters("QL-820NWB")
                
                if (printers != null) {
                    for (printer in printers) {
                        val printerMap = WritableNativeMap()
                        printerMap.putString("name", printer.modelName ?: "Unknown")
                        printerMap.putString("model", printer.modelName ?: "Unknown")
                        printerMap.putString("ipAddress", printer.ipAddress ?: "Unknown")
                        printerList.pushMap(printerMap)
                    }
                }
                
                val result = WritableNativeMap()
                result.putArray("printers", printerList)
                
                reactApplicationContext.runOnUiQueueThread {
                    promise.resolve(result)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error searching for printers", e)
                reactApplicationContext.runOnUiQueueThread {
                    promise.reject("PRINTER_SEARCH_ERROR", "Failed to search for printers: ${e.message}")
                }
            }
        }.start()
    }

    @ReactMethod
    fun printLabel(printerIP: String, text: String, width: Int, height: Int, promise: Promise) {
        Thread {
            try {
                val printer = Printer()
                val settings = PrinterInfo()
                settings.printerModel = PrinterInfo.Model.QL_820NWB
                settings.ipAddress = printerIP
                settings.port = PrinterInfo.Port.NET
                printer.printerInfo = settings
                
                // Connect to printer
                if (printer.startCommunication()) {
                    // Create and print label
                    // This is a simplified example. In a real app, you'd create
                    // a bitmap with the text and print it using printer.printImage()
                    Log.d(TAG, "Printing to $printerIP: $text - ${width}x${height}")
                    
                    // Disconnect from printer
                    printer.endCommunication()
                    
                    reactApplicationContext.runOnUiQueueThread {
                        promise.resolve(true)
                    }
                } else {
                    reactApplicationContext.runOnUiQueueThread {
                        promise.reject("PRINTER_CONNECTION_ERROR", "Failed to connect to printer")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error printing label", e)
                reactApplicationContext.runOnUiQueueThread {
                    promise.reject("PRINTER_ERROR", "Failed to print label: ${e.message}")
                }
            }
        }.start()
    }
}
