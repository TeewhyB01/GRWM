# GRWM Firebase

Firebase rules and local emulator test helpers live here.

- `firestore.rules`: Cloud Firestore security rules.
- `storage.rules`: Firebase Storage security rules.
- `tests/`: Firestore and Storage emulator rules tests, synthetic seed data, and local seed helpers.

Run local rules tests from the repository root:

```bash
pnpm test:firestore-rules
pnpm test:storage-rules
pnpm test:firebase-rules
```
