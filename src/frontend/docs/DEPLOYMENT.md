# Whisper Deployment Guide

## Overview

This document provides developer-controlled deployment configuration and guidance for Whisper on the Internet Computer Protocol (ICP). **Caffeine.ai does not automatically manage canister lifecycle**—all deployment, upgrade, and cycle management actions are performed by developers via `dfx` commands or scripts.

## Deployment Configuration

### Sample dfx.json

Below is a sample `dfx.json` configuration for Whisper. This example includes one backend canister and the frontend canister. As the project scales to multi-installation topology, additional installation-specific canisters can be added to this configuration.

