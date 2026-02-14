# Hantu Harga 👻

> **Community-powered price intel for Malaysia.**

[![Deployed on Vercel](https://vercel.com/button)](https://hantu-harga.vercel.app)

Scan receipts. Track real grocery prices. Stop overpaying.

## Demo

[Watch Demo Video](https://github.com/MuhdAqmarr/HantuHarga/raw/main/public/Video/HantuhargaCutted.mp4)

Malaysians spend 30-40% of their income on groceries — but there's no easy way to know if you're overpaying. The same item can cost RM2 more at a different store just down the road.

**HantuHarga** solves this by using AI (OpenAI GPT-4o) to extract every item and price from scanned receipts, crowdsourcing a live database so anyone can search, compare, and find the cheapest store in their area.

## ✨ Features

- **📸 AI Receipt Scanning** — Snap a photo, getting items, prices, and merchant details extracted instantly.
- **🔍 Price Search** — Search for any item (e.g. "Beras", "Telur") and see prices across different stores.
- **🛒 Basket Estimator** — Create a grocery list and see which store has the cheapest total basket price.
- **👥 Community Templates** — Share and use basket templates (e.g. "Student Survival Kit", "Mamak Starter Pack").
- **📍 Location-Based** — Compare prices specific to your area (e.g. Kuala Lumpur, Selangor).
- **📊 Price Intelligence** — Fuzzy matching links different names for the same product (e.g. "Maggi Kari" vs "Maggi 5x79g").

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Auth:** Supabase Auth
- **AI:** OpenAI GPT-4o (Receipt Parsing)
- **Styling:** Tailwind CSS + Radix UI
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- OpenAI API Key

### Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/MuhdAqmarr/HantuHarga.git
   cd HantuHarga
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and add your keys:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_key
   ```

4. Run local server:
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The core logic lives in Supabase:

- `canonical_items` — Master list of products
- `price_points` — Individual price records from receipts
- `merchants` — Stores and locations
- `basket_templates` — User-created grocery lists
- `scans` — Raw receipt scan logs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built by [maqmarx](https://maqmarx.vercel.app/) 👻
