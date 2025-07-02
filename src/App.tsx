import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient.js';
import Auth from './components/Auth';
import HomeScreen from './components/HomeScreen';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!session ? (
        <div className="bg-gray-100 flex items-center justify-center p-4 min-h-screen">
          <Auth />
        </div>
      ) : (
        <HomeScreen />
      )}
    </div>
  );
}

export default App;