# Blog setup (about 10 minutes)

You do this once. After that you manage everything at `/blog/admin/`.

1. **Create a project.** Sign up at supabase.com (free), choose New project, name it "ascendai", set a database password and a region near you.
2. **Create the tables.** Open SQL Editor, choose New query, paste the whole of `supabase/setup.sql`, then select Run. This also adds a sample post.
3. **Turn off public sign-ups.** Authentication > Sign In / Providers (or Settings) > switch off "Allow new users to sign up". Only the account you create next will be able to log in.
4. **Create your login.** Authentication > Users > Add user > Create new user. Enter your email and a strong password, and tick "Auto Confirm User".
5. **Allow your site address.** Authentication > URL Configuration. Set Site URL to `https://ascendai.co.za` and add these Redirect URLs: `https://ascendai.co.za/blog/admin/` and `http://localhost:8000/blog/admin/`. This makes the "Forgot password" email link work.
6. **Copy your keys.** Project Settings > API. Copy the Project URL and the anon public key (or the publishable key). Paste them into `assets/js/config.js` as `supabase: { url: "...", anonKey: "..." }`. These two values are meant to be public. Never paste the service_role or secret key anywhere in the site.
7. **Upload the site** and open `/blog/admin/`. Sign in with the email and password from step 4.

Testing locally: run `npx serve .` or `python -m http.server 8000` from the folder that contains `index.html`, then open `http://localhost:8000/blog/admin/`.
