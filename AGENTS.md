
# Viblooop Angular Engineering Instructions

## Project Context
This repository contains the production Angular frontend for Viblooop.
It supports event creation, chat, notifications, user profiles,
profile verification, and other application features.

This is an existing production application, not a greenfield project.

## Core Engineering Principles
- Inspect existing implementation before making changes.
- Follow existing architecture, coding conventions, and patterns.
- Prefer minimal, targeted changes over unnecessary refactoring.
- Never rewrite working functionality without a clear reason.
- Avoid introducing new dependencies unless genuinely necessary.
- Preserve existing behavior unless the requirement explicitly changes it.
- Do not assume Angular version, libraries, or configuration.
  Inspect package.json and relevant configuration first.

## Angular Architecture
- Follow the existing component, service, directive, and module
  or standalone component architecture.
- Keep components focused on presentation and orchestration.
- Keep API communication inside established services.
- Reuse shared components, utilities, pipes, and directives.
- Avoid duplicating business logic across components.
- Follow existing lazy-loading and routing conventions.
- Respect the existing state-management approach.
- Do not introduce a new state-management library unnecessarily.

## TypeScript Standards
- Prefer strict typing and meaningful interfaces.
- Avoid `any`; use `unknown` when appropriate.
- Avoid unnecessary type assertions.
- Prefer immutable updates where appropriate.
- Use clear, descriptive names.
- Keep functions small and responsibilities focused.
- Avoid deeply nested conditionals.
- Handle null, undefined, and optional values safely.

## Angular Performance
- Follow the repository's existing change-detection strategy.
- Avoid unnecessary subscriptions and repeated computations.
- Prefer async pipe where it fits existing patterns.
- Clean up manually managed subscriptions.
- Avoid unnecessary DOM manipulation.
- Track collections appropriately in loops.
- Avoid expensive computations inside templates.
- Avoid unnecessary component re-rendering.
- Use lazy loading where appropriate.
- Avoid unnecessary API calls and duplicate requests.

## UI / UX
- Reuse existing design system and shared UI components.
- Maintain consistent spacing, typography, colors, and interactions.
- Preserve responsive behavior across desktop, tablet, and mobile.
- Ensure loading, empty, success, and error states are handled.
- Avoid generic or visually inconsistent UI.
- Maintain accessibility, keyboard navigation, and semantic HTML.
- Do not introduce arbitrary styling conventions.

## API Integration
- Follow existing API service patterns.
- Preserve backend API contracts.
- Do not invent endpoints, payloads, or response properties.
- Inspect existing interfaces and API usage before integration.
- Handle API loading, success, and error states.
- Avoid exposing sensitive information in logs.
- Do not hardcode API URLs, credentials, or secrets.

## Security
- Never bypass authentication or authorization.
- Never store secrets in frontend code.
- Avoid unsafe DOM manipulation and untrusted HTML rendering.
- Do not weaken existing route guards or interceptors.
- Preserve existing security-related behaviors.
- Avoid logging personal information or sensitive data.

## Testing
- Inspect existing test conventions before writing tests.
- Add or update tests for meaningful behavior changes.
- Test edge cases and error states where appropriate.
- Run relevant tests and builds when feasible.
- Never claim tests passed without executing them.

## Production Safety
- Avoid unrelated changes.
- Do not remove existing functionality without approval.
- Do not modify environment configuration unnecessarily.
- Do not commit generated files, credentials, or secrets.
- Highlight potential breaking changes before implementation.
- Never deploy or modify production infrastructure unless explicitly requested.

## Workflow
1. Understand the requested behavior.
2. Identify relevant components, services, routes, and models.
3. Trace the existing implementation.
4. Explain the root cause or implementation approach briefly.
5. Make the smallest maintainable change.
6. Validate affected functionality.
7. Summarize changed files, behavior, and verification.

## Response Expectations
- Be concise and technically accurate.
- Explain important decisions only.
- Clearly identify assumptions and limitations.
- Report tests and build results honestly.
- Mention potential regressions or risks.
