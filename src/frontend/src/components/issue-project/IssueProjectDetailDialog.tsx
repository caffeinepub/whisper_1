import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Users, FileText, CheckSquare, Tag } from 'lucide-react';
import { IconBubble } from '@/components/common/IconBubble';
import { IssueProjectTasksTab } from './IssueProjectTasksTab';
import { useGetIssueProjectCategory } from '@/hooks/useSetIssueProjectCategory';
import type { Proposal } from '@/backend';
import { formatProposalGeographyString, getGeographyLevelLabel } from '@/lib/formatProposalGeography';

interface IssueProjectDetailDialogProps {
  proposalName: string;
  proposal: Proposal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IssueProjectDetailDialog({
  proposalName,
  proposal,
  open,
  onOpenChange,
}: IssueProjectDetailDialogProps) {
  const category = useGetIssueProjectCategory(proposalName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <IconBubble size="lg" variant="secondary">
              <MapPin className="h-6 w-6" />
            </IconBubble>
            <DialogTitle className="text-2xl">Issue Project: {proposal.instanceName}</DialogTitle>
          </div>
          <DialogDescription className="text-white/70">
            {formatProposalGeographyString(proposal)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-secondary data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-secondary data-[state=active]:text-white"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Status and Category */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Status:</span>
                <Badge
                  variant={
                    proposal.status === 'Approved'
                      ? 'default'
                      : proposal.status === 'Rejected'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className={
                    proposal.status === 'Pending'
                      ? 'bg-secondary/20 text-secondary border-secondary/30'
                      : ''
                  }
                >
                  {proposal.status}
                </Badge>
              </div>
              
              {category && (
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm">Category:</span>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                    <Tag className="h-3 w-3 mr-1" />
                    {category}
                  </Badge>
                </div>
              )}
            </div>

            <Separator className="bg-white/10" />

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <IconBubble size="sm" variant="secondary">
                  <FileText className="h-4 w-4" />
                </IconBubble>
                Description
              </h4>
              <p className="text-white/80 leading-relaxed">{proposal.description}</p>
            </div>

            <Separator className="bg-white/10" />

            {/* Geography Details */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <IconBubble size="sm" variant="secondary">
                  <MapPin className="h-4 w-4" />
                </IconBubble>
                Geography Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Level:</span>
                  <p className="text-white">{getGeographyLevelLabel(proposal.geographyLevel)}</p>
                </div>
                <div>
                  <span className="text-white/60">State:</span>
                  <p className="text-white">{proposal.state}</p>
                </div>
                {proposal.county && proposal.county !== 'N/A' && (
                  <div>
                    <span className="text-white/60">County:</span>
                    <p className="text-white">{proposal.county}</p>
                  </div>
                )}
                <div>
                  <span className="text-white/60">Census ID:</span>
                  <p className="text-white font-mono text-xs">{proposal.censusBoundaryId}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Demographics */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <IconBubble size="sm" variant="secondary">
                  <Users className="h-4 w-4" />
                </IconBubble>
                Demographics
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Population (2020):</span>
                  <p className="text-white">{proposal.population2020}</p>
                </div>
                <div>
                  <span className="text-white/60">Area:</span>
                  <p className="text-white">{(Number(proposal.squareMeters) / 1_000_000).toFixed(2)} km²</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <IssueProjectTasksTab proposalId={proposalName} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
