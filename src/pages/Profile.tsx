import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { toast } from 'sonner';
import { User, Mail, Calendar, ShieldCheck, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-neutral-500">Please log in to view your profile.</p>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, username });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tighter uppercase">My Profile</h1>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
              <Edit2 size={16} />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Profile Sidebar */}
          <div className="md:col-span-1">
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-24 bg-black" />
              <CardContent className="relative pt-12 text-center">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-neutral-100 text-3xl font-bold text-black shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-neutral-500">@{user.username}</p>
                <div className="mt-6 flex justify-center">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                    <ShieldCheck size={12} />
                    {user.role}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="md:col-span-2">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Account Information</CardTitle>
                <CardDescription>Manage your personal details and account settings</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="yourusername"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Full Name</p>
                        <div className="flex items-center gap-2 text-neutral-700">
                          <User size={16} />
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Username</p>
                        <div className="flex items-center gap-2 text-neutral-700">
                          <span className="font-bold text-neutral-400">@</span>
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Email Address</p>
                        <div className="flex items-center gap-2 text-neutral-700">
                          <Mail size={16} />
                          <span className="font-medium">{user.email}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Member Since</p>
                        <div className="flex items-center gap-2 text-neutral-700">
                          <Calendar size={16} />
                          <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
