export default function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center gap-8">
        <span className="text-lg font-bold text-orange-400">near agentbench</span>
        <div className="flex gap-6 text-sm">
          <span className="rounded bg-zinc-800 px-3 py-1 font-medium text-white">
            Leaderboard
          </span>
          <span className="text-zinc-400 hover:text-white cursor-pointer">About</span>
        </div>
        <div className="ml-auto">
          <a
            href="https://github.com/pinchbench/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400 hover:text-white"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
