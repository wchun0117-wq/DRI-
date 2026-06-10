import React, { useState } from "react";
import { ROLE_PATHWAYS, DRI_ARCHETYPES } from "../data";
import { RolePathway } from "../types";
import { 
  User, 
  MapPin, 
  Award, 
  Activity, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Users,
  ShieldAlert,
  Search
} from "lucide-react";

export default function RolePathways() {
  const [activeRoleName, setActiveRoleName] = useState<string>("产品经理 (PM)");

  const activeRole = ROLE_PATHWAYS.find(r => r.role.startsWith(activeRoleName.split(" ")[0])) || ROLE_PATHWAYS[0];

  return (
    <div className="space-y-10">
      {/* Visual Hub for different starting roles */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
            🚀 Choose Your Role Start
          </span>
          <h2 className="text-2xl font-sans font-bold text-slate-900 mt-2">
            不同角色起点的定制化转型地图
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed font-sans mt-2">
            ‘DRI 的转型本质上不是换掉您的岗位，而是通过 AI 赋能，把自己升级为端到端系统和最终商业价值闭环的直接责任人！’
          </p>
        </div>

        {/* Buttons Selector Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-8 p-1 bg-slate-50 rounded-xl border border-slate-100">
          {[
            { label: "产品经理 (PM)", name: "产品经理 (PM)" },
            { label: "研发 (Dev)", name: "研发工程师 (Dev)" },
            { label: "运营 (Ops)", name: "运营同学 (Ops)" },
            { label: "设计 (Designer)", name: "设计师 (Designer)" },
            { label: "高AI低业务", name: "AI浓度高但无抖音经验" },
            { label: "低AI高经验", name: "抖音经验丰富但AI浓度低" }
          ].map((btn) => (
            <button
              key={btn.name}
              id={`tab-role-${btn.label}`}
              onClick={() => setActiveRoleName(btn.name)}
              className={`py-2.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeRoleName === btn.name
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-white"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Selected Role Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* User story and advantages/shortcomings column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Story Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/20 to-indigo-100/10 border border-indigo-100/50">
              <h3 className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest mb-1 pb-1 border-b border-indigo-100/30">
                USER STORY / 核心定位
              </h3>
              <p className="text-slate-800 text-sm font-sans font-bold leading-relaxed">
                “{activeRole.userStory}”
              </p>
            </div>

            {/* Pros box */}
            <div className="p-5 rounded-2xl bg-emerald-50/20 border border-emerald-100/40">
              <h4 className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                我的先天优势 (Advantages)
              </h4>
              <ul className="space-y-2.5">
                {activeRole.advantages.map((adv, idx) => (
                  <li key={idx} className="flex gap-2 text-xs font-sans text-slate-700 leading-relaxed">
                    <span className="text-emerald-500 shrink-0 select-none">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons box */}
            <div className="p-5 rounded-2xl bg-rose-50/10 border border-rose-100/20">
              <h4 className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                我急需补齐的短板 (Shortcomings)
              </h4>
              <ul className="space-y-2.5">
                {activeRole.shortcomings.map((sh, idx) => (
                  <li key={idx} className="flex gap-2 text-xs font-sans text-slate-700 leading-relaxed">
                    <span className="text-rose-400 shrink-0 select-none">•</span>
                    <span>{sh}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Steps and Milestones Column */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {/* Steps line */}
            <div className="mb-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-sans font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full" /> 建议精进迭代路线 (Roadmap Stages)
              </h3>
              <div className="space-y-4">
                {activeRole.steps.map((st, i) => {
                  const parts = st.split("：");
                  const title = parts[0] + "：";
                  const detail = parts[1] || "";
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="font-sans">
                        <span className="text-xs font-bold text-slate-900">{title}</span>
                        <span className="text-xs text-slate-600 leading-relaxed">{detail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones grid */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
              <h3 className="text-sm font-sans font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                关键进阶考量里程碑 (Milestones M1-M4)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRole.milestones.map((m, i) => {
                  const parts = m.split("：");
                  const headerNum = parts[0] + "：";
                  const descText = parts[1] || "";
                  return (
                    <div key={i} className="p-3.5 bg-slate-50/40 rounded-xl border border-slate-100 font-sans hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {headerNum.replace("：", "")}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">里程碑卡点</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                        {descText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2.4 "AI Exogenous skeleton" Methodologies */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600 animate-bounce" />
            <h3 className="text-lg font-sans font-bold text-slate-900">
              指南商战术：用 AI 充当您的“能力外骨骼”
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest bg-slate-50 p-2 rounded">
            Shortcomings Compensation
          </span>
        </div>

        <p className="text-slate-600 text-sm font-sans leading-relaxed mb-6">
          与其硬着头皮死背代码、钻研美院色彩理论，不如反其道而行。将您薄弱的单点短板细化切片，灌注给大语言模型作为指令，使大模型彻底承接繁复劳作：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              type: "1. 知识短板 (不知道)",
              way: "用 AI 做『领域极速充能与对齐』",
              detail: "跨界对技术不熟、不懂流程术语？向 AI 发送提问：‘请用通俗的大白话和抖音本土用词，帮我解释推荐算法的冷启动逻辑，并列举 3 类常见红线。’",
              target: "产出专属词汇表、需求任务摸板和大组白皮书安全自检清单。"
            },
            {
              type: "2. 执行短板 (不会做 / 做的慢)",
              way: "用 Skill / Agent 做『流程自动化外包』",
              detail: "不会写海报、拖不动流程图？将长 SOP 完全解构、固定输入输出，把重复任务完全装载给特定的无代码机器人自动运行，您仅对关键物料点审批决策。",
              target: "获得一键量产、全时在线的内容或告警故障跟踪自动化套组。"
            },
            {
              type: "3. 判断短板 (不敢放权 / 怕漏案出错)",
              way: "用 评测与双重兜底卡点 做『风控补位』",
              detail: "不放心模型返回的正确率？建立高可高信交叉模型。主模型输出初稿，安全子模型调用红线词典强力对比过滤，不一致或置信度超标的自动告警回执审核。",
              target: "打造零安全错误、置信级在线打分的容错和自迭代飞轮。"
            },
          ].map((wayObj, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-slate-100/80 bg-slate-50/50 flex flex-col justify-between font-sans">
              <div className="space-y-3">
                <span className="text-xs font-bold text-indigo-600 font-mono block uppercase">
                  {wayObj.type}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{wayObj.way}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{wayObj.detail}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                🚀 <span className="font-semibold text-slate-800">直接成效:</span> {wayObj.target}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DRI Archetypes Gallery */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-sans font-bold text-slate-900">
            终点视角：我的最终目标应该对标哪一类 DRI 画像？
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DRI_ARCHETYPES.map((arch, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between font-sans">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-sans font-bold text-slate-900">
                    {arch.name}
                  </h4>
                  <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                    核心对标
                  </span>
                </div>
                <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 py-1 px-2 rounded border border-emerald-100/50">
                  能量条: {arch.abilities}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">最适配和推荐场景:</span>
                  <p className="text-slate-700 text-xs leading-relaxed font-sans">{arch.scenarios}</p>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed italic border-t border-slate-100 pt-3">
                  “{arch.description}”
                </p>
              </div>
              <div className="mt-6 text-[10px] text-slate-400 font-mono">
                对应：起点视角探索 “怎么走得通”，终点视角解决 “走到哪最值钱”。
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
