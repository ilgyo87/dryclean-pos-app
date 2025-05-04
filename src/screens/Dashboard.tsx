// src/screens/Dashboard.tsx
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import React, { useState } from 'react';
import { NativeModules, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  checkPrinterConnection,
  getDummyPrinters,
  getLastError,
  printSample,
  printToIP,
  search,
  addListener,
  BrotherPrintEvents,
  BRLMPrinterPort,
  BRLMPrinterModelName,
  BRLMPrinterLabelName,
  printImage
} from '../services/BrotherPrinter';


const Dashboard = () => {
  const { signOut, user } = useAuthenticator();
  const [result, setResult] = useState<string>('');
  const [dummyPrinters, setDummyPrinters] = useState<any[]>([]);
  const [ipInput, setIpInput] = useState<string>('');
  const [showIpPrompt, setShowIpPrompt] = useState<'check'|'print'|null>(null);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const listenerHandles = React.useRef<any[]>([]);

  // No searchListener or setSearchListener needed
  React.useEffect(() => {
    // Add event listeners for print events and discovery
    listenerHandles.current.push(
      addListener(BrotherPrintEvents.PRINT_SUCCESS, () => {
        setResult(r => r + '\n[onPrint] Print succeeded');
      })
    );
    listenerHandles.current.push(
      addListener(BrotherPrintEvents.PRINT_ERROR, info => {
        setResult(r => r + `\n[onPrintError] ${JSON.stringify(info)}`);
      })
    );
    listenerHandles.current.push(
      addListener(BrotherPrintEvents.PRINT_FAILED_COMMUNICATION, info => {
        setResult(r => r + `\n[onPrintFailedCommunication] ${JSON.stringify(info)}`);
      })
    );
    listenerHandles.current.push(
      addListener(BrotherPrintEvents.PRINTER_AVAILABLE, printer => {
        setDiscoveredPrinters(prev => {
          if (prev.some(p => p.channelInfo === printer.channelInfo)) return prev;
          return [...prev, printer];
        });
        setResult(r => r + `\n[onPrinterAvailable] ${printer.modelName} (${printer.channelInfo})`);
      })
    );
    return () => {
      listenerHandles.current.forEach(h => h?.remove?.());
      listenerHandles.current = [];
    };
  }, []);

  // Handler for dummy printers (dev only)
  const handleListDummyPrinters = async () => {
    setResult('');
    try {
      const printers = await getDummyPrinters();
      setDummyPrinters(printers);
      setResult('Dummy printers loaded.');
    } catch (e) {
      setResult('Error loading dummy printers: ' + (e as any)?.message || String(e));
    }
  };

  // Handler for network printer discovery
  const handleSearchPrinters = async () => {
    setResult('');
    setDiscoveredPrinters([]);
    setIsSearching(true);
    // Add a temporary listener for this search session
    const listener = addListener(BrotherPrintEvents.PRINTER_AVAILABLE, (printer: any) => {
      setDiscoveredPrinters(prev => {
        // Avoid duplicates by IP
        if (prev.some(p => p.channelInfo === printer.channelInfo)) return prev;
        return [...prev, printer];
      });
    });
    listenerHandles.current.push(listener);
    try {
      await search({ port: BRLMPrinterPort.WIFI, searchDuration: 10 });
      setResult('Searching for network printers...');
      // End search after 12 seconds
      setTimeout(() => {
        setIsSearching(false);
        if (listener) listener.remove();
        setResult('Network printer search finished.');
      }, 12000);
    } catch (e) {
      setIsSearching(false);
      if (listener) listener.remove();
      setResult('Network printer search failed: ' + (e as any)?.message || String(e));
    }
  };


  // Handler for printSample
  const handlePrintSample = async () => {
    setResult('');
    try {
      const res = await printSample();
      setResult('Print sample result: ' + res);
    } catch (e) {
      setResult('Print sample error: ' + (e as any)?.message || String(e));
    }
  };

  // Handler for checkPrinterConnection
  const handleCheckPrinterConnection = async (ip: string) => {
    setResult('');
    try {
      const ok = await checkPrinterConnection(ip);
      setResult(ok ? `Printer at ${ip} is reachable.` : `Printer at ${ip} is not reachable.`);
    } catch (e) {
      setResult('Check connection error: ' + (e as any)?.message || String(e));
    }
  };

  // Handler for printToIP
  const handlePrintToIP = async (ip: string) => {
    setResult('');
    try {
      const res = await printToIP(ip);
      setResult('Print to IP result: ' + res);
    } catch (e) {
      setResult('Print to IP error: ' + (e as any)?.message || String(e));
    }
  };

  // Handler for getLastError
  const handleGetLastError = async () => {
    setResult('');
    try {
      const err = await getLastError();
      setResult('Last Error: ' + err);
    } catch (e) {
      setResult('Get last error failed: ' + (e as any)?.message || String(e));
    }
  };



  // Render IP prompt
  const renderIpPrompt = () => (
    <View style={styles.promptOverlay}>
      <View style={styles.promptBox}>
        <Text style={styles.promptTitle}>{showIpPrompt === 'check' ? 'Check Printer Connection (WiFi/IP)' : 'Print to Printer (WiFi/IP)'}</Text>
        <Text style={{marginBottom: 8}}>Enter Printer IP Address (e.g. 192.168.1.100):</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <TextInput
            style={{
              flex: 1,
              padding: 8,
              fontSize: 16,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: '#ccc',
              marginBottom: 8,
            }}
            value={ipInput}
            onChangeText={setIpInput}
            placeholder="e.g. 192.168.1.100"
            autoCapitalize="none"
            keyboardType="numeric"
          />
        </View>
        <View style={{flexDirection:'row',marginTop:12,justifyContent:'flex-end'}}>
          <TouchableOpacity style={styles.promptButton} onPress={() => setShowIpPrompt(null)}>
            <Text style={styles.promptButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.promptButton,{backgroundColor:'#27ae60',marginLeft:8}]}
            onPress={() => {
              if (showIpPrompt === 'check') handleCheckPrinterConnection(ipInput);
              else if (showIpPrompt === 'print') handlePrintToIP(ipInput);
              setShowIpPrompt(null);
            }}>
            <Text style={[styles.promptButtonText,{color:'white'}]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Dryclean POS Dashboard</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.welcomeText}>Welcome, {user?.username || 'User'}!</Text>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>New Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Pickup Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handlePrintSample}>
          <Text style={styles.menuItemText}>Print Test Sample (WiFi/IP)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={async () => {
          if (discoveredPrinters.length === 0) {
            setResult(r => r + '\nNo discovered printer to print to.');
            return;
          }
          const printer = discoveredPrinters[0];
          const defaultPrintSettings = {
            modelName: BRLMPrinterModelName.QL_820NWB,
            labelName: BRLMPrinterLabelName.RollW62,
            encodedImage: 'base64 removed mime-type', // TODO: Replace with actual base64 image
            numberOfCopies: 1,
            autoCut: true,
            port: printer.port,
            channelInfo: printer.channelInfo,
          };
          setResult(r => r + `\nSending print job to ${printer.modelName} (${printer.channelInfo})...`);
          try {
            await printImage(defaultPrintSettings);
          } catch (e) {
            setResult(r => r + `\nprintImage error: ${(e as any)?.message || String(e)}`);
          }
        }}>
          <Text style={styles.menuItemText}>Print Sample to First Printer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSearchPrinters} disabled={isSearching}>
          <Text style={styles.menuItemText}>{isSearching ? 'Searching...' : 'Find Network Printers'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => {setIpInput('');setShowIpPrompt('check');}}>
          <Text style={styles.menuItemText}>Check Printer Connection (WiFi/IP)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => {setIpInput('');setShowIpPrompt('print');}}>
          <Text style={styles.menuItemText}>Print to Printer (WiFi/IP)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleGetLastError}>
          <Text style={styles.menuItemText}>Show Last Error</Text>
        </TouchableOpacity>
      </View>

      {discoveredPrinters.length > 0 && (
        <View style={styles.printerListBox}>
          <Text style={{fontWeight:'bold',marginBottom:4}}>Discovered Network Printers:</Text>
          {discoveredPrinters.map((printer, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                setIpInput(printer.channelInfo);
                setShowIpPrompt('print');
              }}
              style={{paddingVertical: 6}}
            >
              <Text style={{fontSize:14, color:'#34495e'}}>
                {printer.modelName} ({printer.channelInfo}) SN: {printer.serialNumber} [{printer.nodeName}]
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {result ? (
        <View style={styles.resultBox}>
          <Text style={{color:'#2c3e50'}}>{result}</Text>
        </View>
      ) : null}

      {showIpPrompt && renderIpPrompt()}
    </View>
  );
};

const styles = StyleSheet.create({
  printerListBox: {
    backgroundColor: '#f9f9f9',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  resultBox: {
    backgroundColor: '#eafaf1',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1f2eb',
  },
  promptOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  promptBox: {
    width: 320,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  promptTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 8,
    color: '#2c3e50',
  },
  promptButton: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  promptButtonText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2c3e50',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2c3e50',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userInfo: {
    padding: 16,
    backgroundColor: '#ecf0f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  welcomeText: {
    fontSize: 18,
    color: '#2c3e50',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  menuItem: {
    width: '26%',
    backgroundColor: 'white',
    margin: '2%',
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
  },

});

export default Dashboard;