
# 🌤️ Interactive Weather Data Dashboard

A responsive web app built with **Next.js**, **TypeScript**, and **Tailwind CSS** for visualizing historical weather data using the **Open-Meteo API** and **Recharts**.

---

## 🎬 Live Demo (Autoplay GIF)

<img src="/demo.gif" alt="Weather Dashboard Demo" width="100%" />



---

## ✨ Features

- Historical weather data for any location (defaults to Abuja, Nigeria)
- Selectable date ranges
- Interactive charts:
  - Max/Min temperature line chart
  - Precipitation bar chart
- Responsive design for mobile and desktop
- Loading indicators and error handling
- Built entirely with TypeScript
- Clean UI with Tailwind CSS

---

## 🛠️ Technologies Used

- **Next.js** — React framework
- **TypeScript** — static type checking
- **Tailwind CSS** — utility-first styling
- **Recharts** — data visualizations
- **Open-Meteo API** — free weather API

---

## 📂 Project Structure

```

my-weather-dashboard/
├── public/
│   └── demo.gif
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── styles/
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── README.md

```

---

## ⚙️ Installation

1. Create a Next.js project:

```

npx create-next-app\@latest my-weather-dashboard --typescript --eslint --tailwind --app

```

2. Install Recharts:

```

npm install recharts

```

3. Run the dev server:

```

npm run dev

```

---

## ▶️ Usage

- Open `http://localhost:3000`
- Use the date picker to choose a time range
- View interactive weather charts

---

## 🤝 Contributing

Fork, clone, create a branch, make your change, and submit a PR. Contributions welcome.

---

## 📄 License

MIT License. Free to use and modify.

---
```
