
import React, { useState, useEffect } from 'react';
import { User, Report, VoiceNote } from '../../types';
import { getReports, getNotes, saveReport } from '../../services/storageService';
import { generateAIReport } from '../../services/geminiService';
import { STRINGS } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ReportsViewProps {
  user: User;
}

const ReportsView: React.FC<ReportsViewProps> = ({ user }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    setReports(getReports(user.id));
  }, [user.id]);

  const handleGenerateReport = async () => {
    const notes = getNotes(user.id);
    if (notes.length === 0) {
      alert("အစီရင်ခံစာထုတ်ရန် အနည်းဆုံး မှတ်စု (၁) ခု ရှိရပါမည်။");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAIReport(notes, activeTab);
      if (result) {
        saveReport({ ...result as Report, userId: user.id });
        setReports(getReports(user.id));
      }
    } catch (err) {
      console.error(err);
      alert("AI Report Error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  const chartData = [
    { name: 'တနင်္လာ', count: 4 },
    { name: 'အင်္ဂါ', count: 7 },
    { name: 'ဗုဒ္ဓဟူး', count: 3 },
    { name: 'ကြာသပတေး', count: 8 },
    { name: 'သောကြာ', count: 12 },
    { name: 'စနေ', count: 5 },
    { name: 'တနင်္ဂနွေ', count: 2 },
  ];

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('my-MM');
  };

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">{STRINGS.MY.reports_nav}</h2>
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? (
            <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          )}
          Report ထုတ်မည်
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 text-sm uppercase font-bold mb-2">စုစုပေါင်း မှတ်စု</p>
          <p className="text-5xl font-black text-indigo-600">{getNotes(user.id).length}</p>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
            အပတ်စဉ် တိုးတက်မှု
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                   {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setActiveTab(p)}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === p ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {STRINGS.MY[p]}
            </button>
          ))}
        </div>

        {reports.filter(r => r.period === activeTab).length === 0 ? (
          <div className="text-center py-12 text-gray-400 italic">
            ယခုကာလအတွက် အစီရင်ခံစာ မရှိသေးပါ။
          </div>
        ) : (
          <div className="space-y-6">
            {reports.filter(r => r.period === activeTab).map(report => (
              <div key={report.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {STRINGS.MY[report.period]} AI အစီရင်ခံစာ
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">{formatDate(report.timestamp)} • မှတ်စု {report.noteCount} ခုအား လေ့လာပြီး</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export Word
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-indigo-600 font-bold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        {STRINGS.MY.insight_title}
                      </h4>
                      <p className="text-gray-700 leading-relaxed bg-indigo-50 p-4 rounded-2xl">{report.insights}</p>
                    </div>
                    <div>
                      <h4 className="text-emerald-600 font-bold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {STRINGS.MY.recommendation}
                      </h4>
                      <p className="text-gray-700 leading-relaxed bg-emerald-50 p-4 rounded-2xl">{report.recommendations}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-gray-400 font-bold uppercase text-xs mb-4">အဓိက အကြောင်းအရာများ</h4>
                    <div className="flex flex-wrap gap-3">
                      {report.topTopics.map(topic => (
                        <div key={topic} className="px-4 py-2 bg-white border border-gray-100 shadow-sm rounded-xl text-gray-700 text-sm font-medium hover:border-indigo-200 transition-colors">
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;
