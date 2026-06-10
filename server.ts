import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Shared Gemini client lazy initializer
let ai: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("⚠️ GEMINI_API_KEY is not configured or left as default. Using smart deterministic fallback mode.");
    return null;
  }
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Generate Personalized Growth Path
  app.post("/api/generate-path", async (req, res) => {
    try {
      const { role, answers, averageScore, department, preferredDri } = req.body;

      if (!role) {
        return res.status(400).json({ error: "Missing required role parameter." });
      }

      // 1. Construct detailed prompt for Gemini
      const prompt = `
        您是抖音(Douyin) AI 时代 DRI (Directly Responsible Individual，直接负责人) 能力模型导师。
        请根据以下用户的诊断问卷信息，为他生成定制化的成长进阶路径。
        
        【用户背景信息】
        - 所属部门/岗位: ${department || "未填写"}
        - 序列角色: ${role}
        - 期望/倾向成为的 DRI 类型: ${preferredDri || "未选择"}
        - 问卷各维度平均估计得分 (1-10分制): ${averageScore !== undefined ? averageScore.toFixed(1) : "待评估"} 分 / 10分
        - 用户答题选择的痛点/现状描述:
          ${JSON.stringify(answers, null, 2)}
          
        【指南针体系教学目标】
        - 4分跃迁：从“一次次使用工具解决单点任务 (L1)” 跃迁到 “沉淀出可复用的 Skill/Agent 工作流 (L2)”
        - 7分跃迁：从“能跑流程 (L2)” 跃迁到 “建立可自检测、自评估、自迭代、带反馈业务飞轮的智能化闭环系统 (L3)”
        - 10分跃迁：开拓全新的 AI 闭环业务，自主寻找高增长模式。
        
        请结合他的部门环境(${department || "业务线"})、他的序列(${role})、他倾向成为的DRI类型(${preferredDri})、以及他的局限性，给出精确、务实而令人兴奋的个性化学习行动成长卡片。
        必须严格按照所配 JSON Schema 结构进行中文回应。
      `;

      const genaiClient = getGemini();

      // If client is null (no key), or if anything fails, we fall back gracefully to a solid deterministic response
      if (!genaiClient) {
        return res.json(generateFallbackPath(role, averageScore || 3.5, department, preferredDri));
      }

      const response = await genaiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "您是抖音内部的技术辅导教练。您负责帮助各种职能同学（研发/产品/运营/设计/无AI基础者）成为AI时代的DRI。回答时请保持谦和、专业、充满抖音本土业务语境（如大促、合规拦截、多维表格工具、飞书妙记、埋点等）。务必绝对按照JSON格式输出。",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { 
                type: Type.STRING, 
                description: "对用户的当前AI水位、优势进行精炼亲切的中文诊断陈述，在150字以内，符合抖音业务语境。提及他们的部门和想要达成的DRI类型目标更有针对性。" 
              },
              currentLevel: { 
                type: Type.STRING, 
                description: "精确判定其当前的级别和段位定位(如：L1入门级 · 准备跃迁，L2进阶级 · 需要建闭环)，并给出 1-10 的精准评分陈述。" 
              },
              suggestedFocus: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "根据其短板，列出3个最应当聚焦提升的技能方向或改进维度。" 
              },
              actionItems: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "为他制定的4步极为落地可执行的行动路线(例如第1周、第2-4周)。步骤里需包含人工兜底点设立、评测集、推广等理念。" 
              },
              recommendedResources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "资源名称，如《抖音SOP自动化双周工作坊》、《跨端Agent评测数据集标准》" },
                    type: { type: Type.STRING, description: "资源类型，如‘实战白皮书’、‘录播演练营’、‘内部飞书多维表模版’" }
                  }
                },
                description: "针对他的序列和痛点，推荐2-3个抖音内部虚构/真实的优质学习资产名称与类型。"
              }
            },
            required: ["summary", "currentLevel", "suggestedFocus", "actionItems", "recommendedResources"]
          }
        }
      });

      if (response && response.text) {
        const resultString = response.text.trim();
        const pathData = JSON.parse(resultString);
        return res.json(pathData);
      } else {
        throw new Error("Empty text returned from Gemini API.");
      }

    } catch (error) {
      console.error("❌ Error in generate-path API endpoint:", error);
      // Fallback in case of server-side exceptions or parse errors
      const r = req.body.role || "产品经理 (PM)";
      const s = req.body.averageScore || 4.2;
      const d = req.body.department;
      const p = req.body.preferredDri;
      return res.json(generateFallbackPath(r, s, d, p));
    }
  });

  // Vite development / production asset serving integration
  if (process.env.NODE_ENV !== "production") {
    console.log("🚀 Server is running in DEVELOPMENT mode. Loading Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Server is running in PRODUCTION mode. Serving static assets from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ Server running on http://localhost:${PORT}`);
  });
}

// Highly customized deterministic fallback generator to match the target schemas of types.ts
function generateFallbackPath(role: string, averageScore: number, department?: string, preferredDri?: string) {
  let matchedLevel = "L1 入门级 · 效率提效者";
  let targetTransition = "4分跃迁 (寻找可复用 SOP 并流程化)";
  if (averageScore >= 4.0 && averageScore < 7.0) {
    matchedLevel = "L2 进阶级 · 流程再造者";
    targetTransition = "7分跃迁 (建立自我评测与业务实时反馈反馈飞轮)";
  } else if (averageScore >= 7.0) {
    matchedLevel = "L3 精通级 · 系统架构师";
    targetTransition = "10分跃迁 (完全赋能组织、基于 AI 创建新业务)";
  }

  const deptPrefix = department ? `来自【${department}】的` : "";
  const targetDriStr = preferredDri ? `（您当前倾向/志向成为：${preferredDri}）` : "";

  const baseFocusMap: Record<string, string[]> = {
    "产品经理 (PM)": [
      "从单点PRD撰写走向整个商业需求验证SOP的自动化",
      "建立极其严密的关键节点人工抽样审核与防风兜底机制",
      "将发布后的真实用户吐槽与评论接入归因Agent、自动更新下一版假设"
    ],
    "研发工程师 (Engineer)": [
      "把零散的代码重构或排障整合为可一键运行的工程流水合集",
      "针对智能化自愈系统部署安全离线评测集（避免次生灾难）",
      "推动研发自建 Agent 平台化，形成全BU共享的稳定性基础设施"
    ],
    "运营同学 (Operations)": [
      "彻底告别单次频繁点击，搭建热点探测、素材生成、渠道发布的长河Agent",
      "通过离线 A/B 实验数据和点击率反向让模型自行优调提示词参数",
      "积极主导组内 AI 落地分享，带领在职的 80% 同学学会用 AI 托管脏活"
    ],
    "设计师 (Designer)": [
      "将极其感性的品牌调性与圆角规范转换为 AI LoRA 的底层数学特征",
      "建设自动对比度、无障碍标准一键审查的防风检查算子",
      "解放出 90% 画图时间，转为整个组织视觉、体验系统的守护者 and 设计专家"
    ],
  };

  const defaultFocus = [
    "将隐性业务经验炼化并写成高确定性的任务模板 & 评测集规范",
    "明确引入人工审查签字红线卡点防线，规避敏感内容安全失控",
    "将个人的多端提效成果转化为飞书多维表格 / 工具，并横向开源共享"
  ];

  const focusAreas = baseFocusMap[role] || defaultFocus;

  const baseActionSteps: Record<string, string[]> = {
    "产品经理 (PM)": [
      "第一周：锁定日常高频编写 PRD 中的高耗时部分（如：埋点口径校核），写出标准校验 Task SOP 任务大纲。",
      "第二至周四：在内部平台配置‘埋点初检 - 口径匹配 - 格式审核’的 Skill 流程，并必须设定 PM 物理手审阀门。",
      "第二个月：引入发版上线后的评论与差评特征自动提取聚类 Agent，将分析结果连通，证明产品体验迭代决策链缩短了3天。",
      "常态维持：打包该评审工作流标准并在大组周会推行，将该 AI PRD 自检套件赋能给并线小组复用。"
    ],
    "研发工程师 (Dev)": [
      "第一周：锁定日常排障中极费人时的脏累活清单，选取最繁杂的告警日志检索开始梳理提取特征。",
      "第二至周四：编排并触发‘告警捕获 - 服务日志 Trace 提取 - 历史事故对齐 - 拟写修复建议’的 Agent 端到端流程，设置线上红线拦截。",
      "第二个月：研发一套离线故障评测集自动打分并生成线上运行 A/B 复盘报告，实现稳定自愈。",
      "常态维持：平台化发布稳定性保障套件被至少 3 个兄弟 BU 主动接入集成。"
    ],
    "运营同学 (Ops)": [
      "第一周：将单条爆款内容的构思，整理为高保真、包含输入约束、合规红线的任务模板标准。",
      "第二至周四：在内部搭建‘抖音热点抓取 - AI话术拟写 - LoRA出图配套 - 安全红线拦截一审’流水组件并一键发布，单次文案人效提升 3 倍。",
      "第二个月：引进业务 A/B 真实跑通，用真实的转化点击率作为度量反馈，训练智能体根据成效微调文案 Prompt 参数，促使流程稳定且‘自进化’。",
      "常态维持：开展月度分享工作坊，将爆款模板标准化赋能 80% 组内新人上手，团队运营产能彻底托管给该体系。"
    ],
    "设计师 (Designer)": [
      "第一周：将抖音视觉主打的主配比色和圆角数据结构化、封装为 AI 提速模型懂的文字或 LoRA 包。",
      "第二至周四：开发一键排版和配色生成 Skill，同时建立自动对比度校验和格式适配，非美院同学通过它生成符合抖音品牌规范的初稿可用度提高到 85% 以上。",
      "第二个月：抓取投放点击表现（Ctr）融入视觉迭代。建立由真实 CTR 数据评判好坏、线上自动微调海报构图并淘汰劣质图片的进化闭环。",
      "常态维持：发布全 BU 端到端‘体验设计自生成平台’，作为组织首选设计中台，设计师转而只维护调性库。"
    ]
  };

  const defaultActions = [
    "第一阶段（高频拆解）：将平时消耗精力的 1 典型重复 SOP 完全记录为一份包含输入、约束、输出格式和验收标准的详实文档。",
    "第二阶段（无代码化）：在内部平台的低代码画布配置相应的单向 Agent 自动链路，并给可能不靠谱的部分设置人工手控卡点。",
    "第三阶段（闭环与数据）：为系统配置自检程序、并在生产环节跑满至少 3 次真实的业务闭环，形成具有离线数据量化的实战案例。",
    "第四阶段（影响力倍增）：将大组优秀的自动化 SOP 打包开源给团队，担当大组 AI Champion，推动团队 AI 水平提档跃迁。"
  ];

  const actions = baseActionSteps[role] || defaultActions;

  return {
    summary: `您好，${deptPrefix}同学！基于您的选择诊断，您的当前定位为【${matchedLevel}】${targetDriStr}。您的优势很明显，强烈建议您朝着 ${targetTransition} 目标奋起跃迁，将隐性经验用 AI 机器流程彻底固化下来，释放创造力！`,
    currentLevel: `${matchedLevel} (总体评分: ${averageScore.toFixed(1)} / 10分)`,
    suggestedFocus: focusAreas,
    actionItems: actions,
    recommendedResources: [
      { title: `《抖音 ${role.split(" ")[0]} DRI 零基础自动化极速提效白皮书》`, type: "内部核心指南" },
      { title: `《从 1 到 10：高可信多 Agent 拓扑协作与合规拦截防线设计模版》`, type: "实战演习方案" },
      { title: `《抖音内部 AI 资产化：如何将隐性业务经验打包为可复用 Eval 评测集》`, type: "高阶讲座录屏" }
    ]
  };
}

startServer();
