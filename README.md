# NovaTech Solutions

NovaTech Solutions is a fictional tech consultancy website built with semantic HTML5, CSS3 custom properties, and vanilla JavaScript ES6 modules — no frameworks. It serves as the hands-on project for the **Advanced Claude Code** course on Pluralsight.

---

## Prerequisites

- Node.js 18 or later
- Git
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (for course exercises)

---

## Install and Run

```bash
# 1. Clone the repository
git clone https://github.com/nyisztor/novatech-demo.git
cd novatech-demo

# 2. Install dependencies
npm install

# 3. Start the local dev server
npm run dev
```

Open **http://localhost:3000/pages/index.html** in your browser.

In a second terminal, launch Claude Code:

```bash
claude
```

---

## Project Structure

```
novatech-demo/
├── src/
│   ├── pages/          # Five HTML pages: index, services, portfolio, team, contact
│   ├── css/            # Stylesheets (variables, base, components, per-page)
│   └── js/             # JavaScript modules (navigation, validation, contact-form, portfolio-filters)
├── tests/
│   ├── e2e/            # Playwright end-to-end tests
│   └── unit/           # Node.js built-in test runner unit tests
├── docs/               # Design specs and API documentation (see below)
├── scripts/            # Automation scripts
├── .claude/            # Subagents, skills, hooks, slash commands, enterprise templates
├── .mcp.json           # MCP server configuration
└── CLAUDE.md           # Canonical project conventions (code style, git workflow, testing)
```

For code conventions, naming rules, and Git workflow, see [CLAUDE.md](./CLAUDE.md).

---

## Available Commands

Run these from the project root:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server on port 3000 |
| `npm run lint` | Lint JS source files with ESLint |
| `npm run lint:fix` | Lint and auto-fix JS source files |
| `npm run format` | Format source files with Prettier |
| `npm run format:check` | Check formatting without writing changes |
| `npm run test` | Run all tests (unit + E2E) |
| `npm run test:unit` | Run unit tests only |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run Playwright E2E tests with interactive UI |

---

## Testing

Run tests before committing:

```bash
npm run test          # All tests
npm run test:unit     # Unit tests only
npm run test:e2e      # Playwright E2E tests only
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/figma-spec.md](./docs/figma-spec.md) | Design specifications and brand tokens |
| [docs/api-spec.md](./docs/api-spec.md) | API specification for backend services |

---

## Figma Design File (Optional)

For the Figma MCP integration modules, you can duplicate the NovaTech designs to your own Figma account:

**Figma Design File:**  
[https://www.figma.com/design/UZ2t3sc5vi2cn9MXHkOfLY/NovaTech-Solutions?node-id=1-2&p=f](https://www.figma.com/design/UZ2t3sc5vi2cn9MXHkOfLY/NovaTech-Solutions?node-id=1-2&p=f)

Click the link (a free Figma account is required). You can inspect the file, use it with MCP, or duplicate it to your Drafts for your own editable copy. This step is optional — you can follow the course without it.

---

## API Tokens

The GitHub and Figma MCP servers require API tokens set as environment variables.

### GitHub Token

1. Go to https://github.com/settings/tokens and generate a classic token with the `repo` and `read:org` scopes.
2. Set the environment variable:

**macOS / Linux:**
```bash
echo 'export GITHUB_TOKEN=your_token_here' >> ~/.zshrc   # or ~/.bashrc on Linux
source ~/.zshrc
```

**Windows (PowerShell):**
```powershell
setx GITHUB_TOKEN "your_token_here"
```

Restart your terminal after running `setx`.

### Figma Token (Remote MCP only)

Desktop MCP uses OAuth and does not need a token. For the remote MCP server:

1. Go to https://www.figma.com/settings → Personal access tokens → Generate new token.
2. Set the environment variable using the same pattern as the GitHub token, but with `FIGMA_ACCESS_TOKEN`.

---

## Course Module Reference

| Module | Feature | Key Files |
|--------|---------|-----------|
| 1 | MCP Server Integration | `.mcp.json` |
| 2 | Subagents | `.claude/agents/` |
| 3 | Git Worktrees | `scripts/setup-worktrees.sh` |
| 4 | Enterprise Features | `.claude/enterprise-templates/` |
| 5 | Agent Skills | `.claude/skills/` |
| 6 | Hooks | `.claude/settings.json` |

---

## Hidden Files

This project uses a `.claude/` folder for Claude Code configurations. It is hidden by default on most operating systems.

| OS | How to show hidden files |
|----|--------------------------|
| macOS | Finder: `Cmd + Shift + .` |
| Windows | File Explorer: View → Show → Hidden items |
| Linux | File manager: `Ctrl + H` or View → Show Hidden Files |
| VS Code | Hidden files are visible by default |
| Terminal | `ls -la` |

---

## License

MIT — educational project for Pluralsight.
