const languages = ['English', 'हिंदी', 'বাংলা', 'தமிழ்', 'తెలుగు'];

export default function LanguagePage() {
  return (
    <div className="py-10 space-y-4">
      <h2 className="text-2xl font-semibold mb-2">Select language</h2>
      <div className="grid grid-cols-2 gap-3">
        {languages.map((lang) => (
          <button key={lang} className="border rounded-xl p-4 shadow-sm text-lg">
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
}
