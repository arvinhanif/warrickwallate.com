import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, DashboardStats, UserProfile, UserRole } from './types';
import StatCard from './components/StatCard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';

const STORAGE_KEY = 'warrick_wallet_data_v2';
const PROFILE_KEY = 'warrick_wallet_profile_v2';

const App: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [error, setError] = useState('');
  const [tempName, setTempName] = useState('');

  // Persistent Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      return saved ? JSON.parse(saved) : { 
        name: 'User', 
        currency: '৳', 
        avatarSeed: 'Warrick',
        role: UserRole.USER 
      };
    } catch (e) {
      return { name: 'User', currency: '৳', avatarSeed: 'Warrick', role: UserRole.USER };
    }
  });

  // Persistent Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync Transactions to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Sync Profile to LocalStorage
  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  // Sync temp name for modal
  useEffect(() => {
    if (isProfileOpen) {
      setTempName(profile.name);
    }
  }, [isProfileOpen, profile.name]);

  const stats: DashboardStats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalBalance: income - expenses
    };
  }, [transactions]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId === 'Arvin_Hanif' && loginPass === 'Arvin_Hanif') {
      setProfile(prev => ({ ...prev, role: UserRole.ADMIN, name: 'Arvin Hanif' }));
      setIsLoginOpen(false);
      setLoginId('');
      setLoginPass('');
      setError('');
    } else {
      setError('Incorrect ID or Password');
    }
  };

  const handleLogout = () => {
    setProfile(prev => ({ ...prev, role: UserRole.USER, name: 'User' }));
    setIsProfileOpen(false);
  };

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    if (profile.role !== UserRole.ADMIN) return;
    const newTransaction: Transaction = { 
      ...data, 
      id: crypto.randomUUID() 
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    if (profile.role !== UserRole.ADMIN) return;
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const saveProfileSettings = () => {
    setProfile(prev => ({ ...prev, name: tempName || 'User' }));
    setIsProfileOpen(false);
  };

  const isAnyModalOpen = isLoginOpen || isProfileOpen;

  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden">
      {/* Immersive Background Layer */}
      <div className={`w-full min-h-screen py-8 px-6 md:px-12 lg:px-20 animate-ios transition-all duration-700 ease-out ${isAnyModalOpen ? 'scale-[0.98] blur-[15px] opacity-30 pointer-events-none' : 'scale-100 blur-0 opacity-100'}`}>
        <header className="max-w-[1600px] mx-auto flex justify-between items-center mb-12">
          <div className="group cursor-default">
            <h1 className="text-4xl font-extrabold tracking-tighter text-black opacity-90 group-hover:opacity-100 transition-opacity">
              WARRICK WALLET<span className="text-blue-600">.</span>
            </h1>
            <p className="text-[12px] font-black text-blue-600 uppercase tracking-[0.3em] ml-0.5">POWERED BY ARVIN</p>
          </div>
          
          <div className="flex items-center gap-6 ios-glass p-2 pl-6 rounded-full border-white/60 shadow-lg">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{profile.role}</p>
              <p className="text-base font-bold text-slate-900 tracking-tight">{profile.name}</p>
            </div>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden ios-button shadow-md border-2 border-white ring-4 ring-blue-500/5"
            >
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} alt="avatar" className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto space-y-10">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard label="Total Balance" amount={stats.totalBalance} type="balance" currencySymbol={profile.currency} />
            <StatCard label="Income" amount={stats.totalIncome} type="income" currencySymbol={profile.currency} />
            <StatCard label="Expenses" amount={stats.totalExpenses} type="expense" currencySymbol={profile.currency} />
          </section>

          <section className="ios-glass p-10 rounded-[3rem] border-white/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Input</h3>
            </div>
            <TransactionForm onAdd={handleAddTransaction} role={profile.role} />
          </section>

          <section className="ios-glass rounded-[3.5rem] border-white/80 shadow-2xl overflow-hidden mb-12">
            <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} currencySymbol={profile.currency} role={profile.role} />
          </section>
        </main>

        <footer className="mt-24 pb-20 text-center">
          <div className="inline-block px-10 py-3 bg-white/40 backdrop-blur-xl rounded-full border border-white/60 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-400">
              Persistent Storage Active • Build 26.4.2
            </p>
          </div>
        </footer>
      </div>

      {/* MODALS LAYER */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/10 backdrop-blur-[50px] animate-in fade-in duration-300">
          <div className="bg-white/95 p-12 rounded-[4rem] w-full max-w-md shadow-[0_40px_120px_rgba(0,0,0,0.2)] border border-white animate-in zoom-in-95 duration-500">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] mx-auto mb-6 flex items-center justify-center text-white shadow-2xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900">Security</h2>
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Access Restricted to Arvin</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <input 
                autoFocus
                type="text" 
                placeholder="Identifier"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-8 py-6 bg-slate-100/60 rounded-[1.8rem] outline-none font-bold text-base border border-transparent focus:border-blue-200 focus:bg-white transition-all"
              />
              <input 
                type="password" 
                placeholder="Key"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-8 py-6 bg-slate-100/60 rounded-[1.8rem] outline-none font-bold text-base border border-transparent focus:border-blue-200 focus:bg-white transition-all"
              />
              {error && <p className="text-red-500 text-[11px] font-black text-center uppercase tracking-[0.2em] bg-red-50 py-3 rounded-2xl border border-red-100">{error}</p>}
              <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black rounded-[1.8rem] ios-button shadow-2xl shadow-blue-500/30 uppercase tracking-[0.2em] text-sm">Initialize Session</button>
              <button type="button" onClick={() => setIsLoginOpen(false)} className="w-full text-[12px] text-slate-400 font-black uppercase tracking-[0.4em] pt-6">Abort Request</button>
            </form>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/10 backdrop-blur-[50px] animate-in fade-in duration-300">
          <div className="bg-white/95 p-12 rounded-[4rem] w-full max-w-xl shadow-[0_40px_120px_rgba(0,0,0,0.2)] border border-white animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">System Console</h2>
              <button onClick={() => setIsProfileOpen(false)} className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 ios-button hover:bg-slate-200 transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg>
              </button>
            </div>
            
            <div className="space-y-12">
              <div>
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-6 ml-2">Personal Identity</label>
                <div className="flex items-center gap-6 p-6 bg-slate-50/70 rounded-[2.5rem] border border-slate-100 shadow-inner">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white overflow-hidden shadow-xl">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tempName}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Display Name"
                      className="w-full bg-transparent border-none outline-none text-3xl font-black text-slate-900 placeholder:text-slate-200"
                    />
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                      Real-time Avatar Sync
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-6 ml-2">Monetary Interface</label>
                <div className="grid grid-cols-3 gap-6">
                  {['৳', '$', '€'].map(cur => (
                    <button
                      key={cur}
                      onClick={() => setProfile({...profile, currency: cur})}
                      className={`py-8 rounded-[2rem] font-black text-3xl transition-all ios-button ${profile.currency === cur ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-blue-100'}`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 space-y-4">
                {profile.role === UserRole.USER ? (
                  <button onClick={() => { setIsProfileOpen(false); setIsLoginOpen(true); }} className="w-full py-6 border-2 border-dashed border-blue-200 bg-blue-50/40 text-blue-600 text-[12px] font-black rounded-[2rem] uppercase tracking-[0.2em] ios-button hover:bg-blue-50">Request Admin Clearance</button>
                ) : (
                  <button onClick={handleLogout} className="w-full py-6 bg-rose-50 text-rose-600 text-[12px] font-black rounded-[2rem] uppercase tracking-[0.2em] ios-button border border-rose-100">Terminate Admin Protocol</button>
                )}
                <button onClick={saveProfileSettings} className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] mt-4 ios-button shadow-2xl shadow-slate-900/40 uppercase tracking-[0.3em] text-sm">Save & Synchronize</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;