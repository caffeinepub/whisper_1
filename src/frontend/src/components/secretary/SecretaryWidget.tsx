import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, ArrowLeft, FileText, AlertTriangle, MapPin, Plus } from 'lucide-react';
import { IconBubble } from '@/components/common/IconBubble';
import { useSecretaryChat } from '@/hooks/useSecretaryChat';
import { useSecretaryNavigationRegistry } from '@/hooks/useSecretaryNavigationRegistry';
import { useGetAllStates, useGetCountiesForState, useGetPlacesForState } from '@/hooks/useUSGeography';
import { useSecretaryInstanceAvailability } from '@/hooks/useSecretaryInstanceAvailability';
import { useComplaintSuggestions } from '@/hooks/useComplaintSuggestions';
import { useSetIssueProjectCategory } from '@/hooks/useSetIssueProjectCategory';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SecretaryLocationTypeahead } from './SecretaryLocationTypeahead';
import { parseDeepLink } from '@/lib/secretaryNavigation';
import { signalProjectNavigation } from '@/utils/secretaryProjectNavigation';
import { computeCanonicalInstanceName } from '@/lib/whisperInstanceNaming';
import { uiCopy } from '@/lib/uiCopy';
import { USHierarchyLevel, type USState, type USCounty, type USPlace } from '@/backend';

interface SecretaryWidgetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOptionSelect?: (optionNumber: number) => void;
  initialFlow?: 'discovery' | null;
}

type DiscoveryStep = 'idle' | 'select-state' | 'select-county-or-city' | 'checking-availability' | 'result';
type ReportIssueStep = 'idle' | 'collect-description' | 'show-suggestions' | 'custom-category' | 'complete';

interface TypeaheadOption {
  id: string;
  label: string;
  data: any;
}

export function SecretaryWidget({ open = false, onOpenChange, onOptionSelect, initialFlow }: SecretaryWidgetProps) {
  const { messages, isMenuVisible, addUserMessage, addAssistantMessage, returnToMenu, resetChat } = useSecretaryChat();
  const { findByKeyword, navigate } = useSecretaryNavigationRegistry();
  const [userInput, setUserInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Discovery flow state
  const [discoveryStep, setDiscoveryStep] = useState<DiscoveryStep>('idle');
  const [selectedState, setSelectedState] = useState<USState | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<USCounty | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<USPlace | null>(null);
  const [instanceExists, setInstanceExists] = useState<boolean>(false);
  
  // Report issue flow state
  const [reportIssueStep, setReportIssueStep] = useState<ReportIssueStep>('idle');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueLevel, setIssueLevel] = useState<USHierarchyLevel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const debouncedDescription = useDebouncedValue(issueDescription, 500);
  
  const { data: states = [], isLoading: statesLoading } = useGetAllStates();
  const { data: counties = [], isLoading: countiesLoading } = useGetCountiesForState(selectedState?.hierarchicalId || null);
  const { data: places = [], isLoading: placesLoading } = useGetPlacesForState(selectedState?.hierarchicalId || null);
  
  // Determine which level to check based on current selection
  const availabilityLevel = selectedPlace 
    ? USHierarchyLevel.place 
    : selectedCounty 
    ? USHierarchyLevel.county 
    : selectedState 
    ? USHierarchyLevel.state 
    : null;

  const availabilityParams = availabilityLevel && selectedState ? {
    level: availabilityLevel,
    state: selectedState,
    county: selectedCounty,
    place: selectedPlace,
  } : null;

  const { data: instanceAvailable, isLoading: checkingAvailability } = useSecretaryInstanceAvailability(availabilityParams);
  
  const { data: suggestions = [], isLoading: suggestionsLoading } = useComplaintSuggestions(
    issueLevel,
    debouncedDescription,
    reportIssueStep === 'show-suggestions'
  );
  
  const setCategoryMutation = useSetIssueProjectCategory();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, discoveryStep, reportIssueStep]);

  useEffect(() => {
    if (open) {
      const deepLink = parseDeepLink(window.location.hash);
      if (deepLink && deepLink.type === 'section') {
        window.location.hash = '';
      }
      
      // Start discovery flow if requested
      if (initialFlow === 'discovery') {
        startDiscoveryFlow();
      }
    }
  }, [open, initialFlow]);

  // Handle availability check completion
  useEffect(() => {
    if (discoveryStep === 'checking-availability' && !checkingAvailability && instanceAvailable !== undefined) {
      setInstanceExists(instanceAvailable);
      
      if (instanceAvailable) {
        addAssistantMessage(uiCopy.secretary.discoveryFoundInstance);
      } else {
        // Determine founding citizen message
        const message = getFoundingCitizenMessage();
        addAssistantMessage(message);
      }
      
      setDiscoveryStep('result');
    }
  }, [discoveryStep, checkingAvailability, instanceAvailable]);

  const startDiscoveryFlow = () => {
    addAssistantMessage(uiCopy.secretary.discoveryPromptState);
    setDiscoveryStep('select-state');
  };

  const startReportIssueFlow = () => {
    // Determine jurisdiction level based on current geography selection
    let level: USHierarchyLevel = USHierarchyLevel.state;
    if (selectedPlace) {
      level = USHierarchyLevel.place;
    } else if (selectedCounty) {
      level = USHierarchyLevel.county;
    } else if (selectedState) {
      level = USHierarchyLevel.state;
    }
    
    setIssueLevel(level);
    addAssistantMessage(uiCopy.secretary.reportIssueDescriptionPrompt);
    setReportIssueStep('collect-description');
  };

  const handleStateSelect = (option: TypeaheadOption) => {
    const state = option.data as USState;
    setSelectedState(state);
    addUserMessage(state.longName);
    addAssistantMessage(`${uiCopy.secretary.discoveryPromptCityOrCounty}`);
    setDiscoveryStep('select-county-or-city');
  };

  const handleCountySelect = (option: TypeaheadOption) => {
    const county = option.data as USCounty;
    setSelectedCounty(county);
    addUserMessage(county.fullName);
    
    // Start availability check
    addAssistantMessage(uiCopy.secretary.checkingAvailability);
    setDiscoveryStep('checking-availability');
  };

  const handlePlaceSelect = (option: TypeaheadOption) => {
    const place = option.data as USPlace;
    setSelectedPlace(place);
    addUserMessage(place.shortName);
    
    // Start availability check
    addAssistantMessage(uiCopy.secretary.checkingAvailability);
    setDiscoveryStep('checking-availability');
  };

  const getFoundingCitizenMessage = (): string => {
    // This is a simplified version - in reality we'd check all levels
    if (selectedPlace) {
      return uiCopy.secretary.foundingCitizenCity;
    } else if (selectedCounty) {
      return uiCopy.secretary.foundingCitizenCounty;
    } else {
      return uiCopy.secretary.foundingCitizenState;
    }
  };

  const handleDescriptionSubmit = () => {
    if (!issueDescription.trim()) return;
    
    addUserMessage(issueDescription);
    addAssistantMessage(uiCopy.secretary.reportIssueSuggestionsPrompt);
    setReportIssueStep('show-suggestions');
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    addUserMessage(category);
    addAssistantMessage(uiCopy.secretary.reportIssueCategorySelected);
    
    // Find or create the appropriate proposal
    const proposalName = computeCanonicalInstanceName(selectedState, selectedCounty, selectedPlace);
    
    if (proposalName) {
      // Save category
      try {
        await setCategoryMutation.mutateAsync({
          proposalId: proposalName,
          category,
        });
        
        // Signal navigation to project
        setTimeout(() => {
          signalProjectNavigation({ proposalName, category });
          addAssistantMessage(uiCopy.secretary.reportIssueNavigating);
          
          setTimeout(() => {
            handleClose();
          }, 1000);
        }, 500);
      } catch (error) {
        console.error('Failed to set category:', error);
        addAssistantMessage('Failed to save category. Please try again.');
      }
    }
    
    setReportIssueStep('complete');
  };

  const handleSomethingElse = () => {
    addUserMessage(uiCopy.secretary.reportIssueSomethingElse);
    addAssistantMessage(uiCopy.secretary.reportIssueCustomCategory);
    setReportIssueStep('custom-category');
  };

  const handleCustomCategorySubmit = async () => {
    if (!userInput.trim()) return;
    
    const customCategory = userInput.trim();
    await handleCategorySelect(customCategory);
    setUserInput('');
  };

  const handleDiscoveryAction = () => {
    if (instanceExists) {
      navigate('proposals');
    } else {
      navigate('create-instance');
    }
    handleClose();
  };

  const handleClose = () => {
    onOpenChange?.(false);
    setTimeout(() => {
      resetChat();
      setDiscoveryStep('idle');
      setReportIssueStep('idle');
      setSelectedState(null);
      setSelectedCounty(null);
      setSelectedPlace(null);
      setIssueDescription('');
      setIssueLevel(null);
      setSelectedCategory(null);
      setUserInput('');
      setInstanceExists(false);
    }, 300);
  };

  const handleOptionSelect = (optionNumber: number) => {
    onOptionSelect?.(optionNumber);
    
    switch (optionNumber) {
      case 1:
        startDiscoveryFlow();
        break;
      case 2:
        startReportIssueFlow();
        break;
      case 3:
        navigate('proposals');
        handleClose();
        break;
      case 4:
        navigate('create-instance');
        handleClose();
        break;
      default:
        break;
    }
  };

  const handleFreeTextSubmit = () => {
    if (!userInput.trim()) return;
    
    addUserMessage(userInput);
    
    const match = findByKeyword(userInput);
    if (match) {
      navigate(match.id);
      handleClose();
    } else {
      addAssistantMessage(uiCopy.secretary.noMatchFound);
    }
    
    setUserInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (reportIssueStep === 'collect-description') {
        handleDescriptionSubmit();
      } else if (reportIssueStep === 'custom-category') {
        handleCustomCategorySubmit();
      } else if (isMenuVisible) {
        handleFreeTextSubmit();
      }
    }
  };

  // Convert geography data to TypeaheadOption format
  const stateOptions: TypeaheadOption[] = states.map(state => ({
    id: state.hierarchicalId,
    label: state.longName,
    data: state,
  }));

  const countyOptions: TypeaheadOption[] = counties.map(county => ({
    id: county.hierarchicalId,
    label: county.fullName,
    data: county,
  }));

  const placeOptions: TypeaheadOption[] = places.map(place => ({
    id: place.hierarchicalId,
    label: place.shortName,
    data: place,
  }));

  const renderContent = () => {
    // Discovery flow UI
    if (discoveryStep === 'select-state') {
      return (
        <div className="space-y-4">
          <SecretaryLocationTypeahead
            options={stateOptions}
            onSelect={handleStateSelect}
            placeholder={uiCopy.secretary.typeaheadStatePlaceholder}
            emptyMessage={uiCopy.secretary.typeaheadNoResults}
            isLoading={statesLoading}
          />
        </div>
      );
    }

    if (discoveryStep === 'select-county-or-city') {
      return (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{uiCopy.secretary.typeaheadCountyHelper}</p>
            <SecretaryLocationTypeahead
              options={countyOptions}
              onSelect={handleCountySelect}
              placeholder={uiCopy.secretary.typeaheadCountyPlaceholder}
              emptyMessage={uiCopy.secretary.typeaheadNoResults}
              isLoading={countiesLoading}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">{uiCopy.secretary.typeaheadCityHelper}</p>
            <SecretaryLocationTypeahead
              options={placeOptions}
              onSelect={handlePlaceSelect}
              placeholder={uiCopy.secretary.typeaheadCityPlaceholder}
              emptyMessage={uiCopy.secretary.typeaheadNoResults}
              isLoading={placesLoading}
            />
          </div>
        </div>
      );
    }

    if (discoveryStep === 'result') {
      return (
        <div className="space-y-3">
          <Button
            onClick={handleDiscoveryAction}
            className="w-full"
            size="lg"
          >
            {instanceExists ? (
              <>
                <FileText className="mr-2 h-4 w-4" />
                View Existing Instance
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Instance Proposal
              </>
            )}
          </Button>
        </div>
      );
    }

    // Report issue flow UI
    if (reportIssueStep === 'collect-description') {
      return (
        <div className="space-y-3">
          <Input
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the issue..."
            className="w-full"
          />
          <Button
            onClick={handleDescriptionSubmit}
            disabled={!issueDescription.trim()}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      );
    }

    if (reportIssueStep === 'show-suggestions') {
      return (
        <div className="space-y-2">
          {suggestionsLoading ? (
            <p className="text-sm text-muted-foreground">Loading suggestions...</p>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((category, index) => (
                <Button
                  key={index}
                  onClick={() => handleCategorySelect(category)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {category}
                </Button>
              ))}
              <Button
                onClick={handleSomethingElse}
                variant="ghost"
                className="w-full"
              >
                Something else
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSomethingElse}
              variant="outline"
              className="w-full"
            >
              Enter custom category
            </Button>
          )}
        </div>
      );
    }

    if (reportIssueStep === 'custom-category') {
      return (
        <div className="space-y-3">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter category name..."
            className="w-full"
          />
          <Button
            onClick={handleCustomCategorySubmit}
            disabled={!userInput.trim()}
            className="w-full"
          >
            Submit
          </Button>
        </div>
      );
    }

    // Main menu
    if (isMenuVisible) {
      return (
        <div className="space-y-3">
          {uiCopy.secretary.menuOptions.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleOptionSelect(index + 1)}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3"
            >
              <span className="flex items-center gap-3">
                <IconBubble size="sm" variant="secondary">
                  {index === 0 && <MapPin className="h-4 w-4" />}
                  {index === 1 && <AlertTriangle className="h-4 w-4" />}
                  {index === 2 && <FileText className="h-4 w-4" />}
                  {index === 3 && <Plus className="h-4 w-4" />}
                </IconBubble>
                <span>{option}</span>
              </span>
            </Button>
          ))}
        </div>
      );
    }

    return null;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      <Card className="w-full max-w-md shadow-2xl pointer-events-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            {!isMenuVisible && (
              <Button
                variant="ghost"
                size="icon"
                onClick={returnToMenu}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <IconBubble size="sm" variant="secondary">
                <MessageCircle className="h-4 w-4" />
              </IconBubble>
              <CardTitle className="text-lg">{uiCopy.secretary.title}</CardTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea ref={scrollRef} className="h-[400px] pr-4">
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {renderContent()}

          {isMenuVisible && (
            <div className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Or type your request..."
                className="flex-1"
              />
              <Button
                onClick={handleFreeTextSubmit}
                size="icon"
                disabled={!userInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
