const express = require("express");
const axios = require("axios");
const line = require("@line/bot-sdk");

const app = express();
app.use(express.json());

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);

app.post("/webhook", async (req, res) => {
  try {
    const event = req.body.events?.[0];
    if (!event || !event.message || !event.replyToken) return res.sendStatus(200);

    const userMessage = event.message.text;
    const replyToken = event.replyToken;

    const response = await axios.post(
      "https://api.dify.ai/v1/chat-messages",
      {
        inputs: {},
        query: userMessage,
        user: event.source.userId // ユーザー識別子
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const botReply = response.data.answer || "ご返信を取得できませんでした。";

    await client.replyMessage(replyToken, {
      type: "text",
      text: botReply
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("エラー:", error);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("LINE × Dify Webhook Server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
