---
name: devops
description: "DevOps domain expertise for this project. CI/CD patterns, deployment conventions, infrastructure, and operational standards."
version: 1.0.0
created: 2026-03-08
platforms: [cursor, claude-code]
category: domain
tags: [devops, ci-cd, infrastructure, deployment]
risk: safe
---

# devops

## Purpose

Domain expertise for DevOps and infrastructure in this project. Defines CI/CD patterns, deployment conventions, and operational practices. Referenced by `@apply` (for implementation) and `@reviewer` (for review).

## When to Use

- Referenced by `@apply` when implementing infrastructure or CI/CD changes
- Referenced by `@reviewer` when reviewing DevOps-related code
- Directly invoked when user asks DevOps-specific questions

---

## Stack

| Layer | Technology |
|-------|-----------|
| CI/CD | CircleCI (`.circleci/config.yml`) |
| Containers | Docker (`Dockerfile`, `docker-compose.yml`) |
| Deployment | Capistrano 3 (`Capfile`, `config/deploy.rb`, `config/deploy/`) |
| Process Manager | Unicorn (`unicorn-worker-killer`) |
| Web Server | Nginx (config sample: `config/nginx-daijob.sample.conf`) |
| App Server | Unicorn (`config/unicorn.sample.rb`) |
| JS Build | Webpacker / Yarn |
| Scheduling | Whenever gem (`config/schedule.rb`) — generates cron jobs |
| Hosting | Linux server (SSH-based Capistrano deploy) |

## Infrastructure Overview

- **Server-based deployment**: Capistrano deploys via SSH to a production server running Unicorn + Nginx
- **Docker for development**: `docker-compose.yml` provides a local dev environment; production does NOT use Docker orchestration
- **Branch strategy**: GitHub Flow — `master` is production; feature branches deploy to staging for testing
- **Staging**: deploy the feature branch to staging with Capistrano before merging to master
- **Secrets**: managed via Rails encrypted credentials (`config/credentials.yml.enc`); local overrides in `config/settings.local.yml`

---

## Conventions

### CI/CD Pipeline

- **CircleCI** runs on every push: `bundle install` → `yarn install` → `RAILS_ENV=test bundle exec rspec`
- CI config is `.circleci/config.yml` — validate changes with `circleci config validate -c .circleci/config.yml`
- Run CircleCI locally with `circleci build .circleci/config.yml` before pushing
- Cache: bundle and node_modules cached by `Gemfile.lock` + `yarn.lock` checksums
- No automatic deployment from CI — deployments are manual via Capistrano

### Deployment

- **Capistrano 3** manages deploys: `bundle exec cap {stage} deploy`
- Deploy config reads server address and app name from `config/settings.local.{stage}.yml` via `Settings.deploy.*`
- Target branch set in `config/deploy/{stage}.rb` — staging uses feature branch, production uses master
- Submodule (`daijob6_shared`) deployed via `capistrano-git-with-submodules`
- After deploy: Unicorn restarts gracefully via `capistrano3-unicorn`
- Database migrations run automatically as a Capistrano deploy hook
- Yarn assets compiled on deploy via `capistrano-yarn`

### Infrastructure as Code

- No Terraform/Pulumi detected — infrastructure is managed via configuration files and deployment scripts
- Nginx config template: `config/nginx-daijob.sample.conf` (copy and customize per environment)
- Unicorn config template: `config/unicorn.sample.rb`
- Puma config (alternative): `config/puma.rb`
- Cron jobs defined in `config/schedule.rb` using the `whenever` gem — apply with `whenever --update-crontab`

### Monitoring & Logging

- **Error notifications**: `exception_notification` gem emails on unhandled exceptions in production
- **Slack notifications**: `slack-notifier` gem available for alerting
- **Log monitoring**: Rails logs at `log/{environment}.log` — tail with `tail -f log/development.log`
- **Process management**: `unicorn-worker-killer` auto-restarts workers exceeding memory limits

### Security & Secrets

- Secrets via Rails encrypted credentials: `EDITOR=vim bin/rails credentials:edit`
- Environment-specific constants in `config/settings/{environment}.yml` (accessed via `Settings.*`)
- Local developer overrides in `config/settings.local.yml` (gitignored)
- `.env` files: use `dotenv-rails` in dev/test — never commit `.env` with real credentials
- AWS credentials required for S3 uploads (`fog-aws`) — stored in credentials, not hardcoded

---

## Coding Standards

### DO:

- Validate CircleCI config changes locally before pushing: `circleci config validate`
- Use `config/settings.local.{stage}.yml` for environment-specific deploy values
- Keep deploy scripts idempotent — safe to re-run
- Add new cron jobs to `config/schedule.rb` via `whenever` — never edit crontab directly
- Use `capistrano-upload-config` for environment-specific config files on server
- Test Docker build locally before committing: `docker-compose build`

### DO NOT:

- Do NOT commit secrets, credentials, or `.env` files with real values
- Do NOT hardcode server IP addresses or credentials in `config/deploy.rb` — use `Settings.deploy.*`
- Do NOT deploy directly to production without staging verification
- Do NOT modify production server files directly — all changes go through Capistrano
- Do NOT skip CircleCI checks — CI must be green before deploying

---

## Related Files

- `AGENTS.md` — Project-level conventions
- `.circleci/config.yml` — CI pipeline definition
- `Dockerfile` — Docker image definition
- `docker-compose.yml` — Local development environment
- `Capfile` — Capistrano plugin loading
- `config/deploy.rb` — Shared deploy configuration
- `config/deploy/` — Per-stage deploy configs (staging, production)
- `config/schedule.rb` — Cron job definitions (whenever gem)
- `README.deploy.md` — Deployment runbook

---

## Principles

- **YAGNI** — Don't over-engineer infrastructure beyond current needs
- **Reproducible** — Every environment is rebuildable from code
- **Least privilege** — Minimal permissions, scoped access
- **Observable** — If it runs, it must be monitored
- **Immutable** — Prefer immutable deployments, avoid config drift
