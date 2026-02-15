const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_KEY || "sk_test_fake");
const app = express();

app.use(express.json());
app.use(cors());

// Мок база пользователей
let users = {}; // { email: { paid: true/false } }

// Советы
const adviceFree = [
  "Бесплатный совет: следите за расходами каждый день",
  "Бесплатный совет: делайте ежемесячный бюджет",
  "Бесплатный совет: откладывайте хотя бы 10% дохода"
];

const advicePremium = [
  "Премиум: рассмотрите инвестиции в ETF на американском рынке",
  "Премиум: диверсифицируйте портфель, включая криптовалюту",
  "Премиум: используйте стратегию DCA для долгосрочных инвестиций"
];

// Главная
app.get("/", (req, res) => {
  res.send("FinBot сервер работает!");
});

// AI advice
app.post("/advice", (req, res) => {
  const { email } = req.body;
  const user = users[email] || { paid: false };

  // Бесплатный совет всегда
  const freeTip = adviceFree[Math.floor(Math.random() * adviceFree.length)];

  if (!user.paid) {
    return res.json({ advice: freeTip, note: "Подпишись, чтобы получать премиум советы" });
  }

  // Премиум совет для платных пользователей
  const premiumTip = advicePremium[Math.floor(Math.random() * advicePremium.length)];
  res.json({ advice: premiumTip });
});

// Создать Stripe checkout session
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

  if (!users[email]) users[email] = { paid: false };
  res.json({ url: session.url });
});

// Тестовое подтверждение оплаты (для проверки)
app.post("/confirm", (req, res) => {
  const { email } = req.body;
  if (users[email]) users[email].paid = true;
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});


