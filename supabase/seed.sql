-- Make the client an admin. Create their Auth user in the Supabase dashboard
-- (Authentication → Users → Add user) first, then replace the email and run this once.
insert into public.admin_users (user_id)
select id from auth.users where email = 'clutch.kicks1of1@gmail.com'
on conflict do nothing;
