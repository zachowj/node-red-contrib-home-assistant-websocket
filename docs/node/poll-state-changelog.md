---
sidebar: auto
---

# Poll State Changelog

## Version 1

- "if state"/"halt if" will now send the message to the first output if true and to the second if not. The old behavior, sending the message to the second output if true, will continue to be in place until you edit one of the existing nodes via the UI and at that time the outputs will automatically be switched.
