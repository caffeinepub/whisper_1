# Whisper Architecture Documentation

## Vision Confirmation

Whisper is a decentralized, community-empowered civic accountability platform built on the Internet Computer Protocol (ICP). This document confirms the architectural vision and translates it into an ICP-aligned base architecture **without implementing full application features**. This is an architecture-only phase.

### Core Principles

**Equality & Merit-Based Influence**: Whisper shifts power from centralized elites to citizens through verifiable contributions. Reverence and influence derive from measurable impact (time/effort resolving issues), not insider advantages or manipulation.

**Immutable Accountability**: All actions are logged immutably on-chain, preventing manipulation and ensuring transparency. Future reward mechanisms (WSP tokenomics) will be based on verified impact.

**Citizen Empowerment**: Citizens report issues that auto-create Basecamp-like Issue Projects for collaboration (evidence uploads, conversations, calendars, tasks). The platform interfaces citizens with officials, legal/tech professionals, journalists, and nonprofits.

### Hierarchical Installation Model

Whisper organizes as a hierarchy of **installations**—hyper-local to national sub-sites within one unified platform:

**Installation Definition**: An installation is a jurisdiction-specific instance (e.g., WhisperDavenport-IA for Davenport city, WhisperScottCounty-IA for Scott County). Each installation has:
- **Scope**: Geographic/jurisdictional boundary (city, county, state, national)
- **Local Dashboard**: Issues, happiness rankings, trends specific to that jurisdiction
- **Visual Identity**: Custom header image, branding aligned to locality
- **Parent/Child Relationships**: Links to parent jurisdiction (city → county → state → national)
- **Escalation Paths**: Issues can be escalated to parent installations when jurisdiction is unclear or broader action is needed

**Hierarchy Levels**:
1. **City Level** (e.g., WhisperDavenport-IA): Local issues like potholes, city ordinances, municipal services
2. **County Level** (e.g., WhisperScottCounty-IA): County roads, sheriff's office, county health services
3. **State Level** (e.g., WhisperIowa): State highways, state agencies, legislative issues
4. **National/Federal Level** (e.g., WhisperUSA): Federal agencies, national policy, aggregated trends

**Citizen-Led Founding**: New installations are founded by citizens via a low-barrier form. Provisional activation occurs through milestones (e.g., minimum user count, verified issues) to filter out trolls and ensure genuine community need.

### ICP Canister Mapping

Each installation maps to ICP canister boundaries as follows:

**Current Phase (Single-Canister Prototype)**:
- One backend canister contains all installation logic
- Installation data stored in stable memory with clear module boundaries
- Future-ready interfaces for multi-canister topology

**Future Multi-Canister Topology** (developer-deployed):
- **Controller/Registry Canister**: Manages installation registry, jurisdiction blueprint DB, global governance
- **Installation Canisters**: One per major installation (or grouped by region), containing issues, projects, user data for that jurisdiction
- **Shared Service Canisters**: Authentication, WSP token ledger, notification service, AI routing assistant

**Inter-Canister Communication**: Installations communicate via inter-canister calls for escalation (e.g., city installation calls county installation's `escalateIssue` endpoint).

### Modular Subsystems with Scaling Hooks

To avoid "bird's nest" tangles, the architecture includes modular subsystems with explicit interfaces from day one:

**Installation Registry Module**:
- Interface: `registerInstallation(scope, parent)`, `getInstallation(id)`, `listChildren(parentId)`
- Stores installation metadata (scope, owner, parent/child relationships)
- Hook for dynamic installation creation (future)

**Jurisdiction Resolution Module**:
- Interface: `resolveJurisdiction(issueType, location)` → returns appropriate installation ID
- Uses blueprint DB (expandable to state/federal rules)
- Hook for AI assistant integration (future)

**Issue Management Module**:
- Interface: `createIssue(installationId, details)`, `updateIssue(id, status)`, `escalateIssue(id, targetInstallationId)`
- Manages issue lifecycle within an installation
- Hook for Basecamp-like project features (tasks, calendar, evidence uploads)

**Escalation/Linking Module**:
- Interface: `escalate(issueId, fromInstallation, toInstallation)`, `linkIssues(issueIds)`
- Handles cross-installation issue routing
- Hook for inter-canister calls in multi-canister topology

**User/Role Module**:
- Interface: `registerUser(principal, role)`, `verifyUser(principal, tier)`
- Manages user identities and verification tiers (future)
- Hook for Internet Identity integration (already present)

**Reward/Tokenomics Module** (future):
- Interface: `recordContribution(principal, issueId, impact)`, `distributeRewards()`
- Tracks contributions and distributes WSP tokens
- Hook for ICP SNS integration

### Integrity & Equality Principles

**Immutable Logs**: All issue actions, status changes, and contributions are logged to stable memory with timestamps and actor principals. Logs are append-only and cannot be modified, ensuring auditability.

**Impact-Based Rewards** (future module): WSP token distribution is algorithmically determined by verified contributions (issue resolution time, evidence quality, community votes). No manual override by admins.

**Transparent Governance** (future module): Platform governance via ICP SNS allows token holders to vote on protocol changes, ensuring decentralized control.

## System Diagram

