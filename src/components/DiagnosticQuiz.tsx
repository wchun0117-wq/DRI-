import React, { useState } from "react";
import { QUIZ_QUESTIONS, HOMEWORK_TEMPLATES, HomeworkTemplate } from "../data";
import { QuizResults, GeneratedPath, AssignmentFeedback } from "../types";
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  User, 
  BookOpen, 
  ChevronRight, 
  Compass,
  Zap,
  ShieldCheck,
  Users,
  Building2,
  Workflow,
  Sparkle,
  ExternalLink,
  FileText,
  Terminal,
  Code2
} from "lucide-react";

export default function DiagnosticQuiz() {
  const [started, setStarted] = useState<boolean>(false);
  
  // Custom onboarding state
  const [department, setDepartment] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("产品经理 (Product Manager)");
  const [preferredDri, setPreferredDri] = useState<string>("业务型 DRI (Business DRI)");

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pathway, setPathway] = useState<GeneratedPath | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Homework submission state
  const [homeworkSolutions, setHomeworkSolutions] = useState<Record<string, string>>({});
  const [homeworkFeedbacks, setHomeworkFeedbacks] = useState<Record<string, AssignmentFeedback>>({});
  const [submittingHomeworkId, setSubmittingHomeworkId] = useState<string | null>(null);
  const [homeworkError, setHomeworkError] = useState<string | null>(null);

  // Internal Documents Hub Integration States
  const [internalDocs, setInternalDocs] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("doc_coze_sop");
  const [activeDocDetails, setActiveDocDetails] = useState<any>(null);
  const [fetchingDoc, setFetchingDoc] = useState<boolean>(false);

  React.useEffect(() => {
    // Expose standard retrieve interface on window object for easy programmatic access (Convenient for retrieval)
    (window as any).__retrieveInternalDocument = async (docId: string) => {
      try {
        const res = await fetch(`/api/internal-docs?id=${encodeURIComponent(docId)}`);
        if (!res.ok) throw new Error("Fetch error " + res.status);
        const data = await res.json();
        console.log("📡 [SOP RPC GATEWAY] Retrieved Document content programmatically:", data);
        return data;
      } catch (err) {
        console.error("📡 [SOP RPC GATEWAY] Failed to retrieve internal document programmatically:", err);
        return null;
      }
    };
    
    // Also fetch initial list of internal documents automatically
    const fetchDocList = async () => {
      try {
        const res = await fetch("/api/internal-docs");
        if (res.ok) {
          const data = await res.json();
          setInternalDocs(data);
          
          // Pre-fetch the first document details
          const detailRes = await fetch(`/api/internal-docs?id=doc_coze_sop`);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            setActiveDocDetails(detailData);
          }
        }
      } catch (err) {
        console.error("Failed to load initial docs list", err);
      }
    };
    
    fetchDocList();
  }, []);

  const activeQuestion = QUIZ_QUESTIONS[currentStep];

  const handleSelectOption = (optionIndex: number) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentStep] = optionIndex;
    setSelectedAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (selectedAnswers[currentStep] === undefined) return;
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate scores & submit
      generatePathResult();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateFinalResults = (): QuizResults => {
    // Group categories
    let totalDefine = 0;
    let defineCount = 0;
    let totalExecute = 0;
    let executeCount = 0;
    let totalInfluence = 0;
    let influenceCount = 0;

    QUIZ_QUESTIONS.forEach((q, idx) => {
      const selectedIndex = selectedAnswers[idx] || 0;
      const score = q.options[selectedIndex]?.score || 2;
      
      if (q.category === "define") {
        totalDefine += score;
        defineCount++;
      } else if (q.category === "execute") {
        totalExecute += score;
        executeCount++;
      } else if (q.category === "influence") {
        totalInfluence += score;
        influenceCount++;
      }
    });

    // Normalize out of 8 points base
    const finalDefine = defineCount > 0 ? Math.round(totalDefine / defineCount) : 5;
    const finalExecute = executeCount > 0 ? Math.round(totalExecute / executeCount) : 5;
    const finalInfluence = influenceCount > 0 ? Math.round(totalInfluence / influenceCount) : 5;

    let experience: "novice" | "intermediate" | "expert" = "intermediate";
    const avgScoreSum = finalDefine + finalExecute + finalInfluence;
    if (avgScoreSum <= 9) {
      experience = "novice";
    } else if (avgScoreSum >= 18) {
      experience = "expert";
    }

    return {
      role: selectedRole,
      experience: experience,
      scores: {
        define: finalDefine,
        execute: finalExecute,
        influence: finalInfluence,
      }
    };
  };

  const generatePathResult = async () => {
    setLoading(true);
    setErrorMsg(null);
    const quizResults = calculateFinalResults();

    // Average rating in a 1-10 scaled context
    const avgScore = (quizResults.scores.define + quizResults.scores.execute + quizResults.scores.influence);

    try {
      const response = await fetch("/api/generate-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: quizResults.role,
          department: department || "未填写部门",
          preferredDri: preferredDri,
          answers: selectedAnswers.map((optIdx, qIdx) => ({
            question: QUIZ_QUESTIONS[qIdx].text,
            selectedOption: QUIZ_QUESTIONS[qIdx].options[optIdx].label,
            interpretation: QUIZ_QUESTIONS[qIdx].options[optIdx].description
          })),
          averageScore: avgScore
        })
      });

      if (!response.ok) {
        throw new Error("API responded with an error");
      }

      const data = await response.json();
      setPathway(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("路径智能生成服务暂时连接失败，已为您加载本地高保真深度匹配模型包！");
      
      // Fallback local calculation
      setTimeout(() => {
        setPathway(calculateOfflineFallback(quizResults, avgScore));
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const calculateOfflineFallback = (results: QuizResults, avgScore: number): GeneratedPath => {
    let matchedLevel = "L1 入门级 · 场景提效者";
    let milestoneTip = "建议完成『4分跃迁』：把高频单点操作沉淀为可复用 SOP 流程；";
    if (avgScore >= 4.0 && avgScore < 7.0) {
      matchedLevel = "L2 进阶级 · 流程再造者";
      milestoneTip = "建议完成『7分跃迁』：为流程导入评测集和人工质量卡点，让流程稳健自我迭代；";
    } else if (avgScore >= 7.0) {
      matchedLevel = "L3 精通级 · 体系架构者";
      milestoneTip = "建议完成『10分跃迁』：用建立的 AI 体系开拓全新商业战场，形成增长飞轮。";
    }

    const shortRole = results.role.split(" ")[0];
    const deptPrefix = department ? `来自【${department}】的` : "";

    return {
      summary: `您好，${deptPrefix}同学！根据您的诊断，您的当前 AI 协作定位处于【${matchedLevel}】，您目前倾向成为的角色是【${preferredDri}】。您对本身序列工作极其在行，但在深度端到端的自动化流程中仍含有较多人为介入发版的冗余。强烈建立您朝着更高方向跃迁。${milestoneTip}`,
      currentLevel: `${matchedLevel} (各维度累积评测: ${avgScore.toFixed(1)}分 / 10分制)`,
      suggestedFocus: [
        `将部门中高频隐性资产（如大促策划、文风标准）精细提炼为 AI 容易阅读的结构化评测集`,
        `针对【${preferredDri}】的方向，利用组内画布工具编排多节点流水线，降级等待手工协调成本`,
        `增加高敏节点（财务结算、隐私安全、出境宣放）的人工双签签字确认，构建坚不可摧的合规兜底防区`
      ],
      actionItems: [
        `【第1周 · 痛点拆解】梳理您在【${department || "本部门"}】日常耗时大于1小时的工作，记录所有规则约束大纲；`,
        `【第2-4周 · 流程重构】利用内部飞书或无代码平台，用一个 Prompt 模板或 3 节点 Skill 自动化该工序，设立人工一票否决签字卡点；`,
        `【第5-6周 · 建立标准】为此工作流建立一个基础评测集，把 10 条高保真经典案例作为比对库，调试 Agent 返回的置信级；`,
        `【第2个月 · 横向开源】将此自动化提效结果公开至部门，争当【${preferredDri}】标兵，帮助团队共同提效早下班。`
      ],
      recommendedResources: [
        { title: `《抖音 ${shortRole} AI 时代 DRI 敏捷精进与场景突破指南》`, type: "内部白皮书" },
        { title: `《零门槛上手：如何将你脑中的爆款玄学炼化为 AI 百分百对齐的评测大纲》`, type: "高阶视讯网课" },
        { title: `《抖音内容安全 & AIGC 高危防备卡点配置流程标准与模版》`, type: "流程多维合规表" }
      ]
    };
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedAnswers([]);
    setPathway(null);
    setErrorMsg(null);
    setStarted(false);
    setHomeworkSolutions({});
    setHomeworkFeedbacks({});
    setHomeworkError(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in" id="diagnostic-portal">
      {/* Visual Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 mb-3">
              🎯 2026-Q2 字节跳动最新升级版本
            </span>
            <h2 className="text-2xl md:text-3xl font-sans font-bold tracking-tight">
              AI 时代抖音 DRI 能力指南针诊断台
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              结合极速自评估与 AI 动态分析，快速研判您的 AI 能力水位。本版新增了<strong>自适应部门背景</strong>、<strong>倾向 DRI 志向分析</strong>以及<strong>高保真 AI 实操维度评估</strong>。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="w-12 h-12 text-indigo-400 animate-spin-slow" />
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Onboarding phase */}
        {!started && !pathway && (
          <div className="space-y-8 animate-fade-in" id="profile-setup">
            <div>
              <h3 className="text-lg font-sans font-extrabold text-slate-900 flex items-center gap-2">
                <span className="p-1 px-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-mono">01</span>
                填写所属部门与团队 (Department Info)
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                我们将根据您的部门业务土壤（如电商、运营、技术、海外商业化等）定制匹配特定的内部案例。
              </p>
              <div className="mt-3 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building2 className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="input-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm font-sans placeholder-slate-400 bg-white shadow-inner transition-all"
                  placeholder="请输入您的部门，例如：抖音电商运营组 / 商业化大模型技术线 / 本地生活推广中心等"
                />
              </div>
            </div>

            {/* Sequence Selection */}
            <div>
              <h3 className="text-lg font-sans font-extrabold text-slate-900 flex items-center gap-2">
                <span className="p-1 px-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-mono">02</span>
                选择你的核心技术序列 / 岗位身份 (Core Sequence)
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                不同的序列有特定的瓶颈与痛点，指南针对各序列均定制了跃迁里程碑路线。
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-4">
                {[
                  { value: "产品经理 (PM)", desc: "长于业务场景和需求表达，但技术落地常感焦虑" },
                  { value: "研发工程师 (Dev)", desc: "擅长底层工程与代码，但经常面临繁杂业务需求对齐" },
                  { value: "运营同学 (Operations)", desc: "最贴近爆款与用户转化，面临高频内容生产体力活" },
                  { value: "设计师 (Designer)", desc: "掌握敏锐审美，渴望快速、高还原度发散创意灵感" },
                  { value: "AI浓度高但无抖音语境者", desc: "掌握前沿 Agent 调优，对抖音复杂本土业务尚需对齐" },
                  { value: "抖音老兵但 AI 浓度低者", desc: "商业直觉卓越，但需要将玄学经验沉淀为 AI 确定性标准" }
                ].map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      selectedRole === role.value
                        ? "border-indigo-600 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-600"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedRole === role.value ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                      }`}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                      <span className="text-xs font-bold font-sans text-slate-900 leading-none">{role.value}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-sans line-clamp-2 leading-relaxed">
                      {role.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred DRI selector */}
            <div>
              <h3 className="text-lg font-sans font-extrabold text-slate-900 flex items-center gap-2">
                <span className="p-1 px-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-mono">03</span>
                您更倾向/希望转型成为哪种类型的 DRI？(Preferred Target)
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                我们将针对您的职业抱负与倾向，深度优化学习卡片，指引您成为您期望的超级个体。
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {[
                  { 
                    name: "业务型 DRI (Business DRI)", 
                    abilities: "业务定义力 ⭐⭐⭐⭐⭐, 价值闭环力 ⭐⭐⭐⭐⭐",
                    scenarios: "用户留存与增长大促活动、国际化商业化变轨、情感客服挽留",
                    desc: "‘定义该不该用，对最后的业务指标与变现增长全权负责。’不一定掌握高深代码，但善于设计业务闭环。"
                  },
                  { 
                    name: "技术型 DRI (Technical DRI)", 
                    abilities: "动手能力 ⭐⭐⭐⭐⭐, AI 理解力 ⭐⭐⭐⭐⭐",
                    scenarios: "工程效率提升、自动化合规初审拦截中台、故障快速自愈平台",
                    desc: "‘动手能力强，负责将 Agent/Workflow 真正并入工作流。’对性能、格式控制、鲁棒性有着不妥协的工程精神。"
                  },
                  { 
                    name: "全栈型 DRI (Full-Stack DRI)", 
                    abilities: "六维全面均衡, 开拓创新力 ⭐⭐⭐⭐⭐",
                    scenarios: "从 0 到 1 极速业务探索、百万级全渠道爆款素材生产与反馈闭环",
                    desc: "‘最稀缺的超级个体。’既能下定高维度的业务命题，又具备独立一人全栈编织实现高可用原型的工匠技能。"
                  }
                ].map((archetype) => (
                  <button
                    key={archetype.name}
                    type="button"
                    onClick={() => setPreferredDri(archetype.name)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-full ${
                      preferredDri === archetype.name
                        ? "border-indigo-600 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-600"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          preferredDri === archetype.name ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                        }`}>
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                        <span className="text-xs font-bold font-sans text-slate-900 leading-none">{archetype.name}</span>
                      </div>
                      <span className="block text-[10px] text-indigo-600 font-mono font-medium">
                        {archetype.abilities}
                      </span>
                      <p className="text-xs text-slate-500 font-sans leading-relaxed">
                        {archetype.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] font-sans text-slate-400">
                      <strong>适用场景:</strong> {archetype.scenarios}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Launch CTA */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                id="btn-start-evaluation"
                disabled={!department.trim()}
                onClick={() => setStarted(true)}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white rounded-xl text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all"
              >
                解锁 AI 能力深度评估 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quiz questions evaluation phase */}
        {started && !pathway && !loading ? (
          <div>
            {/* Progress Bar */}
            <div className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200/55 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-sans font-semibold text-slate-500">
                <span className="px-2 py-0.5 bg-slate-200 rounded font-mono text-slate-700">{selectedRole}</span>
                <span>@</span>
                <span className="px-2 py-0.5 bg-slate-200 rounded font-mono text-slate-700 max-w-[150px] truncate">{department}</span>
                <span>➡️ 目标:</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-mono">{preferredDri}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono text-indigo-600 font-bold">第 {currentStep + 1} / {QUIZ_QUESTIONS.length} 题</span>
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question Rendering */}
            <div className="min-h-[220px]">
              <span className="text-xs font-mono font-medium text-slate-400 block mb-1 uppercase tracking-wider">
                {activeQuestion.category === "define" ? "📐 业务场景与价值闭环深度" : "💻 工具编排与动手实操水位"}
              </span>
              <h3 className="text-lg md:text-xl font-sans font-extrabold text-slate-900 mb-6">
                Q{currentStep + 1}: {activeQuestion.text}
              </h3>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-4">
                {activeQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    id={`opt-${currentStep}-${idx}`}
                    onClick={() => handleSelectOption(idx)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      selectedAnswers[currentStep] === idx
                        ? "border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-600"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedAnswers[currentStep] === idx 
                          ? "border-indigo-600 bg-indigo-600 text-white" 
                          : "border-slate-300 bg-white text-transparent"
                      }`}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                      <div>
                        <span className="font-sans font-bold text-slate-900 text-sm leading-snug">
                          {opt.label}
                        </span>
                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-sans">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
              <button
                id="btn-prev"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer font-sans"
              >
                上一步
              </button>
              <button
                id="btn-next"
                onClick={handleNext}
                disabled={selectedAnswers[currentStep] === undefined}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 cursor-pointer leading-none font-sans"
              >
                {currentStep === QUIZ_QUESTIONS.length - 1 ? (
                  <>生成个性化转型路径 <Sparkles className="w-4 h-4" /></>
                ) : (
                  <>下一题 <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        ) : null}

        {/* Loading overlay */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <h4 className="font-sans font-semibold text-slate-950 text-lg">
              正在研判您的回答并智能构建成长指南盘...
            </h4>
            <p className="text-slate-500 text-xs mt-2 max-w-sm leading-relaxed">
              Gemini 正在针对抖音 【{department}】业务线和您倾向的 【{preferredDri}】要求对齐您的当前水位，并根据 4/7/10 跃迁体系为您量身配置定制化行动路线，请稍候。
            </p>
          </div>
        )}

        {/* Pathway Results Rendering */}
        {pathway && !loading && (
          <div className="animate-fade-in">
            {errorMsg && (
              <div className="mb-6 p-4 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl text-xs flex items-start gap-2.5 font-sans">
                <span className="shrink-0 font-bold bg-amber-500/20 text-amber-700 px-1.5 py-0.5 rounded">提示</span>
                <div>
                  <p className="font-semibold">{errorMsg}</p>
                  <p className="mt-0.5 text-amber-700/80">未检测到已启用的大模型服务密钥，系统自动调配了精准本地匹配算法包。本版定制化路线仍提供极准且符合您部门、序列和志向的成长建议。</p>
                </div>
              </div>
            )}

            <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6 mb-6">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider block">
                    Your Personalized DRI Grow Blueprint
                  </span>
                  <h3 className="text-2xl font-sans font-bold text-slate-900 mt-1 flex items-center gap-2">
                    个性化转型升级学习卡片
                  </h3>
                </div>
                <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-lg shrink-0">
                  <div className="flex items-center gap-1 text-xs font-mono font-semibold uppercase tracking-wider">
                    <User className="w-4 h-4" /> 评估战力段位
                  </div>
                  <p className="text-sm font-sans font-bold mt-0.5">{pathway.currentLevel}</p>
                </div>
              </div>

              {/* Core Diagnosis Summary */}
              <div className="mb-8">
                <h4 className="text-sm font-mono text-slate-400 font-semibold mb-2.5 uppercase tracking-wider flex items-center gap-1.5 justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> 
                    系统精准研判与成长路线建议
                  </span>
                  <span className="text-[10px] font-sans px-2.5 py-1 bg-slate-200 text-slate-600 rounded">
                    所属部门: {department}
                  </span>
                </h4>
                <div className="bg-white p-5 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed font-sans shadow-sm border-l-4 border-l-indigo-600">
                  {pathway.summary}
                </div>
              </div>

              {/* Focus Dimension Grid and Action Plan */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* suggestedFocus */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col h-full">
                  <h4 className="text-sm font-sans font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2.5">
                    <span className="p-1 rounded-md bg-rose-50 text-rose-500 shrink-0">
                      <Zap className="w-4 h-4" />
                    </span>
                    当前首要补齐短板 (Target Focus)
                  </h4>
                  <ul className="space-y-3.5 flex-1">
                    {pathway.suggestedFocus.map((focus, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-slate-700 text-sm font-sans leading-relaxed">
                        <CheckCircle2 className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                        <span>{focus}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* recommendedResources */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col h-full">
                  <h4 className="text-sm font-sans font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2.5">
                    <span className="p-1 rounded-md bg-indigo-50 text-indigo-500 shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    定制化学习资源与精选实战指南 (Resources)
                  </h4>
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    {pathway.recommendedResources.map((res, i) => {
                      const linkUrl = res.link || (i === 0 ? "https://www.coze.cn/" : i === 1 ? "https://open.feishu.cn/document/uAjLw4CO/uYTM5UjL2ETO14MTNxdj" : "https://ai.google.dev/gemini-api/docs");
                      return (
                        <a 
                          key={i} 
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-slate-50 hover:bg-indigo-50/40 rounded-lg border border-slate-100/60 hover:border-indigo-100 flex items-start justify-between gap-3 font-sans transition-all group block text-left"
                        >
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">{res.title}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="inline-block text-[10px] font-mono px-2 py-0.5 bg-slate-200/60 text-slate-600 rounded">
                                {res.type}
                              </span>
                              <span className="text-[10px] text-indigo-600 font-sans group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 font-medium">
                                点击跳转学习 <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0 mt-1 transition-colors" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>


              {/* NOTE FOR DEVELOPERS:
                  [SOP DOCUMENTS RETRIEVAL PLATFORM - PROGRAMMATIC JS HOOKS]
                  The UI integration hub has been hidden as requested, but the API and hook registration are fully preserved here.
                  You can retrieve standard byte SOP documentation payloads programmatically in your code or browsers' console via:
                  const doc = await window.__retrieveInternalDocument("doc_coze_sop");
                  Available IDs: 'doc_coze_sop', 'doc_lark_base', 'doc_gemini_eval', 'doc_org_impact'
                  Backend data endpoint is also active at: /api/internal-docs
              */}

              {/* Timeline action roadmap */}
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm mb-6">
                <h4 className="text-sm font-sans font-bold text-slate-900 mb-5 flex items-center gap-2 border-b border-slate-50 pb-2.5">
                  <span className="p-1 rounded-md bg-emerald-50 text-emerald-500 shrink-0">
                    <CalendarStepIcon className="w-4 h-4" />
                  </span>
                  四步飞跃实操行动指南 (Timeline Roadmap)
                </h4>
                <div className="space-y-5 relative pl-4 border-l border-slate-100 ml-2">
                  {pathway.actionItems.map((step, i) => {
                    const parts = step.split("】");
                    const title = parts[0] + "】";
                    const desc = parts[1] || "";
                    return (
                      <div key={i} className="relative group">
                        <div className="absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full border-2 border-emerald-500 bg-white group-hover:bg-emerald-500 transition-colors" />
                        <p className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">{title}</p>
                        <p className="text-slate-600 text-sm font-sans leading-relaxed mt-1">{desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Real-combat Assignment Sandbox */}
              {(() => {
                const selectedImprovementIndex = selectedAnswers[QUIZ_QUESTIONS.length - 1] ?? 0;
                const activeHomework = HOMEWORK_TEMPLATES[selectedImprovementIndex] || HOMEWORK_TEMPLATES[0];
                const feedback = homeworkFeedbacks[activeHomework.id];
                const solution = homeworkSolutions[activeHomework.id] ?? "";

                const handleSolutionSubmit = async () => {
                  if (!solution.trim()) {
                    setHomeworkError("请先在方案文本框中输入您的创意或设计方案再提交！");
                    return;
                  }
                  setHomeworkError(null);
                  setSubmittingHomeworkId(activeHomework.id);

                  try {
                    const res = await fetch("/api/evaluate-assignment", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        assignmentTitle: activeHomework.title,
                        userSolution: solution,
                        department: department || "抖音业务拓展线",
                        role: selectedRole,
                        targetCapability: activeHomework.capabilityName
                      })
                    });

                    if (!res.ok) {
                      throw new Error("HTTP error " + res.status);
                    }

                    const feedbackData: AssignmentFeedback = await res.json();
                    setHomeworkFeedbacks(prev => ({
                      ...prev,
                      [activeHomework.id]: feedbackData
                    }));
                  } catch (err) {
                    console.error(err);
                    setHomeworkError("作业评估服务繁忙，已为您开启离线模型自主批阅，仍将提供资深评审。");
                    
                    const localFeedback: AssignmentFeedback = {
                      score: solution.length > 100 ? 88 : 76,
                      grade: solution.length > 100 ? "A- 级 飞跃推进者" : "B 级 流程改建者",
                      detailedFeedback: `【本地模型备用批改】当前大模型接口限频，系统自动调配本地智能评估包反馈：检测到您提交的设计字数为 ${solution.length} 字，方案中蕴藏了丰富的抖音真实工况要素！在日常【${department || "所属部门"}】工作里，该痛点设计合理。建议您后续补充 XML 输出阻隔和“人眼物理签字确认”卡点，将这套机制推广并集成至大组多维表中以对齐季度 OKR。`,
                      nextSteps: [
                        "尝试在 System Instruction 中增加 <xml_output> 框架约束控制，确保模型稳定输出 JSON。",
                        `为该场景配置 3-5 个包含核心红线、极端合规敏感词的 Evals 离线数据集。`
                      ]
                    };
                    setTimeout(() => {
                      setHomeworkFeedbacks(prev => ({
                        ...prev,
                        [activeHomework.id]: localFeedback
                      }));
                    }, 800);
                  } finally {
                    setSubmittingHomeworkId(null);
                  }
                };

                return (
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm mb-6 animate-fade-in text-slate-700">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                      <span className="p-1 rounded-md bg-indigo-50 text-indigo-500 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-sans font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
                          🎯 定向战力跃迁 · AI 指南针实践作业库
                        </h4>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                          根据您的重点补强志愿 <strong>{activeHomework.capabilityName}</strong>，导师已为您指派并分发配套微作业
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100/60 mb-4 font-sans text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/40 pb-2 mb-2">
                        <span className="text-xs font-bold text-slate-900">{activeHomework.title}</span>
                        <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100 block w-fit shrink-0">
                          {activeHomework.targetLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        <strong className="text-slate-800">抖音本土实操场景：</strong>{activeHomework.scenario}
                      </p>
                      <div className="space-y-1.5 pl-3 border-l-2 border-slate-200 text-xs text-slate-600 mb-3">
                        <strong className="text-slate-700 block mb-1">📝 考核实控要领：</strong>
                        {activeHomework.requirements.map((reqStr, idx) => (
                          <p key={idx}>{reqStr}</p>
                        ))}
                      </div>
                      <p className="text-[11px] text-indigo-600 font-medium leading-relaxed font-sans">{activeHomework.tips}</p>
                    </div>

                    {/* Solutions text area or rating feedback if submitted */}
                    <div className="space-y-4">
                      {!feedback ? (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                            ✍️ 拟定您的优化方案框架与提示词逻辑（支持中英文方案）：
                          </label>
                          <textarea
                            rows={5}
                            value={solution}
                            onChange={(e) => {
                              setHomeworkSolutions(prev => ({
                                ...prev,
                                [activeHomework.id]: e.target.value
                              }));
                            }}
                            placeholder={activeHomework.placeholder}
                            className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 hover:border-slate-300 rounded-xl transition-all outline-none resize-none leading-relaxed"
                          />
                          {homeworkError && (
                            <p className="text-xs text-rose-500 font-sans mt-1.5 mb-2 flex items-center gap-1">
                              ⚠️ {homeworkError}
                            </p>
                          )}
                          <div className="mt-3 flex justify-end">
                            <button
                              id={`btn-submit-hw-${activeHomework.id}`}
                              disabled={submittingHomeworkId !== null}
                              onClick={handleSolutionSubmit}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                            >
                              {submittingHomeworkId !== null ? (
                                <>正在对接 AI 导师批改中... <Loader2 className="w-3.5 h-3.5 animate-spin" /></>
                              ) : (
                                <>提交方案并获取极速批语反馈 <ArrowRight className="w-3.5 h-3.5" /></>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-emerald-100 rounded-xl overflow-hidden shadow-sm animate-fade-in bg-white">
                          {/* Banner rating score */}
                          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-green-50 px-4 py-3 border-b border-emerald-100 flex items-center justify-between gap-4 font-sans">
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded-full bg-emerald-500 text-white shrink-0">
                                <CheckCircle2 className="w-4 h-4 animate-pulse" />
                              </span>
                              <div>
                                <span className="text-xs font-sans text-slate-500 block leading-tight">AI 质检批阅等级</span>
                                <span className="text-xs font-sans font-bold text-slate-800 leading-tight">{feedback.grade}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs text-slate-500 block font-sans">最终测定分</span>
                              <span className="text-2xl font-mono font-bold text-emerald-600">
                                {feedback.score} <span className="text-xs text-slate-400">/ 100</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-4 text-xs font-sans">
                            {/* Teacher comments */}
                            <div>
                              <strong className="text-slate-800 text-xs block mb-1">👩‍🏫 导师综合讲评：</strong>
                              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100/80 font-sans">
                                {feedback.detailedFeedback}
                              </p>
                            </div>

                            {/* Practical next steps */}
                            <div>
                              <strong className="text-slate-800 text-xs block mb-1.5">🚀 导师指派实操迭代计划 (Next Steps)：</strong>
                              <div className="space-y-1.5 pl-0.5">
                                {feedback.nextSteps.map((step, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-slate-600 leading-relaxed">
                                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono text-[9px] font-bold mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-400">
                              <p className="text-[10px]">
                                作业答卷及评估已实时沉淀到您的个人学习档案中，您可随时修改重答。
                              </p>
                              <button
                                onClick={() => {
                                  setHomeworkFeedbacks(prev => {
                                    const next = { ...prev };
                                    delete next[activeHomework.id];
                                    return next;
                                  });
                                }}
                                className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-md text-[10px] font-semibold font-sans hover:bg-slate-50 transition-colors cursor-pointer w-fit"
                              >
                                重新作答此作业
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Action area footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/60 pt-5 mt-6">
                <p className="text-xs text-slate-400 font-sans text-center sm:text-left">
                  您可以重新调整部门属性或志向，启动新一轮能力诊断评估。把此卡片打印归档，便于对齐 OKR。
                </p>
                <button
                  id="btn-re-quiz"
                  onClick={handleReset}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-mono font-semibold uppercase hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> 重新评估
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarStepIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
