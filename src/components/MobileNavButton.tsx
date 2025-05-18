interface MobileNavButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function MobileNavButton({ onClick, isOpen }: MobileNavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-600 md:hidden transform transition-transform hover:scale-105 active:scale-95"
      aria-label="Toggle navigation menu"
    >
      <div className="w-6 h-6 flex items-center justify-center">
        <div className="relative w-6 h-4">
          <span
            className={`absolute left-0 h-0.5 w-6 bg-white transform transition-all duration-300 ${
              isOpen ? 'rotate-45 top-2' : 'rotate-0 top-0'
            }`}
          />
          <span
            className={`absolute left-0 h-0.5 w-6 bg-white transform transition-all duration-300 ${
              isOpen ? 'opacity-0 top-2' : 'opacity-100 top-2'
            }`}
          />
          <span
            className={`absolute left-0 h-0.5 w-6 bg-white transform transition-all duration-300 ${
              isOpen ? '-rotate-45 top-2' : 'rotate-0 top-4'
            }`}
          />
        </div>
      </div>
    </button>
  );
} 