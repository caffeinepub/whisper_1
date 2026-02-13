# Specification

## Summary
**Goal:** Store the currently selected “Photo (optional)” file in `PostComposer` component state (no upload).

**Planned changes:**
- Add a new `useState` value in `frontend/src/components/feed/PostComposer.tsx` to hold the selected photo file (`File | null`).
- Add an `onChange` handler to the existing photo `<Input type="file">` to update that state from `e.target.files` (set to `null` when none selected).
- Clear the selected photo state back to `null` after a successful post submission (after `createPost.mutateAsync` resolves), alongside existing resets.

**User-visible outcome:** When a user selects a photo file in the composer, the selection is tracked locally and is cleared after successfully submitting a post (without uploading or attaching the photo to the post).
