/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { providers, Contract, utils } from 'ethers';
import { Shield, Zap, Flame, Crown, Wallet, Activity, Settings, ExternalLink, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import generatedBadgeImage from './assets/images/gas_guardian_badges_1784137163379.jpg';

const ABI = [
  "function recordGasSpent(uint256 gasAmountInWei) external",
  "function totalGasSpent(address) view returns (uint256)",
  "function userBadge(address) view returns (uint8)"
];

const MONAD_TESTNET = {
  chainId: '0x279f', // 10143
  chainName: 'Monad Testnet',
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  blockExplorerUrls: ['https://testnet.monadexplorer.com']
};

const BADGES = [
  { level: 0, name: "Unranked", color: "text-gray-500", border: "border-gray-800", bg: "bg-gray-900", icon: Activity, req: "0 MON" },
  { level: 1, name: "Gas Saver", color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-950/30", icon: Flame, req: "0.01 MON" },
  { level: 2, name: "Gas Warrior", color: "text-cyan-400", border: "border-cyan-500/50", bg: "bg-cyan-950/30", icon: Zap, req: "0.1 MON" },
  { level: 3, name: "Gas Legend", color: "text-purple-400", border: "border-purple-500/50", bg: "bg-purple-950/30", icon: Crown, req: "1.0+ MON" }
];

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string>('0x938513299Dead19554Ad513f06f50EB3De0B8f10');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  const [gasSpent, setGasSpent] = useState<string>('0');
  const [userBadgeLevel, setUserBadgeLevel] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{text: string, type: 'info'|'success'|'error'} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('gasGuardianContract');
    if (saved) {
      setContractAddress(saved);
      setIsEditingAddress(false);
    }
  }, []);

  const saveContractAddress = () => {
    if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      showStatus('Invalid contract address format.', 'error');
      return;
    }
    localStorage.setItem('gasGuardianContract', contractAddress);
    setIsEditingAddress(false);
    showStatus('Contract address saved!', 'success');
    if (account) fetchUserData();
  };

  const showStatus = (text: string, type: 'info'|'success'|'error') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const ensureMonadNetwork = async () => {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error("MetaMask not found");
    
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [MONAD_TESTNET],
        });
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      showStatus("Please install MetaMask!", "error");
      return;
    }
    setIsLoading(true);
    try {
      await ensureMonadNetwork();
      const provider = new providers.Web3Provider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      showStatus("Wallet connected successfully", "success");
    } catch (error: any) {
      showStatus(error.message || "Failed to connect wallet", "error");
    }
    setIsLoading(false);
  };

  const fetchUserData = async () => {
    if (!account || !contractAddress || isEditingAddress) return;
    
    try {
      const provider = new providers.Web3Provider((window as any).ethereum);
      const contract = new Contract(contractAddress, ABI, provider);
      
      const gas = await contract.totalGasSpent(account);
      const level = await contract.userBadge(account);
      
      setGasSpent(utils.formatEther(gas));
      setUserBadgeLevel(Number(level));
    } catch (error) {
      console.error("Fetch error:", error);
      showStatus("Could not fetch data. Check contract address.", "error");
    }
  };

  useEffect(() => {
    if (account && contractAddress && !isEditingAddress) {
      fetchUserData();
    }
  }, [account, contractAddress, isEditingAddress]);

  const recordDemoGas = async () => {
    if (!account) return showStatus("Connect wallet first", "error");
    if (!contractAddress || isEditingAddress) return showStatus("Save contract address first", "error");

    setIsLoading(true);
    try {
      await ensureMonadNetwork();
      const provider = new providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      const contract = new Contract(contractAddress, ABI, signer);
      
      showStatus("Please confirm transaction in MetaMask...", "info");
      const tx = await contract.recordGasSpent(utils.parseEther("0.05"));
      
      showStatus("Transaction sent! Waiting for confirmation...", "info");
      await tx.wait();
      
      showStatus("Gas recorded successfully! 🎉", "success");
      await fetchUserData();
    } catch (error: any) {
      console.error(error);
      showStatus(error.message || "Transaction failed", "error");
    }
    setIsLoading(false);
  };

  const currentBadge = BADGES[userBadgeLevel] || BADGES[0];
  const BadgeIcon = currentBadge.icon;

  return (
    <div className="min-h-screen bg-[#0f0a1f] text-slate-300 font-sans selection:bg-cyan-500/30">
      {/* Background ambient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.3)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Gas Guardian</h1>
              <p className="text-xs text-cyan-400 font-mono tracking-wider uppercase">Monad Testnet Tracker</p>
            </div>
          </div>

          <button
            onClick={connectWallet}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-medium text-sm"
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "Connect Wallet"}
          </button>
        </header>

        {/* Notifications */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full border shadow-lg backdrop-blur-md flex items-center gap-2 text-sm font-medium
                ${statusMsg.type === 'error' ? 'bg-red-950/80 border-red-500/50 text-red-200' : 
                  statusMsg.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' : 
                  'bg-blue-950/80 border-blue-500/50 text-blue-200'}`}
            >
              {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {statusMsg.type === 'error' && <Activity className="w-4 h-4" />}
              {statusMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Visuals & Info */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a1f] to-transparent opacity-60 z-10"></div>
              <img 
                src={generatedBadgeImage} 
                alt="Gas Guardian Badges" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <h3 className="text-white font-bold text-lg">Cyberpunk Artifacts</h3>
                <p className="text-sm text-cyan-300/80">Unlock legendary status on the Monad network.</p>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" />
                Contract Setup
              </h3>
              
              {isEditingAddress ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-slate-400">Deploy the Solidity contract on Remix, then paste your contract address here to interact with it.</p>
                  <input 
                    type="text" 
                    placeholder="0x..."
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  <button 
                    onClick={saveContractAddress}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl py-2 text-sm font-medium transition-colors"
                  >
                    Save Address
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-xs font-mono text-slate-400 truncate mr-2">{contractAddress}</span>
                    <button 
                      onClick={() => setIsEditingAddress(true)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded-md bg-cyan-500/10"
                    >
                      Edit
                    </button>
                  </div>
                  <a 
                    href={`${MONAD_TESTNET.blockExplorerUrls[0]}/address/${contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    View on Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dashboard */}
          <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
            
            {!account ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                <Wallet className="w-12 h-12 text-slate-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h2>
                <p className="text-slate-400 text-sm max-w-sm mb-6">Connect your MetaMask wallet on the Monad Testnet to view your gas tracking stats and unlock badges.</p>
                <button 
                  onClick={connectWallet}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Connect MetaMask
                </button>
              </div>
            ) : (
              <>
                {/* Active Status Board */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Gas Stats */}
                  <div className="bg-gradient-to-br from-[#1a0033]/50 to-[#000033]/50 p-6 rounded-2xl border border-cyan-500/20 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 blur-2xl rounded-full"></div>
                    <p className="text-cyan-400/80 text-sm font-medium mb-1">Total Gas Tracked</p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-4xl font-bold text-white tracking-tight">{Number(gasSpent).toFixed(4)}</h2>
                      <span className="text-cyan-500 font-mono text-sm">MON</span>
                    </div>
                  </div>

                  {/* Current Badge */}
                  <div className={`p-6 rounded-2xl border relative overflow-hidden ${currentBadge.bg} ${currentBadge.border}`}>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                      <BadgeIcon className={`w-24 h-24 ${currentBadge.color}`} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Current Tier</p>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-black/40 border border-white/10 ${currentBadge.color}`}>
                        <BadgeIcon className="w-6 h-6" />
                      </div>
                      <h2 className={`text-2xl font-bold tracking-tight ${currentBadge.color}`}>{currentBadge.name}</h2>
                    </div>
                  </div>
                </div>

                {/* Tiers Overview */}
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-white font-semibold mb-6 flex items-center justify-between">
                    <span>Badge Hierarchy</span>
                    <span className="text-xs px-2 py-1 bg-white/5 rounded text-slate-400">Monthly Tracker</span>
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    {BADGES.slice(1).map((badge, idx) => {
                      const isUnlocked = userBadgeLevel >= badge.level;
                      const Icon = badge.icon;
                      return (
                        <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isUnlocked ? `${badge.bg} ${badge.border}` : 'bg-black/20 border-white/5 opacity-60'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isUnlocked ? badge.bg : 'bg-white/5'} border border-white/10`}>
                              <Icon className={`w-5 h-5 ${isUnlocked ? badge.color : 'text-slate-500'}`} />
                            </div>
                            <div>
                              <h4 className={`font-bold ${isUnlocked ? badge.color : 'text-slate-300'}`}>{badge.name}</h4>
                              <p className="text-xs text-slate-500">Requirement: {badge.req}</p>
                            </div>
                          </div>
                          {isUnlocked && (
                            <div className="text-xs font-bold px-3 py-1 bg-white/10 rounded-full text-white/90">
                              UNLOCKED
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Action Section */}
                <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 p-6 rounded-2xl border border-white/10 text-center">
                  <h3 className="text-white font-semibold mb-2">Simulate Gas Expenditure</h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                    Manually trigger a smart contract transaction to record 0.05 MON of gas spent and watch your badge tier climb.
                  </p>
                  <button 
                    onClick={recordDemoGas}
                    disabled={isLoading || isEditingAddress || !contractAddress}
                    className="relative inline-flex group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
                    <div className="relative inline-flex items-center gap-2 px-8 py-3 bg-[#0f0a1f] border border-white/10 rounded-xl text-white font-bold transition-all">
                      {isLoading ? (
                        <Activity className="w-5 h-5 animate-spin" />
                      ) : (
                        <Zap className="w-5 h-5 text-cyan-400" />
                      )}
                      {isLoading ? "Processing Tx..." : "Record 0.05 MON Gas"}
                    </div>
                  </button>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

