# Product Requirements Document: Siksha AI

## 1. Executive Summary
Siksha AI is a comprehensive, AI-powered educational platform designed to streamline and enhance the learning experience for students, teachers, and school administrators. By integrating generative AI, role-based dashboards, and interactive learning tools, Siksha AI bridges the gap between structured curriculum delivery and personalized learning, creating an immersive educational ecosystem.

## 2. Product Vision
To empower educational institutions with a smart, unified ecosystem where teachers can easily curate interactive content, schools can monitor holistic performance, and students receive AI-driven, personalized learning experiences at scale.

## 3. Target Audience
*   **Students:** Primary users who interact with the learning materials, complete quizzes, participate in classrooms, and leverage AI mentors for self-paced study.
*   **Teachers:** Content creators and facilitators who manage classrooms, assign work, evaluate progress, and generate AI-assisted study materials (notes, flashcards, quizzes).
*   **School Administrators:** Overseers who monitor school-wide performance analytics, manage teacher rosters, and supervise classroom allocations.
*   **Super Admins:** Platform managers who handle system-wide operations, school onboarding, and global metrics.

## 4. Key Features & Capabilities

### 4.1. Role-Based Access Control & Portals
*   **Student Dashboard:** Centralized view of enrolled classrooms, active quests, study streaks, leaderboards, and AI mentor access.
*   **Teacher Dashboard:** Tools to create/manage topics, generate materials, grade submissions, and view classroom analytics.
*   **School Dashboard:** High-level metrics, teacher management, and classroom monitoring.
*   **Super Admin Dashboard:** Global platform analytics, onboarding of new schools, and subscription management.

### 4.2. AI-Powered Learning (Generative AI Integration)
*   **AI Mentor Chat:** 24/7 conversational agent to answer student queries, explain complex concepts, and guide learning.
*   **Automated Content Generation:** Teachers and students can auto-generate structured notes, flashcards, and quizzes from raw text or syllabus data using integrated LLMs (Meta LLaMA 3).
*   **Study Session Mode:** Immersive, distraction-free environment utilizing generated materials.

### 4.3. Gamification & Engagement
*   **Quests & Achievements:** Daily and weekly goals (e.g., login streaks, quiz completions) to incentivize consistent learning.
*   **Leaderboards:** Competitive rankings based on experience points (XP) earned through platform engagement.
*   **Time Tracking:** Analytics on active study time and session efficiency.

### 4.4. Classroom & Analytics Management
*   **Classroom Mode:** Real-time synchronization of teacher-led materials to student devices.
*   **Granular Analytics:** Secure views in the database providing insights into student performance, quiz completion rates, and material engagement.

## 5. Technical Stack
*   **Frontend:** React (Vite), TypeScript, Tailwind CSS, shadcn/ui.
*   **Backend / Database:** Supabase (PostgreSQL, Authentication, Storage, Edge Functions).
*   **AI Integration:** NVIDIA NIM API (Llama 3 8B Instruct / DeepSeek).
*   **Deployment:** Vercel (Frontend).

## 6. Security & Data Privacy
*   **Row Level Security (RLS):** Strict PostgreSQL RLS policies ensure data isolation between different schools, teachers, and students.
*   **Secure Authentication:** Supabase Auth handling email/password and role persistence.
*   **Data Integrity:** Triggers and secure views to maintain consistent analytics without exposing raw cross-tenant data.

## 7. Future Roadmap
*   **Phase 2:** Parent portal for real-time progress tracking.
*   **Phase 3:** Advanced predictive analytics for student at-risk identification.
*   **Phase 4:** Voice-to-text integration for the AI mentor for accessibility and language learning.
