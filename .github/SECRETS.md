# GitHub Actions Secrets

Configure these in **Settings → Secrets and variables → Actions**.

## Dev environment

| Secret | Description |
|--------|-------------|
| `DEV_SSH_HOST` | Hetzner dev server IP or hostname |
| `DEV_SSH_USER` | SSH user (e.g. `deploy`) |
| `DEV_SSH_KEY` | Private SSH key for dev server |
| `DEV_CLIENT_NAME` | Client directory name under `/opt/clients/` (e.g. `template-dev`) |

## Prod environment

| Secret | Description |
|--------|-------------|
| `PROD_SSH_HOST` | Hetzner prod server IP or hostname |
| `PROD_SSH_USER` | SSH user |
| `PROD_SSH_KEY` | Private SSH key for prod server |
| `PROD_CLIENT_NAME` | Client directory name under `/opt/clients/` (e.g. `template-prod`) |

## Notes

- `GITHUB_TOKEN` is provided automatically by GitHub Actions — no configuration needed
- SSH keys must be added to `~/.ssh/authorized_keys` on the respective servers
- Generate a deploy key: `ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key`
- The `.env` file on the server at `/opt/clients/<name>/.env` is **never** stored in GitHub
