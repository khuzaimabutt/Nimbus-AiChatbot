-- Run this in your Supabase project's SQL editor before deploying.
-- Creates the three tables the chatbot uses.

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id bigint generated always as identity primary key,
  conversation_id uuid references conversations(id) on delete set null,
  name text,
  email text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_leads_conversation on leads(conversation_id);
