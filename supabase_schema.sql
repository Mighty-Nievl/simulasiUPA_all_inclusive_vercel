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

-- Create exam_results table
create table if not exists public.exam_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  session_id int not null,
  score int not null,
  total_questions int not null,
  correct_answers int not null,
  incorrect_answers int not null,
  answers jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS for exam_results
alter table public.exam_results enable row level security;

-- Policies for exam_results
create policy "Users can view their own exam results"
  on public.exam_results for select
  using (auth.uid() = user_id);

create policy "Users can insert their own exam results"
  on public.exam_results for insert
  with check (auth.uid() = user_id);

