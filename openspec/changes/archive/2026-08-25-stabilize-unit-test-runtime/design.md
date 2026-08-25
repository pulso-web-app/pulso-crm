## Context

The unit-test builder defaults to the Native Federation wrapper. The DOM test environment also lacks the browser-native `ResizeObserver` used by the layout directive.

## Goals / Non-Goals

**Goals:** use a supported build target and supply the missing browser boundary in tests.

**Non-Goals:** alter production layout behavior or replace the test runner.

## Decisions

- Configure `crm:esbuild:development` explicitly as the test `buildTarget`.
- Register a minimal test-only `ResizeObserver` implementation through the builder's `setupFiles` option.

## Risks / Trade-offs

- [A test needs resize callbacks] → Keep callback behavior explicit in focused directive tests instead of simulating layout globally.
