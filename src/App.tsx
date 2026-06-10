import React, { useState } from "react";
import DiagnosticQuiz from "./components/DiagnosticQuiz";
import CapabilityModel from "./components/CapabilityModel";
import RolePathways from "./components/RolePathways";
import Glossary from "./components/Glossary";
import OperationsPromotion from "./components/OperationsPromotion";
import { 
  Compass, 
  MapPin, 
  BookOpen, 
  Tv, 
  GitCommit, 
  Layers, 
  Users, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Github
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("quiz");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-600 selection:text-white pb-16">
      {/* Top micro announcement / status banner */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 flex justify-between items-center font-sans tracking-wide">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>字节跳动内部 AI 资产库及 DRI 学习指南</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-slate-400 text-[10px]">
          <span>当前环境: Agent 时代 (IV阶段) 锚定</span>
          <span>●</span>
          <span>更新版本: 2026-Q2 精准版</span>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo / Title Area */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md relative">
              <Compass className="w-5.5 h-5.5 text-white animate-spin-slow" />
              {/* Little red / blue dots representing TikTok theme */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border border-white" />
            </div>
            <div>
              <h1 className="text-lg font-sans font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                AI 时代抖音 DRI 能力模型 <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold border border-slate-200">指南针体系</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-sans mt-1">
                引领更多抖音同学成为 AI 时代直接负责人 (Directly Responsible Individuals)
              </p>
            </div>
          </div>

          {/* Logic coordinate tracker */}
          <div className="flex items-center gap-2 md:gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {[
              { label: "认知对齐", active: activeTab === "quiz" || activeTab === "glossary" },
              { label: "定义标准", active: activeTab === "matrix" },
              { label: "路径指引", active: activeTab === "pathways" },
              { label: "运营落地", active: activeTab === "promotion" }
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <span className={`text-[10px] px-2 py-1 rounded-md font-sans font-semibold transition-all ${
                  step.active 
                    ? "bg-white text-indigo-600 shadow-sm font-bold" 
                    : "text-slate-400"
                }`}>
                  {step.label}
                </span>
                {idx < 3 && <ArrowRight className="w-3 h-3 text-slate-300" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200/60 pb-px overflow-x-auto gap-4 scrollbar-hide mb-8 font-sans">
          {[
            { id: "quiz", label: "🎯 前置导览 & 路径诊断", icon: Compass },
            { id: "matrix", label: "📐 能力维度 ＆ 分级标准", icon: Layers },
            { id: "pathways", label: "🗺️ 序列同学转型路径", icon: Users },
            { id: "promotion", label: "📣 推广落地 ＆ 运营矩阵", icon: TrendingUp },
            { id: "glossary", label: "📖 术语名词 ＆ 常见问解", icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 border-b-2 text-xs md:text-sm font-bold whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? "border-indigo-600 text-indigo-600 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Display */}
        <div className="space-y-12">
          {activeTab === "quiz" && <DiagnosticQuiz />}
          {activeTab === "matrix" && <CapabilityModel />}
          {activeTab === "pathways" && <RolePathways />}
          {activeTab === "promotion" && <OperationsPromotion />}
          {activeTab === "glossary" && <Glossary />}
        </div>
      </main>

      {/* Structured Credit Section footer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-16 border-t border-slate-200/60 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-sans">
          <p>© 2026 Douyin DRI AI Compass Co-building Group. ByteDance Proprietary.</p>
          <p>字节跳动 AI DRI 能力对齐与推广指南盘工作台 内部专属许可</p>
        </div>
      </footer>
    </div>
  );
}
