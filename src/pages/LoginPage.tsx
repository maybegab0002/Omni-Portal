import { motion } from 'framer-motion'
import { Mail, Lock, Building2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from "@/components/ui/use-toast"

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      console.log('Auth successful:', authData.user);

      // 2. Check user roles
      if (email === 'guest@gmail.com') {
        console.log('Admin login detected');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        navigate('/dashboard');
        return;
      } else if (email === 'hdc.ellainegarcia@gmail.com') {
        console.log('Limited access user login detected');
        localStorage.setItem('userRole', 'limited');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        navigate('/dashboard');
        return;
      }

      // 3. Find the client record
      const { data: clientData, error: clientError } = await supabase
        .from('Clients')
        .select('*')
        .or(`auth_id.eq."${authData.user.id}",Email.eq."${email}"`)
        .single();

      console.log('Client search result:', clientData);

      if (clientError || !clientData) {
        console.error('Client lookup error:', clientError);
        throw new Error('No client account found');
      }

      // 4. Store client info in localStorage
      localStorage.setItem('userRole', 'client');
      localStorage.setItem('clientId', clientData.id.toString());
      localStorage.setItem('clientName', clientData.Name);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);

      console.log('Client login successful, redirecting to client dashboard');
      
      // 5. Navigate to client dashboard
      navigate('/client-dashboard');

    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative bg-gray-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orb - Top Right */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        {/* Gradient Orb - Bottom Left */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '4rem 4rem'
        }} />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 125 }}
              className="inline-flex justify-center mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-ping opacity-20">
                  <Building2 className="w-12 h-12 text-blue-500" />
                </div>
                <Building2 className="w-12 h-12 text-blue-500 relative z-10" />
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 tracking-tight"
            >
              OmniPortal
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-gray-600"
            >
              Your gateway to seamless property management
            </motion.p>
          </div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/70 p-8 rounded-3xl shadow-xl border border-white/50"
          >
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email address</Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-5 group-hover:opacity-10 transition-opacity" />
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-5 group-hover:opacity-10 transition-opacity" />
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                    Remember me
                  </label>
                </div>

                <a href="#" className="text-sm font-medium text-blue-500 hover:text-blue-600">
                  Forgot password?
                </a>
              </div>

              <div className="space-y-4">
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group overflow-hidden rounded-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity" />
                  <span className="relative text-white">
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </span>
                </Button>
              </div>
            </motion.form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
