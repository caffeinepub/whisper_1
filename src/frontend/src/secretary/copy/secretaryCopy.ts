/**
 * Secretary-specific copy module with English prompt templates for menu greeting,
 * discovery flow, report issue flow, intent/slot flow, and unknown input recovery messages.
 * Extended with guided report-issue flow copy and category dropdown labels.
 */

export const secretaryCopy = {
  // Menu
  menuGreeting: 'Hello! I\'m your Secretary. How can I help you today?',
  menuOptions: {
    discovery: 'Discover Your Area',
    reportIssue: 'Report an Issue',
    viewProposals: 'View Proposals',
    createInstance: 'Create Instance',
  },
  backToMenu: 'Back to Menu',

  // Discovery flow
  discoveryPromptState: 'Which state would you like to explore?',
  discoveryPromptLocation: 'Now, select a county or city within that state.',
  discoveryResultMessage: 'Great! I found information about your selected location.',

  // Legacy report issue flow
  reportIssueLoadingData: 'Loading issue reporting data...',
  reportIssueDescriptionPrompt: 'Please describe the issue you\'d like to report.',
  reportIssuePromptDescription: 'Please describe the issue you\'d like to report.',
  reportIssueCustomCategoryPrompt: 'Please enter a custom category for your issue.',
  reportIssuePromptCustomCategory: 'Please enter a custom category for your issue.',
  reportIssueCategorySelected: 'Thank you! Your issue has been recorded. You\'ll earn contribution points for reporting this issue.',
  reportIssueSomethingElse: 'Something else',
  reportIssueComplete: 'Thank you! Your issue has been submitted successfully.',

  // Guided report-issue flow
  guidedReportTitlePrompt: 'What would you like to call this issue? Please enter a short title.',
  guidedReportPromptTitle: 'What would you like to call this issue? Please enter a short title.',
  guidedReportLocationPrompt: 'Where is the issue located? Please select a state, then optionally a county or city.',
  guidedReportPromptLocation: 'Where is the issue located? Please select a state, then optionally a county or city.',
  guidedReportCategoryPrompt: 'What category best describes this issue?',
  guidedReportPromptCategory: 'What category best describes this issue?',
  guidedReportCategoryPromptWithSuggestions: 'Here are some suggested categories based on your location. Choose one or select "Something else" to enter a custom category.',
  guidedReportDetailsPrompt: 'Please describe the issue in detail.',
  guidedReportPromptDetails: 'Please describe the issue in detail.',
  guidedReportConfirmationPrompt: 'Please review your issue report and confirm to submit:',
  guidedReportPromptConfirmation: 'Please review your issue report and confirm to submit:',
  guidedReportConfirmationSuccess: 'Thank you! Your issue has been submitted. You\'ll earn contribution points for reporting this issue.',
  
  // Guided report-issue buttons
  guidedReportSomethingElse: 'Something else',
  guidedReportConfirm: 'Confirm & Submit',
  guidedReportEditTitle: 'Edit Title',
  guidedReportEditLocation: 'Edit Location',
  guidedReportEditCategory: 'Edit Category',
  guidedReportEditDetails: 'Edit Details',

  // Category dropdown
  categoryDropdownLabel: 'Issue Category',
  categoryDropdownPlaceholder: 'Select a category',
  categoryDropdownEmptyPlaceholder: 'No categories available',
  guidedReportCategoryLabel: 'Issue Category',
  guidedReportCategoryPlaceholder: 'Select a category',

  // Unknown input recovery
  unknownInputRecovery: 'I didn\'t understand that. Please try again or use the menu options.',
};
