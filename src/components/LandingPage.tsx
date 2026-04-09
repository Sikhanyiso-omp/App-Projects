import { useAuth } from '../AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Shield, Zap, Lock, Brain } from 'lucide-react';

export function LandingPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-8">
              <Zap className="w-3 h-3" />
              <span>BEHAVIOR CONTROL SYSTEM v1.0</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
              MIND<span className="text-primary">LOCK</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light">
              Enforce productivity. Eliminate distractions. 
              The AI-powered behavior control system that doesn't just track time—it <span className="text-white font-medium italic">enforces</span> it.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={login}
                className="h-14 px-8 text-lg font-bold rounded-none bg-white text-black hover:bg-primary hover:text-white transition-all duration-300"
              >
                INITIALIZE SYSTEM
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-14 px-8 text-lg font-bold rounded-none border-white/20 hover:bg-white/10"
              >
                VIEW PROTOCOLS
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<Lock className="w-6 h-6 text-primary" />}
            title="App Lockdown"
            description="Hard-block WhatsApp, TikTok, and YouTube until your study goals are met. No escape."
          />
          <FeatureCard 
            icon={<Brain className="w-6 h-6 text-primary" />}
            title="AI Verification"
            description="Our AI strictly verifies your work. Upload code or notes—cheating is impossible."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-primary" />}
            title="Pain System"
            description="Fail your tasks and face the consequences. Grayscale mode, loud alarms, and point loss."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
