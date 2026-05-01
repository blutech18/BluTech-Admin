/**
 * Seed script — populates the projects table with repos from github.com/blutech18.
 *
 * Run with: npx tsx scripts/seed-projects.ts
 *
 * Requires DATABASE_URL in .env or .dev.vars
 */
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const GRADIENTS = [
  "from-sky-400 to-blue-600",
  "from-blue-600 to-indigo-700",
  "from-cyan-400 to-sky-600",
  "from-indigo-400 to-blue-600",
  "from-emerald-400 to-cyan-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-600",
];

interface Project {
  title: string;
  category: string;
  year: string;
  description: string;
  about: string;
  stack: string[];
  gradient: string;
  is_featured: boolean;
}

const projects: Project[] = [
  {
    title: "Hopelink v2",
    category: "Web App",
    year: "2026",
    description: "Community-driven donation management platform connecting donors, recipients, and volunteers.",
    about: "A full-stack donation platform with smart matching algorithm, logistics tracking, community events, analytics dashboards, and geospatial integration. Built for real-world impact.",
    stack: ["React", "Vite", "Tailwind CSS", "Supabase", "Express.js", "Zustand", "Framer Motion"],
    gradient: GRADIENTS[0],
    is_featured: true,
  },
  {
    title: "LDCU Clinic",
    category: "Web App",
    year: "2026",
    description: "Full-stack medical and dental appointment management system for Liceo de Cagayan University.",
    about: "Online booking, multi-campus support, 7 user roles with Row-Level Security, schedule management, nurse assignment, and audit logs. Deployed on Vercel with Supabase backend.",
    stack: ["React", "TypeScript", "Vite", "Supabase", "PostgreSQL", "Tailwind CSS", "Zustand", "Zod"],
    gradient: GRADIENTS[4],
    is_featured: true,
  },
  {
    title: "MSEUF Library Portal",
    category: "Web App",
    year: "2026",
    description: "AI-powered academic library portal with embedded chatbot for Manuel S. Enverga University Foundation.",
    about: "Combines a Next.js website, Convex backend, Google Drive-synced digital catalog, and an AI librarian chatbot (ROSe) powered by Google Gemini for intelligent book search and recommendations.",
    stack: ["Next.js", "TypeScript", "Convex", "Google Gemini AI", "Tailwind CSS", "Zustand"],
    gradient: GRADIENTS[5],
    is_featured: true,
  },
  {
    title: "EduCatch Lite",
    category: "Web App",
    year: "2026",
    description: "Simplified catch-up planner for students who miss classes due to competitions.",
    about: "Track missed lessons, generate study schedules, and monitor progress with auto-generated timelines. Built with Next.js and Convex for real-time data sync.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Convex", "Zustand"],
    gradient: GRADIENTS[3],
    is_featured: true,
  },
  {
    title: "MCA Portal",
    category: "Web App",
    year: "2025",
    description: "Full-stack school management system handling enrollment, grades, attendance, and multi-role access.",
    about: "Built for MCA Montessori School with Laravel and MySQL. Supports Admin, Instructor, and Student roles with secure authentication. Deployed on Hostinger.",
    stack: ["PHP", "Laravel", "MySQL", "Bootstrap", "Blade", "JavaScript"],
    gradient: GRADIENTS[1],
    is_featured: false,
  },
  {
    title: "FakeGPS — Nodare GeoSec",
    category: "Mobile App",
    year: "2026",
    description: "Native Android GPS security and dispatch management app for field operations.",
    about: "Features 5-layer fake GPS detection, real-time tracking, route deviation monitoring, and role-based access control. Built with Kotlin, Firebase, and Google Maps SDK.",
    stack: ["Kotlin", "Firebase", "Google Maps SDK", "Hilt", "Room", "Retrofit", "WorkManager"],
    gradient: GRADIENTS[6],
    is_featured: false,
  },
  {
    title: "PCMonitoring",
    category: "Mobile App",
    year: "2026",
    description: "React Native mobile app for monitoring computer usage in an organizational environment.",
    about: "Real-time dashboards, session tracking, notifications, reports with charts, offline support, and a Python PC agent for Windows. Cross-platform with Expo.",
    stack: ["React Native", "Expo", "TypeScript", "Firebase", "Python", "React Navigation"],
    gradient: GRADIENTS[2],
    is_featured: false,
  },
  {
    title: "LDCU Tabulation",
    category: "Web App",
    year: "2026",
    description: "Dynamic tabulation system supporting scoring-based and ranking-based events.",
    about: "Admin panel with dual tabulation modes, drag-and-drop ranking, image overlays, and responsive design. Powered by Supabase for real-time updates.",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Framer Motion", "Supabase"],
    gradient: GRADIENTS[0],
    is_featured: false,
  },
  {
    title: "Liceo Attendance Scanner",
    category: "Web App",
    year: "2026",
    description: "QR-based attendance scanning system for LDCU built with SvelteKit.",
    about: "Uses Svelte with TypeScript, Tailwind CSS, and Bun as the runtime. Fast, lightweight attendance tracking with QR code scanning.",
    stack: ["Svelte", "SvelteKit", "TypeScript", "Tailwind CSS", "Bun"],
    gradient: GRADIENTS[4],
    is_featured: false,
  },
  {
    title: "School Management System",
    category: "Web App",
    year: "2026",
    description: "Comprehensive web-based school management system with role-based access control.",
    about: "Manages attendance, grades, schedules, subjects, courses, and excuse letters. Supports admins, deans, coordinators, instructors, and students.",
    stack: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Radix UI", "MySQL", "Vercel"],
    gradient: GRADIENTS[3],
    is_featured: false,
  },
  {
    title: "Mapping",
    category: "Web App",
    year: "2026",
    description: "Cemetery mapping and plot management web application with interactive maps.",
    about: "Built with React, Vite, Supabase, and Leaflet for interactive geospatial mapping. Manage plots, records, and locations visually.",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Supabase", "Leaflet"],
    gradient: GRADIENTS[2],
    is_featured: false,
  },
  {
    title: "DreamHome",
    category: "Web App",
    year: "2025",
    description: "Flask-based real estate management system for properties, customers, and transactions.",
    about: "Multi-branch property management across Cagayan de Oro with multi-database MySQL architecture. Handles appointments, customers, and transaction records.",
    stack: ["Python", "Flask", "MySQL", "Jinja2", "HTML", "CSS"],
    gradient: GRADIENTS[7],
    is_featured: false,
  },
  {
    title: "ClaimIT",
    category: "Mobile App",
    year: "2025",
    description: "Expo-based cross-platform mobile application with file-based routing.",
    about: "Built with create-expo-app for cross-platform development targeting Android, iOS, and web from a single codebase.",
    stack: ["TypeScript", "JavaScript", "Expo", "React Native"],
    gradient: GRADIENTS[1],
    is_featured: false,
  },
  {
    title: "AppomodoroTimer",
    category: "Mobile App",
    year: "2025",
    description: "Pomodoro timer mobile app built with React Native CLI for Android and iOS.",
    about: "A productivity timer app using the Pomodoro technique. Supports both platforms with Metro bundler for hot-reloading during development.",
    stack: ["React Native", "JavaScript", "TypeScript", "Kotlin", "Swift"],
    gradient: GRADIENTS[6],
    is_featured: false,
  },
  {
    title: "AugustOne",
    category: "Web App",
    year: "2025",
    description: "A TypeScript-based web project built with modern frontend tooling.",
    about: "Web application built with TypeScript, CSS, and JavaScript. Deployed on Vercel.",
    stack: ["TypeScript", "CSS", "JavaScript"],
    gradient: GRADIENTS[5],
    is_featured: false,
  },
  {
    title: "Hearts",
    category: "Web App",
    year: "2026",
    description: "A web project built with Vite, React, shadcn-ui, and Tailwind CSS.",
    about: "Modern React application with shadcn-ui component library and Tailwind CSS for styling. Built with Vite for fast development.",
    stack: ["TypeScript", "React", "Vite", "shadcn-ui", "Tailwind CSS"],
    gradient: GRADIENTS[6],
    is_featured: false,
  },
  {
    title: "ITISDEV MVPc",
    category: "Web App",
    year: "2026",
    description: "Application development project built with JavaScript and Handlebars templating.",
    about: "Course project for ITISDEV using server-rendered Handlebars templates with JavaScript, HTML, and CSS.",
    stack: ["JavaScript", "HTML", "Handlebars", "CSS"],
    gradient: GRADIENTS[7],
    is_featured: false,
  },
  {
    title: "LibraryMS",
    category: "Web App",
    year: "2025",
    description: "Library management system built with React, shadcn-ui, and Tailwind CSS.",
    about: "A library management application using Vite, TypeScript, React, and the shadcn-ui component library for a polished UI.",
    stack: ["TypeScript", "React", "Vite", "shadcn-ui", "Tailwind CSS"],
    gradient: GRADIENTS[0],
    is_featured: false,
  },
  {
    title: "mini-love-game",
    category: "Web App",
    year: "2026",
    description: "A small web game exploring simple game mechanics around choices and outcomes.",
    about: "Built with React and Vite, featuring interactive game mechanics with affection systems and branching outcomes.",
    stack: ["TypeScript", "React", "Vite", "shadcn-ui", "Tailwind CSS"],
    gradient: GRADIENTS[6],
    is_featured: false,
  },
  {
    title: "GBTAC",
    category: "Web App",
    year: "2026",
    description: "A JavaScript and Python full-stack application.",
    about: "Full-stack project combining JavaScript frontend with Python backend services.",
    stack: ["JavaScript", "Python", "CSS"],
    gradient: GRADIENTS[4],
    is_featured: false,
  },
  {
    title: "Fitness Tracker",
    category: "Desktop App",
    year: "2026",
    description: "Desktop fitness tracking application built with Java Swing and MySQL.",
    about: "Demonstrates OOP, data structures (QuickSort, Binary Search), and database integration for workout and meal tracking. Built with Maven.",
    stack: ["Java", "Java Swing", "Maven", "MySQL"],
    gradient: GRADIENTS[2],
    is_featured: false,
  },
  {
    title: "PayrollProject",
    category: "Backend",
    year: "2025",
    description: "A Python-based payroll computation system.",
    about: "Backend payroll system handling employee salary calculations, deductions, and reporting. Built entirely in Python.",
    stack: ["Python"],
    gradient: GRADIENTS[7],
    is_featured: false,
  },
  {
    title: "Umelec",
    category: "Mobile App",
    year: "2025",
    description: "A native Android application built with Kotlin.",
    about: "Native Android project using Kotlin for the core application logic with some JavaScript integration.",
    stack: ["Kotlin", "JavaScript"],
    gradient: GRADIENTS[5],
    is_featured: false,
  },
];

async function seed() {
  console.log("🌱 Seeding projects from GitHub repos...\n");

  // Ensure table exists
  await sql`CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL, category text NOT NULL, year text NOT NULL,
    description text NOT NULL, about text NOT NULL DEFAULT '',
    stack text[] NOT NULL DEFAULT '{}',
    gradient text NOT NULL DEFAULT 'from-sky-400 to-blue-600',
    image_url text, meta text NOT NULL DEFAULT '',
    is_featured boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    sort_order int NOT NULL DEFAULT 0,
    proof_image_url text,
    client_number text NOT NULL DEFAULT '',
    service_type text NOT NULL DEFAULT '',
    transaction_date text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;

  // Clear existing projects
  await sql`DELETE FROM projects`;
  console.log("  ✓ Cleared existing projects");

  // Insert each project
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    await sql`
      INSERT INTO projects (title, category, year, description, about, stack, gradient, is_featured, is_active, sort_order)
      VALUES (${p.title}, ${p.category}, ${p.year}, ${p.description}, ${p.about},
              ${p.stack}, ${p.gradient}, ${p.is_featured}, true, ${i + 1})
    `;
    console.log(`  ✓ ${p.title} (${p.category})`);
  }

  console.log(`\n✅ Seeded ${projects.length} projects successfully!`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
