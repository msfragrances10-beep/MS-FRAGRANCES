import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '@/src/firebase';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/src/components/ui/Card';
import { toast } from 'sonner';
import { Chrome } from 'lucide-react';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Logged in successfully!');
      navigate(redirect);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!');
      }
      navigate(redirect);
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      toast.error(error.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp ? 'Join Ms Fragrances today' : 'Sign in to your account to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              variant="outline"
              className="w-full gap-2 py-6 text-lg"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Chrome size={20} />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button size="lg" className="w-full py-6 text-lg" disabled={loading}>
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center">
            <p className="text-sm text-neutral-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-bold text-black hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
