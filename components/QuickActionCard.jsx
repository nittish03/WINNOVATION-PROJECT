import Link from "next/link"

export default function QuickActionCard({ title, actions }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
          >
            {action.icon && (
              <span className="mr-3 text-gray-500 group-hover:text-gray-700">
                {action.icon}
              </span>
            )}
            <span className="font-medium text-gray-700 group-hover:text-gray-900">
              {action.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
