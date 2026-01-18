
import React, { useState, useEffect } from 'react';
import { User, VoiceNote } from '../../types';
import { getNotes, deleteNote } from '../../services/storageService';
import { STRINGS } from '../../constants';

interface NotesViewProps {
  user: User;
}

const NotesView: React.FC<NotesViewProps> = ({ user }) => {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setNotes(getNotes(user.id));
  }, [user.id]);

  const handleDelete = (id: string) => {
    if (confirm("ဤမှတ်စုကို ဖျက်ရန် သေချာပါသလား?")) {
      deleteNote(user.id, id);
      setNotes(getNotes(user.id));
    }
  };

  const handleExport = (note: VoiceNote) => {
    const content = `
TITLE: ${note.title}
DATE: ${new Date(note.timestamp).toLocaleString()}
CATEGORY: ${note.category}

SUMMARY:
${note.summary}

REFINED TEXT:
${note.refinedText}

KEYWORDS:
${note.keywords.join(", ")}

ORIGINAL TRANSCRIPT:
${note.originalText}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, '_')}_AI_Note.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.refinedText.toLowerCase().includes(search.toLowerCase()) ||
    n.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('my-MM', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">{STRINGS.MY.notes_nav}</h2>
          <p className="text-gray-500 mt-1">သင်၏ အသံမှတ်တမ်းများကို ဤနေရာတွင် စီမံနိုင်ပါသည်</p>
        </div>
        <div className="relative group">
          <input
            type="text"
            placeholder="ရှာဖွေရန်..."
            className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none w-full md:w-80 transition-all shadow-sm group-hover:shadow-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-200 shadow-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <p className="text-xl font-bold text-gray-400 mb-2">{STRINGS.MY.no_notes}</p>
          <p className="text-gray-300">အသံသွင်းရန်ခလုတ်ကို နှိပ်ပြီး စတင်လိုက်ပါ</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {filteredNotes.map(note => (
            <div key={note.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200">
                      {note.category}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {Math.floor(note.audioDuration)}s
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">{note.title}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">{formatDate(note.timestamp)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleExport(note)}
                    title="Export as Text"
                    className="p-3 bg-gray-50 text-gray-500 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(note.id)}
                    className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-3 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                      {STRINGS.MY.refined_text}
                    </h4>
                    <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">{note.refinedText}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-4">
                    {note.keywords.map(kw => (
                      <span key={kw} className="px-4 py-1.5 bg-gray-50 text-gray-500 text-xs font-bold rounded-xl border border-gray-100 hover:border-indigo-200 hover:text-indigo-500 transition-colors">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="bg-indigo-50/50 rounded-[1.5rem] p-6 border border-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <svg className="w-20 h-20 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16L9.01703 16V21M14.017 21H18.017C19.1216 21 20.017 20.1046 20.017 19V5C20.017 3.89543 19.1216 3 18.017 3H5.01703C3.91246 3 3.01703 3.89543 3.01703 5V19C3.01703 20.1046 3.91246 21 5.01703 21H9.01703" /></svg>
                    </div>
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      {STRINGS.MY.summary}
                    </h4>
                    <p className="text-sm text-indigo-800/80 italic font-medium leading-relaxed">"{note.summary}"</p>
                  </div>

                  <button 
                    onClick={() => {
                       const el = document.getElementById(`orig-${note.id}`);
                       if (el) el.classList.toggle('hidden');
                    }}
                    className="w-full py-3 px-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    View Original Transcript
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div id={`orig-${note.id}`} className="hidden bg-gray-50 p-4 rounded-xl text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed border border-gray-100">
                    {note.originalText}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesView;
