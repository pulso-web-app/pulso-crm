## 1. Implementation

- [x] 1.1 Add automatic date/time masking and verify numeric typing/paste, cursor editing, deletion, invalid values and clearing through Material integration tests.
- [x] 1.2 Connect masks to the shared modal and verify a masked date/time is saved as the correct local instant.

## 2. Verification

- [x] 2.1 Run npm run check, preserving existing picker, pending-save and failure coverage; record results and any browser limitation.
- [x] 2.2 Synchronize and strictly validate specifications, then archive the change.

## Verification evidence

- `npx nx test contacts-feature`: 94 tests passed, including immediate typing without blur, paste, selection replacement, Backspace/Delete at separators, excess digits, invalid dates/times, clearing and saving masked input.
- `npm run check`: documentation, OpenSpec, lint, unit/tooling tests and production build passed.
- Material integration tests exercise the real input controls with repository mocks. No authenticated browser session or live database write was used for this change.
- No dependency, graph, persistence, federation or deployment impact.
- OpenSpec's archive staging rename failed with EPERM on Windows. The synchronized, validated change was archived with native PowerShell Move-Item after checking absolute source and destination paths remain inside the repository changes directory.
