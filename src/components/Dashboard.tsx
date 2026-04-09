import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog } from '@/components/ui/dialog';
import { 
  LayoutDashboard, 
  CheckSquare, 
  ShieldAlert, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  Zap, 
  Clock, 
  Trophy,
  MessageSquare,
  Send,
  Lock,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, doc, handleFirestoreError, OperationType, isFirebaseEnabled } from '../lib/firebase';
import { Task, UserStats, AppBlockRule, ChatMessage } from '../types';
import { getAIResponse, verifyTask as verifyTaskAI } from '../lib/gemini';
import { toast } from 'sonner';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [blockRules, setBlockRules] = useState<AppBlockRule[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "MindLock initialized. I'm watching your progress. What are we achieving today?", timestamp: Date.now() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Real-time data listeners
  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));

    const statsQuery = query(collection(db, 'stats'), where('userId', '==', user.uid));
    const unsubscribeStats = onSnapshot(statsQuery, (snapshot) => {
      if (!snapshot.empty) {
        setStats({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as unknown as UserStats);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'stats'));

    const rulesQuery = query(collection(db, 'blockRules'), where('userId', '==', user.uid));
    const unsubscribeRules = onSnapshot(rulesQuery, (snapshot) => {
      const rulesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppBlockRule));
      setBlockRules(rulesData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'blockRules'));

    return () => {
      unsubscribeTasks();
      unsubscribeStats();
      unsubscribeRules();
    };
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: inputMessage, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    const history = chatMessages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const response = await getAIResponse(inputMessage, history);
    setChatMessages(prev => [...prev, { role: 'model', content: response || "System error.", timestamp: Date.now() }]);
    setIsChatLoading(false);
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-zinc-950">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="font-black tracking-tighter text-xl">MINDLOCK</span>
          </div>

          <nav className="space-y-1">
            <SidebarItem icon={<LayoutDashboard />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <SidebarItem icon={<CheckSquare />} label="Tasks" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
            <SidebarItem icon={<ShieldAlert />} label="App Blocker" active={activeTab === 'blocker'} onClick={() => setActiveTab('blocker')} />
            <SidebarItem icon={<BarChart3 />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
            <SidebarItem icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="w-10 h-10 border border-white/20">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">Level {stats?.level || 1} Enforcer</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-bottom border-white/10 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-md">
          <h2 className="text-lg font-bold capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-white/5">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs font-mono">{stats?.xp || 0} XP</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-white/5">
              <Trophy className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-mono">{stats?.totalPoints || 0} PTS</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {!isFirebaseEnabled && (
            <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-yellow-500" />
              <p className="text-xs text-yellow-500/80">
                <span className="font-bold">DEMO MODE ACTIVE:</span> Database provisioning in progress. Data will not persist across sessions.
              </p>
            </div>
          )}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab stats={stats} tasks={tasks} blockRules={blockRules} />}
            {activeTab === 'tasks' && <TasksTab tasks={tasks} user={user} />}
            {activeTab === 'blocker' && <BlockerTab rules={blockRules} user={user} />}
            {activeTab === 'analytics' && <AnalyticsTab stats={stats} tasks={tasks} />}
            {activeTab === 'settings' && <SettingsTab user={user} stats={stats} />}
          </AnimatePresence>
        </div>
      </main>

      {/* AI Assistant Panel */}
      <aside className="w-80 border-l border-white/10 flex flex-col bg-zinc-950">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold tracking-tight uppercase">AI Enforcer</span>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] p-3 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-zinc-900 text-zinc-300 rounded-tl-none border border-white/5'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                <Brain className="w-3 h-3" />
                <span>Enforcer is thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/10">
          <div className="relative">
            <Input 
              placeholder="Talk to Enforcer..." 
              className="bg-zinc-900 border-white/10 pr-10 focus-visible:ring-primary"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              size="icon" 
              variant="ghost" 
              className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={handleSendMessage}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
          : 'text-muted-foreground hover:text-white hover:bg-white/5'
      }`}
    >
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' }) : icon}
      {label}
    </button>
  );
}

function OverviewTab({ stats, tasks, blockRules }: { stats: UserStats | null, tasks: Task[], blockRules: AppBlockRule[] }) {
  const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'verifying').length;
  const blockedApps = blockRules.filter(r => r.isBlocked).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Productivity" value={`${stats?.productivityScore || 0}%`} subValue="Daily Average" progress={stats?.productivityScore || 0} />
        <StatCard title="Active Tasks" value={activeTasks.toString()} subValue="Awaiting Completion" />
        <StatCard title="Blocked Apps" value={blockedApps.toString()} subValue="Currently Restricted" />
        <StatCard title="Streak" value={`${stats?.consistencyStreak || 0} Days`} subValue="Don't break the chain" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-950 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Time Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Productive Work</span>
                  <span className="text-white font-mono">{stats?.timeProductive || 0}m</span>
                </div>
                <Progress value={75} className="h-1.5 bg-zinc-900" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wasted Time</span>
                  <span className="text-red-500 font-mono">{stats?.timeWasted || 0}m</span>
                </div>
                <Progress value={25} className="h-1.5 bg-zinc-900" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' : 
                        task.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-sm font-medium">{task.title}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">{task.status}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, subValue, progress }: { title: string, value: string, subValue: string, progress?: number }) {
  return (
    <Card className="bg-zinc-950 border-white/10 overflow-hidden relative">
      <CardContent className="p-6">
        <p className="text-xs font-mono text-muted-foreground uppercase mb-2 tracking-widest">{title}</p>
        <h3 className="text-3xl font-black mb-1">{value}</h3>
        <p className="text-xs text-muted-foreground">{subValue}</p>
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-900">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TasksTab({ tasks, user }: { tasks: Task[], user: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isVerifying, setIsVerifying] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', category: 'study' as any, proofType: 'photo' as any });
  const [proofContent, setProofContent] = useState('');
  const [isVerifyingAI, setIsVerifyingAI] = useState(false);

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      if (isFirebaseEnabled) {
        await addDoc(collection(db, 'tasks'), {
          ...newTask,
          userId: user.uid,
          status: 'pending',
          createdAt: Date.now(),
          points: 50
        });
      } else {
        // Local state fallback for demo
        toast.success("Task deployed (Demo Mode).");
      }
      setIsAdding(false);
      setNewTask({ title: '', description: '', category: 'study', proofType: 'photo' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  const handleVerify = async () => {
    if (!isVerifying || !proofContent.trim()) return;
    
    setIsVerifyingAI(true);
    toast.info("AI Enforcer is analyzing your proof...");
    
    try {
      const result = await verifyTaskAI(isVerifying.title, isVerifying.description, proofContent, isVerifying.proofType as any);
      
      if (result.isLegit) {
        if (isFirebaseEnabled) {
          await updateDoc(doc(db, 'tasks', isVerifying.id), { 
            status: 'completed', 
            completedAt: Date.now(),
            proofAnswer: proofContent 
          });
        }
        toast.success(`Verification Successful: ${result.feedback}`);
        setIsVerifying(null);
        setProofContent('');
      } else {
        toast.error(`Verification Failed: ${result.feedback}`);
      }
    } catch (err) {
      toast.error("Verification system error.");
    } finally {
      setIsVerifyingAI(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Active Protocols</h3>
        <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map(task => (
          <Card key={task.id} className="bg-zinc-950 border-white/10 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">{task.category}</Badge>
                <Badge variant="outline" className="text-[10px]">{task.proofType} proof</Badge>
              </div>
              <CardTitle className="text-white mt-2">{task.title}</CardTitle>
              <CardDescription className="text-zinc-500 line-clamp-2">{task.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs font-mono text-muted-foreground">{task.points} PTS</span>
              {task.status === 'completed' ? (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/20">COMPLETED</Badge>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-xs border-white/10 hover:bg-primary hover:text-white hover:border-primary"
                  onClick={() => setIsVerifying(task)}
                >
                  Verify
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-zinc-950 border-white/20 p-6 z-50">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-white">New Behavior Protocol</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Task Title</Label>
              <Input 
                className="bg-zinc-900 border-white/10" 
                value={newTask.title}
                onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Description</Label>
              <Textarea 
                className="bg-zinc-900 border-white/10 min-h-[100px]" 
                value={newTask.description}
                onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground">Category</Label>
                <select 
                  className="w-full bg-zinc-900 border border-white/10 rounded-md h-10 px-3 text-sm"
                  value={newTask.category}
                  onChange={e => setNewTask(prev => ({ ...prev, category: e.target.value as any }))}
                >
                  <option value="study">Study</option>
                  <option value="work">Work</option>
                  <option value="fitness">Fitness</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground">Proof Type</Label>
                <select 
                  className="w-full bg-zinc-900 border border-white/10 rounded-md h-10 px-3 text-sm"
                  value={newTask.proofType}
                  onChange={e => setNewTask(prev => ({ ...prev, proofType: e.target.value as any }))}
                >
                  <option value="photo">Photo URL</option>
                  <option value="code">Code Snippet</option>
                  <option value="answer">Written Answer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 border-white/10" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary" onClick={addTask}>Deploy</Button>
            </div>
          </div>
        </Card>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={!!isVerifying} onOpenChange={() => !isVerifyingAI && setIsVerifying(null)}>
        <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] bg-zinc-950 border-white/20 p-6 z-50">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Protocol Verification
            </CardTitle>
            <CardDescription>Submit proof for: {isVerifying?.title}</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                {isVerifying?.proofType === 'photo' ? 'Image URL' : 
                 isVerifying?.proofType === 'code' ? 'Paste Code' : 'Your Answer'}
              </Label>
              <Textarea 
                placeholder={`Provide your ${isVerifying?.proofType} proof here...`}
                className="bg-zinc-900 border-white/10 min-h-[150px] font-mono text-sm"
                value={proofContent}
                onChange={e => setProofContent(e.target.value)}
                disabled={isVerifyingAI}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 border-white/10" onClick={() => setIsVerifying(null)} disabled={isVerifyingAI}>Cancel</Button>
              <Button className="flex-1 bg-primary" onClick={handleVerify} disabled={isVerifyingAI || !proofContent.trim()}>
                {isVerifyingAI ? 'Analyzing...' : 'Submit for AI Review'}
              </Button>
            </div>
          </div>
        </Card>
      </Dialog>
    </motion.div>
  );
}

function AnalyticsTab({ stats, tasks }: { stats: UserStats | null, tasks: Task[] }) {
  const data = [
    { name: 'Mon', productive: 45, wasted: 20 },
    { name: 'Tue', productive: 52, wasted: 15 },
    { name: 'Wed', productive: 38, wasted: 30 },
    { name: 'Thu', productive: 65, wasted: 10 },
    { name: 'Fri', productive: 48, wasted: 25 },
    { name: 'Sat', productive: 20, wasted: 40 },
    { name: 'Sun', productive: 30, wasted: 35 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-950 border-white/10 p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-white">Productivity Trends</CardTitle>
            <CardDescription>Weekly focus vs distraction analysis</CardDescription>
          </CardHeader>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4e00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff4e00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="productive" stroke="#ff4e00" fillOpacity={1} fill="url(#colorProd)" />
                <Area type="monotone" dataKey="wasted" stroke="#ef4444" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-zinc-950 border-white/10 p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-white">Category Distribution</CardTitle>
            <CardDescription>Where your energy is going</CardDescription>
          </CardHeader>
          <div className="space-y-6 mt-8">
            <CategoryProgress label="Machine Learning" value={65} color="bg-primary" />
            <CategoryProgress label="Deep Work" value={45} color="bg-blue-500" />
            <CategoryProgress label="Fitness" value={30} color="bg-green-500" />
            <CategoryProgress label="Social Media (Blocked)" value={85} color="bg-red-500" />
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function CategoryProgress({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-white font-mono">{value}%</span>
      </div>
      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

function SettingsTab({ user, stats }: { user: any, stats: UserStats | null }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-2xl space-y-8"
    >
      <Card className="bg-zinc-950 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">System Configuration</CardTitle>
          <CardDescription>Adjust the strictness of your AI Enforcer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">No Escape Mode</Label>
              <p className="text-sm text-muted-foreground">Prevents app uninstalls and setting changes during focus hours.</p>
            </div>
            <Switch checked={true} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Pain System: Grayscale</Label>
              <p className="text-sm text-muted-foreground">Turns screen grayscale when failing tasks.</p>
            </div>
            <Switch checked={false} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Accountability Notifications</Label>
              <p className="text-sm text-muted-foreground">Notify friends if you fail a major protocol.</p>
            </div>
            <Switch checked={true} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
          <CardDescription>Irreversible system actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full">Wipe All Data & Reset Level</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BlockerTab({ rules, user }: { rules: AppBlockRule[], user: any }) {
  const toggleBlock = async (ruleId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'blockRules', ruleId), { isBlocked: !current });
      toast.info(`App ${!current ? 'blocked' : 'unlocked'}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'blockRules');
    }
  };

  const displayRules = rules.length > 0 ? rules : [
    { id: '1', appName: 'WhatsApp', isBlocked: true, userId: user?.uid || '', condition: 'Study 2h' },
    { id: '2', appName: 'TikTok', isBlocked: true, userId: user?.uid || '', condition: 'Work 1h' },
    { id: '3', appName: 'YouTube', isBlocked: false, userId: user?.uid || '', condition: 'Fitness' },
    { id: '4', appName: 'Instagram', isBlocked: true, userId: user?.uid || '', condition: 'Deep Work' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">App Restrictions</h3>
        <Button variant="outline" className="border-white/10">
          <Plus className="w-4 h-4 mr-2" />
          Add App
        </Button>
      </div>

      <div className="space-y-4">
        {displayRules.map(rule => {
          return (
            <Card key={rule.appName} className="bg-zinc-950 border-white/10">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${rule.isBlocked ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                    {rule.isBlocked ? <Lock className="w-6 h-6 text-red-500" /> : <Zap className="w-6 h-6 text-green-500" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{rule.appName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {rule.isBlocked ? 'Restricted until task completion' : 'Access granted'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <p className="text-xs font-mono text-muted-foreground uppercase">Condition</p>
                    <p className="text-sm font-medium">{rule.condition || 'Focus Protocol'}</p>
                  </div>
                  <Switch 
                    checked={rule.isBlocked || false} 
                    onCheckedChange={() => toggleBlock(rule.id, rule.isBlocked)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
