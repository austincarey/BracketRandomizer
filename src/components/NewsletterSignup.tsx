export default function NewsletterSignup() {
  return (
    <section className="max-w-xl mx-auto mt-20 px-6 py-8 bg-white rounded-3xl shadow-sm border border-slate-200 text-center">
      <h2 className="text-2xl font-black text-[#002d62] mb-2 tracking-tight">
        Ready for the next tournament?
      </h2>
      <p className="text-slate-500 mb-6 text-sm">
        Join our low-volume newsletter. We'll only email you when the new teams and stats are live for 2027!
      </p>
      
      <form
        action="https://buttondown.com/api/emails/embed-subscribe/bracketrandomizer"
        method="post"
        target="popupwindow"
        onSubmit={() => window.open('https://buttondown.com/bracketrandomizer', 'popupwindow')}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <input
          type="email"
          name="email"
          id="bd-email"
          placeholder="Enter your email"
          required
          className="flex-1 px-5 py-3 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#29abe2] focus:border-transparent text-[#002d62] shadow-inner bg-slate-50"
        />
        <button
          type="submit"
          className="bg-[#29abe2] hover:bg-[#1f8fb5] text-white px-8 py-3 rounded-full font-bold transition-all shadow-md active:scale-95"
        >
          Subscribe
        </button>
      </form>
      <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
        No spam. Powered by Buttondown.
      </p>
    </section>
  );
}
