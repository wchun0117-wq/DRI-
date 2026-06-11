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

        【关于 recommendedResources 推荐资源的重要指示】
        - 资源不得局限于内部文档。必须涵盖极其硬核、深受赞誉的【外部大模型官方学习平台、国内外实操视频教程、学术顶会经典论文（带真实 arXiv/Google 博客链接）、开源明星框架 Cookbook 教程等】。
        - 根据不同角色方向：如果是研发，可推荐经典 Transformer 奠基论文 https://arxiv.org/abs/1706.03762、LangChain 官方最佳实践、或 GitHub Google Gemini SDK 开源库 https://github.com/google-gemini/generative-ai-js；如果是运营/PM，可推荐 Coze 实控平台 https://www.coze.cn/、B站优秀 AIGC 提效科普视频、或权威 Prompting Guide 提示词指南 https://www.promptingguide.ai/zh。
        - 确保推荐 3 个极其优质有用、类型覆盖丰富的真实外部学习资源入口。资源的 type 字段可以写为‘官方平台’、‘官方文档’、‘名师视频课’、‘经典顶会论文’、‘权威实战指南’或‘开源Cookbook’。
        
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
                    title: { type: Type.STRING, description: "资源名称，如《字节跳动扣子 (Coze) 智能体核心编排指南》" },
                    type: { type: Type.STRING, description: "资源类型，如‘官方平台’、‘官方文档’、‘内部白皮书模板’" },
                    link: { type: Type.STRING, description: "外部真实或演示用学习参考链接，如 https://www.coze.cn 或 https://open.feishu.cn 或 https://ai.google.dev" }
                  },
                  required: ["title", "type", "link"]
                },
                description: "针对他的序列和痛点，推荐2-3个极为优质的学习资产名称、类型和访问URL。"
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

  // API Route: Evaluate Homework Assignment
  app.post("/api/evaluate-assignment", async (req, res) => {
    try {
      const { assignmentTitle, userSolution, department, role, targetCapability } = req.body;

      if (!userSolution || userSolution.trim() === "") {
        return res.status(400).json({ error: "No homework solution provided." });
      }

      // 1. Construct detailed evaluation prompt for Gemini
      const prompt = `
        您是抖音(Douyin) AI 时代 DRI (直接负责人) 资深技术导师与评卷教练。
        请根据以下用户提交的『能力飞跃实操微作业』解答，为他生成专业的等级评估和极其硬核、带有温度的中文辅导反馈。
        
        【用户申报背景】
        - 所属部门/团队: ${department || "未填写部门"}
        - 序列角色: ${role || "综合序列"}
        - 渴望提升的核心能力维度: ${targetCapability || "业务定义/实操编排"}
        
        【作业课题】
        - 题目: ${assignmentTitle}
        
        【用户的解答方案与设计提案】
        - 方案内容:
        ${userSolution}
        
        【评估检测三大要领】
        1. 业务痛点契合度 (是否务实解决了 ${department || "该部门"} 的日常高耗场景，杜绝泛泛而谈的玄学 buzzwords)；
        2. 方案风控与合规拦截 (对 AIGC 幻觉及格式失控是否有具体卡控措施，如人眼双签签字、XML 标签匹配、默认优雅降级)；
        3. SOP 流程化与自进化 (是否展示出将单次经验炼化为可复用 SOP / Agents / 评测集回哺的飞轮思想)。
        
        请结合这些标尺客观评判，指出他方案里的 2 个惊艳闪光点，并给出一个至关重要、可以直接改进其 Prompts 稳定性或 Workflow 鲁棒性的底层优化微调建议。
        必须严格按照所配 JSON Schema 结构进行中文回应。
      `;

      const genaiClient = getGemini();

      // If key is missing or calls fail, we fallback gracefully to the solid local heuristic function
      if (!genaiClient) {
        return res.json(generateFallbackFeedback(assignmentTitle, userSolution, department || "", role || "", targetCapability || ""));
      }

      const response = await genaiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "您是抖音内部的高级技术导师。回答时请保持真诚、严谨、多用抖音本土业务惯用手段（如飞书多维表格、人眼双签、安全卡点、指标闭环等）进行针对性评述。评分上不要放水，但也对认真作答、字数详实的方案给予鼓励和建设性优整意见。绝对按照 JSON 输出。",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { 
                type: Type.INTEGER, 
                description: "总体质检评分(1-100分制)。若解法简陋或只贴空话，给60-75分。若作答细节清晰、有格式或安全拦截、具备工程意识，给85-98分。" 
              },
              grade: { 
                type: Type.STRING, 
                description: "评定等第陈述(如：'S级 终极架构标兵', 'A-级 飞跃推进者', 'B+级 流程改建者')" 
              },
              detailedFeedback: { 
                type: Type.STRING, 
                description: "长约200-300字的专业辅导讲评，带有温度和抖音工作流辅导属性。直接剖析其方案闪光点和唯一的优化建议方案。" 
              },
              nextSteps: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "为他后续实控此方案推荐 2-3 个极为具体的行动点。" 
              }
            },
            required: ["score", "grade", "detailedFeedback", "nextSteps"]
          }
        }
      });

      if (response && response.text) {
        const resultString = response.text.trim();
        const feedbackData = JSON.parse(resultString);
        return res.json(feedbackData);
      } else {
        throw new Error("Empty text returned from assignment feedback Gemini API.");
      }

    } catch (error) {
      console.error("❌ Error in evaluate-assignment API endpoint:", error);
      const title = req.body.assignmentTitle || "微作业";
      const solution = req.body.userSolution || "";
      const dept = req.body.department || "";
      const r = req.body.role || "";
      const cap = req.body.targetCapability || "";
      return res.json(generateFallbackFeedback(title, solution, dept, r, cap));
    }
  });

  // API Route: Get or List internal documents
  app.get("/api/internal-docs", (req, res) => {
    const docs = [
      {
        id: "doc_coze_sop",
        title: "《抖音内容安全 & Coze 智能体双核过滤规则集 v2.4》",
        type: "抖音内容安全红线规章",
        creator: "抖音安全合规风控中台",
        lastUpdated: "2026-05-12",
        summary: "详细规范了针对 AIGC 自动化文本、图片发布的拦截基线，配置双签人机接口的 JSON 模型规范，用以杜绝虚假宣发和低俗引导。",
        content: `# 抖音内容安全与 Coze 智能体全生命周期过滤准则

## 1. 核心安全矩阵定义
针对大模型输出，所有生产线必须挂载【合规拦截过滤器】。置信级评分拆为三档：
- **安全档 (Score >= 0.92)**: 允许自动化并线。
- **巡审档 (0.75 <= Score < 0.92)**: 触发飞书审核推流通知，由人工进行一键过检。
- **高危拦截档 (Score < 0.75)**: 强制废弃并由本地静态文案模板兜底适配。

## 2. 强格式 Schema 格式约束
所有的提示词及 Workflow 参数必须定义格式并利用如下正则表达式过滤：
\`\`\`regex
<results>(.*?)</results>
\`\`\`
严防由于流输出截断引发的 JSON 崩毁。`
      },
      {
        id: "doc_lark_base",
        title: "《飞书多维表格(Lark Base)大促高频多端群组自动化编排手册》",
        type: "实控技术SOP模板",
        creator: "抖音电商运营工具组",
        lastUpdated: "2026-06-01",
        summary: "主要阐述如何通过飞书开放平台 Webhook 并联 Coze (扣子) 的 Skill 工作流，实现千人千面的爆款创意海报、通知文案的一键极速发放。",
        content: `# 飞书多维表格 AIGC 自动化并线实控手册

## 1. 简易配置步骤
1. 建立飛書多维表格，定义：【原始素材列】、【AI建议提示词】、【状态判定】、【安全一审】、【推送渠道】。
2. 配置多维表格自动化流：当【安全一审】被选中为“允许外流（人工手签）”时，触发 Webhook 将内容秒发到对应业务群组，完成 5 倍以上的极速闭环。

## 2. RAG 本地知识检索配置
通过对多维表绑定的 RAG 语料，对模型配置 Hybrid Search (混合检索)，包含 BM25 与向量化检索，大幅修正幻觉，将专业回答准确率提档到 92% 以上。`
      },
      {
        id: "doc_gemini_eval",
        title: "《抖音研发效能部：大语言模型 Evals 测定集标准及 Robust 验证基线》",
        type: "研发工程验证规范",
        creator: "抖音基础大模型工程组",
        lastUpdated: "2026-04-20",
        summary: "阐述如何为特定业务线建立具有 10-30 个经典 corner instances 的评测集，用来在每日发布前自动化回归大模型的返回置信度，量化 ROI。",
        content: `# 大模型 Eval 评测集与鲁棒性验证规范

## 1. Evals 核心方法论
不要依赖主观“觉得好不好用”来给提示词调优。每个 DRI 必须为本序列的工作流程建立精准测评大纲。
- **比对法 (Compare Eval)**: 建立 15 条资深专家的完美答卷作为 Benchmarking，用大模型对比输出内容的语义相似度 (Cosine Similarity)。
- **规则法 (Rule Eval)**: 强制检测是否包含负向敏感词、是否长于 200 字，确保输出绝对符合业务发布标准。

## 2. 异常自动重试 (Retry Strategy)
系统针对 TimeOut / Rate Limit / Format Error 重试三次，均使用指数避让退让策略，重试均宣告失败时自动转为 offline Heuristics 兜底模式。`
      },
      {
        id: "doc_org_impact",
        title: "《抖音 AIGC 超级个体：从单点提效到全组 80% 开源成长手册》",
        type: "组织影响力白皮书",
        creator: "抖音大模型学社 & 组织效能部",
        lastUpdated: "2026-06-05",
        summary: "专门针对想要把个人的小工具转化为团队共有大型 SOP 的同学，指导如何撰写 OKR 的 AI Key Results，消除组内老兵摩擦力。",
        content: `# 组织级 AI Champion 跃迁指南

## 1. 如何做 5 分钟的惊艳 Demo 展示
- **Pain Point First**: 第一分钟放痛点，展示别人每天做 2 小时的繁琐工序。
- **In-action Next**: 第二分钟自己投屏实控，点一下鼠标，5 秒产出极高水准的成果。
- **Open Source Last**: 现场投出群二维码或飞书模板，让听众当家扫码立即享用，不搞高深代码理论。

## 2. 季度 OKR 黄金 Kr 实例
- O: 打造部门级 AI 自动化效率中台，释放组员体力消耗。
- KR1: 自研 AI SOP 被组内 80% 同学加入，沉淀 3 个典型大促标杆案例。
- KR2: 将本组特定业务大促文案人效提升 65% 以上(通报表扬入选效能期刊)。`
      }
    ];

    const { id } = req.query;
    if (id) {
      const doc = docs.find(d => d.id === id);
      if (doc) return res.json(doc);
      return res.status(404).json({ error: "Internal document not found" });
    }
    return res.json(docs);
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

  // Dynamically tailor excellent real-world multi-media resources based on specific role types
  let customResources = [
    { 
      title: "《字节跳动扣子 (Coze) 智能体开发与核心自动化编排指南》", 
      type: "官方开发平台", 
      link: "https://www.coze.cn/" 
    },
    { 
      title: "《飞书开放平台 · 多维表格 (Lark Base) 自动化集成工作流手册》", 
      type: "官方开发文档", 
      link: "https://open.feishu.cn/document/uAjLw4CO/uYTM5UjL2ETO14MTNxdj" 
    },
    { 
      title: "《DAIR.AI · 提示词工程 (Prompt Engineering Guide) 权威研究中文指南》", 
      type: "权威实战指南", 
      link: "https://www.promptingguide.ai/zh" 
    }
  ];

  if (role.includes("研发")) {
    customResources = [
      { 
        title: "《Attention Is All You Need (奠基之作：Transformer 机制经典原创论文)》", 
        type: "经典顶会论文", 
        link: "https://arxiv.org/abs/1706.03762" 
      },
      { 
        title: "《GitHub - Google Gemini JS/TS Core Live 接入与 System Instructions 配置规范》", 
        type: "开源Cookbook", 
        link: "https://github.com/google-gemini/generative-ai-js" 
      },
      { 
        title: "《Bilibili 零基础大模型核心技术：如何用 Python 零基础编排 Agent 视频教程》", 
        type: "名师视频课", 
        link: "https://www.bilibili.com/video/BV1S54y1R79M/" 
      }
    ];
  } else if (role.includes("运营")) {
    customResources = [
      { 
        title: "《字节扣子官方：如何通过 Coze 快速托管爆款电商与社群内容全过程课程》", 
        type: "官方开发平台", 
        link: "https://www.coze.cn/" 
      },
      { 
        title: "《DAIR.AI · 爆款文案特征提炼与 Few-Shot 高精密提示词调优实践手册》", 
        type: "权威实战指南", 
        link: "https://www.promptingguide.ai/zh" 
      },
      { 
        title: "《Bilibili 爆款短视频脚本一键自动化生成与飞书工作流集成精讲视频》", 
        type: "实操视频教程", 
        link: "https://www.bilibili.com/" 
      }
    ];
  } else if (role.includes("设计")) {
    customResources = [
      { 
        title: "《字节扣子 (Coze) 多模态 AIGC 图像出图与可拖拽交互设计卡片配置规范》", 
        type: "官方平台教程", 
        link: "https://www.coze.cn/" 
      },
      { 
        title: "《High-Resolution Image Synthesis with Latent Diffusion Models (扩散模型奠基论文)》", 
        type: "经典顶会论文", 
        link: "https://arxiv.org/abs/2112.10752" 
      },
      { 
        title: "《Bilibili 视觉大咖说：体验设计师转型 AIGC 创意思维与 ControlNet 控调分享》", 
        type: "名师视频课", 
        link: "https://www.bilibili.com/" 
      }
    ];
  } else if (role.includes("产品")) {
    customResources = [
      { 
        title: "《字节跳动扣子 (Coze) 官方低代码画布多 Agent 拓扑工作流协作新手指南》", 
        type: "官方开发平台", 
        link: "https://www.coze.cn/" 
      },
      { 
        title: "《DAIR.AI · 朝向万物互联：AI 世代产品经理 (PM) 提示词工程高确定性指南》", 
        type: "权威实战指南", 
        link: "https://www.promptingguide.ai/zh" 
      },
      { 
        title: "《Google Gemini API (Generative-AI-JS) 官方核心接入描述规范》", 
        type: "官方参考文档", 
        link: "https://ai.google.dev/gemini-api/docs" 
      }
    ];
  }

  return {
    summary: `您好，${deptPrefix}同学！基于您的选择诊断，您的当前定位为【${matchedLevel}】${targetDriStr}。您的优势很明显，强烈建议您朝着 ${targetTransition} 目标奋起跃迁，将隐性经验用 AI 机器流程彻底固化下来，释放创造力！`,
    currentLevel: `${matchedLevel} (总体评分: ${averageScore.toFixed(1)} / 10分)`,
    suggestedFocus: focusAreas,
    actionItems: actions,
    recommendedResources: customResources
  };
}

// Intelligent offline validation logic for assignment submissions
function generateFallbackFeedback(
  assignmentTitle: string,
  userSolution: string,
  department: string,
  role: string,
  targetCapability: string
) {
  const solutionText = userSolution || "";
  let baseScore = 76;
  const matchWords: string[] = [];

  if (solutionText.length > 200) {
    baseScore += 8;
  } else if (solutionText.length < 50) {
    baseScore -= 10;
  }

  const keywordBoosts = [
    { word: "正则", boost: 4, name: "RegEx正则清洗算子" },
    { word: "XML", boost: 3, name: "XML标签输出阻隔" },
    { word: "JSON", boost: 3, name: "JSON Schema强序列化约束" },
    { word: "飞书", boost: 3, name: "飞书Lark生态集成" },
    { word: "Lark", boost: 3, name: "Lark多维表协作流程" },
    { word: "人工", boost: 4, name: "人机协同双重签字拦截防险" },
    { word: "兜底", boost: 4, name: "流程优雅降级与兜底机制" },
    { word: "评测", boost: 4, name: "Eval Dataset自动化离线评测" },
    { word: "指标", boost: 3, name: "业务效果反馈闭环" },
    { word: "Prompt", boost: 3, name: "提示词精编工程" }
  ];

  keywordBoosts.forEach(kb => {
    if (solutionText.toLowerCase().includes(kb.word.toLowerCase())) {
      baseScore += kb.boost;
      matchWords.push(kb.name);
    }
  });

  const finalScore = Math.min(98, Math.max(50, baseScore));

  let grade = "B 级流程再造小匠";
  if (finalScore >= 92) {
    grade = "S 级 终极架构标兵 (Top Class Champion)";
  } else if (finalScore >= 85) {
    grade = "A- 级 飞跃推进者 (Advanced DRI Coach)";
  } else if (finalScore >= 78) {
    grade = "B+ 级 业务解题者 (Qualified Practitioner)";
  }

  const deptStr = department ? `来自【${department}】的` : "";
  const capStr = targetCapability ? `针对「${targetCapability}」的` : "";

  const detailedFeedback = `您好，${deptStr} 同学。指南针评卷导师已对您提交的作业方案进行了深入的研究评测！
在您针对“${assignmentTitle}”的方案中，字数为 ${solutionText.length} 字。${
    matchWords.length > 0
      ? `我们在您的方案里检测到了：${matchWords.join("、")}等高分专业实践思想。能够将具体的容灾降级、结构化输出等概念写进方案，说明您已经完全跨出了 L1 仅仅单点提效的视野，跨向 L2/L3 体系化自愈闭环设计！`
      : `您能够针对所提要求给出完整的场景搭建链路规划，逻辑清晰。不过如果想要进一步拿到高分，建议多往“抗随机乱编”、“合规人工签字拦截”等高可用风控要素入手，防止大模型的偶然错误导致业务安全风险。`
  }
您的优点是结构条理非常扎实；如果要将其打造为真正的生产级系统，建议在 System Instruction 中增加典型的 Few-shot 样例，强制模型输出结构，以此将极端异常率压缩回 1% 轨。期待您在下一周期的实控表现！`;

  const nextSteps = [
    "在工作流中针对可能发生 JSON 坏死截断的点配置 RegEx 清洗清洗，提升流水线可用度；",
    "编写 3-5 个包含极端恶性攻击用语或合规红线语料的 Eval 评测文件，并融入系统离线测试流程中；",
    "将您沉淀出的飞书或者 Agent SOP 卡片，尝试大组周会投屏或者大群分享，开展一次一秒上手的小型 Demo 演示。"
  ];

  return {
    score: finalScore,
    grade,
    detailedFeedback,
    nextSteps
  };
}

startServer();

