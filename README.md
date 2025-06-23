
# ExeatTrack: MTU Exeat Management System

![Project Banner](https://placehold.co/1200x400.png?text=ExeatTrack)

**ExeatTrack** is a modern, full-stack web application designed to digitize and streamline the student exeat (leave of absence) process at Mountain Top University (MTU). It replaces a manual, paper-based system with an efficient, transparent, and secure digital workflow, benefiting students and administrative staff alike.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg?logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-9-orange.svg?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-cyan.svg?logo=tailwind-css)](https://tailwindcss.com/)

---

## The Problem

Traditionally, applying for an exeat at MTU involved a cumbersome, multi-step paper process. Students had to manually fill out forms, get signatures from various departments, and physically track their application's progress. This system was prone to delays, lost paperwork, and a lack of transparency for both students and staff.

## The Solution

ExeatTrack provides a centralized digital platform with distinct, role-based portals for everyone involved in the exeat lifecycle:

-   **Students**: Can easily submit and track exeat requests online.
-   **Porters, HODs, DSA**: Can review, comment on, and approve or deny requests in a clear, sequential workflow.

The system enhances efficiency, ensures accountability, and provides real-time visibility into the status of every request.

---

## Key Features

-   **👨‍🎓 Student Portal**: Intuitive dashboard for students to submit detailed exeat requests, upload consent documents, and monitor the status of their applications in real-time.
-   **🗂️ Staff Portals (Porter, HOD, DSA)**: Dedicated dashboards for each administrative role, showing only the requests that require their specific action.
-   **➡️ Sequential Approval Workflow**: A robust, multi-step approval process. Requests move from Porter to Head of Department (HOD) and finally to the Dean of Student Affairs (DSA) for final sign-off.
-   **🆔 Unique Exeat ID & Printable Permit**: Upon final approval, a unique ID and a printable PDF permit are generated. The permit includes an approval trail and a QR code for easy verification.
-   **🛡️ Public Verification Portal**: A landing page feature allowing security personnel or parents to enter an Exeat ID and instantly verify its authenticity and current status.
-   **🔐 Secure Authentication**: Built with Firebase Authentication, ensuring that only authorized users can access the system.
-   **📝 Profile Management**: All users can update their profile information and change their passwords.

---

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **UI Library**: React
-   **Components**: ShadCN UI
-   **Styling**: Tailwind CSS
-   **Authentication**: Firebase Authentication
-   **Database**: Google Firestore (for users and exeat requests)
-   **AI (Optional)**: Genkit for potential future AI features.

---

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   A Google Account for Firebase

### 2. Installation & Setup

Clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/witdaemma/EXEATSYSTEM.git
cd EXEATSYSTEM
npm install
```

### 3. Firebase Configuration (Crucial!)

This project relies heavily on Firebase for authentication and database services. You **must** configure it to run the application.

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Add a Web App**: In your project's settings (click the gear icon ⚙️), add a new web application.
3.  **Get Credentials**: Firebase will provide you with a `firebaseConfig` object. Copy these credentials.
4.  **Update Config File**: Open `src/lib/firebase.ts` and paste your credentials, replacing the placeholder values.

    ```typescript
    // src/lib/firebase.ts
    const firebaseConfig = {
      apiKey: "YOUR_ACTUAL_API_KEY",
      authDomain: "YOUR_PROJECT.firebaseapp.com",
      // ... and so on
    };
    ```

5.  **Enable Authentication**: In the Firebase Console, navigate to **Authentication** -> **Sign-in method** and enable the **Email/Password** provider.
6.  **Set Up Firestore**:
    -   Navigate to **Firestore Database** and click **Create database**.
    -   Start in **production mode** (it's more secure).
    -   Choose a location for your database.
7.  **Add Security Rules**:
    -   Go to the **Rules** tab in the Firestore Database section.
    -   Replace the default rules with the contents of the `firestore.rules` file from this repository. This is essential for the app to work correctly.
    -   Click **Publish**.

### 4. Run the Development Server

Once Firebase is configured, start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## User Roles & Credentials

The system is designed to work with pre-seeded staff data. You can create this data in your Firestore `users` collection. The password for all users below is **`password`**.

-   **Student**:
    -   *Sign up for a new account through the UI using an `@mtu.edu.ng` email.*
-   **Porter**:
    -   Email: `porter1@mtu.edu.ng`
-   **HOD (Head of Department)**:
    -   Email: `hod1@mtu.edu.ng`
-   **DSA (Dean of Student Affairs)**:
    -   Email: `dsa1@mtu.edu.ng`

*Note: For staff accounts, you need to create their profiles in your Firestore `users` collection first. The system will link their Firebase Auth account on their first login.*

---

## Contributing

Contributions are welcome! If you have suggestions for improvements or find a bug, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

This project is distributed under the MIT License. See `LICENSE` for more information.

---
*Developed for the MTU community.*
