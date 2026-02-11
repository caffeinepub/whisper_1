import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, ArrowLeft, FileText, AlertTriangle, MapPin, Plus } from 'lucide-react';
import { IconBubble } from '@/components/common/IconBubble';
import { useSecretaryNavigationRegistry } from '@/hooks/useSecretaryNavigationRegistry';
import { useGetAllStates, useGetCountiesForState, useGetPlacesForState } from '@/hooks/useUSGeography';
import { useGetAllProposals } from '@/hooks/useQueries';
import { useComplaintSuggestions } from '@/hooks/useComplaintSuggestions';
import { useSetIssueProjectCategory } from '@/hooks/useSetIssueProjectCategory';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useActor } from '@/hooks/useActor';
import { SecretaryLocationTypeahead } from './SecretaryLocationTypeahead';
import { signalProjectNavigation } from '@/utils/secretaryProjectNavigation';
import { FlowEngineBrain } from '@/secretary/brain/FlowEngineBrain';
import { prepareUIViewModel } from '@/secretary/ui/secretaryViewModel';
import type { Action } from '@/secretary/flow/types';
import { USHierarchyLevel } from '@/backend';

interface SecretaryWidgetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOptionSelect?: (optionNumber: number) => void;
  initialFlow?: 'discovery' | null;
}

interface TypeaheadOption {
  id: string;
  label: string;
  data: any;
}

export function SecretaryWidget({ open = false, onOpenChange, onOptionSelect, initialFlow }: SecretaryWidgetProps) {
  const { findByKeyword, navigate } = useSecretaryNavigationRegistry();
  const { actor } = useActor();
  const [userInput, setUserInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const brainRef = useRef<FlowEngineBrain | null>(null);
  const [, setForceUpdate] = useState(0);

  // Initialize brain
  if (!brainRef.current) {
    brainRef.current = new FlowEngineBrain(actor);
    brainRef.current.setKeywordFinder(findByKeyword);
    brainRef.current.setNavigationHandler((request) => {
      navigate(request.destinationId);
      if (request.shouldClose) {
        onOpenChange?.(false);
      }
    });
  }

  const brain = brainRef.current;

  // Update actor when it changes
  useEffect(() => {
    if (brain) {
      brain.setActor(actor);
    }
  }, [actor, brain]);

  // Geography queries
  const { data: allStates = [] } = useGetAllStates();
  const context = brain.getContext();
  
  // Use slots for intent/slot filling, fallback to discovery state
  const stateForQuery = context.activeIntent ? context.slots.state : context.selectedState;
  
  const { data: countiesForState = [] } = useGetCountiesForState(
    stateForQuery?.hierarchicalId || null
  );
  const { data: placesForState = [] } = useGetPlacesForState(
    stateForQuery?.hierarchicalId || null
  );

  // Update brain with geography data
  useEffect(() => {
    if (brain) {
      brain.setGeographyData(allStates, countiesForState, placesForState);
    }
  }, [allStates, countiesForState, placesForState, brain]);

  // Proposals query
  const { data: allProposals = [] } = useGetAllProposals();

  // Complaint suggestions - use slots for intent/slot filling
  const descriptionForQuery = context.activeIntent 
    ? context.slots.issue_description 
    : context.reportIssueDescription;
  const levelForQuery = context.activeIntent && context.slots.state
    ? USHierarchyLevel.state
    : context.reportIssueGeographyLevel;
    
  const debouncedSearchTerm = useDebouncedValue(descriptionForQuery, 300);
  const { data: complaintSuggestions = [] } = useComplaintSuggestions(
    levelForQuery,
    debouncedSearchTerm,
    context.currentNode === 'report-show-suggestions' ||
    (!!context.activeIntent && context.currentNode === 'intent-slot-filling')
  );

  // Update brain with suggestions
  useEffect(() => {
    if (brain) {
      brain.setComplaintSuggestions(complaintSuggestions);
    }
  }, [complaintSuggestions, brain]);

  const { mutate: setIssueProjectCategory } = useSetIssueProjectCategory();

  // Get view model from brain
  const viewModel = brain.getViewModel();
  const uiViewModel = prepareUIViewModel(viewModel);
  const messages = brain.getMessages();
  const isMenuVisible = brain.isShowingMenu();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize discovery flow if requested
  useEffect(() => {
    if (open && initialFlow === 'discovery' && isMenuVisible) {
      handleAction({ type: 'menu-option', payload: 1 });
    }
  }, [open, initialFlow]);

  // Don't render if not open (after all hooks are called)
  if (!open) {
    return null;
  }

  const handleAction = async (action: Action) => {
    await brain.handleAction(action);
    setForceUpdate((n) => n + 1);

    // Handle special actions
    if (action.type === 'menu-option') {
      onOptionSelect?.(action.payload);
    }

    if (action.type === 'custom-category-submitted' || action.type === 'top-issue-selected' || action.type === 'suggestion-selected') {
      const category = action.payload;
      const proposalName = 'temp-proposal-id';
      setIssueProjectCategory({ proposalId: proposalName, category });

      setTimeout(() => {
        signalProjectNavigation({ proposalName, category });
        onOpenChange?.(false);
      }, 1000);
    }
  };

  const handleUserMessageSubmit = async () => {
    if (!userInput.trim()) return;

    const message = userInput.trim();
    setUserInput('');

    await brain.handleUserText(message);
    setForceUpdate((n) => n + 1);
  };

  const handleBackToMenu = async () => {
    await handleAction({ type: 'back-to-menu' });
  };

  const handleClose = () => {
    onOpenChange?.(false);
  };

  const handleTypeaheadSelect = async (option: TypeaheadOption) => {
    if (context.currentNode === 'discovery-select-state') {
      await handleAction({ type: 'state-selected', payload: option.data });
    } else if (context.currentNode === 'discovery-select-location') {
      await handleAction({ type: 'location-selected', payload: option.data });
    } else if (context.activeIntent && context.currentNode === 'intent-slot-filling') {
      // Handle intent/slot filling typeahead
      if (option.data.fipsCode && option.data.longName) {
        // State
        await handleAction({ type: 'state-selected', payload: option.data });
      } else {
        // County or place
        await handleAction({ type: 'location-selected', payload: option.data });
      }
    }
  };

  const typeaheadOptions = brain.getTypeaheadOptions();
  const suggestions = brain.getSuggestions();

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-2xl z-overlay">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center gap-3">
          <IconBubble size="sm">
            <MessageCircle className="h-4 w-4" />
          </IconBubble>
          <CardTitle className="text-lg font-semibold">Secretary</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {!isMenuVisible && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToMenu}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea ref={scrollRef} className="h-96 p-4">
          {isMenuVisible ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                How can I help you today?
              </p>
              <div className="grid gap-2">
                {uiViewModel.buttons.map((button, idx) => {
                  const Icon = button.icon === 'MapPin' ? MapPin : button.icon === 'AlertTriangle' ? AlertTriangle : button.icon === 'FileText' ? FileText : Plus;
                  return (
                    <Button
                      key={idx}
                      variant={button.variant || 'outline'}
                      className="justify-start h-auto py-3 px-4"
                      onClick={() => handleAction(button.action)}
                    >
                      <Icon className="mr-3 h-5 w-5 shrink-0" />
                      <span className="text-left">{button.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {uiViewModel.shouldShowTypeahead && (
                <div className="mt-4">
                  <SecretaryLocationTypeahead
                    options={typeaheadOptions}
                    onSelect={handleTypeaheadSelect}
                    placeholder={uiViewModel.typeaheadPlaceholder}
                  />
                </div>
              )}

              {uiViewModel.shouldShowTopIssues && uiViewModel.topIssues.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uiViewModel.topIssues.map((issue, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3"
                      onClick={() => handleAction({ type: 'top-issue-selected', payload: issue })}
                    >
                      <span className="text-sm">{issue}</span>
                    </Button>
                  ))}
                </div>
              )}

              {uiViewModel.shouldShowSuggestions && suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3"
                      onClick={() => handleAction({ type: 'suggestion-selected', payload: suggestion })}
                    >
                      <span className="text-sm">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              )}

              {!isMenuVisible && uiViewModel.buttons.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uiViewModel.buttons.map((button, idx) => (
                    <Button
                      key={idx}
                      variant={button.variant || 'outline'}
                      className="w-full"
                      onClick={() => handleAction(button.action)}
                    >
                      {button.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {!isMenuVisible && uiViewModel.shouldShowTextInput && (
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserMessageSubmit();
              }}
              className="flex gap-2"
            >
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={uiViewModel.textInputPlaceholder || 'Type your message...'}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!userInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
