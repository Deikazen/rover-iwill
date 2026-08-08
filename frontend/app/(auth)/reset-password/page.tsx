export const metadata = {
  title: "Reset Password - Simple",
  description: "Page description",
};

export default function ResetPassword() {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Reset password</h1>
      </div>

      {/* Form */}
      <form>
        <div className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              className="form-input w-full py-2"
              type="email"
              placeholder="corybarker@email.com"
              required
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="btn w-full bg-linear-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 hover:brightness-105 transition-all">
            Reset Password
          </button>
        </div>
      </form>
    </>
  );
}
