# ✨ Saha AI – Intelligent Note-Taking App

Saha AI is a modern, beautifully designed, AI-assisted note-taking application that helps you write and summarize notes effortlessly. Built with **React**, **Supabase**, and **OpenAI**, it brings productivity and simplicity together in one clean interface.

---

## 🔥 Features

- 📝 Create and manage multiple notes
- 🎨 Clean, responsive UI with Tailwind & Radix UI
- 💡 One-click AI-powered summaries using OpenAI
- 🔄 Real-time note syncing via Supabase
- 🔐 Email/password authentication
- 🧠 Smart save feedback and toast notifications

---

## ⚙️ Getting Started

### 🚀 Clone, Install, Setup, and Run

```bash
# 1. Clone the repository
git clone https://github.com/kamojjalaShivani/AI-Collaborative--Notes-App.git
cd project

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create a .env file at the root and add:
# (Replace these with your actual keys)
echo "VITE_SUPABASE_URL=your-supabase-url" >> .env
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env
echo "VITE_OPENAI_API_KEY=your-openai-api-key" >> .env

# 4. Set up the 'notes' table in Supabase SQL editor:
# Paste this SQL and run it:
# ------------------------------------------
# create table notes (
#   id uuid primary key default uuid_generate_v4(),
#   user_id uuid references auth.users not null,
#   title text,
#   content text,
#   summary text,
#   created_at timestamp default now(),
#   updated_at timestamp default now()
# );
# ------------------------------------------

# 5. Run the app
npm run dev
