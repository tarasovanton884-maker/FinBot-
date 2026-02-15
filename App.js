import React, { useState } from "react";
import { View, Text, TextInput, Button, Linking, ScrollView, StyleSheet } from "react-native";

// Вставь сюда свой URL backend с Railway
const API_URL = "https://finbot-yf24.onrender.com";

export default function App() {
  const [email, setEmail] = useState("");
  const [adviceList, setAdviceList] = useState([]);
  const [status, setStatus] = useState("free"); // free / paid

  const getAdvice = async () => {
    if (!email) return alert("Введите Email");

    try {
      const res = await fetch(`${API_URL}/advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setAdviceList(prev => [...prev, data.advice]);
      setStatus(data.advice.includes("подпишись") ? "free" : "paid");
    } catch (err) {
      alert("Ошибка: не удалось получить совет");
    }
  };

  const subscribe = async () => {
    if (!email) return alert("Введите Email");

    try {
      const res = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.url) Linking.openURL(data.url); // Открываем Stripe checkout
    } catch (err) {
      alert("Ошибка: не удалось открыть подписку");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>FinBot AI советы</Text>
      <TextInput
        style={styles.input}
        placeholder="Ваш Email"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Получить совет" onPress={getAdvice} />
      <Button title="Подписаться" onPress={subscribe} color="#f39c12" style={{ marginTop: 10 }} />
      <Text style={styles.status}>Статус: {status.toUpperCase()}</Text>

      <View style={styles.adviceContainer}>
        {adviceList.map((a, i) => (
          <Text key={i} style={styles.advice}>• {a}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "stretch" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  status: { marginTop: 10, marginBottom: 10, fontWeight: "bold" },
  adviceContainer: { marginTop: 20 },
  advice: { marginBottom: 10, fontSize: 16 },
});
