'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  organizationName: string;
  whatsappNumber: string;
  isActive: boolean;
  services?: {
    serviceType: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

interface LeadAgent {
  id: string;
  agentId: string;
  order: number;
  status: 'assigned' | 'contacted' | 'accepted' | 'working' | 'completed' | 'declined' | 'on_hold' | 'cancelled';
  serviceType: string | null;
  bankName: string | null;
  isCurrent: boolean;
  assignedAt: string;
  contactedAt: string | null;
  acceptedAt: string | null;
  startedWorkingAt: string | null;
  completedAt: string | null;
  declinedAt: string | null;
  agent: Agent;
}

interface AgentAssignmentProps {
  leadId: string;
  setupType?: string | null;
  hasBankProject?: boolean;
  companyCompletedAt?: Date | null;
  onAssign?: () => Promise<void>;
  onStatusChange?: () => Promise<void>;
}

export default function AgentAssignment({ 
  leadId, 
  setupType, 
  hasBankProject, 
  companyCompletedAt,
  onAssign,
  onStatusChange
}: AgentAssignmentProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [companyAgents, setCompanyAgents] = useState<LeadAgent[]>([]);
  const [bankAgents, setBankAgents] = useState<LeadAgent[]>([]);
  const [selectedCompanyAgentIds, setSelectedCompanyAgentIds] = useState<string[]>([]);
  const [selectedBankAgentIds, setSelectedBankAgentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorServiceType, setSelectorServiceType] = useState<'company' | 'bank' | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [settingCurrent, setSettingCurrent] = useState<string | null>(null);
  const [showResetMenu, setShowResetMenu] = useState<string | null>(null);

  // Map setupType to service slug
  const getServiceSlug = (setupType: string | null | undefined): string | null => {
    if (!setupType) return null;
    const normalized = setupType.toLowerCase().trim();
    if (normalized === 'mainland') return 'mainland';
    if (normalized === 'freezone') return 'freezone';
    if (normalized === 'offshore') return 'offshore';
    if (normalized === 'bank') return 'bank';
    if (normalized === 'company') return 'mainland';
    return null;
  };

  // Get all required service slugs
  const getRequiredServiceSlugs = (): string[] => {
    const slugs: string[] = [];
    const companySlug = getServiceSlug(setupType);
    if (companySlug && companySlug !== 'bank') {
      slugs.push(companySlug);
    }
    if (hasBankProject || companySlug === 'bank') {
      slugs.push('bank');
    }
    return [...new Set(slugs)];
  };

  // Filter agents by services
  const filterAgentsByServices = (agents: Agent[], serviceSlugs: string[]): Agent[] => {
    if (serviceSlugs.length === 0) return agents;
    return agents.filter(agent => 
      agent.services?.some(service => 
        serviceSlugs.includes(service.serviceType.slug)
      )
    );
  };

  // Extract bank name from agent name
  const extractBankName = (agentName: string): string | null => {
    const bankPattern = /- (adcb|wio|enbd|emirates nbd|dib|fgb|adib|rakbank|cbd|mashreq|hsbc|standard chartered|citibank|barclays|deutsche bank|commercial bank|ajman bank|nbad|first abu dhabi bank|fab)/i;
    const match = agentName.match(bankPattern);
    if (match) {
      return match[1].toUpperCase();
    }
    const lowerName = agentName.toLowerCase();
    if (lowerName.includes('adcb')) return 'ADCB';
    if (lowerName.includes('wio')) return 'WIO';
    if (lowerName.includes('enbd') || lowerName.includes('emirates nbd')) return 'ENBD';
    return null;
  };

  useEffect(() => {
    fetchAgents();
    fetchAssignedAgents();
  }, [leadId, setupType, hasBankProject]);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        const activeAgents = data.filter((a: Agent) => a.isActive);
        // Don't filter too strictly - we'll filter in getAgentsForService when needed
        setAgents(activeAgents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchAssignedAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leads/${leadId}/agents`);
      if (response.ok) {
        const data = await response.json();
        // Handle both grouped and flat response formats
        const allAssignments = data.all || data;
        const company = data.company || allAssignments.filter((a: LeadAgent) => a.serviceType === 'company');
        const bank = data.bank || allAssignments.filter((a: LeadAgent) => a.serviceType === 'bank');
        
        setCompanyAgents(company.sort((a: LeadAgent, b: LeadAgent) => a.order - b.order));
        setBankAgents(bank.sort((a: LeadAgent, b: LeadAgent) => a.order - b.order));
        setSelectedCompanyAgentIds(company.map((la: LeadAgent) => la.agentId));
        setSelectedBankAgentIds(bank.map((la: LeadAgent) => la.agentId));
      }
    } catch (error) {
      console.error('Error fetching assigned agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (serviceType: 'company' | 'bank') => {
    const selectedIds = serviceType === 'company' ? selectedCompanyAgentIds : selectedBankAgentIds;
    
    if (selectedIds.length === 0) {
      if (!confirm(`Are you sure you want to unassign all ${serviceType} agents from this lead?`)) {
        return;
      }
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/leads/${leadId}/assign-agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentIds: selectedIds,
          serviceType: serviceType,
        }),
      });

      if (response.ok) {
        await fetchAssignedAgents();
        setShowSelector(false);
        setSelectorServiceType(null);
        if (onAssign) {
          await onAssign();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to assign agents');
      }
    } catch (error) {
      console.error('Error assigning agents:', error);
      alert('Failed to assign agents');
    } finally {
      setSaving(false);
    }
  };

  const toggleAgent = (agentId: string, serviceType: 'company' | 'bank') => {
    if (serviceType === 'company') {
      setSelectedCompanyAgentIds(prev => {
        if (prev.includes(agentId)) {
          return prev.filter(id => id !== agentId);
        } else {
          return [...prev, agentId];
        }
      });
    } else {
      setSelectedBankAgentIds(prev => {
        if (prev.includes(agentId)) {
          return prev.filter(id => id !== agentId);
        } else {
          return [...prev, agentId];
        }
      });
    }
  };

  const handleSetCurrent = async (agentId: string) => {
    setSettingCurrent(agentId);
    try {
      const response = await fetch(`/api/leads/${leadId}/agents/${agentId}/set-current`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchAssignedAgents();
        if (onStatusChange) {
          await onStatusChange();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to set current agent');
      }
    } catch (error) {
      console.error('Error setting current agent:', error);
      alert('Failed to set current agent');
    } finally {
      setSettingCurrent(null);
    }
  };

  const handleUpdateStatus = async (agentId: string, status: string) => {
    setUpdatingStatus(agentId);
    try {
      const response = await fetch(`/api/leads/${leadId}/agents/${agentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchAssignedAgents();
        if (onStatusChange) {
          await onStatusChange();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to update agent status');
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      alert('Failed to update agent status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      assigned: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      working: 'bg-purple-100 text-purple-800',
      completed: 'bg-emerald-100 text-emerald-800',
      declined: 'bg-red-100 text-red-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-600',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      assigned: 'Assigned',
      contacted: 'Contacted',
      accepted: 'Accepted',
      working: 'Working',
      completed: 'Completed',
      declined: 'Declined',
      on_hold: 'On Hold',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  // Get all available statuses for reset
  const getAvailableStatuses = (currentStatus: string): string[] => {
    const allStatuses = ['assigned', 'contacted', 'accepted', 'working', 'completed', 'declined', 'on_hold', 'cancelled'];
    // Return all statuses except the current one
    return allStatuses.filter(s => s !== currentStatus);
  };

  // Filter agents by service type
  const getAgentsForService = (serviceType: 'company' | 'bank'): Agent[] => {
    if (serviceType === 'bank') {
      // For bank, show agents whose names contain bank patterns
      return agents.filter(agent => {
        const agentName = agent.name.toLowerCase();
        return extractBankName(agent.name) !== null || 
               agentName.includes('bank') || 
               agentName.includes('adcb') || 
               agentName.includes('wio') || 
               agentName.includes('enbd');
      });
    } else {
      // For company, show agents who provide company setup services (mainland, freezone, or offshore)
      // First try to match the specific setupType, but if no matches, show all company agents
      const companySlug = getServiceSlug(setupType);
      const companyServiceSlugs = ['mainland', 'freezone', 'offshore'];
      
      // Filter out bank agents first
      const nonBankAgents = agents.filter(agent => {
        const agentName = agent.name.toLowerCase();
        return extractBankName(agent.name) === null && 
               !agentName.includes('bank') && 
               !agentName.includes('adcb') && 
               !agentName.includes('wio') && 
               !agentName.includes('enbd');
      });
      
      // If we have a specific company slug, try to match it first
      if (companySlug && companySlug !== 'bank' && companyServiceSlugs.includes(companySlug)) {
        const matchingAgents = nonBankAgents.filter(agent => 
          agent.services?.some(service => 
            service.serviceType.slug === companySlug
          )
        );
        // If we found agents with the specific service, return them
        if (matchingAgents.length > 0) {
          return matchingAgents;
        }
      }
      
      // Otherwise, return all agents that have any company service (mainland, freezone, or offshore)
      const companyAgents = nonBankAgents.filter(agent => 
        agent.services?.some(service => 
          companyServiceSlugs.includes(service.serviceType.slug)
        )
      );
      
      // If we still have no matches, return all non-bank agents (fallback)
      return companyAgents.length > 0 ? companyAgents : nonBankAgents;
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading agents...</div>;
  }

  if (showSelector && selectorServiceType) {
    const availableAgents = getAgentsForService(selectorServiceType);
    const selectedIds = selectorServiceType === 'company' ? selectedCompanyAgentIds : selectedBankAgentIds;
    const isBankOnlyLead = setupType === 'bank';
    const isCompanyCompleted = !!companyCompletedAt;
    const shouldDisableBankSelection = selectorServiceType === 'bank' && !isBankOnlyLead && !isCompanyCompleted;

    return (
      <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        {shouldDisableBankSelection && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            Bank setup agents can only be assigned after company setup is completed
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {selectorServiceType === 'company' ? 'Company Setup' : 'Bank Setup'} Agents (in order of preference)
          </label>
          <div className="space-y-2 border border-gray-200 rounded-md p-3 max-h-64 overflow-y-auto bg-white">
            {availableAgents.length === 0 ? (
              <p className="text-gray-500 text-sm">No agents available for {selectorServiceType} setup</p>
            ) : (
              availableAgents.map((agent) => {
                return (
                  <label key={agent.id} className={`flex items-start space-x-3 p-2 rounded ${
                    shouldDisableBankSelection 
                      ? 'cursor-not-allowed opacity-50' 
                      : 'cursor-pointer hover:bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(agent.id)}
                      onChange={() => !shouldDisableBankSelection && toggleAgent(agent.id, selectorServiceType)}
                      disabled={shouldDisableBankSelection}
                      className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {agent.name}
                          {agent.organizationName && <span className="text-xs text-gray-500 ml-2">({agent.organizationName})</span>}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{agent.whatsappNumber}</div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Agents will be contacted in the order you select them (first selected = first to contact)
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setShowSelector(false);
              setSelectorServiceType(null);
              fetchAssignedAgents();
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => !shouldDisableBankSelection && handleSave(selectorServiceType)}
            disabled={saving || shouldDisableBankSelection}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : selectedIds.length === 0 ? 'Unassign All' : 'Save Assignment'}
          </button>
        </div>
      </div>
    );
  }

  const renderAgentCard = (la: LeadAgent, index: number, serviceType: 'company' | 'bank') => {
    const isCurrent = la.isCurrent;
    const orderNumber = index + 1;
    // Check if bank agents should be disabled (company not completed and not bank-only lead)
    const isBankAgent = serviceType === 'bank';
    const isBankOnlyLead = setupType === 'bank';
    const shouldDisableBankAgent = isBankAgent && !isBankOnlyLead && !companyCompletedAt;
    
    return (
      <div
        key={la.id}
        onClick={() => !shouldDisableBankAgent && handleSetCurrent(la.agentId)}
        className={`p-3 rounded-lg border transition-all ${
          shouldDisableBankAgent 
            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            : isCurrent
            ? 'border-indigo-500 bg-indigo-50 shadow-md cursor-pointer'
            : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
        } ${settingCurrent === la.agentId ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
              {orderNumber}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {la.agent.name}
              {la.agent?.organizationName && <span className="text-xs text-gray-500 ml-2">({la.agent.organizationName})</span>}
            </span>
            {isCurrent && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-600 text-white">
                Current
              </span>
            )}
          </div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(la.status)}`}>
            {getStatusLabel(la.status)}
          </span>
        </div>
        
        {/* Status action buttons */}
        <div className="mt-2 flex flex-wrap gap-2">
          {shouldDisableBankAgent && (
            <span className="text-xs text-amber-700 italic">
              Company setup must be completed first
            </span>
          )}
          {!shouldDisableBankAgent && (
            <div className="relative inline-block">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowResetMenu(showResetMenu === la.agentId ? null : la.agentId);
                }}
                disabled={updatingStatus === la.agentId}
                className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Reset Status
              </button>
              {showResetMenu === la.agentId && (
                <>
                  <div
                    className="fixed inset-0 z-[5]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowResetMenu(null);
                    }}
                  />
                  <div className="absolute left-0 top-full mt-1 z-[10] bg-white border border-gray-200 rounded-md shadow-lg min-w-[140px]">
                    <div className="py-1">
                      {getAvailableStatuses(la.status).map((status) => (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(la.agentId, status);
                            setShowResetMenu(null);
                          }}
                          disabled={updatingStatus === la.agentId}
                          className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {getStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {!shouldDisableBankAgent && la.status === 'contacted' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(la.agentId, 'accepted');
                }}
                disabled={updatingStatus === la.agentId}
                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Mark Accepted
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(la.agentId, 'declined');
                }}
                disabled={updatingStatus === la.agentId}
                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Mark Declined
              </button>
            </>
          )}
          {!shouldDisableBankAgent && la.status === 'accepted' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(la.agentId, 'working');
                }}
                disabled={updatingStatus === la.agentId}
                className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Mark Working
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(la.agentId, 'declined');
                }}
                disabled={updatingStatus === la.agentId}
                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Mark Declined
              </button>
            </>
          )}
          {!shouldDisableBankAgent && la.status === 'working' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(la.agentId, 'completed');
                }}
                disabled={updatingStatus === la.agentId}
                className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
              >
                Mark Completed
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(la.agentId, 'declined');
                }}
                disabled={updatingStatus === la.agentId}
                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Mark Declined
              </button>
            </>
          )}
          {!shouldDisableBankAgent && la.status === 'assigned' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(la.agentId, 'declined');
              }}
              disabled={updatingStatus === la.agentId}
              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Mark Declined
            </button>
          )}
          {!shouldDisableBankAgent && la.status === 'declined' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(la.agentId, 'assigned');
              }}
              disabled={updatingStatus === la.agentId}
              className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  };

  const needsCompany = setupType && setupType !== 'bank';
  const needsBank = hasBankProject || setupType === 'bank';

  return (
    <div className="space-y-4">
      {/* Company Setup Agents */}
      {needsCompany && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-900">Company Setup Agents</div>
            <button
              onClick={() => {
                setSelectorServiceType('company');
                setShowSelector(true);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {companyAgents.length > 0 ? 'Change' : 'Assign'}
            </button>
          </div>
          
          {companyAgents.length > 0 ? (
            <div className="space-y-2">
              {companyAgents.map((la, index) => renderAgentCard(la, index, 'company'))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No company setup agents assigned</div>
          )}
        </div>
      )}

      {/* Bank Setup Agents */}
      {needsBank && (() => {
        const isBankOnlyLead = setupType === 'bank';
        const isCompanyCompleted = !!companyCompletedAt;
        const shouldDisableBankSection = !isBankOnlyLead && !isCompanyCompleted;
        
        return (
          <div className={`space-y-2 ${shouldDisableBankSection ? 'opacity-50' : ''}`}>
            {shouldDisableBankSection && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                Bank setup agents can only be assigned after company setup is completed
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">Bank Setup Agents</div>
              <button
                onClick={() => {
                  if (!shouldDisableBankSection) {
                    setSelectorServiceType('bank');
                    setShowSelector(true);
                  }
                }}
                disabled={shouldDisableBankSection}
                className={`text-sm font-medium ${
                  shouldDisableBankSection
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-indigo-600 hover:text-indigo-800'
                }`}
              >
                {bankAgents.length > 0 ? 'Change' : 'Assign'}
              </button>
            </div>
            
            {bankAgents.length > 0 ? (
              <div className="space-y-2">
                {bankAgents.map((la, index) => renderAgentCard(la, index, 'bank'))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No bank setup agents assigned</div>
            )}
          </div>
        );
      })()}

      {!needsCompany && !needsBank && (
        <div className="text-sm text-gray-500">No service type specified for this lead</div>
      )}
    </div>
  );
}
