export default function WorkerProfilePage() {
  return (
    <div className="py-8 space-y-4">
      <h2 className="text-2xl font-semibold">Worker Profile</h2>
      <input className="w-full border rounded-lg p-3" placeholder="Name" />
      <input className="w-full border rounded-lg p-3" placeholder="Skills (e.g., Electrician, Plumber)" />
      <input className="w-full border rounded-lg p-3" placeholder="Experience (years)" />
      <input className="w-full border rounded-lg p-3" placeholder="Expected wage (e.g., ₹400/hr)" />
      <div className="flex gap-3">
        <button className="flex-1 bg-brand text-white rounded-lg p-3">Save</button>
        <button className="flex-1 border rounded-lg p-3">Set Availability</button>
      </div>
    </div>
  );
}
