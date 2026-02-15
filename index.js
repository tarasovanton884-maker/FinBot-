const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_KEY || "sk_test_fake");
const app = express();

app.use(express.json());
app.use(cors());

// Мок база пользователей
let users = {}; // { email: { paid: true/false } }

// Советы
app.post("/advice", async (req, res) => {
  const { email } = req.body;
  const user = users[email] || { paid: false };

  try {
    // Формируем подсказку для AI
    const prompt = user.paid
      ? `Ты финансовый эксперт. Дай продвинутый финансовый совет пользователю с email ${email}.`
      : `Ты финансовый эксперт. Дай простой бесплатный финансовый совет пользователю с email ${email}.`;

    // Запрос к OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const aiAdvice = response.choices[0].message.content;

    // Отправляем ответ
    const result = user.paid
      ? { advice: aiAdvice }
      : { advice: aiAdvice, note: "Подпишись, чтобы получать премиум советы" };

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ advice: "Ошибка AI. Попробуйте позже." });
  }
});

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


