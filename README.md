# AIP-C01 Revision Console

A source-backed React revision tool for the **AWS Certified Generative AI Developer - Professional (AIP-C01)** exam.

The current content snapshot represents all items published in the official outline:

- 5 domains
- 20 tasks
- 98 skills
- 106 in-scope AWS service and feature entries
- 12 complete topic guides
- 6 hands-on labs
- 24 original practice questions

This is coverage of the published scope, not a guarantee about unseen exam questions. AWS describes the outline and service list as non-exhaustive and subject to change.

## Run locally

Requires Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm content:generate
pnpm dev
```

Open `http://localhost:3000`.

## Validate

```bash
pnpm content:generate
pnpm lint
pnpm typecheck
pnpm test
```

The content generator validates record counts, stable IDs, relationships, official AWS source links, and practice-question structure.

## Content and learner data

- Source content is generated into `public/data/*.json`.
- The canonical generator is `scripts/generate-content.mjs`.
- Learner progress is stored as JSON in browser local storage.
- Settings provides JSON export, merge import, and reset.
- Progress records use stable IDs and do not duplicate question text.

## Official references

- [AIP-C01 exam guide](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html)
- [AWS certification overview](https://aws.amazon.com/certification/certified-generative-ai-developer-professional/)

Each topic, service, lab, and practice explanation also links directly to relevant AWS documentation.
