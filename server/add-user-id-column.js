import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addUserIdColumn() {
  console.log('Adding user_id column to categories table...');

  try {
    // First, let's check the current structure of the categories table
    const { data: tableInfo, error: infoError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'categories');

    if (infoError) {
      console.error('Error checking table structure:', infoError);
    } else {
      console.log('Current categories table columns:', tableInfo.map(col => col.column_name));
    }

    // Try to add the user_id column using direct SQL
    console.log('Attempting to add user_id column...');
    
    // We'll use the REST API to execute raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: 'ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT \'\';'
      })
    });

    if (response.ok) {
      console.log('Successfully added user_id column');
    } else {
      const error = await response.text();
      console.error('Error adding column:', error);
      
      // Try alternative approach - direct table modification
      console.log('Trying alternative approach...');
      
      // Let's try creating the column by inserting a test record and then removing it
      const { error: insertError } = await supabaseAdmin
        .from('categories')
        .insert({ name: 'test', emoji: '🔧', user_id: 'test-user' });
      
      if (insertError) {
        console.error('Alternative approach failed:', insertError);
      } else {
        console.log('Column seems to exist now, removing test record...');
        
        const { error: deleteError } = await supabaseAdmin
          .from('categories')
          .delete()
          .eq('name', 'test');
        
        if (deleteError) {
          console.error('Error removing test record:', deleteError);
        } else {
          console.log('Test record removed successfully');
        }
      }
    }

    // Check the table structure again
    const { data: newTableInfo, error: newInfoError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'categories');

    if (!newInfoError) {
      console.log('Updated categories table columns:', newTableInfo.map(col => col.column_name));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

addUserIdColumn();