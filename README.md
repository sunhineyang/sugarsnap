# AI Diabetes Management App

AI Diabetes Management App is a comprehensive Next.js application designed to help users manage their diabetes through AI-powered insights and tracking. It provides a robust foundation with modern technologies and best practices for health management applications.

![preview](preview.png)

## ✨ Features

### 🎯 Core Features
- **AI-Powered Diabetes Management**: Intelligent insights for blood sugar tracking
- **Modern Tech Stack**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Authentication System**: Secure user management with Supabase Auth
- **Health Data Tracking**: Comprehensive diabetes monitoring and analytics
- **User Dashboard**: Personal health dashboard for diabetes management
- **Multi-language Support**: Built-in internationalization (i18n)
- **SEO Optimized**: Server-side rendering and meta tag management
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🚀 Quick Start

```bash
git clone git@github.com:your-username/ai-diabetes-app.git my-ai-diabetes-project
cd my-ai-diabetes-project
```

2. Install dependencies

```bash
pnpm install
```

3. Run the development server

```bash
pnpm dev
```

## Customize

- Set your environment variables

```bash
cp .env.example .env.development
```

- Set your theme in `src/app/theme.css`

[tweakcn](https://tweakcn.com/editor/theme)

- Set your landing page content in `src/i18n/pages/landing`

- Set your i18n messages in `src/i18n/messages`

## Deploy

- Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fai-diabetes-app&project-name=my-ai-diabetes-project&repository-name=my-ai-diabetes-project&redirect-url=https%3A%2F%2Fai-diabetes.com&demo-title=AI%20Diabetes%20App&demo-description=AI-powered%20diabetes%20management%20application&demo-url=https%3A%2F%2Fai-diabetes.com)

- Deploy to Cloudflare

for new project, clone with branch "cloudflare"

```shell
git clone -b cloudflare https://github.com/your-username/ai-diabetes-app.git
```

for exist project, checkout to branch "cloudflare"

```shell
git checkout cloudflare
```

1. Customize your environment variables

```bash
cp .env.example .env.production
cp wrangler.toml.example wrangler.toml
```

edit your environment variables in `.env.production`

and put all the environment variables under `[vars]` in `wrangler.toml`

2. Deploy

```bash
npm run cf:deploy
```

## Community

- [AI Diabetes App](https://ai-diabetes.com)
- [Documentation](https://docs.ai-diabetes.com)

## License

- [MIT License](LICENSE)
