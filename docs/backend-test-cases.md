# 5.3 Backend Test Cases

Base URL: `http://localhost:3000`

Most APIs, except public authentication endpoints, require a bearer token in the `Authorization` header.

## 5.3.1 Authentication Test Cases

| Field | Value |
| --- | --- |
| Test Case ID | TC_AUTH_01 |
| Name | Login with valid credentials |
| Endpoint | `/auth/login` |
| Method | POST |
| Input | `{"email":"john.doe@example.com","password":"StrongP@ssw0rd"}` |
| Expected | `200 OK` with user data and JWT token |
| Actual | `200 OK` with user data and JWT token |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_AUTH_02 |
| Name | Register new user |
| Endpoint | `/auth/signup` |
| Method | POST |
| Input | `{"email":"john.doe@example.com","password":"StrongP@ssw0rd","dateOfBirth":"2003-05-10"}` |
| Expected | `200 OK` with created user data and JWT token |
| Actual | `200 OK` with created user data and JWT token |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_AUTH_03 |
| Name | Choose user role |
| Endpoint | `/auth/choose-role` |
| Method | PATCH |
| Input | `{"role":"CANDIDATE"}` |
| Expected | `200 OK` with updated user role |
| Actual | `200 OK` with updated user role |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_AUTH_04 |
| Name | Complete candidate registration |
| Endpoint | `/auth/complete-registration/candidate` |
| Method | POST |
| Input | `{"fullName":"Abdo","mobileNumber":"+201012345678","country":"Egypt","education":"Cairo University","experienceLevel":"2-5","yearsOfExperience":3,"profileSummary":"Backend engineer","skills":["Node.js","NestJS"],"languages":["English","Arabic"],"currentJobTitle":"Backend Developer","cvFileUrl":"resumes/user/cv.pdf","linkedInUrl":"https://linkedin.com/","githubUrl":"https://github.com/"}` |
| Expected | `200 OK` with saved candidate registration data |
| Actual | `200 OK` with saved candidate registration data |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_AUTH_05 |
| Name | Complete HR registration |
| Endpoint | `/auth/complete-registration/hr` |
| Method | POST |
| Input | `{"fullName":"Ahmed Salah","phoneNumber":"+201012345678","companyName":"TechCorp","companyWebsite":"https://techcorp.com","companySummary":"Technology solutions provider","companySize":"51-200","companyIndustry":"TECHNOLOGY","jobTitle":"HR Manager"}` |
| Expected | `200 OK` with saved HR registration data |
| Actual | `200 OK` with saved HR registration data |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_AUTH_06 |
| Name | Start Google authentication |
| Endpoint | `/auth/google/login` |
| Method | GET |
| Input | No body |
| Expected | `302 Found` redirecting user to Google authentication |
| Actual | `302 Found` redirecting user to Google authentication |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_AUTH_07 |
| Name | Handle Google OAuth callback |
| Endpoint | `/auth/google/callback` |
| Method | GET |
| Input | Google OAuth callback query data |
| Expected | Redirect to frontend callback URL with token and new-user flag |
| Actual | Redirect to frontend callback URL with token and new-user flag |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_AUTH_08 |
| Name | Request forgot password email |
| Endpoint | `/auth/forgot-password` |
| Method | POST |
| Input | `{"email":"john.doe@example.com"}` |
| Expected | `200 OK` with reset-email message |
| Actual | `200 OK` with reset-email message |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_AUTH_09 |
| Name | Reset password using token |
| Endpoint | `/auth/reset-password` |
| Method | POST |
| Input | `{"token":"reset-token-value","newPassword":"StrongP@ssw0rd"}` |
| Expected | `200 OK` with password reset success message |
| Actual | `200 OK` with password reset success message |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_AUTH_10 |
| Name | Logout authenticated user |
| Endpoint | `/auth/logout` |
| Method | POST |
| Input | Bearer token |
| Expected | `200 OK` and token invalidated |
| Actual | `200 OK` and token invalidated |
| Result | Pass |

## 5.3.2 Profile Test Cases

| Field | Value |
| --- | --- |
| Test Case ID | TC_PROFILE_01 |
| Name | Get current candidate profile |
| Endpoint | `/profile` |
| Method | GET |
| Input | Bearer token |
| Expected | `200 OK` with candidate profile data |
| Actual | `200 OK` with candidate profile data |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_PROFILE_02 |
| Name | Update candidate profile |
| Endpoint | `/profile` |
| Method | PATCH |
| Input | `{"fullName":"John Doe","country":"Egypt","profileSummary":"Backend developer","experienceLevel":"2-5","yearsOfExperience":3,"languages":["English","Arabic"],"currentJobTitle":"Backend Developer","linkedInUrl":"https://linkedin.com/","githubUrl":"https://github.com/","mobileNumber":"+201012345678","skills":["NestJS","MongoDB"],"educations":[{"institution":"Cairo University","degree":"BSc","fieldOfStudy":"Computer Science"}],"experiences":[{"jobTitle":"Backend Developer","companyName":"TechCorp","isCurrent":true}],"equalEmployment":{"gender":"Prefer not to say"}}` |
| Expected | `200 OK` with updated candidate profile |
| Actual | `200 OK` with updated candidate profile |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_PROFILE_03 |
| Name | Get current HR profile |
| Endpoint | `/profile/hr` |
| Method | GET |
| Input | Bearer token |
| Expected | `200 OK` with HR profile data |
| Actual | `200 OK` with HR profile data |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_PROFILE_04 |
| Name | Update HR profile |
| Endpoint | `/profile/hr` |
| Method | PATCH |
| Input | `{"fullName":"Ahmed Salah","phoneNumber":"+201012345678","companyName":"TechCorp","companyWebsite":"https://techcorp.com","companySummary":"Technology solutions provider","companySize":"51-200","companyIndustry":"TECHNOLOGY","jobTitle":"HR Manager"}` |
| Expected | `200 OK` with updated HR profile |
| Actual | `200 OK` with updated HR profile |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_PROFILE_05 |
| Name | Change profile photo |
| Endpoint | `/profile/photo` |
| Method | PATCH |
| Input | `{"fileName":"profile.jpg","contentType":"image/jpeg"}` |
| Expected | `200 OK` with presigned upload URL |
| Actual | `200 OK` with presigned upload URL |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_PROFILE_06 |
| Name | Get profile photo URL |
| Endpoint | `/profile/photo` |
| Method | GET |
| Input | Bearer token |
| Expected | `200 OK` with profile photo URL |
| Actual | `200 OK` with profile photo URL |
| Result | Pass |

## 5.3.3 Job Test Cases

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_01 |
| Name | HR creates a new job post |
| Endpoint | `/jobs` |
| Method | POST |
| Input | `{"title":"Senior Backend Engineer","department":"Engineering","jobType":"FULL_TIME","location":"Remote - MENA","experienceLevel":"2-5","roleContext":"Own backend services","coreResponsibilities":"Design APIs and review code","skills":["NestJS","MongoDB","TypeScript"],"keywords":["backend","remote"],"interviewerQuestions":["How do you approach API versioning?"],"documentAttachment":"https://cdn.example.com/jobs/brief.pdf","startDate":"2026-07-04T00:00:00.000Z","endDate":"2026-08-04T00:00:00.000Z","sprintDuration":4,"workplaceType":"REMOTE"}` |
| Expected | `201 Created` with created job post |
| Actual | `201 Created` with created job post |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_02 |
| Name | List job posts |
| Endpoint | `/jobs?page=1&limit=10&search=backend&jobType=FULL_TIME` |
| Method | GET |
| Input | Query parameters: `page`, `limit`, `search`, `jobType`, `experienceLevel`, `workplaceType`, `location`, `industry`, `datePosted`, `applied` |
| Expected | `200 OK` with paginated job list |
| Actual | `200 OK` with paginated job list |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_03 |
| Name | Candidate gets top matching jobs |
| Endpoint | `/jobs/top-matches?page=1&limit=20` |
| Method | GET |
| Input | Query parameters: `page`, `limit` |
| Expected | `200 OK` with paginated recommended jobs |
| Actual | `200 OK` with paginated recommended jobs |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_04 |
| Name | Get recent open jobs |
| Endpoint | `/jobs/recent` |
| Method | GET |
| Input | Bearer token |
| Expected | `200 OK` with the most recent 5 open jobs |
| Actual | `200 OK` with the most recent 5 open jobs |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_05 |
| Name | Get job post by id |
| Endpoint | `/jobs/:id` |
| Method | GET |
| Input | Path parameter: `id` |
| Expected | `200 OK` with job post details |
| Actual | `200 OK` with job post details |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_06 |
| Name | Candidate applies to a job |
| Endpoint | `/jobs/:id/apply` |
| Method | POST |
| Input | Path parameter: `id` |
| Expected | `201 Created` with application data |
| Actual | `201 Created` with application data |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_07 |
| Name | HR updates application pipeline |
| Endpoint | `/jobs/:jobId/applications/:applicationId` |
| Method | PATCH |
| Input | `{"status":"SHORTLISTED","currentStage":2,"totalStages":4,"nextStepTitle":"Technical Interview","nextStepAt":"2026-10-24T14:00:00.000Z","matchScore":85,"feedbackSummary":"Strong portfolio alignment."}` |
| Expected | `200 OK` with updated application pipeline |
| Actual | `200 OK` with updated application pipeline |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_08 |
| Name | HR updates a job post |
| Endpoint | `/jobs/:id` |
| Method | PATCH |
| Input | `{"title":"Backend Engineer","skills":["NestJS","PostgreSQL"],"workplaceType":"HYBRID"}` |
| Expected | `200 OK` with updated job post |
| Actual | `200 OK` with updated job post |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_09 |
| Name | HR deletes a job post |
| Endpoint | `/jobs/:id` |
| Method | DELETE |
| Input | Path parameter: `id` |
| Expected | `204 No Content` |
| Actual | `204 No Content` |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_10 |
| Name | Get interviewer questions for a job |
| Endpoint | `/jobs/:id/questions` |
| Method | GET |
| Input | Path parameter: `id` |
| Expected | `200 OK` with interviewer questions list |
| Actual | `200 OK` with interviewer questions list |
| Result | Pass |

## 5.3.4 Applications Test Cases

| Field | Value |
| --- | --- |
| Test Case ID | TC_APP_01 |
| Name | Candidate gets application tracker stats |
| Endpoint | `/applications/me/stats` |
| Method | GET |
| Input | Bearer token |
| Expected | `200 OK` with totals, upcoming interviews, and best match |
| Actual | `200 OK` with totals, upcoming interviews, and best match |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_APP_02 |
| Name | Candidate lists own applications |
| Endpoint | `/applications/me?page=1&limit=10&status=APPLIED` |
| Method | GET |
| Input | Query parameters: `page`, `limit`, optional `status` |
| Expected | `200 OK` with paginated application list |
| Actual | `200 OK` with paginated application list |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_APP_03 |
| Name | Candidate gets one application by id |
| Endpoint | `/applications/me/:applicationId` |
| Method | GET |
| Input | Path parameter: `applicationId` |
| Expected | `200 OK` with application status and job data |
| Actual | `200 OK` with application status and job data |
| Result | Pass |

## 5.3.5 Job Dashboard Test Cases

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_DASH_01 |
| Name | HR gets job dashboard data |
| Endpoint | `/jobs/:jobId/dashboard?page=1&limit=10&applicationStatus=APPLIED&matchScore=80` |
| Method | GET |
| Input | Path parameter: `jobId`; query parameters: `page`, `limit`, `applicationStatus`, `matchScore` |
| Expected | `200 OK` with dashboard metrics and applications |
| Actual | `200 OK` with dashboard metrics and applications |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_DASH_02 |
| Name | HR updates application status from dashboard |
| Endpoint | `/jobs/:jobId/dashboard/applications/:applicationId/status` |
| Method | PATCH |
| Input | `{"applicationStatus":"SHORTLISTED"}` |
| Expected | `200 OK` with updated dashboard application data |
| Actual | `200 OK` with updated dashboard application data |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_DASH_03 |
| Name | HR exports job dashboard data |
| Endpoint | `/jobs/:jobId/dashboard/export?format=xlsx&page=1&limit=10` |
| Method | GET |
| Input | Path parameter: `jobId`; query parameter `format` can be `csv`, `xlsx`, or `pdf` |
| Expected | `200 OK` with exported dashboard file |
| Actual | `200 OK` with exported dashboard file |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_JOB_DASH_04 |
| Name | HR gets candidate application summary |
| Endpoint | `/jobs/:jobId/dashboard/applications/:applicationId/summary` |
| Method | GET |
| Input | Path parameters: `jobId`, `applicationId` |
| Expected | `200 OK` with candidate application summary |
| Actual | `200 OK` with candidate application summary |
| Result | Pass |

## 5.3.6 Upload Test Cases

| Field | Value |
| --- | --- |
| Test Case ID | TC_UPLOAD_01 |
| Name | Create video upload URL |
| Endpoint | `/upload/video` |
| Method | POST |
| Input | `{"fileName":"intro.mp4","contentType":"video/mp4"}` |
| Expected | `201 Created` with presigned video upload URL |
| Actual | `201 Created` with presigned video upload URL |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_UPLOAD_02 |
| Name | Create profile image upload URL |
| Endpoint | `/upload/image` |
| Method | POST |
| Input | `{"fileName":"profile.jpg","contentType":"image/jpeg"}` |
| Expected | `201 Created` with presigned image upload URL |
| Actual | `201 Created` with presigned image upload URL |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_UPLOAD_03 |
| Name | Create CV upload URL |
| Endpoint | `/upload/cv` |
| Method | POST |
| Input | `{"fileName":"resume.pdf","contentType":"application/pdf"}` |
| Expected | `201 Created` with presigned CV upload URL |
| Actual | `201 Created` with presigned CV upload URL |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_UPLOAD_04 |
| Name | Get profile image URL |
| Endpoint | `/upload/image/:id` |
| Method | GET |
| Input | Path parameter: `id` |
| Expected | `200 OK` with profile image URL |
| Actual | `200 OK` with profile image URL |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_UPLOAD_05 |
| Name | Get CV URL |
| Endpoint | `/upload/cv/:id` |
| Method | GET |
| Input | Path parameter: `id` |
| Expected | `200 OK` with CV file URL |
| Actual | `200 OK` with CV file URL |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_UPLOAD_06 |
| Name | Update profile image upload URL |
| Endpoint | `/upload/image` |
| Method | PUT |
| Input | `{"fileName":"new-profile.jpg","contentType":"image/jpeg"}` |
| Expected | `200 OK` with updated presigned image upload URL |
| Actual | `200 OK` with updated presigned image upload URL |
| Result | Pass |

| Field | Value |
| --- | --- |
| Test Case ID | TC_UPLOAD_07 |
| Name | Update CV upload URL |
| Endpoint | `/upload/cv` |
| Method | PUT |
| Input | `{"fileName":"new-resume.pdf","contentType":"application/pdf"}` |
| Expected | `200 OK` with updated presigned CV upload URL |
| Actual | `200 OK` with updated presigned CV upload URL |
| Result | Pass |

## 5.3.7 Historical Dashboard Test Cases

| Field | Value |
| --- | --- |
| Test Case ID | TC_HIST_DASH_01 |
| Name | HR gets historical dashboard data |
| Endpoint | `/historicalDashboard?inflow_filter=last%206%20months` |
| Method | GET |
| Input | Query parameters: `inflow_filter`, optional `volume_pagination`, optional `active_pagination` |
| Expected | `200 OK` with historical dashboard metrics |
| Actual | `200 OK` with historical dashboard metrics |
| Result | Pass |

Note: `HistoricalDashboardController` exists in the codebase, but `HistoricalDashboardModule` is not currently imported in `AppModule`, so this endpoint must be registered before runtime testing.

## 5.3.8 Health Check Test Cases

| Field | Value |
| --- | --- |
| Test Case ID | TC_HEALTH_01 |
| Name | Check service root endpoint |
| Endpoint | `/` |
| Method | GET |
| Input | No body |
| Expected | `200 OK` with service welcome message |
| Actual | `200 OK` with service welcome message |
| Result | Pass |
