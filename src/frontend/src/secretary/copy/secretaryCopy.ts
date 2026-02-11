/**
 * Secretary-specific copy module following the uiCopy pattern.
 * Exports reusable English prompt templates for the flow engine.
 */

export const secretaryCopy = {
  // Menu
  menuGreeting: 'How can I help you today?',
  menuOptions: {
    discovery: 'Discover Your City',
    reportIssue: 'Report an Issue',
    viewProposals: 'View Proposals',
    createInstance: 'Create Instance',
  },

  // Discovery flow
  discoveryPromptState: 'Which state would you like to explore?',
  discoveryPromptLocation: 'Great! Now, which county or city would you like to learn about?',
  discoveryFoundInstance: 'Good news! This location already has an active Whisper instance.',
  discoveryNoInstance: 'This location doesn\'t have a Whisper instance yet. You could be a founding citizen!',
  discoveryTopIssuesPrompt: 'Would you like to see the top issues for this location?',

  // Report issue flow
  reportIssueLoadingData: 'Let me check the top issues for your location...',
  reportIssueTopIssuesPrompt: 'Here are the most common issues in your area. Select one or describe something else:',
  reportIssueNoTopIssues: 'No common issues have been recorded for this location yet. Please describe your issue:',
  reportIssueDescriptionPrompt: 'Please describe the issue you\'d like to report:',
  reportIssueSuggestionsPrompt: 'Based on your description, here are some suggested categories:',
  reportIssueSomethingElse: 'Something else',
  reportIssueCustomCategoryPrompt: 'Please enter a custom category for your issue:',
  reportIssueCategorySelected: 'Great! I\'ll help you create an Issue Project for that.',
  reportIssueNavigating: 'Opening your Issue Project...',
  reportIssueError: 'I\'m having trouble loading issue data. Please try again.',

  // Intent/slot flow
  intentSlotStatePrompt: 'Which state would you like to explore?',
  intentSlotCountyPrompt: (stateName: string) => `Great! Now, which county in ${stateName} would you like to explore?`,
  intentSlotPlacePrompt: (countyName: string) => `Which city or town in ${countyName}?`,
  intentSlotDescriptionPrompt: 'Please describe the issue you\'d like to report:',
  intentSlotCategoryPrompt: 'Based on your description, here are some suggested categories:',
  intentSlotCategoryCustomPrompt: 'Please enter a custom category for your issue:',
  intentSlotRepairConfirm: (slotName: string) => `Got it, I've updated your ${slotName}.`,
  intentSlotCompleteReportIssue: 'Great! I\'ll help you create an Issue Project for that.',
  intentSlotCompleteCreateInstance: 'Taking you to Create Instance...',
  intentSlotCompleteFindInstance: 'Let me show you what\'s happening in your area...',

  // Unknown input recovery
  unknownInputRecovery: 'I\'m not sure I understood that. Could you rephrase, or would you like to return to the main menu?',
  noMatchFound: 'I couldn\'t find a match for that. Try rephrasing or return to the menu.',

  // Navigation
  navigatingTo: (destination: string) => `Taking you to ${destination}...`,

  // General
  backToMenu: 'Back to Menu',
  loading: 'Loading...',
  error: 'Something went wrong. Please try again.',
};
