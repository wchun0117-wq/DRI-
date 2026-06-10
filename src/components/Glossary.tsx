import React, { useState } from "react";
import { GLOSSARY_DATA, FAQ_DATA } from "../data";
import { GlossaryItem, FAQItem } from "../types";
import { 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Tv, 
  CheckCircle2, 
  Compass, 
  Info,
  SlidersHorizontal
} from "lucide-react";

export default function Glossary() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeFaqId, setActiveFaqId] = useState<string | null>("faq_1");

  // Filter glossary items
  const filteredGlossary = GLOSSARY_DATA.filter(item => {
    const termLower = item.term.toLowerCase();
    const definitionLower = item.definition.toLowerCase();
    const contextLower = item.douyinContext.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return termLower.includes(searchLower) ||
           definitionLower.includes(searchLower) ||
           contextLower.includes(searchLower) ||
           (item.englishTerm && item.englishTerm.toLowerCase().includes(searchLower));
  });

  const toggleFaq = (id: string) => {
    setActiveFaqId(activeFaqId === id ? null : id);
  };

  return (
    <div className="space-y-10">
      {/* Searchable Glossary Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-5 mb-6">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-sans font-bold text-slate-900">
              核心术语通俗语境词典 (Glossary)
            </h3>
          </div>
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索术语（如：DRI、Agent、自迭代...）"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Glossary responsive Grid */}
        {filteredGlossary.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGlossary.map((item) => (
              <div 
                key={item.id} 
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/50 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-md font-sans font-bold text-slate-900">
                      {item.term}
                    </h4>
                    {item.englishTerm && (
                      <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded">
                        {item.englishTerm}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm font-sans leading-relaxed">
                    {item.definition}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-start gap-2 bg-white/40 p-2.5 rounded-lg border border-slate-100/30">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">
                    <strong className="text-emerald-700">抖音语境：</strong>
                    {item.douyinContext}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm font-sans">未检索到与“{searchTerm}”相关的术语标本，请重新尝试检索。</p>
          </div>
        )}
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-5 mb-6">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-sans font-bold text-slate-900">
            指南针FAQ / 常见疑问澄清 (Misconceptions)
          </h3>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((faq) => {
            const isOpen = activeFaqId === faq.id;
            return (
              <div 
                key={faq.id} 
                className={`border rounded-xl transition-all overflow-hidden ${
                  isOpen 
                    ? "border-indigo-600 bg-indigo-50/5" 
                    : "border-slate-150 hover:border-slate-200"
                }`}
              >
                <button
                  id={`btn-${faq.id}`}
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-sans font-bold text-slate-900 text-sm md:text-base">
                    {faq.question}
                  </span>
                  <div className="shrink-0 text-slate-400">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 border-t border-slate-100/60 font-sans text-sm text-slate-600 leading-relaxed font-sans bg-white/50">
                    <div className="whitespace-pre-wrap">{faq.answer}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
