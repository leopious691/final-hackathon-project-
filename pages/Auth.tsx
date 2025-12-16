import React, { useState } from 'react';
import { UserRole, BloodGroup } from '../types';
import { mockBackend } from '../services/mockBackend';
import Button from '../components/Button';
import Input from '../components/Input';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Mock password
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.DONOR);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(BloodGroup.O_POS);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await mockBackend.login(email);
      } else {
        await mockBackend.register({
          name,
          email,
          phone: '000-000-0000', // Mock
          role,
          bloodGroup: role === UserRole.DONOR ? bloodGroup : undefined, // Only set blood group for donors
          isAvailable: role === UserRole.DONOR ? true : undefined,
        });
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-red-200 mb-4">
            <span className="text-4xl">🩸</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Blood Connect</h1>
          <p className="text-gray-500 mt-2">Saving lives, one student at a time.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-red-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {isLogin ? 'Welcome Back' : 'Join the Community'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <Input 
                label="Full Name" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            
            <Input 
              label="College Email" 
              type="email" 
              placeholder="student@college.edu" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {!isLogin && (
              <>
                 <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">I am a...</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.DONOR)}
                      className={`py-3 rounded-xl border-2 font-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
                        role === UserRole.DONOR 
                          ? 'bg-red-600 border-red-600 text-white shadow-md scale-[1.02]' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      <span>🩸</span>
                      <span>Donor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.REQUESTER)}
                      className={`py-3 rounded-xl border-2 font-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
                        role === UserRole.REQUESTER 
                          ? 'bg-red-600 border-red-600 text-white shadow-md scale-[1.02]' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      <span>🏥</span>
                      <span>Requester</span>
                    </button>
                  </div>
                </div>

                {role === UserRole.DONOR && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black focus:ring-2 focus:ring-red-200 outline-none"
                    >
                      {Object.values(BloodGroup).map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</div>}

            <Button type="submit" isLoading={loading}>
              {isLogin ? 'Sign In' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-red-600 font-medium hover:underline text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;