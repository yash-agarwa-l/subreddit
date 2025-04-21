# Thapar Reddit-Style Backend

A custom Node.js backend built for a Reddit-style platform exclusively for Thapar University students. This backend supports user authentication, community creation, post submissions (both public and anonymous), and moderation functionalities.

## Features

### Community
- Create new communities
- Join or leave communities
- Fetch community-specific posts

### Posts
- Create public posts within a community
- Post anonymously without revealing identity
- Retrieve posts sorted by community or time

### Authentication
- JWT-based authentication system
- Signup and login system for verified Thapar students
- Role-based access control for moderation

### Moderation & Reporting
- Community creators can moderate posts
- Users can report posts or comments for review

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **API Design**: REST
- **Hosting**: [Insert here if applicable, e.g., Render, Railway, Vercel]

## Project Structure
/controllers      # Route logic
/models           # MongoDB schemas
/routes           # API endpoints
/middleware       # Auth & validation layers
/utils            # Helper functions

git clone https://github.com/yash-agarwa-l/subreddit.git
cd subreddit
npm install
