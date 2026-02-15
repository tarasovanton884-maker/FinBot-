import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';

const API_URL = "https://finbot-yf24.onrender.com"; 

export default function App() {
  const [email, setEmail] = useState("");
  const [advice, setAdvice] = useState("");
  const [note, setNote] = useState("");

  const getAdvice = async () => {
    if (!email) return Alert.alert("Enter your email");

    try {
      const res = await fetch(`${API_URL}/advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setAdvice(data.advice);
      setNote(data.note || "");
    } catch (err) {
      Alert.alert("Server error");
    }
  };

  const subscribe = async () => {
    if (!email) return Alert.alert("Enter your email");
    try {
      const res = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      Alert.alert("Subscription", `Follow this link to pay:\n${data.url}`);
    } catch (err) {
      Alert.alert("Stripe error");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>FinBot 💰</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={getAdvice}>
        <Text style={styles.buttonText}>Get Advice</Text>
      </TouchableOpacity>

      {advice ? (
        <View style={styles.adviceBox}>
          <Text style={styles.adviceText}>{advice}</Text>
          {note ? <Text style={styles.note}>{note}</Text> : null}
        </View>
      ) : null}

      <TouchableOpacity style={[styles.button, styles.subscribe]} onPress={subscribe}>
        <Text style={styles.buttonText}>Subscribe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', padding: 10, borderWidth: 1, borderColor: '#555', borderRadius: 8, marginBottom: 20 },
  button: { backgroundColor: '#1e90ff', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 10 },
  subscribe: { backgroundColor: '#32cd32' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  adviceBox: { marginTop: 20, padding: 15, borderWidth: 1, borderColor: '#aaa', borderRadius: 8, backgroundColor: '#f0f8ff' },
  adviceText: { fontSize: 16, marginBottom: 10 },
  note: { fontSize: 14, color: '#ff4500', fontWeight: 'bold' }
});
