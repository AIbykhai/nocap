import { createClient } from '@supabase/supabase-js';

// Get environment variables
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

async function setupDatabase() {
  console.log('Setting up database tables...');

  try {
    // Create categories table if it doesn't exist
    console.log('Creating categories table...');
    const { data: categoriesData, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .limit(1);

    if (categoriesError && categoriesError.code === '42P01') {
      console.log('Categories table does not exist, creating via SQL...');
      
      // Use raw SQL approach
      const { data, error } = await supabaseAdmin.rpc('sql', {
        query: `
          CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            emoji TEXT NOT NULL,
            user_id TEXT NOT NULL
          );
        `
      });

      if (error) {
        console.error('Error creating categories table:', error);
      } else {
        console.log('Categories table created successfully');
      }
    } else if (categoriesError && categoriesError.code === '42703') {
      console.log('Categories table exists but user_id column is missing, adding it...');
      
      const { data, error } = await supabaseAdmin.rpc('sql', {
        query: `
          ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT '';
        `
      });

      if (error) {
        console.error('Error adding user_id column to categories table:', error);
      } else {
        console.log('Added user_id column to categories table');
      }
    } else if (categoriesError) {
      console.error('Error checking categories table:', categoriesError);
    } else {
      console.log('Categories table already exists');
    }

    // Create expenses table if it doesn't exist
    console.log('Creating expenses table...');
    const { data: expensesData, error: expensesError } = await supabaseAdmin
      .from('expenses')
      .select('id')
      .limit(1);

    if (expensesError && expensesError.code === '42P01') {
      console.log('Expenses table does not exist, creating via SQL...');
      
      const { data, error } = await supabaseAdmin.rpc('sql', {
        query: `
          CREATE TABLE IF NOT EXISTS expenses (
            id SERIAL PRIMARY KEY,
            item_name TEXT NOT NULL,
            amount INTEGER NOT NULL,
            expense_date TEXT NOT NULL,
            category_id INTEGER REFERENCES categories(id),
            recurrence TEXT,
            user_id TEXT NOT NULL
          );
        `
      });

      if (error) {
        console.error('Error creating expenses table:', error);
      } else {
        console.log('Expenses table created successfully');
      }
    } else if (expensesError) {
      console.error('Error checking expenses table:', expensesError);
    } else {
      console.log('Expenses table already exists');
    }

    // Create budgets table if it doesn't exist
    console.log('Creating budgets table...');
    const { data: budgetsData, error: budgetsError } = await supabaseAdmin
      .from('budgets')
      .select('id')
      .limit(1);

    if (budgetsError && budgetsError.code === '42P01') {
      console.log('Budgets table does not exist, creating via SQL...');
      
      const { data, error } = await supabaseAdmin.rpc('sql', {
        query: `
          CREATE TABLE IF NOT EXISTS budgets (
            id SERIAL PRIMARY KEY,
            daily_budget INTEGER,
            monthly_budget INTEGER,
            user_id TEXT NOT NULL UNIQUE
          );
        `
      });

      if (error) {
        console.error('Error creating budgets table:', error);
      } else {
        console.log('Budgets table created successfully');
      }
    } else if (budgetsError) {
      console.error('Error checking budgets table:', budgetsError);
    } else {
      console.log('Budgets table already exists');
    }

    console.log('Database setup completed');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();