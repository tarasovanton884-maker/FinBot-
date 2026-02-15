// index.js - FinBot backend (GPT-3.5 Turbo)

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_KEY || "sk_test_fake");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY // <-- ключ берётся из переменной окружения Render
});

const app = express();
app.use(express.json());
app.use(cors());

// Простая in-memory база пользователей
let users = {}; // { email: { paid: true/false } }

// Главная страница
app.get("/", (req, res) => {
  res.send("FinBot server is running!");
});

// AI advice маршрут
app.post("/advice", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ advice: "Email is required" });

  const user = users[email] || { paid: false };

  try {
    const prompt = user.paid
      ? `You are a financial expert. Give an advanced financial advice to the user with email ${email}. Keep it in English.`
      : `You are a financial expert. Give a simple financial advice to the user with email ${email}. Keep it in English.`;

    // GPT-3.5 Turbo
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const aiAdvice = response.choices[0].message.content;

    const result = user.paid
      ? { advice: aiAdvice }
      : { advice: aiAdvice, note: "Subscribe to get premium advice" };

    res.json(result);

  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ advice: "AI error. Please try again later." });
  }
});

// Stripe подписка
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price: process.env.PRICE_ID || "price_test",
        quantity: 1
      }],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:19006"}?success=true&email=${email}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:19006"}?cancel=true`
    });

    if (!users[email]) users[email] = { paid: false };

    res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Stripe error" });
  }
});

// Тестовое подтверждение оплаты
app.post("/confirm", (req, res) => {
  const { email } = req.body;
  if (users[email]) users[email].paid = true;
  res.json({ success: true });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
