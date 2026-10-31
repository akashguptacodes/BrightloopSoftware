import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/roleHelpers';
import {
  Zap,
  Repeat,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Percent,
  BadgePercent,
  Layers,
  ArrowRight,
  CreditCard,
  BarChart3,
  Users,
  Sparkles,
  Clock,
  ChevronRight,
  Globe,
  Lock,
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const dashboardPath = user ? getDashboardPath(user.role) : '/login';

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f7f4] text-slate-800">
      {/* ======================================================== */}
      {/* 1. Classical Navigation Bar                              */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#edf5fc] border-b border-[#c8deef] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded bg-[#2d6a4f] text-white shadow-xs">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight leading-none block">
                Brightloop
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#2d6a4f] leading-none block">
                Software ERP
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#capabilities" className="hover:text-[#2d6a4f] transition-colors">
              Capabilities
            </a>
            <a href="#workflow" className="hover:text-[#2d6a4f] transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-[#2d6a4f] transition-colors">
              Pricing Plans
            </a>
            <a href="#security" className="hover:text-[#2d6a4f] transition-colors">
              Enterprise Security
            </a>
          </nav>

          {/* Dynamic Action Buttons */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <Link
                to={dashboardPath}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2d6a4f] hover:bg-[#1e4836] text-white rounded text-xs font-semibold shadow-xs transition"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-xs transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#2d6a4f] hover:bg-[#1e4836] text-white rounded text-xs font-semibold shadow-xs transition"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. Hero Section                                          */}
      {/* ======================================================== */}
      <section className="pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#cde2d4] bg-gradient-to-b from-[#edf6f0] via-[#f3f7f4] to-[#f3f7f4]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headline & CTAs */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold bg-[#d9eee0] text-[#1c532e] border border-[#b3dbbe]">
                <Sparkles className="w-3.5 h-3.5 text-[#1c532e]" />
                <span>Unified Subscription & Recurring Billing ERP</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#143d22] tracking-tight leading-tight">
                Run Your Entire Subscription Business on One Classical Platform
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                Replace spreadsheet chaos, forgotten renewals, and handwritten invoices. Brightloop
                orchestrates product variants, quotation templates, automated recurring invoicing, tax
                rules, and online payments in one centralized system.
              </p>

              {/* Hero Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to={user ? dashboardPath : '/register'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d6a4f] hover:bg-[#1e4836] text-white rounded text-sm font-semibold shadow-sm transition"
                >
                  <span>{user ? 'Open Workspace' : 'Start Free Trial'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-[#b3dbbe] rounded text-sm font-semibold shadow-xs transition"
                >
                  <Lock className="w-4 h-4 text-[#2d6a4f]" />
                  <span>Sign In to Portal</span>
                </Link>
              </div>

              {/* Highlights Checklist */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#2c5339] font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2d6a4f]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2d6a4f]" />
                  <span>Role-Based Access (Admin/Staff)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2d6a4f]" />
                  <span>Automated GST & Discounts</span>
                </div>
              </div>
            </div>

            {/* Right Column: Classical Live Mockup Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded border border-[#cde2d4] shadow-sm overflow-hidden">
                {/* Mockup Header */}
                <div className="bg-[#edf6f0] px-4 py-3 border-b border-[#cde2d4] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    <span className="ml-1 text-[11px] font-mono font-bold text-[#143d22]">
                      Brightloop Operations Live Hub
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold bg-[#d9eee0] text-[#1c532e] px-2 py-0.5 rounded border border-[#b3dbbe]">
                    Active
                  </span>
                </div>

                {/* Mockup Body */}
                <div className="p-5 space-y-4">
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#f8fbf9] p-3 rounded border border-[#cde2d4]">
                      <p className="text-[10px] uppercase font-semibold text-slate-500">Recurring ARR</p>
                      <p className="text-lg font-bold text-[#2d6a4f] font-mono mt-0.5">₹14,80,000</p>
                      <span className="text-[10px] text-emerald-600 font-medium">↑ 18.4% this quarter</span>
                    </div>
                    <div className="bg-[#f8fbf9] p-3 rounded border border-[#cde2d4]">
                      <p className="text-[10px] uppercase font-semibold text-slate-500">Active Subs</p>
                      <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">142 Contracts</p>
                      <span className="text-[10px] text-slate-500 font-medium">0 missed renewals</span>
                    </div>
                  </div>

                  {/* Active Proposal Item */}
                  <div className="p-3 bg-[#f8fbf9] rounded border border-[#cde2d4] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#2d6a4f]">SUB-2026-0042</span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                        CONFIRMED
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium">Enterprise Cloud Suite + Odoo Brand Add-on</p>
                    <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-[#daebde]">
                      <span>Billing: Monthly Recurring</span>
                      <span className="font-mono font-bold text-slate-900">₹8,450.00 / mo</span>
                    </div>
                  </div>

                  {/* Automated Invoice Notification */}
                  <div className="flex items-center gap-3 p-2.5 bg-[#edf5fc] rounded border border-[#c8deef] text-xs">
                    <Receipt className="w-4 h-4 text-sky-700 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 text-[11px] truncate">
                        Invoice #INV-2026-0189 generated automatically
                      </p>
                      <p className="text-[10px] text-slate-500">Scheduled cycle run &bull; 18% GST auto-applied</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. Core Enterprise Capabilities                         */}
      {/* ======================================================== */}
      <section id="capabilities" className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#cde2d4]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2d6a4f] font-mono">
              Complete Feature Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Engineered for Modern Recurring Billing Workflows
            </h2>
            <p className="text-sm text-slate-600">
              Every phase of the subscription lifecycle handled with high precision and decimal-accurate financial compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Capability 1 */}
            <div className="bg-white rounded border border-[#cde2d4] p-5 shadow-xs hover:border-[#9ec9aa] transition">
              <div className="w-10 h-10 rounded bg-[#e3f2e7] text-[#2d6a4f] border border-[#bedec8] flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Product & Variant Pricing</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Configure Software, Service, and Physical items with flexible variant surcharges (e.g., standard price + brand modifier like Odoo brand +₹560).
              </p>
            </div>

            {/* Capability 2 */}
            <div className="bg-white rounded border border-[#cde2d4] p-5 shadow-xs hover:border-[#9ec9aa] transition">
              <div className="w-10 h-10 rounded bg-[#e3f2e7] text-[#2d6a4f] border border-[#bedec8] flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Flexible Billing Frequencies</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Define plans with Daily, Weekly, Monthly, or Yearly cadences, minimum quantities, interval multipliers, and lifecycle pause/renewal controls.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="bg-white rounded border border-[#cde2d4] p-5 shadow-xs hover:border-[#9ec9aa] transition">
              <div className="w-10 h-10 rounded bg-[#e3f2e7] text-[#2d6a4f] border border-[#bedec8] flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Quotation Templates</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Sales reps quickly deploy preset quotation templates, customize seat quantities, verify discounts, and convert accepted quotes into active subscriptions in one click.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="bg-white rounded border border-[#cde2d4] p-5 shadow-xs hover:border-[#9ec9aa] transition">
              <div className="w-10 h-10 rounded bg-[#e3f2e7] text-[#2d6a4f] border border-[#bedec8] flex items-center justify-center mb-4">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Automated Invoicing Engine</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Zero manual invoice typing on billing day. Automated recurring cycles generate compliant invoices with line items, tax rules, and automatic sequential numbering.
              </p>
            </div>

            {/* Capability 5 */}
            <div className="bg-white rounded border border-[#cde2d4] p-5 shadow-xs hover:border-[#9ec9aa] transition">
              <div className="w-10 h-10 rounded bg-[#e3f2e7] text-[#2d6a4f] border border-[#bedec8] flex items-center justify-center mb-4">
                <BadgePercent className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Dynamic Taxes & Discounts</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Admin-controlled percentage or fixed discount rules with minimum quantity gates, expiration dates, usage limits, and post-discount tax computation.
              </p>
            </div>

            {/* Capability 6 */}
            <div className="bg-white rounded border border-[#cde2d4] p-5 shadow-xs hover:border-[#9ec9aa] transition">
              <div className="w-10 h-10 rounded bg-[#e3f2e7] text-[#2d6a4f] border border-[#bedec8] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Customer Self-Service Portal</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Customers view their own subscription terms, inspect line items, download invoice receipts, and complete online payments without back-and-forth emails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. Workflow Stepper                                      */}
      {/* ======================================================== */}
      <section id="workflow" className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#cde2d4] bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2d6a4f] font-mono">
              The Subscription Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              From First Quote to Automated Recurring Revenue
            </h2>
            <p className="text-sm text-slate-600">
              Four seamless steps that replace fragmented spreadsheets with reliable automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-5 rounded border border-[#cde2d4] bg-[#f8fbf9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[#2d6a4f]">01</span>
                <span className="text-[10px] font-semibold bg-[#e3f2e7] text-[#1c532e] px-2 py-0.5 rounded border border-[#b3dbbe]">
                  SETUP
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Configure Catalog</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Define software products, variant pricing modifiers, and custom subscription billing cadences.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded border border-[#cde2d4] bg-[#f8fbf9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[#2d6a4f]">02</span>
                <span className="text-[10px] font-semibold bg-[#e3f2e7] text-[#1c532e] px-2 py-0.5 rounded border border-[#b3dbbe]">
                  SALES
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Deploy Quotations</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sales reps issue quotes with line items, tax rules, and automatic discount eligibility checks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded border border-[#cde2d4] bg-[#f8fbf9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[#2d6a4f]">03</span>
                <span className="text-[10px] font-semibold bg-[#e3f2e7] text-[#1c532e] px-2 py-0.5 rounded border border-[#b3dbbe]">
                  FULFILL
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Activate Contract</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accepted proposals transform automatically into active subscriptions with scheduled billing dates.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded border border-[#cde2d4] bg-[#f8fbf9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[#2d6a4f]">04</span>
                <span className="text-[10px] font-semibold bg-[#e3f2e7] text-[#1c532e] px-2 py-0.5 rounded border border-[#b3dbbe]">
                  RECURRING
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Auto-Billing & Payment</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recurrent invoices are dispatched without human error, and payments are reconciled instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. Pricing Plans Preview                                 */}
      {/* ======================================================== */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#cde2d4]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2d6a4f] font-mono">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Simple, Predictable Plans for Growing Teams
            </h2>
            <p className="text-sm text-slate-600">
              Choose the right tier for your operational scale. All plans include full RBAC and multi-cadence billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded border border-[#cde2d4] p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Starter SaaS</h3>
                  <p className="text-xs text-slate-500 mt-1">For small business billing & self-service</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">₹2,499</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Up to 100 active subscriptions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Monthly & Yearly billing cycles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Customer self-service portal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Automated GST calculations</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 block text-center w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded text-xs font-semibold shadow-xs transition"
              >
                Get Started
              </Link>
            </div>

            {/* Professional Plan (Highlighted) */}
            <div className="bg-[#f8fbf9] rounded border-2 border-[#2d6a4f] p-6 shadow-md relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2d6a4f] text-white text-[10px] font-bold px-3 py-0.5 rounded">
                MOST POPULAR
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#143d22]">Growth Business</h3>
                  <p className="text-xs text-slate-500 mt-1">Full operational staff hub & quotation lifecycle</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-[#143d22]">₹5,999</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-[#daebde]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Unlimited active subscriptions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Daily, Weekly, Monthly & Yearly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Variant pricing & brand modifiers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Quotation templates & conversion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Multi-role Staff Management</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 block text-center w-full py-2 px-3 bg-[#2d6a4f] hover:bg-[#1e4836] text-white rounded text-xs font-semibold shadow-xs transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded border border-[#cde2d4] p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Custom Enterprise</h3>
                  <p className="text-xs text-slate-500 mt-1">For multi-brand organizations & volume contracts</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">Custom</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Dedicated payment reconciliation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Advanced discount rules & usage caps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Sub-2 second query SLA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Dedicated account engineering</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 block text-center w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded text-xs font-semibold shadow-xs transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. Enterprise Security & Architecture                    */}
      {/* ======================================================== */}
      <section id="security" className="py-14 px-4 sm:px-6 lg:px-8 border-b border-[#cde2d4] bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 rounded border border-[#cde2d4] bg-[#edf6f0] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-[#1c532e] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise Security & Data Isolation</span>
              </div>
              <h3 className="text-xl font-bold text-[#143d22]">
                Architected with Cryptographic Integrity and Strict RBAC
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Secure JWT stored in HTTP-only cookies, SHA-256 hashed password reset flow, rate-limited auth endpoints, and strict role segregation between Administrator, Staff, and Customer users.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 bg-[#2d6a4f] hover:bg-[#1e4836] text-white rounded text-xs font-semibold shadow-xs transition"
              >
                Create Account Now
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-[#b3dbbe] rounded text-xs font-semibold shadow-xs transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. Classical Corporate Footer                            */}
      {/* ======================================================== */}
      <footer className="bg-[#0f172a] text-slate-300 py-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="flex items-center justify-center h-6 w-6 rounded bg-[#2d6a4f]">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-wide">Brightloop Software</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Full-lifecycle subscription management and automated recurring billing system.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Product</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#capabilities" className="hover:text-white transition">Catalog & Variants</a></li>
              <li><a href="#capabilities" className="hover:text-white transition">Recurring Plans</a></li>
              <li><a href="#capabilities" className="hover:text-white transition">Quotation Templates</a></li>
              <li><a href="#capabilities" className="hover:text-white transition">Automated Invoicing</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Portals</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/login" className="hover:text-white transition">Admin Command Center</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Staff Operations Hub</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Customer Self-Service</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Customer Registration</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Security & System</h4>
            <p className="text-slate-400 leading-relaxed">
              Stateless JWT authentication &bull; Decimal precision ledger &bull; Sub-2s analytics.
            </p>
            <div className="pt-2 flex items-center gap-2 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>&copy; {new Date().getFullYear()} Brightloop Software. Built for Enterprise Recurring Billing.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-400 transition">Portal Login</Link>
            <span>&bull;</span>
            <Link to="/register" className="hover:text-slate-400 transition">Create Customer Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

