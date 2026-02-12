# Production Deployment Retry Runbook

This runbook provides step-by-step guidance for retrying a failed production deployment and capturing diagnostic information for follow-up troubleshooting.

## Prerequisites

Before retrying a deployment, verify:

1. **Network Connectivity**: Ensure stable internet connection to ICP mainnet
2. **Cycles Balance**: Confirm sufficient cycles in your wallet for deployment
3. **Build Artifacts**: Verify that the local build completed successfully
4. **Canister IDs**: Check that canister IDs are correctly configured in `canister_ids.json`
5. **Identity**: Confirm you're using the correct dfx identity with deployment permissions

## Retry Checklist

Follow these steps in order:

### 1. Check Current State

