import os
import requests

from dotenv import load_dotenv

from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

# Load environment variables
load_dotenv()

# Telegram Bot Token
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# Your deployed backend API
BACKEND_URL = "https://gramsahay-ai-backend.onrender.com/api/chat"


# Start command
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome_message = (
        "🙏 Welcome to GramSahay AI\n\n"
        "I can help you with:\n"
        "• Farmer Schemes\n"
        "• Student Scholarships\n"
        "• Pension Schemes\n"
        "• Health Insurance\n"
        "• Women Welfare\n"
        "• AI Guidance\n\n"
        "You can chat in English or Telugu."
    )

    await update.message.reply_text(welcome_message)


# Handle user messages
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = update.message.text

    try:
        payload = {
            "message": user_message,
            "language": "te" if any(ord(c) > 127 for c in user_message) else "en"
        }

        response = requests.post(BACKEND_URL, json=payload)

        data = response.json()

        bot_reply = (
            data.get("response")
            or data.get("reply")
            or "Sorry, I could not process your request."
        )

        await update.message.reply_text(bot_reply)

    except Exception as e:
        print("Telegram Bot Error:", e)

        await update.message.reply_text(
            "⚠️ Server temporarily unavailable."
        )


# Main
if __name__ == "__main__":
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    # Start command
    app.add_handler(CommandHandler("start", start))

    # Message handler
    app.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)
    )

    print("✅ GramSahay Telegram Bot Running...")

    app.run_polling()