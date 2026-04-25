/**
 * Workflow Panel Component
 * Shows available workflow actions based on user role and ticket status
 */
import React, { useState } from 'react';
import { api } from '../services/api';

export default function WorkflowPanel({ ticket, user, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);

  // State colors for UI
  const stateColors = {
    submission: 'bg-blue-100 text-blue-800',
    review: 'bg-purple-100 text-purple-800',
    assigned: 'bg-orange-100 text-orange-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const handleReview = async (notes) => {
    try {
      setLoading(true);
      await api.workflow.review(ticket.id, { notes });
      onStatusChange();
      setError('');
      setExpandedSection(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to review ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (assignedTo, notes) => {
    try {
      setLoading(true);
      await api.workflow.assign(ticket.id, { assigned_to: assignedTo, notes });
      onStatusChange();
      setError('');
      setExpandedSection(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (notes) => {
    try {
      setLoading(true);
      await api.workflow.startWork(ticket.id, { notes });
      onStatusChange();
      setError('');
      setExpandedSection(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start work');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (resolutionNotes) => {
    try {
      setLoading(true);
      await api.workflow.resolve(ticket.id, { resolution_notes: resolutionNotes });
      onStatusChange();
      setError('');
      setExpandedSection(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resolve ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (notes) => {
    try {
      setLoading(true);
      await api.workflow.close(ticket.id, { notes });
      onStatusChange();
      setError('');
      setExpandedSection(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to close ticket');
    } finally {
      setLoading(false);
    }
  };

  // Check if current user can perform action
  const isAdmin = user?.role === 'admin';
  const isAssigned = ticket?.assigned_to === user?.user_id;
  const isReporter = ticket?.user_id === user?.user_id;
  const isStaff = ['staff', 'faculty'].includes(user?.role);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Ticket Workflow</h3>

      {/* Current Status */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Current Status</p>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${stateColors[ticket?.workflow_status] || 'bg-gray-100'}`}>
            {ticket?.workflow_status?.toUpperCase().replace('_', ' ')}
          </span>
          {ticket?.workflow_status === 'in_progress' && (
            <div className="text-sm text-gray-600">
              Assigned to: <strong>{ticket?.assigned_first_name || 'Unassigned'}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {/* Available Actions */}
      <div className="space-y-3">
        {/* Admin - Review Action */}
        {isAdmin && ticket?.workflow_status === 'submission' && (
          <AdminReviewSection
            loading={loading}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            onReview={handleReview}
          />
        )}

        {/* Admin - Assign Action */}
        {isAdmin && ticket?.workflow_status === 'review' && (
          <AdminAssignSection
            loading={loading}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            onAssign={handleAssign}
            ticket={ticket}
          />
        )}

        {/* Staff - Start Work Action */}
        {(isAssigned || isAdmin) && ticket?.workflow_status === 'assigned' && (
          <StaffStartWorkSection
            loading={loading}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            onStartWork={handleStartWork}
          />
        )}

        {/* Staff - Resolve Action */}
        {(isAssigned || isAdmin) && ticket?.workflow_status === 'in_progress' && (
          <StaffResolveSection
            loading={loading}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            onResolve={handleResolve}
          />
        )}

        {/* Admin - Close Action */}
        {isAdmin && ticket?.workflow_status === 'resolved' && (
          <AdminCloseSection
            loading={loading}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            onClose={handleClose}
            resolutionNotes={ticket?.resolution_notes}
          />
        )}

        {/* No Actions Available */}
        {!((isAdmin && ticket?.workflow_status === 'submission') ||
          (isAdmin && ticket?.workflow_status === 'review') ||
          ((isAssigned || isAdmin) && ticket?.workflow_status === 'assigned') ||
          ((isAssigned || isAdmin) && ticket?.workflow_status === 'in_progress') ||
          (isAdmin && ticket?.workflow_status === 'resolved')) && (
          <div className="p-3 bg-gray-50 text-gray-600 rounded">
            No actions available for your role in this ticket state.
          </div>
        )}
      </div>
    </div>
  );
}

// Admin Review Section
function AdminReviewSection({ loading, expandedSection, setExpandedSection, onReview }) {
  const [notes, setNotes] = useState('');

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setExpandedSection(expandedSection === 'review' ? null : 'review')}
        className="w-full p-3 flex items-center justify-between hover:bg-blue-50"
      >
        <span className="font-medium text-blue-700">Review Ticket</span>
        <span>{expandedSection === 'review' ? '−' : '+'}</span>
      </button>
      {expandedSection === 'review' && (
        <div className="p-4 border-t bg-blue-50">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add review notes..."
            className="w-full p-2 border rounded mb-3"
            rows="3"
          />
          <button
            onClick={() => onReview(notes)}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Approve for Assignment'}
          </button>
        </div>
      )}
    </div>
  );
}

// Admin Assign Section
function AdminAssignSection({ loading, expandedSection, setExpandedSection, onAssign, ticket }) {
  const [assignedTo, setAssignedTo] = useState(ticket?.assigned_to || '');
  const [notes, setNotes] = useState('');
  const [staffList] = React.useState([
    { id: 2, name: 'Demo Instructor' },
    // Staff would be fetched from API
  ]);

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setExpandedSection(expandedSection === 'assign' ? null : 'assign')}
        className="w-full p-3 flex items-center justify-between hover:bg-orange-50"
      >
        <span className="font-medium text-orange-700">Assign to Staff</span>
        <span>{expandedSection === 'assign' ? '−' : '+'}</span>
      </button>
      {expandedSection === 'assign' && (
        <div className="p-4 border-t bg-orange-50">
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full p-2 border rounded mb-3"
          >
            <option value="">Select staff member...</option>
            {staffList.map(staff => (
              <option key={staff.id} value={staff.id}>{staff.name}</option>
            ))}
          </select>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add assignment notes..."
            className="w-full p-2 border rounded mb-3"
            rows="2"
          />
          <button
            onClick={() => onAssign(assignedTo, notes)}
            disabled={loading || !assignedTo}
            className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Assign Ticket'}
          </button>
        </div>
      )}
    </div>
  );
}

// Staff Start Work Section
function StaffStartWorkSection({ loading, expandedSection, setExpandedSection, onStartWork }) {
  const [notes, setNotes] = useState('');

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setExpandedSection(expandedSection === 'start' ? null : 'start')}
        className="w-full p-3 flex items-center justify-between hover:bg-yellow-50"
      >
        <span className="font-medium text-yellow-700">Start Work</span>
        <span>{expandedSection === 'start' ? '−' : '+'}</span>
      </button>
      {expandedSection === 'start' && (
        <div className="p-4 border-t bg-yellow-50">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add work notes..."
            className="w-full p-2 border rounded mb-3"
            rows="2"
          />
          <button
            onClick={() => onStartWork(notes)}
            disabled={loading}
            className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Start Working on Ticket'}
          </button>
        </div>
      )}
    </div>
  );
}

// Staff Resolve Section
function StaffResolveSection({ loading, expandedSection, setExpandedSection, onResolve }) {
  const [resolutionNotes, setResolutionNotes] = useState('');

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setExpandedSection(expandedSection === 'resolve' ? null : 'resolve')}
        className="w-full p-3 flex items-center justify-between hover:bg-green-50"
      >
        <span className="font-medium text-green-700">Resolve Ticket</span>
        <span>{expandedSection === 'resolve' ? '−' : '+'}</span>
      </button>
      {expandedSection === 'resolve' && (
        <div className="p-4 border-t bg-green-50">
          <textarea
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Explain how the issue was resolved..."
            className="w-full p-2 border rounded mb-3"
            rows="3"
            required
          />
          <button
            onClick={() => onResolve(resolutionNotes)}
            disabled={loading || !resolutionNotes.trim()}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Mark as Resolved'}
          </button>
        </div>
      )}
    </div>
  );
}

// Admin Close Section
function AdminCloseSection({ loading, expandedSection, setExpandedSection, onClose, resolutionNotes }) {
  const [notes, setNotes] = useState('');

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setExpandedSection(expandedSection === 'close' ? null : 'close')}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-100"
      >
        <span className="font-medium text-gray-700">Close Ticket</span>
        <span>{expandedSection === 'close' ? '−' : '+'}</span>
      </button>
      {expandedSection === 'close' && (
        <div className="p-4 border-t bg-gray-50">
          {resolutionNotes && (
            <div className="mb-3 p-2 bg-white border rounded">
              <p className="text-sm font-medium text-gray-600 mb-1">Resolution Notes:</p>
              <p className="text-sm text-gray-800">{resolutionNotes}</p>
            </div>
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add closing notes (optional)..."
            className="w-full p-2 border rounded mb-3"
            rows="2"
          />
          <button
            onClick={() => onClose(notes)}
            disabled={loading}
            className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Close Ticket'}
          </button>
        </div>
      )}
    </div>
  );
}
