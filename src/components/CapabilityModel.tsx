import React, { useState } from "react";
import { CAPABILITY_DIMENSIONS, CASE_STUDIES } from "../data";
import { CapabilityDimension } from "../types";
import { 
  Compass, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  HelpCircle, 
  Tv, 
  GitCommit, 
  Layers, 
  ArrowUpRight, 
  FileText, 
  TrendingUp, 
  MonitorPlay,
  RotateCw,
  Award
} from "lucide-react";

export default function CapabilityModel() {
  const [selectedDirection, setSelectedDirection] = useState<string>("ALL");
  const [activeDimensionId, setActiveDimensionId] = useState<string>("biz_define");
  const [activeTransitionTab, setActiveTransitionTab] = useState<number>(4);

  // Filter dimensions based on Direction tabs
  const filteredDimensions = selectedDirection === "ALL" 
    ? CAPABILITY_DIMENSIONS 
    : CAPABILITY_DIMENSIONS.filter(d => d.direction === selectedDirection);

  const activeDimension = CAPABILITY_DIMENSIONS.find(d => d.id === activeDimensionId) || CAPABILITY_DIMENSIONS[0];

  return (
    <div className="space-y-10">
      {/* 2.0 AI Evolution anchoring */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-sans font-bold text-slate-900">
            能力的底层坐标轴：AI 演进五阶段与本体系锚点
          </h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mb-6 font-sans">
          各能力定级强依赖 “当前 AI 处于哪个阶段”。本标准体系锚定在
          <span className="text-indigo-600 font-semibold px-1">第 ④ 阶段（Agent 智能体时代）</span>。
          即假设 AI 已经可以自主多步调用工具、编排闭环，但仍旧需要人“定义高维问题、设计抽检防区与最后的兜底”。一旦阶段前移进入 ⑤ AGI 时代，各维度和定级比重将重构标定。
        </p>

        {/* Timeline representation of 5 stages */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { phase: "① LLM 时代", rep: "GPT-3", feat: "能输出语言，但极不可靠，需海量筛选", rel: "看写字看个乐", active: false },
            { phase: "② 对话时代", rep: "ChatGPT", feat: "单轮或浅层次对话，能够检索问答", rel: "问答小助手", active: false },
            { phase: "③ 工具/Copilot", rep: "GPT-4 / Cursor", feat: "嵌入工作流调用工具，完成单点事务", rel: "人主导，AI打下手", active: false },
            { phase: "④ Agent 智能体", rep: "GPT-5 (★当前锚点)", feat: "自主多步闭环，可执行 Skill 编排和自评估", rel: "人定问题+抽检，AI自闭环", active: true },
            { phase: "⑤ AGI 跨领域通用", rep: "自愈网络", feat: "跨领域自主决策、自我纠错与长效运营", rel: "人设目标，AI全托管", active: false },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border transition-all ${
                item.active 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-[1.02]" 
                  : "bg-slate-50 border-slate-100 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${item.active ? "text-indigo-200" : "text-slate-400"}`}>
                  {item.phase}
                </span>
                {item.active && (
                  <span className="bg-red-500 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <h4 className="text-xs font-sans font-bold leading-tight">{item.rep}</h4>
              <p className={`text-xs font-sans mt-2 leading-relaxed ${item.active ? "text-indigo-100" : "text-slate-500"}`}>
                {item.feat}
              </p>
              <div className={`mt-3 pt-2 text-[10px] font-mono border-t ${item.active ? "border-indigo-500/50 text-indigo-200" : "border-slate-200/60 text-slate-400"}`}>
                人机关系: {item.rel}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explorer section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Dimension Navigator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-mono text-slate-400 font-semibold uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>●</span> 3大业务方向 ＆ 6大能力维度
            </h3>

            {/* Selector Tabs */}
            <div className="flex border-b border-slate-100 pb-3 mb-4 gap-1 flex-wrap">
              {["ALL", "选对问题", "把 AI 用出来", "让能力扩散"].map((dir) => (
                <button
                  key={dir}
                  id={`tab-dir-${dir}`}
                  onClick={() => setSelectedDirection(dir)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    selectedDirection === dir 
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-slate-500 hover:text-indigo-600"
                  }`}
                >
                  {dir === "ALL" ? "全部维度" : dir}
                </button>
              ))}
            </div>

            {/* List representing the 6 dimensions */}
            <div className="space-y-2">
              {filteredDimensions.map((dim) => (
                <button
                  key={dim.id}
                  id={`btn-dim-${dim.id}`}
                  onClick={() => setActiveDimensionId(dim.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    activeDimensionId === dim.id
                      ? "border-indigo-600 bg-indigo-50/10 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activeDimensionId === dim.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <span className="text-xs font-mono font-bold">
                        {dim.id === "biz_define" ? "业务" : dim.id === "value_close" ? "闭环" : dim.id === "hands_on" ? "动手" : dim.id === "ai_understanding" ? "理解" : dim.id === "innovation" ? "创新" : "协作"}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-sans font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                        {dim.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                        方向：{dim.direction}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                    activeDimensionId === dim.id ? "text-indigo-600 translate-x-1" : "text-slate-300"
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Level details card */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm h-full flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {activeDimension.direction}
                  </span>
                  <h3 className="text-xl font-sans font-bold text-slate-900 mt-2">
                    {activeDimension.name} 能力拆解
                  </h3>
                  <p className="text-slate-500 text-sm font-sans mt-1.5">
                    定义：{activeDimension.definition}
                  </p>
                </div>
              </div>

              {/* Dynamic Grid for standard requirements L1 / L2 / L3 */}
              <div className="space-y-4">
                {[
                  { level: "L1 入门级 (1-3分)", text: activeDimension.levels.l1, bg: "from-slate-50 to-slate-50/50", border: "border-slate-100", labelColor: "bg-slate-200/60 text-slate-700" },
                  { level: "L2 进阶级 (4-6分)", text: activeDimension.levels.l2, bg: "from-indigo-50/20 to-indigo-50/5", border: "border-indigo-100/40", labelColor: "bg-indigo-100/60 text-indigo-800" },
                  { level: "L3 精通级 (7-9分)", text: activeDimension.levels.l3, bg: "from-rose-50/10 to-rose-50/5", border: "border-rose-100/30", labelColor: "bg-rose-100/60 text-rose-800" }
                ].map((item, id) => (
                  <div key={id} className={`p-4 rounded-xl border bg-gradient-to-br ${item.bg} ${item.border} flex items-start gap-3`}>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${item.labelColor} mt-0.5`}>
                      {item.level}
                    </span>
                    <p className="text-slate-700 text-sm font-sans leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Real World Scenario */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h4 className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                  💡 抖音业务代表场景 (Combined Scenario)
                </h4>
                <p className="text-slate-600 text-sm font-sans leading-relaxed">
                  {activeDimension.scenario}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2.3 Leap explanation */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-sans font-bold text-slate-900">
              指南针三大跃迁线：为什么要不甘于做“入门级”？
            </h3>
          </div>
          <div className="flex bg-slate-50 p-1 rounded-lg gap-1 border border-slate-100">
            {[
              { id: 4, name: "4分跃迁 (建立流程)" },
              { id: 7, name: "7分跃迁 (建立自检)" },
              { id: 10, name: "10分跃迁 (寻找自增长)" }
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-leap-${tab.id}`}
                onClick={() => setActiveTransitionTab(tab.id)}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                  activeTransitionTab === tab.id
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-500 hover:text-indigo-600"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content rendering */}
        {activeTransitionTab === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
            <div className="md:col-span-8 space-y-4">
              <h4 className="text-base font-sans font-bold text-slate-900">
                4分跃迁核心 —— 把无序零散的 AI 操作沉淀为可复用的流程。
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-sans">
                区别在于，入门级同学停留在使用 AI 的“体力模式”。比如每次做一个视频新产品推广，都要打开网页一次次重新输入 Prompt 发送。进阶级则是将这个 SOP 正式抽象提炼成：
                <span className="font-semibold bg-indigo-50 text-indigo-700 px-1 rounded">版本日志抓取 + 卖点提炼 + 文案模板 + AIGC组件 = 自动化发版组合</span>，并预设了人工确认卡点。
              </p>
              <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-xl">
                <span className="text-xs font-mono font-bold text-emerald-800 block mb-1">🏁 4分跃迁里程碑标志:</span>
                <p className="text-slate-700 text-sm font-sans leading-relaxed">
                  能把一类高频或重复业务沉淀为可稳定运行的 Skill / Agent 工作流，设立防风人工审查标志。使不熟悉模型的技术或非技术同学点一下，流程即可稳定、低偏差反复重现。
                </p>
              </div>
            </div>
            <div className="md:col-span-4 bg-slate-50 p-5 rounded-xl border border-slate-100/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider mb-2">
                  天花板重构
                </span>
                <p className="text-slate-700 text-xs font-sans leading-relaxed">
                  你从“每次耗费肉眼去盯，你能盯几份”的体力上限，彻底跳跃成为“用一套流程解放体力”的内容流水线设计师。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                ⭐ L1级 ➡️ L2级 唯一黄金跨越
              </div>
            </div>
          </div>
        )}

        {activeTransitionTab === 7 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
            <div className="md:col-span-8 space-y-4">
              <h4 className="text-base font-sans font-bold text-slate-900">
                7分跃迁核心 —— 为流程引入自评测与自更新，产出进入业务闭环。
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-sans">
                进阶级解决的是“能跑通一次长流程”。但如果遇到长河数据偏差或高危合规红线，该流程可能吐出坏垃圾。精通级（7分+）则是引入交叉评测大纲：
                对大模型返回结果设计出正确审查度量、一致性校验、安全风口拦截判定。把真实跑通得到的转化、差评、吐槽通过抓取自动反馈给 AI 重新训练或调整生成策略！
              </p>
              <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-xl">
                <span className="text-xs font-mono font-bold text-emerald-800 block mb-1">🏁 7分跃迁里程碑标志:</span>
                <p className="text-slate-700 text-sm font-sans leading-relaxed">
                  建立起 AI 的自度量与评判纠偏机制。接入真实运营点击结果（转化漏斗）反向更新策略。这与业界 SAE 自动驾驶等级标准的‘从辅助工具到托管式掌控’完全吻合。
                </p>
              </div>
            </div>
            <div className="md:col-span-4 bg-slate-50 p-5 rounded-xl border border-slate-100/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider mb-2">
                  交付价值变迁
                </span>
                <p className="text-slate-700 text-xs font-sans leading-relaxed">
                  您在这个阶段，交付的不再是单次成功的数据，也不是一套容易卡住的流程；而是一套在抖音能无错自运行、自迭代的系统生态。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                ⭐ 精通级（L3级）核心大坎
              </div>
            </div>
          </div>
        )}

        {activeTransitionTab === 10 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
            <div className="md:col-span-8 space-y-4">
              <h4 className="text-base font-sans font-bold text-slate-900">
                10分理想态核心 —— 依赖 AI 自跑闭环体系，极低阻力开辟出全生命期业务。
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-sans">
                达到 10 分的终极领航员不再局限于给既有流程降本，而能把“发版 - 广告生成 - 数据抓回 - Ctr淘汰 - 体验升级”串成自循环的业务模式。甚至可以单人利用该成熟的 AI 基础设施，在 2 天内快速设计出一个之前需要 30 人支撑的大型运营或本地商业游戏，直接形成新爆点。
              </p>
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <span className="text-xs font-mono font-bold text-indigo-800 block mb-1">🏁 10分理想态标志:</span>
                <p className="text-slate-700 text-sm font-sans leading-relaxed">
                  将功能、产出、负反馈、参数纠正完全闭锁在一个自旋转的数据圆盘中。业务交付的是全新的赛道和前导性的生产力高点。
                </p>
              </div>
            </div>
            <div className="md:col-span-4 bg-slate-50 p-5 rounded-xl border border-slate-100/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider mb-2">
                  Shopify 例证
                </span>
                <p className="text-slate-700 text-xs font-sans leading-relaxed">
                  正如 Shopify 总裁 mandate 宣布：‘在要求添加额外 HC 之前，先向我证明 AI 无法承接该完整业务。’这便是用 AI 体系作为组织底板的终极呈现。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                ⭐ DRI 指南针终极状态
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Case studies comparison matrix */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <MonitorPlay className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-sans font-bold text-slate-900">
            标杆案例多镜对照：【全新产品宣发推广】三水位大对比！
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CASE_STUDIES.map((c, i) => (
            <div key={i} className="flex flex-col justify-between border border-slate-100 rounded-2xl p-5 bg-slate-50/40 relative">
              <div className="absolute top-4 right-4 bg-indigo-100/70 text-indigo-800 text-[9px] font-semibold px-2 py-0.5 rounded uppercase font-mono">
                {c.level}
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    SCENARIO {i+1}
                  </h4>
                  <p className="text-sm font-sans font-bold text-slate-900 leading-snug mt-1">
                    {c.scenario}
                  </p>
                </div>
                <div className="space-y-2.5">
                  <div className="text-xs font-sans">
                    <span className="font-semibold text-indigo-600 block mb-0.5 font-mono uppercase">做法 Action:</span>
                    <p className="text-slate-600 leading-relaxed">{c.action}</p>
                  </div>
                  <div className="text-xs font-sans">
                    <span className="font-semibold text-rose-500 block mb-0.5 font-mono uppercase">亮点 Highlight:</span>
                    <span className="text-slate-800 font-medium leading-relaxed bg-white/80 p-2 rounded block border border-slate-100/50">{c.highlight}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200 text-xs text-slate-500 italic font-sans">
                💡 指南针启示: {c.takeaway}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
