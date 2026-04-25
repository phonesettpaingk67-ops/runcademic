import Badge from './Badge';

export default function TicketTable({ tickets, onAction }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Priority</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-700">#{ticket.id}</td>
              <td className="px-4 py-3 text-gray-700 font-medium">{ticket.title}</td>
              <td className="px-4 py-3">
                <Badge status={ticket.status} />
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-sm ${
                  ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.priority}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 text-sm">{ticket.created}</td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onAction && onAction(ticket.id)}
                  className="text-[#E05F6B] hover:text-[#D94D5A] font-medium text-sm"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
