# Tech Stack

## Frontend

| Technology | Purpose |
|---|---|
| **React + TypeScript** | Component-based UI with static typing for safer, more maintainable code |
| **Tailwind CSS** | Utility-first styling for rapid UI development without leaving HTML |
| **React Router** | Client-side routing for navigation between dashboard views |

## Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express + TypeScript** | HTTP server and REST API with type safety across the full stack |
| **Database Sessions** | Server-side session storage for authentication — no JWT complexity |

## Database

| Technology | Purpose |
|---|---|
| **PostgreSQL** | Relational database for tickets, users, sessions, and knowledge base |
| **Prisma** | Type-safe ORM with schema-driven migrations and auto-generated query client |

## AI

| Technology | Purpose |
|---|---|
| **Claude API** | Ticket classification, AI summaries, and suggested reply generation |

## Email

| Technology | Purpose |
|---|---|
| **SendGrid / Mailgun** | Inbound email parsing to create tickets; outbound delivery for AI-generated replies |

## Deployment

| Technology | Purpose |
|---|---|
| **Docker** | Containerizes the app and database for consistent environments across dev and prod |
| **Cloud Provider** | Hosts containers — AWS (ECS/Fargate), Railway, or Fly.io are all viable options |
