interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      <h2 className="text-lg font-medium text-gray-900">{title}</h2>
    </div>
  );
}