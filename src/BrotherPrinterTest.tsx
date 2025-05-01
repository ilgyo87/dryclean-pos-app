import React, { useState } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import BrotherPrinter from './modules/BrotherPrinter';

export default function BrotherPrinterTest() {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [labelText, setLabelText] = useState('Test Label');
  const [labelWidth, setLabelWidth] = useState('62');
  const [labelHeight, setLabelHeight] = useState('29');

  const searchPrinters = async () => {
    setLoading(true);
    try {
      const result = await BrotherPrinter.searchPrinters();
      setPrinters(result.printers || []);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to search for printers');
    } finally {
      setLoading(false);
    }
  };

  const printLabel = async () => {
    if (!selectedPrinter) {
      Alert.alert('Select a printer first');
      return;
    }
    setLoading(true);
    try {
      const success = await BrotherPrinter.printLabel(
        selectedPrinter.ipAddress,
        labelText,
        parseInt(labelWidth, 10),
        parseInt(labelHeight, 10)
      );
      if (success) {
        Alert.alert('Success', 'Label sent to printer!');
      } else {
        Alert.alert('Failure', 'Failed to print label.');
      }
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to print label');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title={loading ? 'Searching...' : 'Search for Printers'} onPress={searchPrinters} disabled={loading} />
      <FlatList
        data={printers}
        keyExtractor={item => item.ipAddress}
        renderItem={({ item }) => (
          <View style={styles.printerItem}>
            <Text style={{ fontWeight: selectedPrinter?.ipAddress === item.ipAddress ? 'bold' : 'normal' }}>
              {item.name} ({item.model}) - {item.ipAddress}
            </Text>
            <Button
              title={selectedPrinter?.ipAddress === item.ipAddress ? 'Selected' : 'Select'}
              onPress={() => setSelectedPrinter(item)}
              disabled={selectedPrinter?.ipAddress === item.ipAddress}
            />
          </View>
        )}
        ListEmptyComponent={!loading && <Text style={{ marginTop: 16 }}>No printers found.</Text>}
        style={{ marginVertical: 16 }}
      />
      <TextInput
        style={styles.input}
        value={labelText}
        onChangeText={setLabelText}
        placeholder="Label Text"
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          value={labelWidth}
          onChangeText={setLabelWidth}
          placeholder="Width (mm)"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={labelHeight}
          onChangeText={setLabelHeight}
          placeholder="Height (mm)"
          keyboardType="numeric"
        />
      </View>
      <Button title={loading ? 'Printing...' : 'Print Label'} onPress={printLabel} disabled={loading || !selectedPrinter} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  printerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
});
