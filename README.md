# ExeatTrack: MTU Exeat Management System

A modern, streamlined application for managing student exeat requests at Mountain Top University (MTU). Built with Next.js and Firebase, it provides distinct portals for students and staff to handle the entire exeat lifecycle, from submission to final approval and verification.

## Core Features

-   **Student Portal**: Students can sign up, log in, and submit detailed exeat requests, including purpose, dates, and consent documents.
-   **Multi-Step Approval Workflow**: Role-based dashboards for Porters, Heads of Department (HODs), and the Dean of Student Affairs (DSA) to review, comment on, and approve or decline requests sequentially.
-   **Unique Exeat ID & Printable Permit**: Generates a unique ID for each request and allows for a printable PDF permit upon final approval, complete with an approval trail and QR code.
-   **Public Verification Portal**: A simple verification system on the landing page where anyone can enter an Exeat ID to confirm its authenticity and status.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **UI Library**: React
-   **Components**: ShadCN UI
-   **Styling**: Tailwind CSS
-   **Authentication**: Firebase Authentication
-   **Database (Simulated)**: In-memory mock API (`src/lib/mockApi.ts`). Can be extended to use Firestore.
-   **AI (Optional)**: Genkit for potential future AI features.

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### 2. Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### 3. Firebase Setup (Crucial!)

This project uses Firebase for user authentication. You **must** configure it to run the application.

1.  **Create a Firebase Project**: If you don't have one, create a new project at the [Firebase Console](https://console.firebase.google.com/).
2.  **Add a Web App**: In your project's settings, add a new web application.
3.  **Get Credentials**: Firebase will provide you with a `firebaseConfig` object. Copy these credentials.
4.  **Update Config File**: Paste your credentials into the `src/lib/firebase.ts` file, replacing the placeholder values.

    ```typescript
    // src/lib/firebase.ts
    const firebaseConfig = {
      apiKey: "YOUR_ACTUAL_API_KEY",
      authDomain: "YOUR_PROJECT.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```

5.  **Enable Authentication**: In the Firebase Console, navigate to **Authentication** -> **Sign-in method** and enable the **Email/Password** provider.

### 4. Run the Development Server

Once Firebase is configured, start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or another port if 3000 is busy).

## Available Scripts

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build`: Creates a production build of the application.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Lints the code for errors and style issues.

## User Roles & Credentials

The system comes with pre-seeded mock user data. The default password for these users is **`password`**. You can also sign up as a new student.

-   **Student**:
    -   Email: `student1@mtu.edu.ng`
    -   Password: `password`
-   **Porter**:
    -   Email: `porter1@mtu.edu.ng`
    -   Password: `password`
-   **HOD (Head of Department)**:
    -   Email: `hod1@mtu.edu.ng`
    -   Password: `password`
-   **DSA (Dean of Student Affairs)**:
    -   Email: `dsa1@mtu.edu.ng`
    -   Password: `password`

## Project Structure

-   `src/app/`: Contains the pages and layouts using the Next.js App Router.
    -   `(auth)`: Route group for login/signup pages.
    -   `(main)`: Route group for all authenticated pages.
-   `src/components/`: Reusable React components.
    -   `core/`: Essential components like Header, Logo, Sidebar.
    -   `forms/`: Form components.
    -   `ui/`: ShadCN UI components.
-   `src/hooks/`: Custom React hooks, like `useAuth.ts` for authentication.
-   `src/lib/`: Core logic, types, and utilities.
    -   `firebase.ts`: Firebase configuration and initialization.
    -   `mockApi.ts`: Simulates a backend database for user profiles and exeat requests.
    -   `types.ts`: TypeScript type definitions for the application.
    -   `utils.ts`: Utility functions.
-   `public/`: Static assets.
