## Architecture

momentm/
├── app/
│   ├── page.tsx              # Dashboard/home
│   ├── habits/
│   │   └── page.tsx          # Habit tracker
│   ├── projects/
│   │   └── page.tsx          # Project tracker
│   ├── tasks/
│   │   └── page.tsx          # Todo lists
│   ├── calendar/
│   │   └── page.tsx          # Calendar view
│   └── layout.tsx            # Main layout with nav
├── components/
│   ├── habits/
│   ├── projects/
│   ├── tasks/
│   ├── calendar/
│   └── shared/               # Shared UI components
├── lib/
│   ├── storage/              # Data persistence layer
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript interfaces
└── contexts/                 # React Context for global state

## Features

Task (one-time task)
Habit (recurring tasks)
Event (one-time or recurring event)
Project (collection of tasks)
Calendar (view of tasks, habits, events, projects)
Notes (typed, drawn, lists(of tasks))

## Technology Stack

1. Data Storage: supabase
2. Authentication: email/password or google authentication

## Next Steps

Create the main layout/navigation - sidebar or top nav to switch between trackers