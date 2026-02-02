# Connectibles

**Connect. Collaborate. Create.**

Connectibles is a vibrant social platform designed to help students discover their tribe, collaborate on projects, and build meaningful connections. Whether you're looking for a study buddy, a project partner, or just someone to chill with, Connectibles brings your community to your fingertips.

## Features

### 🤝 Smart Matching
Discover people who share your passions and interests. Our intelligent matching system helps you find the right connections for collaboration or friendship.

### 💬 Real-Time Chat
Engage in meaningful conversations instantly. Connect with your matches and community through our seamless, real-time messaging system.

### 🎭 Interactive Games
Take a break and have fun! Challenge your friends to multiplayer games like **Truth or Dare** and track your achievements on the leaderboard.

### 🔒 Anonymous Confessions
A safe, judgment-free space to share your thoughts. Post confessions anonymously and interact with the community in a secure environment.

### 📅 Community Events
Never miss out on what's happening. Discover, create, and join events to bring your community together, from study sessions to social gatherings.

### ✨ Dynamic User Profiles
Showcase your personality with detailed profiles including your interests, skills, and social links.

## Tech Stack

Connectibles is built with a modern, high-performance tech stack:

### Frontend
-   **React 19**: The latest version of the library for building user interfaces.
-   **Vite**: Next-generation frontend tooling for lightning-fast development.
-   **TypeScript**: For type-safe, maintainable code.
-   **Tailwind CSS 4**: Utility-first CSS framework for rapid and beautiful UI design.
-   **Framer Motion**: Production-ready motion library for React to create stunning animations.
-   **Three.js / React Three Fiber**: For immersive 3D graphics and experiences.

### Backend & Database
-   **Convex**: The open-source, reactive backend-as-a-service. It handles our real-time database, authentication, file storage, and serverless functions seamlessly.

### UI Components
-   **Radix UI**: Unstyled, accessible components for building high-quality design systems.
-   **Lucide React**: Beautiful & consistent icons.
-   **Sonner**: An opinionated toast component for React.
-   **Vaul**: A drawer component for React.

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites
-   Node.js (v18 or higher recommended)
-   npm or pnpm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Sparkyyy45/connectibles.git
    cd connectibles
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Setup Convex**
    Initialize your Convex backend project:
    ```bash
    npx convex dev
    ```
    This command will guide you through logging in and setting up your project. It will also generate the necessary environment variables.

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    The application should now be running at `http://localhost:5173`.

## Project Structure

-   **`src/components`**: Reusable UI components.
-   **`src/convex`**: Backend functions, schemas, and database logic (Convex).
-   **`src/pages`**: Main application pages (Landing, Dashboard, Profile, etc.).
-   **`src/hooks`**: Custom React hooks (including authentication).
-   **`src/lib`**: Utility functions and configurations.

## Author

**Suyash Yadav**
-   [GitHub](https://github.com/Sparkyyy45)
-   [LinkedIn](https://www.linkedin.com/in/suyash-yadav-b63251378)
-   [Instagram](https://www.instagram.com/suyash.yadv/)

---
*Built with ❤️ for the community.*
