import React, { useState } from "react";
import LucideIcon from "./LucideIcon";
import { UserDoc } from "../types";
import { simulateUpgradeToPro, simulateCancelSubscription } from "../utils/authAndUsage";

interface PricingProps {
  user: UserDoc | null;
  onRefreshUser: () => void;
  onOpenAuth: () => void;
}

export default function Pricing({ user, onRefreshUser, onOpenAuth }: PricingProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCheckoutLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200)); // Simulate gateway authorization
      await simulateUpgradeToPro(user.uid, user.email);
      onRefreshUser();
      setCheckoutSuccess(true);
      await new Promise((r) => setTimeout(r, 1500));
      setShowCheckout(false);
      setCheckoutSuccess(false);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancelSub = async () => {
    if (!user) return;
    if (confirm("Are you sure you want to cancel your DocuCraft Pro Subscription? You will lose unlimited document converts immediately.")) {
      try {
        await simulateCancelSubscription(user.uid);
        onRefreshUser();
        alert("Subscription canceled successfully. Account set back to Free tier.");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const activePlan = user ? user.subscriptionStatus : "free";

  return (
    <section id="saas-pricing-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16 text-center">
      {/* Header heading */}
      <div className="space-y-4 mb-12">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
          Transparent SaaS Pricing
        </span>
        <h1 className="font-sans font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight max-w-2xl mx-auto leading-tight">
          Simple, flexible plans for files & creators
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Start for free with 3 daily browser conversions. Upgrade for unlimited file sizes, high-compression scales, and batch editing.
        </p>

        {/* Yearly discount billing switcher */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className={`text-xs font-semibold ${!isYearly ? "text-slate-900" : "text-slate-400"}`}>
            Billed Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-11 h-6 bg-indigo-600 rounded-full relative transition-colors focus:outline-none cursor-pointer"
          >
            <span
              className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                isYearly ? "right-1" : "left-1"
              }`}
            />
          </button>
          <span className={`text-xs font-semibold ${isYearly ? "text-slate-900" : "text-slate-400"} flex items-center gap-1.5`}>
            Billed Annually
            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-150 uppercase tracking-wide">
              Save 25%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left mb-16">
        
        {/* Free Plan */}
        <div className="bg-white rounded-xl border border-slate-200 p-7 flex flex-col justify-between shadow-sm relative hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-sans font-bold text-lg text-slate-900">Standard Free</h3>
            <p className="text-xs text-slate-400 mt-1">Perfect for quick, casual conversions.</p>
            <div className="my-6">
              <span className="font-sans font-bold text-3xl text-slate-900">$0</span>
              <span className="text-xs text-slate-400 font-semibold"> / permanently free</span>
            </div>
            
            <ul className="space-y-3 pt-4 border-t border-slate-150 text-xs text-slate-600">
              <li className="flex items-center space-x-2.5">
                <LucideIcon name="Check" size={14} className="text-emerald-500 shrink-0" />
                <span>3 free conversions daily</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <LucideIcon name="Check" size={14} className="text-emerald-500 shrink-0" />
                <span>100% secure local sandbox</span>
              </li>
              <li className="flex items-center space-x-2.5 text-slate-350">
                <LucideIcon name="X" size={14} className="shrink-0" />
                <span>No batch folders upload</span>
              </li>
              <li className="flex items-center space-x-2.5 text-slate-350">
                <LucideIcon name="X" size={14} className="shrink-0" />
                <span>No priority processing speed</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              disabled
              className="w-full py-2.5 bg-slate-50 text-slate-400 border border-slate-200 text-xs font-semibold rounded-lg text-center cursor-default"
            >
              {activePlan === "free" ? "Your Active Plan" : "Default Plan"}
            </button>
          </div>
        </div>

        {/* Pro Plan (Highly stylized with glow borders) */}
        <div className="bg-white rounded-xl border-2 border-indigo-500 p-7 flex flex-col justify-between shadow-md relative scale-102">
          {/* Most popular ribbon */}
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg border border-indigo-500 uppercase tracking-widest shadow-sm">
            RECOMMENDED PRO
          </span>

          <div>
            <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-1.5">
              DocuCraft Pro
              <LucideIcon name="Sparkles" size={15} className="text-amber-500" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">For freelancers, designers, and office teams.</p>
            <div className="my-6">
              <span className="font-sans font-bold text-3xl text-slate-900">
                {isYearly ? "$9.99" : "$12.99"}
              </span>
              <span className="text-xs text-slate-400 font-semibold"> / user / month</span>
            </div>
            
            <ul className="space-y-3 pt-4 border-t border-slate-150 text-xs text-slate-600">
              <li className="flex items-center space-x-2.5">
                <LucideIcon name="Check" size={14} className="text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-800">Unlimited SaaS conversions</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <LucideIcon name="Check" size={14} className="text-indigo-600 shrink-0" />
                <span>Max 150MB file size limits</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <LucideIcon name="Check" size={14} className="text-indigo-600 shrink-0" />
                <span>Unlimited batch uploads</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <LucideIcon name="Check" size={14} className="text-indigo-600 shrink-0" />
                <span>Super-high compression layers</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <LucideIcon name="Check" size={14} className="text-indigo-600 shrink-0" />
                <span>24/7 dedicated priority ticket help</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            {activePlan === "pro" ? (
              <button
                onClick={handleCancelSub}
                className="w-full py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer"
              >
                Cancel Subscription
              </button>
            ) : activePlan === "admin" ? (
              <button
                disabled
                className="w-full py-2.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg text-center cursor-default"
              >
                Owner Privilege Admin
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!user) {
                    onOpenAuth();
                  } else {
                    setShowCheckout(true);
                  }
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg text-center shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                {user ? "Upgrade to Pro Now" : "Register and Upgrade"}
              </button>
            )}
          </div>
        </div>

        {/* Enterprise/Team Plan */}
        <div className="bg-white rounded-xl border border-slate-200 p-7 flex flex-col justify-between shadow-sm relative hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-sans font-bold text-lg text-slate-900">Enterprise Agency</h3>
            <p className="text-xs text-slate-400 mt-1">Robust pipelines for corporate document managers.</p>
            <div className="my-6">
              <span className="font-sans font-bold text-3xl text-slate-900">$39.99</span>
              <span className="text-xs text-slate-400 font-semibold"> / company / month</span>
            </div>
            
            <ul className="space-y-3 pt-4 border-t border-slate-150 text-xs text-slate-600">
              <li className="flex items-center space-x-2.5">
                <LucideIcon name="Check" size={14} className="text-emerald-500 shrink-0" />
                <span>Everything in Pro plan included</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <LucideIcon name="Check" size={14} className="text-emerald-500 shrink-0" />
                <span>Up to 10 company seats/profiles</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <LucideIcon name="Check" size={14} className="text-emerald-500 shrink-0" />
                <span>Shared team statistics dashboards</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <LucideIcon name="Check" size={14} className="text-emerald-500 shrink-0" />
                <span>Premium API keys authorization</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              onClick={() => alert("Enterprise custom licenses deployment is in development. Contact sales.")}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg text-center transition-all cursor-pointer"
            >
              Contact Corporate Sales
            </button>
          </div>
        </div>

      </div>

      {/* Credit Card Simulated Gateway Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full relative shadow-xl border border-slate-200 text-left animate-scale-up">
            {/* Close */}
            <button
              onClick={() => setShowCheckout(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <LucideIcon name="X" size={16} />
            </button>

            <div className="space-y-2 mb-6 text-center">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto font-bold">
                <LucideIcon name="CreditCard" size={20} />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900 leading-tight">Simulate SaaS Gateway Payment</h3>
              <p className="text-xs text-slate-500">Secure Stripe-like sandbox. No real assets processed.</p>
            </div>

            {checkoutSuccess ? (
              <div className="text-center py-6 space-y-4 animate-scale-up">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-lg flex items-center justify-center mx-auto shadow-sm font-bold animate-pulse">
                  <LucideIcon name="Check" size={20} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-emerald-900">Subscription Authorized!</h4>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">Upgraded to DocuCraft Pro Plan successfully.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
                {/* User email info */}
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-[11px] text-indigo-800 flex items-center justify-between">
                  <span>Billing profile:</span>
                  <span className="font-bold">{user?.email}</span>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Credit Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Expiration Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">CVV / Security Code</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full px-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full py-2.5 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center space-x-2 shadow-sm cursor-pointer active:scale-98 transition-transform"
                >
                  {checkoutLoading ? (
                    <>
                      <LucideIcon name="Loader2" className="animate-spin" size={14} />
                      <span>Authorizing Sandbox Charge...</span>
                    </>
                  ) : (
                    <span>Authorize Sandbox Charge - ${isYearly ? "9.99" : "12.99"}</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
