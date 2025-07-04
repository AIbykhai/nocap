import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Default categories to create for new users
  const defaultCategories = [
    { name: 'Food & Drinks', emoji: '🍔' },
    { name: 'Shopping', emoji: '🛍️' },
    { name: 'Transportation', emoji: '🚗' },
    { name: 'Entertainment', emoji: '🎬' },
    { name: 'Bills & Utilities', emoji: '💡' },
    { name: 'Healthcare', emoji: '🏥' },
    { name: 'Education', emoji: '📚' },
    { name: 'Travel', emoji: '✈️' },
    { name: 'Personal Care', emoji: '💄' },
    { name: 'Other', emoji: '📦' }
  ];

  const setupDefaultCategories = async (userId: string) => {
    try {
      console.log('Setting up default categories for user:', userId);
      
      // Prepare categories with user_id
      const categoriesToInsert = defaultCategories.map(category => ({
        ...category,
        user_id: userId
      }));

      // Insert all default categories
      const { error } = await supabase
        .from('categories')
        .insert(categoriesToInsert);

      if (error) {
        console.error('Error creating default categories:', error);
        throw error;
      }

      console.log('Default categories created successfully');
    } catch (error) {
      console.error('Failed to setup default categories:', error);
      // Don't throw here - we don't want to fail the entire sign-up process
      // if category creation fails
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // If sign-up was successful and we have a user
      if (data.user) {
        console.log('User signed up successfully:', data.user.id);
        
        // Create default categories for the new user
        await setupDefaultCategories(data.user.id);
        
        alert('Account created successfully! Check your email for the confirmation link.');
      } else {
        alert('Check your email for the confirmation link!');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 bg-white rounded-lg shadow-md w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">NoCap Finance</h1>
      <p className="text-gray-600">Sign in or create an account</p>
      
      {error && (
        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form className="w-full space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your email"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your password"
            required
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'Loading...' : 'Log In'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;