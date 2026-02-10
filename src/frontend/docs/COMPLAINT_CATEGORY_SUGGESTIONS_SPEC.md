# Complaint Category Suggestions - Developer Specification

## Overview
This feature adds a stable-memory database of common citizen issues/complaints categorized by jurisdiction level (city, county, state) for the AI Secretary to suggest likely categories based on user input. When a user selects a suggestion, the chosen category is automatically attached to the Issue/Complaint Project stub.

## Database Structure

### Storage Approach
- **Stable Memory**: Complaint categories are stored as immutable arrays in the backend canister
- **Organization**: Three separate arrays for city, county, and state levels
- **Persistence**: Data survives canister upgrades (stable memory)

### Data Schema
