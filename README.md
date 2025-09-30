Technical Offer Automation UI
A modern, responsive, and feature-rich front-end interface for managing the creation and revision of technical sales offers.

A preview of the project workspace in dark mode.

📖 Description
This application provides a user-friendly interface for sales engineers and managers to streamline the process of building complex technical proposals. It allows users to manage a catalog of products and clients, create new projects, add equipment with specific quantities and deviations, and track the history of an offer through a revision system.

The entire front end is built as a Single Page Application (SPA) with a mocked API that uses browser localStorage to persist data, allowing for a full-featured demonstration without a live backend.

✨ Features
Authentication: Secure login/logout flow with client-side session management.

Dashboard: A central hub to access key modules of the application.

CRUD Operations: Full Create, Read, Update, and Delete functionality for Products and Clients.

Project Management: Create projects, link them to clients, and manage associated documents (simulated).

Revision Control: Robust "Rev Up" system to create versioned copies of a technical offer, preserving history.

Dynamic Equipment Selection: A powerful modal to search, filter, and add multiple products to a project revision.

Deviation Management: Add and track client-specific deviations for any piece of equipment in an offer.

Asynchronous Job Simulation: User-friendly toast notifications to provide feedback for long-running tasks like document generation.

Theming: A beautiful and persistent light/dark mode theme switcher for user comfort.

Responsive Design: A clean and modern UI that works seamlessly across desktop, tablet, and mobile devices.

🛠️ Tech Stack & Libraries
This project is built with a modern, type-safe, and efficient technology stack:

Framework: Next.js (with App Router) & React

Language: TypeScript

Styling: Tailwind CSS

State Management:

Server State: TanStack Query (React Query) for data fetching, caching, and mutations.

UI State: Zustand for simple, lightweight global state (e.g., authentication).

Forms: React Hook Form with Zod for schema validation.

UI Components: Headless UI for fully accessible, unstyled primitives (Modals, Dropdowns).

Tables: TanStack Table for powerful and flexible data grids.

Icons: Lucide React for a consistent and clean icon set.

Notifications: React Hot Toast for elegant, non-blocking notifications.

Theming: next-themes for easy light/dark mode implementation.

🚀 Getting Started
Follow these instructions to get the project up and running on your local machine.

Prerequisites
You must have Node.js (version 18.x or later) and npm installed on your computer.

Installation & Setup
Clone the repository:

git clone <your-repository-url>

Navigate to the project directory:

cd technical-offer-app

Install all the required dependencies:
The package.json file included in this project lists all the necessary libraries. The simplest way to install them all is by running:

npm install

This single command will download and set up everything you need. For reference, the main libraries this command installs are listed below:

npm install @tanstack/react-query @tanstack/react-table zod @hookform/resolvers react-hook-form lucide-react @headlessui/react clsx tailwind-merge zustand react-dropzone react-hot-toast next-themes

Running the Application
Start the development server:

npm run dev

Open in your browser:
Once the server is running, open your web browser and navigate to http://localhost:3000. You should be greeted by the application's login page.

📂 Project Structure
The project follows a standard Next.js App Router structure, organized for clarity and scalability:

/
├── app/              # Main application pages and layouts
├── components/       # Reusable React components (UI, layout, modals)
├── hooks/            # Custom React hooks for data fetching and logic
├── lib/              # Helper functions and the mock API
├── store/            # Global state management stores (Zustand)
├── types/            # TypeScript type definitions for data models
├── public/           # Static assets like images and fonts
└── ...               # Configuration files

📜 Available Scripts
In the project directory, you can run:

npm run dev: Runs the app in development mode.

npm run build: Builds the app for production.

npm run start: Starts a production server.

npm run lint: Runs the linter to check for code quality issues.