import React, { useState } from "react";
import { OPERATIONAL_STAGES, OPERATIONAL_EVENTS } from "../data";
import { OperationalStage, OperationalEvent } from "../types";
import { 
  Megaphone, 
  Calendar, 
  CheckSquare, 
  Send, 
  Plus, 
  Share2, 
  TrendingUp, 
  FileText, 
  Briefcase, 
  AlertCircle, 
  Users, 
  HeartHandshake
} from "lucide-react";

export default function OperationsPromotion() {
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [activeEventIndex, setActiveEventIndex] = useState<number | null>(0);

  // Submitting case state
  const [caseTitle, setCaseTitle] = useState("");
  const [caseLevel, setCaseLevel] = useState("L2 流程重构");
  const [caseDim, setCaseDim] = useState("动手能力 / 价值闭环力");
  const [caseBg, setCaseBg] = useState("");
  const [caseSop, setCaseSop] = useState("");
  const [casePit, setCasePit] = useState("");
  const [caseMetrics, setCaseMetrics] = useState("");
  const [submittedCases, setSubmittedCases] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Task platform dummy tasks state
  const [tasks, setTasks] = useState([
    { id: 1, title: "大促多语系营销文案自动抓取与交叉合规初审 Agent", bu: "海外电商业务组", reward: "200 积分 + 免费咖啡券", claimant: "待认领", logo: "🛒" },
    { id: 2, title: "设计组件库一键 Contrast 比对与格式防漏校验工具箱", bu: "创意设计中心", reward: "150 积分 + 周五下午茶", claimant: "郝俊琪 (设计师) 已认领", logo: "🎨" }
  ]);
  const [claimStatus, setClaimStatus] = useState<Record<number, string>>({});

  const handleClaimTask = (taskId: number) => {
    setClaimStatus(prev => ({
      ...prev,
      [taskId]: "苏畅 @ 小游戏组 已抢单认领！"
    }));
  };

  const handleCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle || !caseBg || !casePit) {
      alert("请完整填写案例的核心字段：案例标题、背景痛点以及填过的坑（⚠️核心字段）！");
      return;
    }

    const newCase = {
      title: caseTitle,
      level: caseLevel,
      dimension: caseDim,
      background: caseBg,
      sop: caseSop,
      pit: casePit,
      metrics: caseMetrics,
      submitTime: new Date().toLocaleDateString(),
      status: "待评委会季度评审入库"
    };

    setSubmittedCases([newCase, ...submittedCases]);
    // reset form
    setCaseTitle("");
    setCaseBg("");
    setCaseSop("");
    setCasePit("");
    setCaseMetrics("");
    setShowForm(false);
  };

  const activeStage = OPERATIONAL_STAGES[activeStageIdx];

  return (
    <div className="space-y-10">
      {/* 4.1 Phased promotion timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
          <Megaphone className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-sans font-bold text-slate-900">
            精细化推广部署三步地图 (Implementation Roadmap)
          </h3>
        </div>

        {/* Stepper Header */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute left-6 right-6 h-0.5 bg-slate-100 top-1/2 -translate-y-1/2 -z-0 hidden md:block" />
          {OPERATIONAL_STAGES.map((s, idx) => (
            <button
              key={idx}
              id={`step-btn-${idx}`}
              onClick={() => setActiveStageIdx(idx)}
              className="z-10 focus:outline-none flex flex-col items-center cursor-pointer group"
            >
              <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-mono font-bold text-sm transition-all ${
                activeStageIdx === idx
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-110"
                  : "bg-white border-slate-205 text-slate-400 group-hover:border-indigo-600"
              }`}>
                0{idx + 1}
              </div>
              <span className={`text-xs font-sans mt-2 font-semibold ${activeStageIdx === idx ? "text-indigo-600" : "text-slate-400"}`}>
                {s.phase}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{s.time}</span>
            </button>
          ))}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                PHASE 0{activeStageIdx + 1} OBJECTIVE
              </span>
              <h4 className="text-base font-sans font-bold text-slate-900 leading-tight mt-1">
                {activeStage.objective}
              </h4>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-indigo-600 font-mono block uppercase">
                部署落地动作 Worksteps:
              </span>
              <ul className="space-y-2">
                {activeStage.actions.map((act, idx) => (
                  <li key={idx} className="text-xs font-sans text-slate-600 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-4 space-y-4 border-t md:border-t-0 md:border-l border-slate-200/60 pt-5 md:pt-0 md:pl-5 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-emerald-600 font-mono block uppercase">
                预期关键交付 Output:
              </span>
              <p className="text-xs text-slate-700 font-sans leading-relaxed">
                {activeStage.output}
              </p>
            </div>

            {activeStage.lever && (
              <div className="bg-white/90 p-3 rounded-lg border border-slate-100 text-[10px] font-sans text-slate-500 font-medium leading-relaxed shadow-sm">
                📌 <strong className="text-indigo-600">操盘杠杆原则：</strong>
                {activeStage.lever}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4.4 Operations Event matrix */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-50 pb-4">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-sans font-bold text-slate-900">
            部运营活动五项矩阵 (Interactive Operations Matrix)
          </h3>
        </div>

        <p className="text-slate-600 text-sm font-sans mb-6">
          运营的核心使命是 “降低记录与准备成本”。不造无聊干瘪的汇报场，咬合日常需求与高敏高频场域，五大常设活动全面引爆极客裂变：
        </p>

        {/* Left tabs of event. Right detailed pane. Robust layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-2">
            {OPERATIONAL_EVENTS.map((evt, idx) => (
              <button
                key={idx}
                id={`btn-evt-${idx}`}
                onClick={() => setActiveEventIndex(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeEventIndex === idx
                    ? "border-indigo-600 bg-indigo-50/10 shadow-sm"
                    : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/20"
                }`}
              >
                <div>
                  <h4 className="text-sm font-sans font-bold text-slate-900 leading-tight">
                    {evt.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    频次频率: {evt.frequency}
                  </span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  activeEventIndex === idx ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  <span className="text-[10px] font-mono font-bold">&gt;</span>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-7">
            {activeEventIndex !== null && (
              <div className="border border-indigo-100/50 bg-indigo-50/5 rounded-2xl p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-mono font-bold px-2 py-0.5 rounded">
                        {OPERATIONAL_EVENTS[activeEventIndex].frequency}
                      </span>
                      <h4 className="text-lg font-sans font-bold text-slate-900 mt-1.5">
                        {OPERATIONAL_EVENTS[activeEventIndex].name}
                      </h4>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs font-sans leading-relaxed mb-4">
                    定位描述：{OPERATIONAL_EVENTS[activeEventIndex].desc}
                  </p>

                  <div className="space-y-2 bg-white/60 p-4 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 font-mono block uppercase">
                      主要运作细节 Steps:
                    </span>
                    <ul className="space-y-2">
                      {OPERATIONAL_EVENTS[activeEventIndex].details.map((detail, dIdx) => (
                        <li key={dIdx} className="text-xs font-sans text-slate-600 leading-relaxed flex gap-2">
                          <span className="text-indigo-400 font-mono shrink-0 select-none">-</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-sans text-emerald-800 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/30">
                  🌱 <strong className="text-emerald-900">核心预期成效:</strong> {OPERATIONAL_EVENTS[activeEventIndex].outcome}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Task platform gameplay */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-5">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <h4 className="text-base font-sans font-bold text-slate-900 leading-snug">
            跨大组 AI 协作任务悬赏台 (The E2E Task Platform)
          </h4>
        </div>

        <p className="text-slate-500 text-xs font-sans leading-relaxed mb-4">
          打通『手头有技术能力的 AI 狂热派』与『深受复杂工种烦扰的一线业务代表』。业务提需，极客抢单，完成双评入库：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/40 relative flex flex-col justify-between h-full font-sans">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100/50">{task.logo}</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 leading-tight">{task.title}</h5>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{task.bu}</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-md mt-2 flex justify-between items-center">
                  <span>💎 悬赏酬劳: {task.reward}</span>
                  <span className="font-bold text-slate-600">{task.claimant}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-indigo-600">
                  {claimStatus[task.id] ? claimStatus[task.id] : "✅ 接单流程常态畅通"}
                </span>
                {!claimStatus[task.id] && task.claimant === "待认领" && (
                  <button
                    id={`btn-claim-${task.id}`}
                    onClick={() => handleClaimTask(task.id)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold rounded cursor-pointer transition-colors"
                  >
                    抢单认领
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4.2 Case submission and collection widget */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-5 mb-6">
          <div>
            <h3 className="text-lg font-sans font-bold text-slate-900">
              案例征集与季评考核漏斗 (Case updates Mechanism)
            </h3>
            <p className="text-slate-500 text-xs font-sans mt-1">
              由 AI 负责人、BU 总裁、技术主席共同组成的评委会，每月提醒、每季严格评选并入库。
            </p>
          </div>
          <button
            id="btn-trigger-form"
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer select-none"
          >
            {showForm ? "收起提交卡单" : "立即提报我的填坑案例"}
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Submission form */}
        {showForm && (
          <form onSubmit={handleCaseSubmit} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4 animate-fade-in mb-8 font-sans text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">案例标题 Title:</label>
                <input
                  type="text"
                  placeholder="一句话描述解决了什么痛点"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">DRI 定位定级 Level:</label>
                <select
                  value={caseLevel}
                  onChange={(e) => setCaseLevel(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option>L1 个人提效水准</option>
                  <option>L2 流程重构水准</option>
                  <option>L3 部门级 AI Native</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">匹配指南针维度 Dimension:</label>
                <select
                  value={caseDim}
                  onChange={(e) => setCaseDim(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option>业务定义力 / 价值闭环力 （选对问题）</option>
                  <option>动手能力 / AI 理解力 （把 AI 用出来）</option>
                  <option>开拓创新力 / 协作方影响力 （让能力扩散）</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">背景痛点 Background:</label>
                <textarea
                  rows={2}
                  placeholder="描述业务场景及人手短板..."
                  value={caseBg}
                  onChange={(e) => setCaseBg(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">AI 方案 SOP / 工具插件:</label>
                <textarea
                  rows={2}
                  placeholder="用了什么 Agent，如何编排链路..."
                  value={caseSop}
                  onChange={(e) => setCaseSop(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-rose-600 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> ⚠️ 踩过并解决的坑 Hard Pit (核心重点，优先收录):
                </label>
                <textarea
                  rows={2}
                  placeholder="遇到什么边际偏差/合规漏洞？怎么绕过去的？"
                  value={casePit}
                  onChange={(e) => setCasePit(e.target.value)}
                  className="w-full p-2 bg-white border border-rose-200 rounded-lg text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">效果量化 Metrics:</label>
                <textarea
                  rows={2}
                  placeholder="粗估节省的时长、转产率提高、或误漏判降低率..."
                  value={caseMetrics}
                  onChange={(e) => setCaseMetrics(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="btn-sub-case"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                提报至 AI 评选委员会 <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Submitted list container */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider mb-2">
            当前提报大组公示案例公示栏 ({submittedCases.length + 3})
          </h4>

          {/* Newest submitted */}
          {submittedCases.map((c, i) => (
            <div key={i} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/5 relative group animate-fade-in font-sans">
              <div className="absolute top-4 right-4 bg-yellow-105 border border-yellow-200 text-yellow-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded animate-pulse">
                {c.status}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                    {c.level}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{c.title}</span>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 bg-white/60 p-3 rounded-lg border border-slate-100/50">
                  <p><strong>背景痛点 background:</strong> {c.background}</p>
                  <p className="text-rose-700 font-medium"><strong>⚠️ 填坑经验 pit:</strong> {c.pit}</p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-3">
                  提报人: 匿名极客同学 | 匹配维度：{c.dimension} | 提报日期: {c.submitTime}
                </div>
              </div>
            </div>
          ))}

          {/* Dummy existing hard cases */}
          {[
            {
              title: "基于 Lora 视觉包将大促短视频一键 AIGC 视觉不合规漏判率降低到 0.05%",
              level: "L3 部门级 AI Native",
              dim: "价值闭环力 / 动手能力",
              bg: "每逢抖音大促海量短视频需要质检，人工过一遍要耗费大量时间且容易审美疲劳漏判漏过。",
              pit: "直接给 AI 扔海报风格它很难对齐。后来我们提炼了特定‘比对圆角+文字占比’评测集，设计交叉校验打分纠偏。"
            },
            {
              title: "服务事故日志 Trace 自动摘要聚类 & A/B 灰度稳定性自动化保障",
              level: "L2 流程重构水准",
              dim: "动手能力 / AI 理解力",
              bg: "故障发生时需要值班人手动去拉一堆 Trace，往往花十几分钟，回复慢影响线上可用度。",
              pit: "模型对巨长日志会超出限制而丢失细节。所以我们加了前置特征规则切层，只给 AI 喂浓缩特征，保证其结论置信。"
            }
          ].map((c, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 font-sans">
              <div className="absolute top-4 right-4 text-[9px] text-slate-400 font-mono">
                已入库 · 推荐在全司复制推广
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded">
                    {c.level}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{c.title}</span>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 bg-white/40 p-3 rounded-lg border border-slate-100/30">
                  <p><strong>背景痛点 background:</strong> {c.bg}</p>
                  <p className="text-rose-700 font-medium"><strong>⚠️ 填坑经验 pit:</strong> {c.pit}</p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-3">
                  提报人: @曹阅微 @钟赛君 | 匹配：{c.dim}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4.5 Community & Open source spirit */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl border border-slate-800 relative overflow-hidden font-sans">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400 font-bold shrink-0">
            <HeartHandshake className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-sans font-bold text-white mb-2 leading-snug">
              共建生态与抖音 AI 开源精神 (Community & Open-source Spirit)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              当前业务 AIGC 实践落地的最大矛盾是：<strong>每个人都在孤独地填平自己的边界大坑，填完就拍拍屁股走了，经验沉淀完全无法复利。</strong>
              <br className="mb-2" />
              我们坚信 “分享的机制设计比单纯发钱激励强得多”。为了降低额外汇报负担，抖音提倡 <strong>“有实践就能随时分享、一键自动整理案例文档、方案被引用全天候收到震动通知”</strong> 的开源成长底盘。只有让极客的影响力永久被见证，才能不断孕育出 AI 时代的最强 DRI 领衔人！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
