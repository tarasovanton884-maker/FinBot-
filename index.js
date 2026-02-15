// index.js - FinBot backend

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_KEY || "sk_test_fake");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

const app = express();
app.use(express.json());
app.use(cors());

// Simple in-memory user database
let users = {}; // { email: { paid: true/false } }

// Home route
app.get("/", (req, res) => {
  res.send("FinBot server is running!");
});

// AI advice route
app.post("/advice", async (req, res) => {
  const { email } = req.body;
  const user = users[email] || { paid: false };

  try {
    // Prompt in English
    const prompt = user.paid
      ? `You are a financial expert. Give an advanced financial advice to the user with email ${email}. Keep it in English.`
      : `You are a financial expert. Give a simple financial advice to the user with email ${email}. Keep it in English.`;

    // Request OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const aiAdvice = response.choices[0].message.content;

    const result = user.paid
      ? { advice: aiAdvice }
      : { advice: aiAdvice, note: "Subscribe to get premium advice" };

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ advice: "AI error. Please try again later." });
  }
});

// Stripe subscription
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

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

  // Mark user as unpaid until confirmed
  if (!users[email]) users[email] = { paid: false };

  res.json({ url: session.url });
});

// Test confirm payment route
app.post("/confirm", (req, res) => {
  const { email } = req.body;
  if (users[email]) users[email].paid = true;
  res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

