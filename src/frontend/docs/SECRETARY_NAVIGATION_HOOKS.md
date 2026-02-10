# Secretary Navigation Hooks

This document describes how to register new destinations and actions for the Secretary assistant, enabling it to direct users to specific pages, features, or in-page sections.

## Overview

The Secretary navigation system uses a registry pattern that allows features to register themselves as navigable destinations. The Secretary can then direct users to these destinations via:

1. **Option selection** - Quick action buttons in the chat interface
2. **Free-text routing** - Keyword matching in user messages
3. **Deep links** - URL-based navigation with query parameters or hash fragments

## Core Components

### 1. Navigation Registry Hook

**File:** `frontend/src/hooks/useSecretaryNavigationRegistry.ts`

The registry hook provides methods to register, unregister, and navigate to destinations:

