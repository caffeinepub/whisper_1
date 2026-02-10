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
import { useGetAllProposals } from '@/hooks/useQueries';
import { useComplaintSuggestions } from '@/hooks/useComplaintSuggestions';
import { useSetIssueProjectCategory } from '@/hooks/useSetIssueProjectCategory';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SecretaryLocationTypeahead } from './SecretaryLocationTypeahead';
import { parseDeepLink } from '@/lib/secretaryNavigation';
import { signalProjectNavigation } from '@/utils/secretaryProjectNavigation';
import { uiCopy } from '@/lib/uiCopy';
import { USHierarchyLevel, type USState, type USCounty, type USPlace } from '@/backend';

interface SecretaryWidgetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOptionSelect?: (optionNumber: number) => void;
  initialFlow?: 'discovery' | null;
}

type DiscoveryStep = 'idle' | 'select-state' | 'select-county-or-city' | 'result';
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
  
  // Report issue flow state
  const [reportIssueStep, setReportIssueStep] = useState<ReportIssueStep>('idle');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueLevel, setIssueLevel] = useState<USHierarchyLevel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const debouncedDescription = useDebouncedValue(issueDescription, 500);
  
  const { data: states = [], isLoading: statesLoading } = useGetAllStates();
  const { data: counties = [], isLoading: countiesLoading } = useGetCountiesForState(selectedState?.hierarchicalId || null);
  const { data: places = [], isLoading: placesLoading } = useGetPlacesForState(selectedState?.hierarchicalId || null);
  const { data: proposals = [] } = useGetAllProposals();
  
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
    evaluateInstanceAvailability('county', selectedState, county, null);
  };

  const handlePlaceSelect = (option: TypeaheadOption) => {
    const place = option.data as USPlace;
    setSelectedPlace(place);
    addUserMessage(place.shortName);
    evaluateInstanceAvailability('place', selectedState, selectedCounty, place);
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
    const proposalName = getProposalNameForCurrentGeography();
    
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

  const getProposalNameForCurrentGeography = (): string | null => {
    if (!selectedState) return null;
    
    if (selectedPlace) {
      return `WHISPER-${selectedPlace.shortName},${selectedState.longName}`;
    } else if (selectedCounty) {
      return `WHISPER-${selectedCounty.fullName},${selectedState.longName}`;
    } else {
      return `WHISPER-${selectedState.longName}`;
    }
  };

  const evaluateInstanceAvailability = (
    level: 'state' | 'county' | 'place',
    state: USState | null,
    county: USCounty | null,
    place: USPlace | null
  ) => {
    if (!state) return;

    // Build instance name patterns to check
    const statePattern = `WHISPER-${state.longName}`;
    const countyPattern = county ? `WHISPER-${county.fullName},${state.longName}` : null;
    const placePattern = place ? `WHISPER-${place.shortName},${state.longName}` : null;

    // Check which instances exist
    const existingInstances = proposals.map(([name]) => name);
    const hasState = existingInstances.some(name => name === statePattern);
    const hasCounty = countyPattern ? existingInstances.some(name => name === countyPattern) : false;
    const hasPlace = placePattern ? existingInstances.some(name => name === placePattern) : false;

    // Determine what to show
    if (level === 'place' && hasPlace) {
      // Show result with explicit action
      addAssistantMessage(uiCopy.secretary.discoveryFoundInstance);
      setDiscoveryStep('result');
    } else if (level === 'county' && hasCounty) {
      // Show result with explicit action
      addAssistantMessage(uiCopy.secretary.discoveryFoundInstance);
      setDiscoveryStep('result');
    } else if (hasState && !hasCounty && !hasPlace) {
      // Only state exists
      addAssistantMessage(uiCopy.secretary.discoveryFoundInstance);
      setDiscoveryStep('result');
    } else {
      // Show founding citizen message with explicit action
      let message = '';
      const missing: string[] = [];
      
      if (!hasPlace && level === 'place') missing.push('City');
      if (!hasCounty && level !== 'state') missing.push('County');
      if (!hasState) missing.push('State');
      
      if (missing.length === 3) {
        message = uiCopy.secretary.foundingCitizenAll;
      } else if (missing.length === 2) {
        if (missing.includes('City') && missing.includes('County')) {
          message = uiCopy.secretary.foundingCitizenCityCounty;
        } else if (missing.includes('City') && missing.includes('State')) {
          message = uiCopy.secretary.foundingCitizenCityState;
        } else {
          message = uiCopy.secretary.foundingCitizenCountyState;
        }
      } else if (missing.length === 1) {
        if (missing.includes('City')) {
          message = uiCopy.secretary.foundingCitizenCity;
        } else if (missing.includes('County')) {
          message = uiCopy.secretary.foundingCitizenCounty;
        } else {
          message = uiCopy.secretary.foundingCitizenState;
        }
      }
      
      addAssistantMessage(message);
      setDiscoveryStep('result');
    }
  };

  const handleDiscoveryAction = () => {
    // Check if instance exists
    const existingInstances = proposals.map(([name]) => name);
    const statePattern = selectedState ? `WHISPER-${selectedState.longName}` : null;
    const countyPattern = selectedCounty && selectedState ? `WHISPER-${selectedCounty.fullName},${selectedState.longName}` : null;
    const placePattern = selectedPlace && selectedState ? `WHISPER-${selectedPlace.shortName},${selectedState.longName}` : null;
    
    const hasInstance = 
      (placePattern && existingInstances.includes(placePattern)) ||
      (countyPattern && existingInstances.includes(countyPattern)) ||
      (statePattern && existingInstances.includes(statePattern));
    
    if (hasInstance) {
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
      // Check if instance exists
      const existingInstances = proposals.map(([name]) => name);
      const statePattern = selectedState ? `WHISPER-${selectedState.longName}` : null;
      const countyPattern = selectedCounty && selectedState ? `WHISPER-${selectedCounty.fullName},${selectedState.longName}` : null;
      const placePattern = selectedPlace && selectedState ? `WHISPER-${selectedPlace.shortName},${selectedState.longName}` : null;
      
      const hasInstance = 
        (placePattern && existingInstances.includes(placePattern)) ||
        (countyPattern && existingInstances.includes(countyPattern)) ||
        (statePattern && existingInstances.includes(statePattern));
      
      return (
        <div className="space-y-4">
          <Button
            onClick={handleDiscoveryAction}
            className="w-full bg-accent hover:bg-accent-hover text-accent-foreground"
          >
            {hasInstance ? uiCopy.secretary.discoveryViewInstanceButton : uiCopy.secretary.discoveryCreateProposalButton}
          </Button>
        </div>
      );
    }

    // Report issue flow UI
    if (reportIssueStep === 'collect-description') {
      return (
        <div className="space-y-4">
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
            className="w-full bg-accent hover:bg-accent-hover text-accent-foreground"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </div>
      );
    }

    if (reportIssueStep === 'show-suggestions') {
      return (
        <div className="space-y-2">
          {suggestionsLoading ? (
            <div className="text-sm text-muted-foreground">Loading suggestions...</div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((category, index) => (
                <Button
                  key={index}
                  onClick={() => handleCategorySelect(category)}
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  {category}
                </Button>
              ))}
              <Button
                onClick={handleSomethingElse}
                variant="ghost"
                className="w-full"
              >
                {uiCopy.secretary.reportIssueSomethingElse}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSomethingElse}
              variant="outline"
              className="w-full"
            >
              {uiCopy.secretary.reportIssueSomethingElse}
            </Button>
          )}
        </div>
      );
    }

    if (reportIssueStep === 'custom-category') {
      return (
        <div className="space-y-4">
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
            className="w-full bg-accent hover:bg-accent-hover text-accent-foreground"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </div>
      );
    }

    // Main menu
    if (isMenuVisible) {
      return (
        <div className="space-y-3">
          <Button
            onClick={() => handleOptionSelect(1)}
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3"
          >
            <IconBubble size="sm">
              <MapPin className="h-4 w-4" />
            </IconBubble>
            <span className="text-left">Discover Your City</span>
          </Button>
          
          <Button
            onClick={() => handleOptionSelect(2)}
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3"
          >
            <IconBubble size="sm">
              <AlertTriangle className="h-4 w-4" />
            </IconBubble>
            <span className="text-left">Report an Issue</span>
          </Button>
          
          <Button
            onClick={() => handleOptionSelect(3)}
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3"
          >
            <IconBubble size="sm">
              <FileText className="h-4 w-4" />
            </IconBubble>
            <span className="text-left">View Proposals</span>
          </Button>
          
          <Button
            onClick={() => handleOptionSelect(4)}
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3"
          >
            <IconBubble size="sm">
              <Plus className="h-4 w-4" />
            </IconBubble>
            <span className="text-left">Create Instance</span>
          </Button>
        </div>
      );
    }

    return null;
  };

  if (!open) return null;

  return (
    <Card className="w-full max-w-md shadow-2xl border-2 border-accent/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center gap-3">
          <IconBubble size="md">
            <MessageCircle className="h-5 w-5" />
          </IconBubble>
          <CardTitle className="text-xl font-bold">{uiCopy.secretary.widgetTitle}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {!isMenuVisible && (
            <Button
              onClick={returnToMenu}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <ScrollArea ref={scrollRef} className="h-[400px] pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-accent text-accent-foreground'
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
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={uiCopy.secretary.inputPlaceholder}
                className="flex-1"
              />
              <Button
                onClick={handleFreeTextSubmit}
                size="icon"
                disabled={!userInput.trim()}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
