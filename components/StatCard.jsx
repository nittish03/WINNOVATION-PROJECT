export default function StatCard({ title, value, icon, color, size = "large" }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200", 
    purple: "bg-purple-50 border-purple-200",
    yellow: "bg-yellow-50 border-yellow-200",
    orange: "bg-orange-50 border-orange-200",
    red: "bg-red-50 border-red-200"
  }

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600", 
    yellow: "text-yellow-600",
    orange: "text-orange-600",
    red: "text-red-600"
  }

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 ${colors[color]} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`${size === 'small' ? 'text-xl' : 'text-3xl'} font-bold text-gray-900`}>
            {value || 0}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]} ${iconColors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
