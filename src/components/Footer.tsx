export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
          <span>© {new Date().getFullYear()} TimeBase</span>
        </div>
      </div>
    </footer>
  );
}
