/**
 * Ticket History Component
 * Displays the audit trail of all ticket state changes
 */
import React, { useState, useEffect } from 'react';
import {
  Eye,
  Hand,
  Cog,
  CheckCircle2,
  Lock,
  MessageCircle,
  Pencil,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';

export default function TicketHistory({ ticketId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, [ticketId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await api.workflow.getHistory(ticketId);
      setHistory(response.data?.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      'REVIEWED': Eye,
      'ASSIGNED': Hand,
      'WORK_STARTED': Cog,
      'RESOLVED': CheckCircle2,
      'CLOSED': Lock,
      'COMMENTED': MessageCircle,
      'UPDATED': Pencil,
    };
    return icons[action] || FileText;
  };

  const getActionColor = (action) => {
    const colors = {
      'REVIEWED': 'bg-purple-50 border-purple-200',
      'ASSIGNED': 'bg-orange-50 border-orange-200',
      'WORK_STARTED': 'bg-yellow-50 border-yellow-200',
      'RESOLVED': 'bg-green-50 border-green-200',
      'CLOSED': 'bg-gray-50 border-gray-200',
      'COMMENTED': 'bg-blue-50 border-blue-200',
      'UPDATED': 'bg-indigo-50 border-indigo-200',
    };
    return colors[action] || 'bg-gray-50 border-gray-200';
  };

  const getStatusTransitionLabel = (fromStatus, toStatus) => {
    if (!fromStatus || !toStatus) return '';
    return `${fromStatus || 'N/A'} → ${toStatus || 'N/A'}`;
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading history...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Activity History</h3>
        <p className="text-sm text-gray-500 mt-1">{history.length} events</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800">
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No activity yet
        </div>
      ) : (
        <div className="divide-y">
          {history.map((event, index) => (
            <div key={event.id} className={`p-4 border-l-4 border-l-transparent ${getActionColor(event.action)}`}>
              <div className="flex items-start gap-4">
                {(() => {
                  const Icon = getActionIcon(event.action);
                  return (
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-gray-700" />
                    </div>
                  );
                })()}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {event.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        by <strong>{event.first_name} {event.last_name}</strong>
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {formatDate(event.created_at)}
                    </div>
                  </div>

                  {/* Status Transition */}
                  {(event.from_status || event.to_status) && (
                    <div className="mt-2 inline-block px-2 py-1 bg-white rounded text-xs text-gray-600 border">
                      {getStatusTransitionLabel(event.from_status, event.to_status)}
                    </div>
                  )}

                  {/* Notes */}
                  {event.notes && (
                    <p className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border-l-2 border-gray-300">
                      {event.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
