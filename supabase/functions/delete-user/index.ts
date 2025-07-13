import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
   import { corsHeaders } from '../_shared/cors.ts';

   Deno.serve(async (req) => {
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders });
     }

     try {
       const { userId } = await req.json();
       if (!userId) {
         throw new Error("User ID is required.");
       }

       const supabaseAdmin = createClient(
         Deno.env.get('SUPABASE_URL') ?? '',
         Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
       );

       // Delete user data in the correct order
       await supabaseAdmin.from('expenses').delete().eq('user_id', userId);
       await supabaseAdmin.from('budgets').delete().eq('user_id', userId);
       await supabaseAdmin.from('categories').delete().eq('user_id', userId);

       // Delete the user from Supabase Auth
       const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
       if (deleteUserError) {
         throw deleteUserError;
       }

       return new Response(JSON.stringify({ message: `User ${userId} deleted successfully.` }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       });
     } catch (error) {
       return new Response(JSON.stringify({ error: error.message }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 400,
       });
     }
   });