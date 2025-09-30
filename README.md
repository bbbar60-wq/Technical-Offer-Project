# 🚀 Technical Offer Automation UI

A **modern, responsive, and feature-rich front-end interface** for managing the creation and revision of technical sales offers.

> A sneak peek of the project workspace in **dark mode**.

---

## 📖 Overview

This application provides a **user-friendly interface** for sales engineers and managers to **streamline the process of building complex technical proposals**.

Key capabilities include:

* Managing a catalog of products and clients
* Creating new projects and linking them to clients
* Adding equipment with specific quantities and deviations
* Tracking the history of an offer through a **robust revision system**

The front-end is built as a **Single Page Application (SPA)** with a **mocked API** that uses `localStorage` to persist data, allowing a **fully functional demo without a live backend**.

---

## ✨ Features

* **Authentication**: Secure login/logout flow with client-side session management.
* **Dashboard**: Central hub to access all key modules.
* **CRUD Operations**: Create, Read, Update, Delete for Products and Clients.
* **Project Management**: Create projects, link to clients, and manage associated documents (simulated).
* **Revision Control**: "Rev Up" system to create **versioned copies** of offers, preserving full history.
* **Dynamic Equipment Selection**: Powerful modal to **search, filter, and add multiple products** to a project revision.
* **Deviation Management**: Track client-specific deviations for any equipment.
* **Asynchronous Job Simulation**: Elegant toast notifications for long-running tasks like document generation.
* **Theming**: Light/Dark mode switcher with persistent user preference.
* **Responsive Design**: Clean, modern UI across desktop, tablet, and mobile.

---

## 🛠️ Tech Stack & Libraries

**Framework & Language**

* **Next.js (App Router)** + **React**
* **TypeScript**

**Styling & UI**

* **Tailwind CSS**
* **Headless UI** (accessible primitives: Modals, Dropdowns)
* **Lucide React** (icons)
* **next-themes** (light/dark mode)

**State Management**

* **TanStack Query** (server state: data fetching, caching, mutations)
* **Zustand** (global UI state, e.g., authentication)

**Forms & Validation**

* **React Hook Form** + **Zod**

**Tables & Notifications**

* **TanStack Table** (data grids)
* **React Hot Toast** (non-blocking notifications)

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** ≥ 18.x
* **npm**

### Installation

1. Clone the repository:

```bash
git clone <your-repository-url>
cd technical-offer-app
```

2. Install dependencies:

```bash
npm install
```

**Main libraries included:**
`@tanstack/react-query`, `@tanstack/react-table`, `zod`, `@hookform/resolvers`, `react-hook-form`, `lucide-react`, `@headlessui/react`, `clsx`, `tailwind-merge`, `zustand`, `react-dropzone`, `react-hot-toast`, `next-themes`

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the login page.

---

## 📂 Project Structure

```
/
├── app/           # Main pages and layouts
├── components/    # Reusable UI components
├── hooks/         # Custom hooks
├── lib/           # Helper functions & mock API
├── store/         # Zustand global state
├── types/         # TypeScript models
├── public/        # Static assets (images, fonts)
└── ...            # Config files
```

---

## 📜 Available Scripts

* `npm run dev` — Start the app in development mode
* `npm run build` — Build for production
* `npm run start` — Start the production server
* `npm run lint` — Check code quality
