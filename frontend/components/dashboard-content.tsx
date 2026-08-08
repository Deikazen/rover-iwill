"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageIllustration from "@/components/page-illustration";
import Avatar01 from "@/public/images/avatar-01.jpg";
import Avatar02 from "@/public/images/avatar-02.jpg";
import Avatar03 from "@/public/images/avatar-03.jpg";
import Avatar04 from "@/public/images/avatar-04.jpg";

// Sample Project Data
const INITIAL_PROJECTS = [
  {
    id: 1,
    name: "Rover Marketing Landing",
    category: "Published",
    url: "rover-marketing.vercel.app",
    views: "45.2k",
    lastEdited: "2 hours ago",
    status: "Active",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    id: 2,
    name: "AI Analytics Portal",
    category: "Published",
    url: "analytics-rover.io",
    views: "18.9k",
    lastEdited: "1 day ago",
    status: "Active",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    gradient: "from-purple-600 to-blue-600",
  },
  {
    id: 3,
    name: "Nexus E-Commerce Store",
    category: "Drafts",
    url: "draft-nexus.rover.site",
    views: "--",
    lastEdited: "3 days ago",
    status: "In Draft",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: 4,
    name: "Starlight Portfolio",
    category: "Published",
    url: "starlight.dev",
    views: "84.1k",
    lastEdited: "5 days ago",
    status: "Active",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    gradient: "from-cyan-500 to-blue-600",
  },
];

// Prompt Suggestions
const PROMPT_SUGGESTIONS = [
  "SaaS Landing Page with Dark Mode",
  "Minimalist Portfolio for Developers",
  "Modern E-commerce Storefront",
  "Fintech Dashboard Interface",
];

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState<"All" | "Published" | "Drafts">("All");
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const filteredProjects =
    activeTab === "All"
      ? INITIAL_PROJECTS
      : INITIAL_PROJECTS.filter((p) => p.category === activeTab);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedSuccess(true);
      setTimeout(() => setGeneratedSuccess(false), 4000);
    }, 1500);
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <PageIllustration />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Dashboard Header Banner */}
        <div className="pb-10 text-center md:pb-14">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/70 px-3.5 py-1 text-xs font-medium text-gray-700 shadow-xs backdrop-blur-md"
            data-aos="zoom-y-out"
          >
            <div className="-mx-1 flex -space-x-2 overflow-hidden">
              <Image
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                src={Avatar01}
                width={24}
                height={24}
                alt="Member 1"
              />
              <Image
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                src={Avatar02}
                width={24}
                height={24}
                alt="Member 2"
              />
              <Image
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                src={Avatar03}
                width={24}
                height={24}
                alt="Member 3"
              />
              <Image
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                src={Avatar04}
                width={24}
                height={24}
                alt="Member 4"
              />
            </div>
            <span className="ml-1 text-gray-600">Pro Team Workspace</span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          </div>

          <h1
            className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl"
            data-aos="zoom-y-out"
            data-aos-delay={150}
          >
            Welcome back to <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Rover Dashboard</span>
          </h1>

          <p
            className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg"
            data-aos="zoom-y-out"
            data-aos-delay={300}
          >
            Manage your web applications, monitor visitor metrics, and launch AI-assisted code generation instantly.
          </p>
        </div>

        {/* AI Quick Generator Bar */}
        <div
          className="mb-12 rounded-2xl border border-blue-100 bg-linear-to-b from-blue-50/60 to-white/80 p-5 shadow-lg shadow-blue-500/5 backdrop-blur-md sm:p-6"
          data-aos="zoom-y-out"
          data-aos-delay={400}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16">
                  <path d="M8 0L9.8 5.4L15.2 6L11 9.8L12.4 15.2L8 12.2L3.6 15.2L5 9.8L0.8 6L6.2 5.4L8 0Z" />
                </svg>
              </span>
              <h2 className="text-base font-semibold text-gray-900">
                Rover AI Generator
              </h2>
            </div>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              8,450 / 10,000 Credits
            </span>
          </div>

          <form onSubmit={handleGenerate} className="relative">
            <div className="relative flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe a new feature or website to generate (e.g. Modern SaaS pricing section)..."
                className="w-full rounded-xl border border-gray-200 bg-white/90 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 shadow-xs backdrop-blur-xs transition-all focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                disabled={isGenerating}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-t from-blue-600 to-blue-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-[length:100%_150%] disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate UI
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16">
                      <path d="M6 3l5 5-5 5-1.4-1.4L8.2 8 4.6 4.4z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Prompt Chips */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Quick Prompts:</span>
            {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPromptText(suggestion)}
                className="rounded-lg border border-gray-200 bg-white/80 px-2.5 py-1 text-xs text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer"
              >
                + {suggestion}
              </button>
            ))}
          </div>

          {generatedSuccess && (
            <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 flex items-center justify-between animate-fade-in">
              <span>✨ Blueprint preview ready! Saved to your workspace drafts.</span>
              <button onClick={() => setGeneratedSuccess(false)} className="text-emerald-700 font-bold">×</button>
            </div>
          )}
        </div>

        {/* 4 Metric KPI Cards */}
        <div
          className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          data-aos="zoom-y-out"
          data-aos-delay={450}
        >
          {/* Card 1 */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-xs transition-all hover:border-blue-200 hover:shadow-md backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Sites</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16">
                  <path d="M2 3h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1zm0 2v6h12V5H2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">12</span>
              <span className="ml-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                +3 this month
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-600 w-3/4"></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-xs transition-all hover:border-blue-200 hover:shadow-md backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Traffic</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16">
                  <path d="M1 14h14v2H1v-2zm2-4h2v3H3v-3zm4-5h2v8H7V5zm4-4h2v12h-2V1z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">148.2k</span>
              <span className="ml-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ↑ 24.5%
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">Total views across all deployed sites</p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-xs transition-all hover:border-blue-200 hover:shadow-md backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Credit Usage</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16">
                  <path d="M8 1L2 5v6l6 4 6-4V5L8 1zm0 2.2L12.5 6 8 8.8 3.5 6 8 3.2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">84.5%</span>
              <span className="ml-2 text-xs font-medium text-gray-500">8,450 used</span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-amber-500 w-[84%]"></div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-xs transition-all hover:border-blue-200 hover:shadow-md backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Status</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.7 6.3l-4.5 4.5a1 1 0 01-1.4 0l-2-2a1 1 0 011.4-1.4L7 8.6l3.8-3.8a1 1 0 011.4 1.5z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">99.9%</span>
              <span className="ml-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Optimal
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">Lighthouse Score: 98/100</p>
          </div>
        </div>

        {/* Main Grid: Projects & Analytics */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Projects Manager (7 cols) */}
          <div className="lg:col-span-7" data-aos="fade-right" data-aos-delay={500}>
            <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Project Workspace</h2>
                  <p className="text-xs text-gray-500">Manage, edit and publish your websites</p>
                </div>

                {/* Filter Tabs */}
                <div className="inline-flex rounded-xl bg-gray-100 p-1">
                  {(["All", "Published", "Drafts"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                        activeTab === tab
                          ? "bg-white text-gray-900 shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group relative flex flex-col justify-between gap-4 rounded-xl border border-gray-200/80 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${project.gradient} text-white font-bold shadow-xs`}>
                        {project.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${project.badgeColor}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-gray-500">{project.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-semibold text-gray-700">{project.views} views</div>
                        <div className="text-[11px] text-gray-400">Edited {project.lastEdited}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <a
                          href={`https://${project.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-blue-700 transition-all"
                        >
                          Open ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  View All Projects & Deployments →
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Analytics & Feed (5 cols) */}
          <div className="lg:col-span-5 space-y-6" data-aos="fade-left" data-aos-delay={600}>
            {/* Weekly Traffic Chart */}
            <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Weekly Traffic Overview</h3>
                  <p className="text-xs text-gray-500">Total sessions across last 7 days</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  +18.4%
                </span>
              </div>

              {/* Custom SVG Bar Graph */}
              <div className="mt-6 flex h-36 items-end justify-between gap-2 px-1">
                {[
                  { day: "Mon", val: 45, height: "h-[45%]" },
                  { day: "Tue", val: 68, height: "h-[68%]" },
                  { day: "Wed", val: 52, height: "h-[52%]" },
                  { day: "Thu", val: 89, height: "h-[89%]" },
                  { day: "Fri", val: 95, height: "h-[95%]" },
                  { day: "Sat", val: 62, height: "h-[62%]" },
                  { day: "Sun", val: 78, height: "h-[78%]" },
                ].map((bar, i) => (
                  <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-gray-900 text-white text-[10px] py-0.5 px-1.5 rounded shadow-xs pointer-events-none">
                      {bar.val}k
                    </div>
                    <div className="w-full rounded-t-md bg-gray-100 flex items-end overflow-hidden h-28">
                      <div
                        className={`w-full ${bar.height} rounded-t-md bg-linear-to-t from-blue-600 to-blue-400 group-hover:from-blue-700 group-hover:to-blue-500 transition-all duration-300`}
                      ></div>
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Activity Feed */}
            <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Recent Workspace Activity</h3>
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                    ✓
                  </span>
                  <div>
                    <p className="text-xs text-gray-800">
                      <span className="font-semibold text-gray-900">Sarah Jenkins</span> published build #1042 to production.
                    </p>
                    <span className="text-[10px] text-gray-400">12 mins ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                    ⚡
                  </span>
                  <div>
                    <p className="text-xs text-gray-800">
                      <span className="font-semibold text-gray-900">Rover AI Engine</span> generated 6 new layout variations.
                    </p>
                    <span className="text-[10px] text-gray-400">1 hour ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">
                    🔒
                  </span>
                  <div>
                    <p className="text-xs text-gray-800">
                      <span className="font-semibold text-gray-900">SSL Certificate</span> auto-renewed for <code className="text-[11px] font-mono">rover-marketing.vercel.app</code>.
                    </p>
                    <span className="text-[10px] text-gray-400">3 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tools Grid */}
        <div className="mt-12 grid gap-5 md:grid-cols-3" data-aos="zoom-y-out" data-aos-delay={700}>
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md transition-all hover:border-blue-200">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
              ❖
            </div>
            <h4 className="text-sm font-bold text-gray-900">Component Library</h4>
            <p className="mt-1 text-xs text-gray-600">
              Access 120+ responsive UI blocks, cards, footers, and interactive navigation elements.
            </p>
            <button className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
              Browse Components →
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md transition-all hover:border-blue-200">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">
              🌐
            </div>
            <h4 className="text-sm font-bold text-gray-900">Custom Domains</h4>
            <p className="mt-1 text-xs text-gray-600">
              Connect your domain with automated DNS configuration and global CDN edge routing.
            </p>
            <button className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
              Manage Domains →
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md transition-all hover:border-blue-200">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
              ⚡
            </div>
            <h4 className="text-sm font-bold text-gray-900">API & Webhooks</h4>
            <p className="mt-1 text-xs text-gray-600">
              Integrate headless APIs, webhook triggers, and automated CI/CD deployment pipelines.
            </p>
            <button className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
              API Documentation →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
