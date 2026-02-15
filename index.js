const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const app = express();

app.use(express.json());
app.use(cors());

// Мок база пользователей в памяти для теста
let users = {}; // { email: { paid: true/false } }

// Тестовый маршрут
app.get("/", (req, res) => {
  res.send("FinBot сервер работает!");
});

// AI advice маршрут
app.post("/advice", (req, res) => {
  const { email } = req.body;
  const user = users[email] || { paid: false };

  if (!user.paid) {
    return res.json({ advice: "Только для бесплатных пользователей: подпишись, чтобы получить премиум советы." });
  }

  // Пример AI-совета (потом подключим OpenAI)
  const advice = "Ваш портфель в порядке, можно рассмотреть диверсификацию с ETF.";
  res.json({ advice });
});

// Создать Stripe checkout session
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price: process.env.PRICE_ID, // твой Price ID из Stripe
      quantity: 1
    }],
    mode: "subscription",
    success_url: `${process.env.FRONTEND_URL}?success=true&email=${email}`,
    cancel_url: `${process.env.FRONTEND_URL}?cancel=true`
  });

  // создаём запись пользователя как unpaid
  if (!users[email]) users[email] = { paid: false };

  res.json({ url: session.url });
});

// Проверка подписки (псевдо, для теста)
app.post("/confirm", (req, res) => {
  const { email } = req.body;
  if (users[email]) users[email].paid = true;
  res.json({ success: true });
});

// Порт от хостинга или локально
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
