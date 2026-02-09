# Whisper Phased Development Plan

## Overview

This document outlines a phased approach to building Whisper, starting with a minimal prototype and scaling to the full vision. Each phase includes explicit deliverables and non-goals to prevent scope creep.

## Phase 0: Architecture & Foundation (Current)

**Deliverables**:
- ✅ Architecture documentation confirming vision and ICP constraints
- ✅ System diagram showing component relationships
- ✅ Canister pattern proposals (single-canister → multi-canister evolution)
- ✅ Data persistence and cycle management strategies
- ✅ Deployment configuration examples
- ✅ Visual theme direction and style guide
- ✅ Initial UI shell demonstrating theme (no features)

**Architectural Hooks Established**:
- Installation registry interface concept (`registerInstallation`, `getInstallation`)
- Jurisdiction resolution interface hook (`resolveJurisdiction`)
- Escalation API hook (`escalateIssue`)
- Stable memory patterns for future state persistence
- Inter-canister call patterns (documented, not implemented)

**Explicit Non-Goals**:
- No full application features (issue reporting, dashboards, user profiles)
- No AI assistant implementation
- No WSP tokenomics or SNS integration
- No multi-canister deployment (single backend canister only)
- No real-time communication features

---

## Phase 1: Single Installation Prototype (WhisperDavenport-IA)

**Goal**: Build a functional prototype for one city installation to validate core workflows.

**Deliverables**:
1. **Installation Data Model**:
   - Backend stores one installation: WhisperDavenport-IA
   - Fields: scope ("city"), name, owner principal, parent reference (WhisperScottCounty-IA ID as placeholder)
   - Stable memory persistence

2. **Issue Reporting**:
   - Frontend form: title, description, category (pothole, streetlight, etc.), location (text field)
   - Backend `createIssue(installationId, issueData)` update call
   - Issues stored in stable memory with timestamps, status ("open", "in-progress", "resolved")

3. **Issue Dashboard**:
   - Frontend displays list of issues for WhisperDavenport-IA
   - Backend `getIssues(installationId)` query call with pagination
   - Basic filtering by status and category

4. **User Authentication**:
   - Internet Identity integration (already present in template)
   - Associate issues with reporter principal
   - Display "My Issues" view

5. **Basic Issue Detail View**:
   - Click issue → detail page with full description, status, timestamps
   - No collaboration features yet (comments, tasks, evidence uploads)

**Architectural Hooks for Scaling**:
- Installation ID parameter in all backend calls (ready for multi-installation)
- Parent installation reference stored (not used yet, ready for escalation)
- Issue category field (ready for jurisdiction resolution logic)

**Explicit Non-Goals**:
- No multi-installation support (only WhisperDavenport-IA)
- No escalation to parent installation (hook present, not functional)
- No AI routing assistant
- No Basecamp-like project features (tasks, calendar, evidence)
- No happiness rankings or analytics dashboards
- No WSP rewards

**Success Criteria**:
- User can authenticate, report an issue, and see it in the dashboard
- Issues persist across canister upgrades (stable memory test)
- UI is polished and demonstrates Whisper theme

---

## Phase 2: Multi-Installation & Escalation

**Goal**: Expand to multiple installations with parent/child relationships and escalation.

**Deliverables**:
1. **Installation Registry**:
   - Backend stores multiple installations: WhisperDavenport-IA, WhisperScottCounty-IA, WhisperIowa
   - `registerInstallation(scope, name, parentId)` update call (admin-only initially)
   - `listInstallations()` query call

2. **Installation Selection**:
   - Frontend dropdown or map to select installation
   - Route: `/installation/:id` for installation-specific dashboards

3. **Jurisdiction Resolution (Manual)**:
   - Issue form includes "Unsure of jurisdiction?" button
   - User selects from installation list or describes issue
   - Backend stores suggested installation ID (no AI yet)

4. **Escalation Workflow**:
   - Issue detail page shows "Escalate to Parent" button if parent exists
   - Backend `escalateIssue(issueId, targetInstallationId)` update call
   - Issue copied/linked to parent installation, original marked "escalated"

5. **Parent/Child Navigation**:
   - Installation dashboard shows parent link (e.g., "Part of Scott County")
   - Parent dashboard shows child installations (e.g., "Includes Davenport, Bettendorf")

**Architectural Hooks for Scaling**:
- Jurisdiction blueprint DB interface (manual selection now, AI-driven later)
- Inter-canister call pattern documented (single canister now, multi-canister later)

**Explicit Non-Goals**:
- No AI-driven jurisdiction resolution
- No citizen-led installation founding (admin creates installations)
- No multi-canister deployment (all installations in one canister)
- No Basecamp-like project features
- No WSP rewards

**Success Criteria**:
- User can report issue in WhisperDavenport-IA and escalate to WhisperScottCounty-IA
- Escalated issue appears in both dashboards with clear linkage
- Installation hierarchy is navigable

---

## Phase 3: Collaboration & Project Features

**Goal**: Add Basecamp-like collaboration tools to issues.

**Deliverables**:
1. **Issue Projects**:
   - Each issue auto-creates a "project" with tabs: Overview, Tasks, Calendar, Evidence, Discussion

2. **Tasks**:
   - Add/assign tasks to issue (e.g., "Take photo of pothole", "Contact city engineer")
   - Mark tasks complete
   - Task list visible to all project participants

3. **Evidence Uploads**:
   - Drag-and-drop file upload (images, PDFs)
   - Store files in canister stable memory or external storage (IPFS via oracle)
   - Display evidence gallery in issue detail

4. **Discussion Threads**:
   - Threaded comments on issues
   - Mention users (@principal or @username)
   - Notifications (in-app, no email yet)

5. **Calendar/Deadlines**:
   - Set deadlines for issue resolution
   - Calendar view of upcoming deadlines across installation

**Architectural Hooks for Scaling**:
- Notification service interface (in-app now, external service later)
- File storage interface (canister now, IPFS/Arweave later)

**Explicit Non-Goals**:
- No real-time chat (threaded comments only)
- No external notifications (email, SMS)
- No WSP rewards for contributions yet

**Success Criteria**:
- User can add tasks, upload evidence, and discuss issue with other users
- Collaboration features are intuitive and performant

---

## Phase 4: Geography-Driven Instance Creation & AI Routing

**Goal**: Enable citizen-led instance creation using authoritative U.S. geography data and add AI assistant for jurisdiction routing.

### Geography-Driven Instance Creation

**Data Source**: U.S. Census Bureau Gazetteer Files (https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html)

The backend uses official U.S. Census Bureau geography data including:
- All 50 U.S. states
- All 3,143 counties and county-equivalent areas
- All ~19,500 cities, towns, and places (incorporated + CDPs)

**Important**: Data ingestion is developer-operated and offline. The application does not fetch Census data at runtime. Geography data is preprocessed by the developer and uploaded to the backend canister in chunks using admin-only ingestion methods.

**Architecture**: Single backend canister stores all geography data in stable memory (no separate GeographyDB canister). This ensures data survives upgrades and avoids inter-canister call overhead.

**Deliverables**:
1. **Geography Data Storage**:
   - Backend stable memory structures for states, counties, and places with hierarchical relationships
   - Developer-triggered ingestion methods (admin-only) to upload preprocessed Census data in chunks
   - Query methods with pagination/search to avoid unbounded response sizes:
     - `getAllStates()` → returns all states
     - `getCountiesForState(stateGeoId)` → returns counties for a state
     - `getPlacesForCounty(countyGeoId)` → returns places for a county

2. **Cascading Geography Selector**:
   - Replace free-text instance naming with dropdown selectors
   - User flow: Select state → Select county → Select place
   - Auto-generate instance name from selection (e.g., "WhisperDavenport-IA")
   - Existing debounced availability check continues to work

3. **Enhanced Proposal Data Model**:
   - Proposals now include geography metadata: scope, state, county, place names, Census boundary IDs, area, population
   - Proposals list and detail views display geography information in readable English format

4. **Citizen-Led Installation Founding**:
   - Frontend form: "Found a new installation" using geography selectors
   - Backend `submitProposal(...)` update call → status "Pending"
   - Provisional activation milestones (future phase):
     - Minimum 10 verified users join
     - Minimum 5 issues reported
     - Admin review (anti-troll filter)
   - Once activated, installation becomes fully functional

### AI Routing Assistant (Future)

**Deliverables** (deferred to later in Phase 4):
1. **AI Routing Assistant**:
   - Chatbot interface on issue creation: "Describe your issue"
   - AI analyzes description and suggests installation (city vs. county vs. state)
   - Uses jurisdiction blueprint DB (rules-based initially, ML later)
   - User can override AI suggestion

2. **Jurisdiction Blueprint DB**:
   - Expandable rules engine: issue type + location → installation
   - Examples: "pothole" + "Davenport" → WhisperDavenport-IA; "state highway" + "Iowa" → WhisperIowa
   - Admin interface to add/edit rules

**Architectural Hooks for Scaling**:
- Geography query methods support future client-side filtering and search
- Proposal data model extensible for additional metadata
- AI service interface (rules-based now, external ML API later)
- Installation approval workflow (manual admin now, DAO governance later)

**Explicit Non-Goals**:
- No runtime fetching of Census data (developer uploads preprocessed data)
- No separate GeographyDB canister (single-canister architecture)
- No advanced ML models (rules-based AI only, deferred)
- No DAO governance for installation approval (admin-controlled)
- No WSP rewards yet
- No automated scheduled backups (manual export/restore only)

**Success Criteria**:
- Users can select state/county/place from authoritative Census data
- Instance names are auto-generated correctly (e.g., "WhisperDavenport-IA")
- Duplicate detection prevents multiple proposals for same geography
- Proposals display geography metadata in readable format
- Geography data survives canister upgrades (stable memory persistence)
- AI correctly routes 80%+ of issues to appropriate installation (future)
- Citizens can propose new installations and see activation progress

---

## Phase 5: Role Tiers & Verification

**Goal**: Implement user roles and verification tiers for trust and accountability.

**Deliverables**:
1. **User Roles**:
   - Citizen (default): Can report issues, comment, vote
   - Official (verified): Government employee, can update issue status
   - Expert (verified): Legal/tech professional, can provide expert input
   - Journalist (verified): Can access aggregated data for reporting
   - Nonprofit (verified): Can coordinate campaigns

2. **Verification Tiers**:
   - Tier 1 (Anonymous): Internet Identity only, limited actions
   - Tier 2 (Verified Email): Email verification, full issue reporting
   - Tier 3 (Verified Identity): Government ID or professional credential, can be Official/Expert

3. **Role-Based Permissions**:
   - Only Officials can mark issues "resolved"
   - Only Experts can add "expert opinion" section to issues
   - Only Journalists can export aggregated data

4. **Verification Workflow**:
   - User submits verification request (upload credential, email confirmation)
   - Admin reviews and approves (future: automated verification via oracles)

**Architectural Hooks for Scaling**:
- Verification oracle interface (manual admin now, automated later)
- Permission system extensible for future roles

**Explicit Non-Goals**:
- No automated verification (manual admin review)
- No WSP rewards yet

**Success Criteria**:
- Users can request verification and receive role badges
- Role-based permissions are enforced correctly

---

## Phase 6: WSP Tokenomics & Rewards

**Goal**: Integrate Whisper Coin (WSP) tokenomics via ICP SNS.

**Deliverables**:
1. **WSP Token Ledger**:
   - Deploy ICP SNS token canister for WSP
   - Integrate with Whisper backend for balance queries

2. **Contribution Tracking**:
   - Backend logs all contributions: issue reports, resolutions, evidence uploads, expert opinions
   - Contribution score algorithm: time to resolution, community votes, evidence quality

3. **Reward Distribution**:
   - Periodic reward cycles (e.g., weekly)
   - Backend calculates rewards based on contribution scores
   - Distribute WSP to contributor principals

4. **Staking & Governance**:
   - Users can stake WSP to vote on platform changes
   - Governance proposals: new features, rule changes, installation approvals
   - ICP SNS DAO integration

5. **Token Burns for Scarcity**:
   - Transaction fees (e.g., founding installation) burn WSP
   - Deflationary mechanism to increase token value

**Architectural Hooks for Scaling**:
- Token ledger interface (ICP SNS standard)
- Governance proposal interface (ICP SNS DAO)

**Explicit Non-Goals**:
- No external token exchanges (ICP DEX integration later)
- No fiat on/off-ramps

**Success Criteria**:
- Users earn WSP for contributions
- Staking and governance are functional
- Token economics are sustainable

---

## Phase 7: Dashboards & Analytics

**Goal**: Add national/local dashboards with happiness rankings and trend analysis.

**Deliverables**:
1. **Installation Dashboards**:
   - Issue statistics: open, in-progress, resolved counts
   - Average resolution time
   - Top issue categories

2. **Happiness Rankings**:
   - User surveys: "How satisfied are you with [installation]?" (1-5 scale)
   - Aggregate scores displayed on installation pages
   - Leaderboard: top-ranked installations

3. **National Dashboard (WhisperUSA)**:
   - Aggregated statistics across all installations
   - Trend charts: issue volume over time, resolution rates
   - Geographic heatmap of issue density

4. **Comparative Analytics**:
   - Compare installations: "Davenport vs. Bettendorf resolution times"
   - Identify best practices from high-performing installations

**Architectural Hooks for Scaling**:
- Analytics aggregation service (single canister now, dedicated canister later)
- Data export interface for external BI tools

**Explicit Non-Goals**:
- No real-time analytics (batch processing)
- No predictive analytics (descriptive only)

**Success Criteria**:
- Dashboards are informative and visually appealing
- Happiness rankings drive healthy competition among installations

---

## Phase 8: Advanced Features & Scaling

**Goal**: Add advanced features and scale to multi-canister topology.

**Deliverables**:
1. **Multi-Canister Deployment**:
   - Split installations into dedicated canisters (high-traffic installations)
   - Controller canister routes calls to appropriate installation canister
   - Inter-canister escalation calls

2. **Real-Time Notifications**:
   - WebSocket or polling for live updates
   - Email/SMS notifications via external service (oracle)

3. **Campaign Mode**:
   - Users can create campaigns (e.g., "Fix all potholes in Davenport")
   - Aggregate related issues, track progress
   - Fundraising integration (future)

4. **FOIA Request Workflow**:
   - Structured FOIA request form
   - Track request status, responses
   - Public FOIA database

5. **Mobile App**:
   - React Native app for iOS/Android
   - Push notifications
   - Offline mode with sync

**Architectural Hooks for Scaling**:
- Mobile API interface (REST or GraphQL over ICP HTTP gateway)
- External service integrations (email, SMS, payment processors)

**Explicit Non-Goals**:
- No blockchain interoperability (ICP-only)
- No AI-generated content moderation (manual moderation)

**Success Criteria**:
- Platform scales to 100+ installations without performance degradation
- Advanced features are adopted by power users

---

## Summary

This phased plan ensures Whisper is built incrementally with clear milestones and architectural hooks for future scaling. Each phase delivers value while avoiding scope creep. The modular design prevents "bird's nest" tangles and enables parallel development of subsystems.
