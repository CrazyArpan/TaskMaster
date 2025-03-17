# Task Manager

A modern task management application built with Next.js, featuring authentication with Clerk and a clean, responsive UI.

## Features

- User authentication with Clerk
- Create, read, update, and delete tasks
- Task prioritization (Low, Medium, High)
- Due date scheduling
- Task status tracking
- Responsive design with dark/light mode support

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Clerk Authentication
- MongoDB
- Shadcn UI Components

## Getting Started

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd task-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   MONGODB_URI=your_mongodb_uri
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 