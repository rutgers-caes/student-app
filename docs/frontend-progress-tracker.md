# Student App Frontend Progress Tracker

Last reviewed: 2026-08-10

This is a brief UI progress overview for `student-app`. It separates sections that are already wired to backend/API flows from sections that currently exist as UI only or still need follow-up.

## Complete / API-Wired

| Section | Status | Notes |
| --- | --- | --- |
| Login | Complete | Calls `/auth/login`, stores token/profile snapshot, redirects to the student's profile slug. |
| Registration | Complete | Calls `/auth/register/request` and `/auth/register/complete`; supports approved email check and password creation. |
| My Profile | Complete | Calls `/students/me`; displays student identity, center, type, certificate status, profile image/base64, and assessment counts. |
| Center Branding Banner | Complete | Uses center code to show center name/color/logo and optional center website link. |
| Center Students Directory | Complete | Shows students from the logged-in student's center, with role/status, graduation year, assessment counts, and email links. |
| Peer Student Profile | Complete | Opens `/students/:studentId`; falls back to directory data while loading and redirects if the selected profile is invalid/self. |
| Assessment Display | Complete | Shows assessment records, faculty/staff, student participants, participant roles, and profile images when available. |
| Assessment Downloads | Complete | Calls `/students/me/assessments/all.xlsx` and `/students/me/assessments/lead.xlsx`. |
| Edit Profile | Mostly complete | Calls `PATCH /students/me` for email, alternate email, student type, major, program start date, class standing, LinkedIn, graduation year, and password update. |
| FAQ | Complete as static page | Static FAQ content and email link are present. |
| Certificate Request | Complete as static page | Links to the certificate application `.docx` and provides certificate email instructions. |
| Navigation / Navbar | Complete | Desktop/mobile nav, profile shortcut, logout, external links, and mail links are present. |

## Waiting / Needs Follow-Up

| Section | Status | What is missing |
| --- | --- | --- |
| Password Reset | Waiting on backend/API | The page collects an email and shows a success-style message, but it does not call an API yet. |
| Entry Survey | API-wired | Calls `/students/me/surveys/entry` to load and save the authenticated student's survey answers. |
| Exit Survey | API-wired | Calls `/students/me/surveys/exit` to load and save the authenticated student's survey answers. |
| Profile Photo Upload | Waiting on persistence | The profile page lets the student pick an image and preview it locally, but it does not upload/save it to the backend yet. Imported/base64 photos can display when returned by the API. |
| Graduate Student Type Save | Needs small fix/check | The edit profile form requires `graduateStudentType` when applicable, but `buildProfileUpdatePayload` does not currently include it in the PATCH payload. |
| Missing Center Handling | Waiting on backend/data consistency | UI can display center data it receives, but complete imported legacy coverage depends on service DB center mappings matching legacy center symbols. |

## Quick Route Map

| Route | Page / View |
| --- | --- |
| `/` | Login |
| `/register` | Registration |
| `/password/reset` | Password reset UI |
| `/profile` | My profile, then redirects to student slug when profile loads |
| `/:studentSlug/profile/detail` | My profile |
| `/edit-profile` | Edit profile |
| `/center-students` | Center student directory |
| `/students/:studentId` | Peer student profile |
| `/certificate-request` | Certificate request instructions |
| `/faq` | FAQ |
| `/entry-survey` | Entry Survey |
| `/exit-survey` | Exit Survey |

## Priority Next Steps

1. Add backend/API integration for password reset.
2. Persist profile photo upload to the backend if students should manage their own photos.
3. Include `graduateStudentType` in the edit profile PATCH payload if the backend supports that field.
