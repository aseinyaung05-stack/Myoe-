
import React from 'react';
import { User } from '../../types';
import { STRINGS, APP_NAME } from '../../constants';

interface SettingsViewProps {
  user: User;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">{STRINGS.MY.settings_nav}</h2>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-lg" alt={user.name} />
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
          <p className="text-gray-500">{user.email}</p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
             <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">PREMIUM USER</span>
             <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">ID: {user.id}</span>
          </div>
        </div>
        <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
          ပရိုဖိုင် ပြင်မည်
        </button>
      </div>

      <div className="grid gap-4">
        {[
          { icon: '🔔', title: 'အသိပေးချက်များ', desc: 'Daily Summary အား ဖုန်းသို့ ပေးပို့ရန်' },
          { icon: '🔒', title: 'လုံခြုံရေး', desc: 'App အား Passcode ဖြင့် ပိတ်ထားရန်' },
          { icon: '🌐', title: 'ဘာသာစကား', desc: 'English / မြန်မာ' },
          { icon: '☁️', title: 'Cloud Sync', desc: 'စက်ပစ္စည်းများအကြား ဒေတာချိတ်ဆက်မှု' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl flex items-center justify-between border border-gray-50 shadow-sm hover:border-indigo-100 transition-all group">
            <div className="flex items-center gap-4">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
              <div>
                <h4 className="font-bold text-gray-800">{item.title}</h4>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-indigo-100 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8">
        <button
          onClick={onLogout}
          className="w-full md:w-auto px-10 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          {STRINGS.MY.logout}
        </button>
      </div>

      <div className="text-center text-gray-300 text-xs py-10">
        {APP_NAME} v1.0.0 • Powered by Google Gemini AI
      </div>
    </div>
  );
};

export default SettingsView;
