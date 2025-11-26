-- Create user_progress table
create table if not exists public.user_progress (
  user_id uuid references auth.users not null primary key,
  current_session int default 1,
  completed_sessions int[] default '{}',
  mastered_question_ids int[] default '{}',
  session_questions jsonb default '{}'::jsonb,
  current_answers jsonb default '{}'::jsonb,
  last_updated timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table public.user_progress enable row level security;

-- Create policies
create policy "Users can view their own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert/update their own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
create trigger handle_user_progress_updated_at
  before update on public.user_progress
  for each row
  execute procedure public.handle_updated_at();
