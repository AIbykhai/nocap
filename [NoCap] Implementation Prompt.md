# **NoCap v1.0 \- Implementation Plan (v6 \- Light Mode Ring)**

This plan merges the refined "Budget Ring" home screen with the clean, minimalist "light mode" aesthetic. It focuses on creating a premium, polished look and feel throughout the application.

### **Phase 1: Project Setup & Core Backend**

*(This phase is complete. The steps remain here for reference.)*

**Step 1.1: Initialize Project & Setup Services**

* **Instruction:** Create a new project using Bolt.new. Set up a new Supabase project for the backend and a new RevenueCat project for future monetization.  
* **Test:** Confirm that the Bolt.new project can be run on a simulator/device. Verify that you can access the Supabase and RevenueCat project dashboards.

**Step 1.2: Implement User Authentication**

* **Instruction:** Using Supabase Auth, create a basic sign-up and login flow. For V1, this can be email/password based.  
* **Test:** Create a new user account. Log out. Log back in with the same credentials. Verify that a new user record appears in the Supabase auth.users table.

**Step 1.3 (UPDATED): Define Database Schema**

* **Instruction:** In addition to the `expenses` and `budgets` tables, create a new `categories` table. This table will hold a user's custom categories.  
* **`categories` table columns:** `id` (int8, Primary), `user_id` (uuid, foreign key to `auth.users`), `name` (text), `emoji` (text).  
* **Instruction:** Modify the `expenses` table. Remove the old `category` (text) column. Add a new column named `category_id` (int8) which will be a foreign key linking to the `id` of the new `categories` table. Ensure there is a `recurrence` (text) column.

  ### **Phase 2 (REVISED): The Light Mode Home Screen with Budget Ring**

**Step 2.1 (REVISED): Build the Light Mode Layout**

* **Prompt:** "Create a new React component for the Home Screen.  
  1. The main screen background must be a very light gray or off-white.  
  2. Use flexbox to lay out the content vertically. There should be a top bar, a central area, and a bottom bar.  
  3. **Top Bar:** Place a dark gray gear icon on the far left and a dark gray camera icon on the far right.  
  4. **Central Area:** This should be the focal point. For now, just add placeholder text: 'Budget Ring Area'.  
  5. **Bottom Bar:** At the very bottom, add the text 'Transactions' in dark gray with an upward-facing arrow."

**Step 2.2: Fetch Spending Data**

* **Prompt:** "Update the Home Screen.  
  1. Import the `supabaseClient`.  
  2. Use a `useEffect` hook to fetch and store the total spending for 'Today' and 'This Month' in state variables.  
  3. Also fetch the user's set budgets from the `budgets` table and store them."

**Step 2.3 (REVISED & POLISHED): Implement the Hero Number and Refined Ring**

* **Prompt:** "This is the most important visual step. Replace the 'Budget Ring Area' placeholder with a light-mode design.  
  1. **Implement the Hero Number Display:** This is the primary focus.  
     * The main digits of the spending amount must be the largest element on the screen with a **Bold** or **Semibold** font weight and a **dark gray color**.  
     * **Implement Adaptive Sizing:** The font size must be responsive. If the number has 5 or more digits (e.g., 10,000), the font size must be reduced to ensure it fits comfortably within the ring without looking cramped.  
     * **Create Typographic Hierarchy:** The dollar sign (`$`) and the cents (`.00`) must be significantly smaller and have a **Regular or Light** font weight.  
     * **Add Padding:** The container for the entire number display must have sufficient padding to prevent any part of the text from overlapping with the surrounding ring.  
     * Below the hero number, display the current view ('Today' or 'This Month') in a medium gray font.  
  2. **Create the Refined Budget Ring:** The ring should frame the hero number.  
     * Use an SVG with two `<circle>` elements.  
     * The stroke width for both circles should be **thinner** to look elegant.  
     * The bottom 'track' circle should have a very light gray stroke.  
     * The top 'progress' circle will be animated using its `stroke-dashoffset`.  
  3. **Connect Data:** The ring's fill percentage and the number displayed must correspond to the spending data for the currently selected view."

**Step 2.4 (REVISED & POLISHED): Implement Final Aesthetics and Animations**

* **Prompt:** "Bring the screen to life with final polish and animations.  
  1. **Apply Refined Color Logic with Gradients:** The stroke color of the progress ring must have an elegant gradient in all states.  
     * **Normal (`< 80%`):** The ring should have a gradient from a **light gray to a brighter, more visible off-white**. The text should be dark gray.  
     * **Warning (`80% - 99.9%`):** The ring should have a gradient from a **deep, muted yellow to a softer, lighter gold**. The text should be a solid, muted yellow.  
     * **Over Budget (`≥ 100%`):** The ring should have a gradient from a **deep, muted red to a softer, lighter salmon color**. The text should be a solid, muted red.  
  2. **Add a Subtle Glow Effect:** Apply a very subtle CSS `drop-shadow` behind the progress ring, using a soft version of the ring's primary color (e.g., a soft yellow glow for the warning ring).  
  3. **Implement Animations:**  
     * When an expense is added, the hero number must **animate a count-up** from the old value to the new value.  
     * When swiping between 'Today' and 'This Month', the number and ring should have a **smooth cross-fade** transition.  
  4. **Remove Clutter:** Remove any extra text below the ring. The color and gradient are the only indicators needed."

**Step 2.5 (NEW): Implement "Smart Hint" Text**

* **Prompt:** "Add smart hint text below the budget ring.  
  1. The text should read: 'Tap to add expense • Double-tap for budget'.  
  2. This text should only be visible for the first 3 times the user opens the app.  
  3. Use `localStorage` or a similar method to track an `appOpenCount`. Increment it on each load and hide the text when the count exceeds 3."

  ### **Phase 3 (REVISED): Light Mode Forms**

**Step 3.1 (REVISED): Implement Redesigned Expense Entry Modal**

* **Prompt:** "Create the expense entry modal with the new light mode aesthetic.  
  1. The modal is triggered by a single tap on the Home Screen.  
  2. **Aesthetics:**  
     * The modal should appear as a **white card with a soft drop shadow**, floating over the light gray screen background.  
     * Input fields should have a **light gray background and rounded corners**.  
     * All text inside the modal should be dark gray.  
  3. **Recurrence Field:** Add a **Segmented Control** for the 'Recurrence' option with three choices: 'None', 'Weekly', 'Monthly'. The selected option should be dark gray on a white background; unselected options are light gray.  
  4. **Save Button:** The 'Save Expense' button should be **solid blue**."

**Step 3.2 (REVISED): Implement Redesigned Budget Setting Modal**

* **Prompt:** "Re-style the budget setting modal to match the new aesthetic.  
  1. The modal is triggered by a double-tap.  
  2. **Aesthetics:** Apply the same style as the expense form: a white card with a drop shadow, light gray input fields, and dark gray text.  
  3. The 'Save Budget' button should be the same solid blue as the expense form."

  ### **Phase 4 (REVISED): Transaction History**

**Step 4.1 (REVISED): Build the Transactions Panel**

* **Prompt:** "Create the transaction history panel and its handle.  
  1. **Handle Style:** At the bottom of the screen, replace the simple 'Transactions' text with a **dark, pill-shaped button**. Inside this button, display the text 'View Transactions' in a light gray font, followed by a subtle, upward-pointing chevron icon.  
  2. **Panel Behavior:** This handle, when swiped up, should reveal the main transactions panel. The panel should slide up from the bottom, appearing as a **white card with a drop shadow** over the light gray background.  
  3. **Supabase Logic:** Inside the panel, fetch the user's expenses. Your Supabase query must:  
     * Select from the `expenses` table.  
     * Filter `where` the `user_id` matches the current user.  
     * Use a `join` to retrieve the `name` and `emoji` from the `categories` table based on the `category_id`.  
     * `order` the results by `expense_date` descending.  
  4. **Display:** Render the fetched transactions as a list of white cards."

**Step 4.2 (REVISED): Implement Transaction Editing & Deletion**

* **Prompt:** "Add editing and deletion functionality to the transaction list.  
  1. **UI:** Make each transaction item in the list tappable. When tapped, open the expense entry modal, pre-filled with that transaction's data.  
  2. **Edit Logic:** When the 'Save' button is pressed in the pre-filled modal, perform a Supabase **`update`** operation on the `expenses` table, targeting the specific expense `id`.  
  3. **Delete Logic:** Add a 'Delete' button (styled in red) to the modal. When tapped, it must first show a confirmation prompt. If confirmed, perform a Supabase **`delete`** operation on the `expenses` table, targeting the specific expense `id`."

### **Phase 5 (REVISED): Interactive Settings Screen**

**Step 5.1: Build the Main Settings Screen Layout**

* **Prompt:** "Revise the main Settings screen component.  
  1. When the 'Settings' icon is tapped on the top left of the main screen, a new view should slide in from the left.  
  2. The screen should have a light gray background.  
  3. It should display a list of options. Each option should be a white card with a soft drop shadow and rounded corners.  
  4. Create list items for: 'Profile', 'Manage Categories', 'Notifications', 'Appearance', 'Help & Feedback', and a 'Sign Out' button.  
  5. 'Profile' and 'Manage Categories' should have a chevron icon indicating they navigate to a new screen.  
  6. The 'Sign Out' button should be styled in red text."

**Step 5.2: Implement Interactive Controls**

* **Prompt:** "Implement the interactive controls on the main Settings screen.  
  1. Replace the 'Notifications' list item's content with a **Segmented Control** containing two options: 'On' and 'Off'.  
  2. Replace the 'Appearance' list item's content with a **Segmented Control** containing two options: a 'light mode' icon (like a sun) and a 'dark mode' icon (like a moon)."

**Step 5.3: Implement 'Profile' Sub-Screen**

* **Prompt:** "Implement the 'Profile' sub-screen.  
  1. When the 'Profile' option is tapped on the main Settings screen, a new view should slide in from the right.  
  2. This new view should contain two options: a 'Change Password' button and a 'Delete Account' button.  
  3. The 'Delete Account' button must be styled in red. Its `onClick` handler must first show a confirmation modal warning that the action is irreversible. If confirmed, it must trigger the logic to delete all the user's data from the `expenses`, `budgets`, and `categories` tables, and finally delete the user from `auth.users`."

**Step 5.4: Implement 'Manage Categories' Sub-Screen**

* **Prompt:** "Implement the 'Manage Categories' sub-screen.  
  1. When 'Manage Categories' is tapped, a new view should slide in from the right.  
  2. This view will display a list of the user's current categories, fetched from the `categories` table. Each list item should show the category's `emoji` and `name`.  
  3. Each category in the list must have a small ✏️ button to open an 'Edit Category' modal, pre-filled with its data.  
  4. Each category in the list must also have a small 'X' button to delete it directly from the list (after a confirmation).  
  5. At the top of the list, include an 'Add New Category' button that opens a modal to create a new category."

**Step 5.5: Implement 'Sign Out'**

* **Prompt:** "Implement the 'Sign Out' functionality.  
  1. The 'Sign Out' button on the main Settings screen, when tapped, should first show a confirmation prompt.  
  2. If confirmed, it should call `supabase.auth.signOut()`."  
     

## **Future Planning / TO-DOs (Post V1)**

These items are identified in the PRD but are out of scope for the initial release. They will be prioritized for future versions.

* **AI-Powered Expense Logging:** Implement the camera-based OCR scanning feature. This includes setting up the third-party vision API, creating the Supabase Edge Function, and integrating it with the app.  
* **Monetization Paywall:** Implement the RevenueCat paywall, triggered after the 3 free uses of the AI scan feature.  
* **Advanced Filtering:** Add filtering by date range and category to the Transactions Panel.  
* **Notifications:** Implement push notifications for budget alerts.  
* **Settings Screen:**  
  * **Privacy & Security Section:** A dedicated screen for managing data privacy settings.  
  * **Data Export:** Functionality for users to export their expense data as a CSV file.  
  * **Help & Support:** get help and contact support.  
* **UI/UX Optimizations:**  
  * Refine all animations to feel more "delightful" by adding subtle haptics (vibrations) when a user completes an action, like saving an expense or swiping between metrics.  
  * Native Modals & Pickers: When implementing pop-ups (like the expense entry modal), you'd ensure they use presentation styles that feel native to iOS.  
  * Animate the expense number counting up right after a new expense is logged.  
  * Add a subtle counter for remaining free AI scans.  
* **Multi-currency support.**  
* **Advanced analytics dashboards.**  
* **Bank account linking.**  
* **Web/tablet versions.**

