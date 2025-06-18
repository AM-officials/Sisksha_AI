# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a6718fe1-1840-48b3-adac-b6e701e6268a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a6718fe1-1840-48b3-adac-b6e701e6268a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Authentication & User Roles

This project uses Supabase for authentication and role-based access. There are four main user roles:

- **Student**: Default user, can sign up and log in via the main Auth page.
- **Teacher**: Created by a school admin (see below), logs in via the Teacher Login modal.
- **School**: Registers via the School Registration modal, logs in via the School Login modal.
- **Superadmin**: Has access to all dashboards and management features.

### Authentication Flow
- **Sign Up**: Students and schools can sign up directly. Teachers are created by schools.
- **Login**: Each role has a dedicated login flow and dashboard. Role-based routing ensures users are redirected to the correct dashboard after login.
- **Password Reset**: All users can reset their password via the "Forgot password?" link. Supabase rate limits password reset requests.

### Adding Teachers
- School admins can add teachers from the Schools Dashboard by providing name, email, password, subjects, and classrooms.
- Teacher accounts are created via a secure backend endpoint using the Supabase service role key.
- Teachers receive a password and can log in immediately. They can update their password after logging in.

### Role-Based Routing
- The app uses route guards to ensure only users with the correct role can access each dashboard.
- If a user tries to access a dashboard for which they lack the correct role, they see an access denied message and are prompted to log out.

### Backend API
- The backend Express server exposes an endpoint `/api/create-teacher` for secure teacher creation.
- The server uses the Supabase service role key and should never be exposed to the frontend.

---

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a6718fe1-1840-48b3-adac-b6e701e6268a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
