export default function EarningsPage() {
  return (
    <div className="py-8 space-y-4">
      <h2 className="text-2xl font-semibold">Earnings</h2>
      <div className="border rounded-xl p-4 shadow-sm">
        <div className="text-sm text-gray-600">This week</div>
        <div className="text-3xl font-bold">₹3,200</div>
      </div>
      <div className="border rounded-xl p-4 shadow-sm">
        <div className="text-sm text-gray-600">Completed jobs</div>
        <div className="text-xl font-semibold">12</div>
      </div>
      <button className="w-full bg-brand text-white rounded-lg p-3">Withdraw</button>
    </div>
  );
}
