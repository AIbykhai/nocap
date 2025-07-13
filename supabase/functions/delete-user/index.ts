import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface DeleteUserRequest {
  userId: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create regular Supabase client to verify the user's session
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify the user's session using the authorization header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { userId }: DeleteUserRequest = await req.json();

    // Verify that the user is trying to delete their own account
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Can only delete your own account' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Starting deletion process for user: ${userId}`);

    // Step 1: Delete user's categories (this will cascade to expenses due to foreign key)
    console.log('Deleting user categories...');
    const { error: categoriesError } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('user_id', userId);

    if (categoriesError) {
      console.error('Error deleting categories:', categoriesError);
      // Continue with deletion even if categories fail
    }

    // Step 2: Delete user's expenses (in case some weren't cascaded)
    console.log('Deleting user expenses...');
    const { error: expensesError } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('user_id', userId);

    if (expensesError) {
      console.error('Error deleting expenses:', expensesError);
      // Continue with deletion even if expenses fail
    }

    // Step 3: Delete user's budgets
    console.log('Deleting user budgets...');
    const { error: budgetsError } = await supabaseAdmin
      .from('budgets')
      .delete()
      .eq('user_id', userId);

    if (budgetsError) {
      console.error('Error deleting budgets:', budgetsError);
      // Continue with deletion even if budgets fail
    }

    // Step 4: Delete the user from Supabase Auth
    console.log('Deleting user from Supabase Auth...');
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete user account', 
          details: deleteUserError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('User deletion completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User account and all associated data deleted successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error during user deletion:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});