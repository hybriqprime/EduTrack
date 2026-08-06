const Footer = () => (
  <footer className="border-t border-slate-200 mt-auto">
    <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
      <span>© {new Date().getFullYear()} EduTrack. Built by Hybriq Prime.</span>
      <span>
        <a href="mailto:hybriqprime@gmail.com" className="hover:text-slate-600 transition-colors">
          hybriqprime@gmail.com
        </a>
      </span>
    </div>
  </footer>
);

export default Footer;