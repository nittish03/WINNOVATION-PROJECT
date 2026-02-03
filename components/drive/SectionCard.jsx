export default function SectionCard({ children, className = "" }) {
  return (
    <div className={`bg-white shadow-lg border border-gray-200 rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}

