PC Config App
 - PC Config App is next.js + Expo app to save PC configurations
 -Workspace 'pc-config-hub-web' : Next.js based back-end + WEB front-end
  -Workspace 'pc-config-hub--mobile' : Expo basd mobile client app

Netlify deployment notes
 - Web app deploy:
   - Netlify site package path: pc-config-hub-web
   - Use pc-config-hub-web/netlify.toml
   - Build base: pc-config-hub-web
   - Build command: npm run build --workspaces=false
   - Publish directory: .next
   - Required Netlify env vars: DATABASE_URL, JWT_SECRET, R2_URL, R2_BUCKET_NAME, R2_PUBLIC_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
   - Keep NPM_FLAGS="--workspaces=false --include=optional" for web so Netlify installs only web deps and includes native optional packages.
   - The web package intentionally pins optional native packages used by Tailwind/Lightning CSS for Netlify Linux builds.

 - Mobile app deploy:
   - Do not let Netlify build Expo directly. Netlify npm install in this monorepo repeatedly failed on transient package versions.
   - The working approach is prebuilt static deploy.
   - Run locally before commit/deploy: npm run build --workspace pc-config-hub--mobile
   - Commit pc-config-hub--mobile/dist because mobile Netlify publishes that prebuilt output.
   - Netlify site build base should be netlify-mobile-static.
   - If Netlify UI overrides config, set:
     - Base directory: netlify-mobile-static
     - Build command: npm run build --workspaces=false
     - Publish directory: netlify-mobile-static/.next
   - netlify-mobile-static/build.js copies ../pc-config-hub--mobile/dist into .next and patches http://localhost:3000/api to EXPO_PUBLIC_API_URL or API_URL.
   - Required mobile Netlify env vars:
     - EXPO_PUBLIC_API_URL=https://<deployed-web-site>/api
     - API_URL=https://<deployed-web-site>/api
   - Do not use localhost in Netlify production env.

 - Monorepo gotchas:
   - A root netlify.toml with base="pc-config-hub-web" breaks the mobile site by forcing mobile deploys into the web app.
   - package-local netlify.toml files are safer, but Netlify UI settings may override them. Always check commandOrigin/publishOrigin in logs.
   - If commandOrigin or publishOrigin is "ui", fix the Netlify site UI settings or make the helper project compatible with those UI commands.
