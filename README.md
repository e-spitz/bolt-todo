# Bolt To-Do App

A minimal To-Do application built with React, TypeScript, and Supabase. This project demonstrates user authentication, task management (create, read, update, delete), sorting of tasks by due dates or priority, and a calendar view for tasks with due dates.

## Features

**User Authentication**: Sign up and sign in using email and password.
**Task Management**: Add, view, edit, mark as complete, and delete tasks.
**Task Details**: Each task can have a title, description, priority (low, medium, high), and a due date.
**Task Filtering**: View incomplete tasks, completed tasks, and tasks organized by date in a calendar view.
**Responsive Design**: Built with Tailwind CSS for a clean and responsive user interface.
**Toast Notifications**: User feedback for actions like adding or deleting tasks.

## Getting Started

Follow these steps to get a local copy of the project up and running on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (LTS version recommended)
*   npm or Yarn
*   Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd bolt-todo
    ```
    *(Note: If you are sharing your Bolt project directly, you might instruct them to fork it from Bolt. If you export it to GitHub, provide the GitHub repository URL here.)*

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Supabase Setup

This application uses [Supabase](https://supabase.com/) for its backend (database and authentication). You'll need to set up your own Supabase project to run this application.

1.  **Create a new Supabase Project:**
    *   Go to [Supabase.com](https://supabase.com/) and sign up or log in.
    *   Click "New project" and follow the prompts to create a new project. Choose a strong database password.

2.  **Get your Supabase Project URL and Anon Key:**
    *   Once your project is created, navigate to `Project Settings` > `API` in your Supabase dashboard.
    *   You will find your `Project URL` and `anon public` key there. Copy these values.

3.  **Set up the Database Schema:**
    *   In your Supabase dashboard, go to the `SQL Editor` section.
    *   Run the following SQL queries to create the `tasks` table, enable Row Level Security (RLS), and set up the necessary policies and triggers.

    ```sql
    -- Create the tasks table
    CREATE TABLE public.tasks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      title text NOT NULL,
      description text,
      priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      completed boolean DEFAULT FALSE,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now(),
      due_date date,
      CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
    );

    -- Enable Row Level Security (RLS) on the tasks table
    ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

    -- Create a policy to allow authenticated users to manage their own tasks
    CREATE POLICY "Users can manage their own tasks" ON public.tasks
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    -- Create a function to update the 'updated_at' timestamp
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
       NEW.updated_at = now();
       RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Create a trigger to call the function on task updates
    CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    ```

4.  **Create Environment Variables:**
    *   In the root of your project directory, create a new file named `.env`.
    *   Add the following lines to the `.env` file, replacing the placeholder values with your actual Supabase Project URL and Anon Key that you copied from your Supabase dashboard:

    ```
    VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

### Running the Application

Once you have set up Supabase and your `.env` file, you can run the application:

```bash
npm run dev
# or
yarn dev```

The application will typically run on `http://localhost:5173` (or another available port). Open this URL in your browser.

## Deployment

This application can be easily deployed to platforms like Netlify or Vercel. Ensure your environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are correctly configured on your chosen hosting provider's dashboard.

---

After you've updated your `.env` file with the placeholder values and added this content to your `README.md`, you should be able to change your Bolt project's visibility to "Public".
