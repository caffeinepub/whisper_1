# Complaint Category Suggestions - Developer Specification

## Overview
This document specifies the complaint category suggestion system for the Whisper Secretary assistant, including database structure, backend API endpoints, frontend integration, and the intent/slot flow engine.

## Backend Database Structure

### Category Storage
Categories are stored in three stable arrays in `backend/main.mo`:
- `complaintCategoriesCity: [Text]` - City/place-level categories
- `complaintCategoriesCounty: [Text]` - County-level categories
- `complaintCategoriesState: [Text]` - State-level categories

### Location-Based Complaint Map
A map stores location-specific top issues:
