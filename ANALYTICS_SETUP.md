# Classroom Analytics Setup

This document provides instructions for setting up the classroom analytics system in the Siksha AI education platform.

## Overview

The classroom analytics system tracks:
- Student study time in classroom mode
- Quiz completion rates
- Material usage
- Student engagement metrics

## Database Setup

To set up the required database tables and views, follow these steps:

1. Run the `setup_classroom_analytics.sql` script to create:
   - `classroom_study_sessions` table
   - `classroom_analytics` view
   - `student_classroom_analytics` view
   - Row-level security policies for the table

2. Run the `fix_analytics_policies.sql` script to:
   - Fix type casting issues in the RLS policies
   - Create secure functions for access control
   - Create secure views with built-in row-level security

You can run these scripts using the Supabase SQL Editor or through the Supabase CLI.

### Using Supabase SQL Editor:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of each SQL file and run them in sequence

### Using Supabase CLI:

```bash
supabase db run --file setup_classroom_analytics.sql
supabase db run --file fix_analytics_policies.sql
```

## Important Notes About Views

Unlike tables, views in PostgreSQL:
- Cannot have RLS policies applied directly
- Cannot be altered with ALTER TABLE commands
- Must be recreated with CREATE OR REPLACE VIEW to modify

To secure the views, we:
1. Create security functions that check user permissions
2. Create secure views that filter data using these functions
3. Grant SELECT permissions on the secure views

## Frontend Components

The analytics system includes these key components:

1. `ClassroomAnalyticsComponent` - A reusable component that displays analytics for both teachers and students
2. Analytics tab in `TeachersDashboard` - Shows classroom-level analytics with classroom selection
3. Analytics section in `ClassroomMode` - Shows both personal and classroom analytics for students

The component will try to fetch data in this order:
1. From the secure views (`secure_classroom_analytics` and `secure_student_classroom_analytics`)
2. From the regular views as fallback (`classroom_analytics` and `student_classroom_analytics`)
3. Manual data collection if views don't exist

## Tracking Study Sessions

Study sessions are automatically tracked when students use Classroom Mode:
- A session starts when the student enters Classroom Mode
- The session ends when they leave the page
- Session data is stored in the `classroom_study_sessions` table

## Troubleshooting

If analytics data isn't displaying:

1. Check that the SQL scripts have been run successfully
2. Verify that the classroom has active students and content
3. Ensure the user has proper permissions to access the data
4. Check the browser console for specific error messages

Common errors:
- "relation does not exist" - The tables/views haven't been created yet
- Permission denied errors - The RLS policies or grants need to be fixed
- Type casting errors - UUID vs text type mismatches in the policies 