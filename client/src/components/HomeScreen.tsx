import React, { useState, useEffect, useRef } from 'react';
import { Settings, Camera, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ExpenseModal from './ExpenseModal';
import BudgetModal from './BudgetModal';
import TransactionPanel from './TransactionPanel';
import SettingsScreen from './SettingsScreen';

interface Budget {
  daily_budget: number | null;
  monthly_budget: number | null;
}

interface EditingExpense {
  id: number;
  item_name: string;
  amount: number;
  expense_date: string;
  category_id: number;
  recurrence: string | null;
}

const HomeScreen: React.FC = () => {
  const [currentView, setCurrentView] = useState<'Today' | 'This Month'>('Today');
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [monthTotal, setMonthTotal] = useState<number>(0);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showHintText, setShowHintText] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isTransactionPanelOpen, setIsTransactionPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<EditingExpense | null>(null);
  
  // FIXED: Simplified onboarding state management
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingPhase, setOnboardingPhase] = useState<'showing' | 'transitioning' | 'complete'>('complete');
  
  // Animation refs
  const [displayValue, setDisplayValue] = useState<number>(0);
  const animationFrame = useRef<number>();
  
  // Touch/swipe handling
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const hasMoved = useRef<boolean>(false);
  
  // Double-tap handling
  const lastTapTime = useRef<number>(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  // FIXED: Simplified onboarding check
  useEffect(() => {
    const checkOnboardingStatus = () => {
      try {
        const currentCount = parseInt(localStorage.getItem('appOpenCount') || '0', 10);
        const newCount = currentCount + 1;
        
        localStorage.setItem('appOpenCount', newCount.toString());
        
        console.log('🚀 App open count:', newCount);
        
        // Show onboarding only for first 3 opens
        if (newCount <= 3) {
          console.log('🎯 Starting onboarding sequence...');
          setIsOnboarding(true);
          setOnboardingPhase('showing');
          setShowHintText(true);
          
          // Start transition after 2.5 seconds
          setTimeout(() => {
            console.log('🔄 Starting onboarding transition...');
            setOnboardingPhase('transitioning');
            
            // Complete transition after animation duration
            setTimeout(() => {
              console.log('✅ Completing onboarding...');
              setOnboardingPhase('complete');
              setIsOnboarding(false);
            }, 1000); // Longer transition duration
          }, 2500);
        } else {
          console.log('📱 Regular app launch (no onboarding)');
          setShowHintText(true); // Still show hint for first 3 opens
          setOnboardingPhase('complete');
          setIsOnboarding(false);
        }
      } catch (error) {
        console.error('❌ Error accessing localStorage:', error);
        setShowHintText(true);
        setOnboardingPhase('complete');
        setIsOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Use simple date string comparisons instead of complex timezone boundaries
      const now = new Date();
      
      // For 'Today': Get today's date in YYYY-MM-DD format
      const todayDateString = now.toISOString().split('T')[0];
      
      // For 'This Month': Get current year and month
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1-based month
      const monthPrefix = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

      console.log('Date filters:', {
        todayDateString,
        monthPrefix,
        currentDate: now.toISOString()
      });

      // Fetch TODAY's expenses using simple date string comparison
      const { data: todayExpenses, error: todayError } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .eq('user_id', user.id)
        .gte('expense_date', todayDateString)
        .lt('expense_date', getNextDay(todayDateString));

      if (todayError) throw todayError;

      // Fetch THIS MONTH's expenses using date prefix matching
      const { data: monthExpenses, error: monthError } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .eq('user_id', user.id)
        .gte('expense_date', `${monthPrefix}-01`)
        .lt('expense_date', getNextMonth(currentYear, currentMonth));

      if (monthError) throw monthError;

      // Fetch user's budget using maybeSingle() to handle no rows gracefully
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('daily_budget, monthly_budget')
        .eq('user_id', user.id)
        .maybeSingle();

      if (budgetError) {
        throw budgetError;
      }

      // Calculate totals with detailed logging
      console.log('Today expenses:', todayExpenses);
      console.log('Month expenses:', monthExpenses);

      const todaySum = todayExpenses?.reduce((sum, expense) => {
        console.log('Today expense:', expense.expense_date, expense.amount);
        return sum + Number(expense.amount);
      }, 0) || 0;
      
      const monthSum = monthExpenses?.reduce((sum, expense) => {
        console.log('Month expense:', expense.expense_date, expense.amount);
        return sum + Number(expense.amount);
      }, 0) || 0;

      // Round to exactly 2 decimal places to eliminate floating-point errors
      const roundedTodaySum = Math.round(todaySum * 100) / 100;
      const roundedMonthSum = Math.round(monthSum * 100) / 100;

      console.log('Final calculations:', {
        todayExpensesCount: todayExpenses?.length || 0,
        monthExpensesCount: monthExpenses?.length || 0,
        rawTodaySum: todaySum,
        rawMonthSum: monthSum,
        roundedTodaySum,
        roundedMonthSum
      });

      setTodayTotal(roundedTodaySum);
      setMonthTotal(roundedMonthSum);
      setBudget(budgetData || null);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get next day in YYYY-MM-DD format
  const getNextDay = (dateString: string): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Helper function to get first day of next month in YYYY-MM-DD format
  const getNextMonth = (year: number, month: number): string => {
    if (month === 12) {
      return `${year + 1}-01-01`;
    } else {
      return `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
    }
  };

  // Get current spending and budget based on view
  const getCurrentData = () => {
    if (currentView === 'Today') {
      return {
        spending: todayTotal,
        budget: budget?.daily_budget || null
      };
    } else {
      return {
        spending: monthTotal,
        budget: budget?.monthly_budget || null
      };
    }
  };

  const { spending, budget: currentBudget } = getCurrentData();
  const progressPercentage = currentBudget ? Math.min((spending / currentBudget) * 100, 100) : 0;

  // Update display value when spending changes or view changes
  useEffect(() => {
    if (!loading && !isOnboarding) {
      setDisplayValue(spending);
    }
  }, [spending, loading, isOnboarding]);

  // Enhanced color scheme with gradients and glow effects
  const getColorScheme = () => {
    if (!currentBudget) {
      return {
        textColor: '#1C1C1E',
        gradientId: 'neutralGradient',
        glowColor: 'rgba(156, 163, 175, 0.3)',
        glowSize: '25px'
      };
    }

    if (progressPercentage < 80) {
      return {
        textColor: '#1C1C1E',
        gradientId: 'neutralGradient',
        glowColor: 'rgba(156, 163, 175, 0.3)',
        glowSize: '25px'
      };
    } else if (progressPercentage < 100) {
      // Warning state: solid amber text, gradient amber ring
      return {
        textColor: '#B45309',
        gradientId: 'warningGradient',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        glowSize: '30px'
      };
    } else {
      // Over budget state: solid burnt orange text, gradient burnt orange ring
      return {
        textColor: '#C2410C',
        gradientId: 'alertGradient',
        glowColor: 'rgba(239, 68, 68, 0.5)',
        glowSize: '35px'
      };
    }
  };

  const colorScheme = getColorScheme();

  // Simplified animation for view switching
  const animateToValue = (targetValue: number, duration: number = 600) => {
    const startValue = displayValue;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
      }
    };
    
    animate();
  };

  // Handle view switching with cross-fade animation
  const handleViewSwitch = (newView: 'Today' | 'This Month') => {
    if (newView === currentView || isTransitioning || isOnboarding) return;
    
    setIsTransitioning(true);
    
    // Start cross-fade animation
    setTimeout(() => {
      setCurrentView(newView);
      
      // Get new spending value and animate to it
      const newSpending = newView === 'Today' ? todayTotal : monthTotal;
      animateToValue(newSpending);
      
      setTimeout(() => setIsTransitioning(false), 400);
    }, 200);
  };

  // Enhanced swipe handling to detect direction
  const handleSwipe = () => {
    if (isOnboarding) return; // Disable swipe during onboarding
    
    const swipeThreshold = 50;
    const horizontalDistance = touchStartX.current - touchEndX.current;
    const verticalDistance = touchStartY.current - touchEndY.current;

    // Determine if it's primarily horizontal or vertical swipe
    if (Math.abs(horizontalDistance) > Math.abs(verticalDistance)) {
      // Horizontal swipe - switch views
      if (Math.abs(horizontalDistance) > swipeThreshold) {
        if (horizontalDistance > 0) {
          // Swiped left - switch to This Month
          handleViewSwitch('This Month');
        } else {
          // Swiped right - switch to Today
          handleViewSwitch('Today');
        }
      }
    } else {
      // Vertical swipe - open transaction panel if swiped up
      if (Math.abs(verticalDistance) > swipeThreshold && verticalDistance > 0) {
        // Swiped up - open transaction panel
        setIsTransactionPanelOpen(true);
      }
    }
  };

  // Handle tap and double-tap
  const handleTap = () => {
    if (isOnboarding) return; // Disable tap during onboarding
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime.current;
    
    // Clear any existing timeout
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
      tapTimeout.current = null;
    }
    
    if (timeDiff < 300) {
      // Double tap detected - open budget modal
      setIsBudgetModalOpen(true);
      lastTapTime.current = 0; // Reset to prevent triple tap
    } else {
      // Single tap - set timeout to open expense modal if no second tap comes
      lastTapTime.current = currentTime;
      tapTimeout.current = setTimeout(() => {
        setIsExpenseModalOpen(true);
        lastTapTime.current = 0;
      }, 300);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    hasMoved.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    
    const horizontalMove = Math.abs(touchStartX.current - touchEndX.current);
    const verticalMove = Math.abs(touchStartY.current - touchEndY.current);
    
    if (horizontalMove > 10 || verticalMove > 10) {
      hasMoved.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    
    if (hasMoved.current) {
      handleSwipe();
    } else {
      handleTap();
    }
    
    isDragging.current = false;
    hasMoved.current = false;
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    isDragging.current = true;
    hasMoved.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
    touchEndY.current = e.clientY;
    
    const horizontalMove = Math.abs(touchStartX.current - touchEndX.current);
    const verticalMove = Math.abs(touchStartY.current - touchEndY.current);
    
    if (horizontalMove > 10 || verticalMove > 10) {
      hasMoved.current = true;
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    
    if (hasMoved.current) {
      handleSwipe();
    } else {
      handleTap();
    }
    
    isDragging.current = false;
    hasMoved.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    hasMoved.current = false;
  };

  const handleExpenseAdded = () => {
    // Refresh data when a new expense is added or updated
    fetchData();
  };

  const handleBudgetSaved = () => {
    // Refresh data when budget is saved
    fetchData();
  };

  // Handle transaction handle tap/swipe
  const handleTransactionHandleTap = () => {
    if (isOnboarding) return; // Disable during onboarding
    setIsTransactionPanelOpen(true);
  };

  // Handle settings button click
  const handleSettingsClick = () => {
    if (isOnboarding) return; // Disable during onboarding
    setIsSettingsOpen(true);
  };

  // Handle editing a transaction
  const handleEditTransaction = (transaction: any) => {
    // Close the transaction panel
    setIsTransactionPanelOpen(false);
    
    // Set the editing expense data
    setEditingExpense({
      id: transaction.id,
      item_name: transaction.item_name,
      amount: transaction.amount,
      expense_date: transaction.expense_date,
      category_id: transaction.category_id,
      recurrence: transaction.recurrence
    });
    
    // Open the expense modal in edit mode
    setIsExpenseModalOpen(true);
  };

  // Handle closing the expense modal
  const handleExpenseModalClose = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  // Format currency with NO decimals for hero numbers
  const formatCurrencyParts = (amount: number) => {
    // Round the amount to exactly 2 decimal places before formatting
    const roundedAmount = Math.round(amount * 100) / 100;
    
    // Format as whole numbers only (no decimals)
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount);
    
    // Updated regex to parse whole numbers without cents
    const match = formatted.match(/^\$(\d{1,3}(?:,\d{3})*)$/);
    if (match) {
      return {
        symbol: '$',
        dollars: match[1],
        cents: '' // No cents for hero display
      };
    }
    
    return {
      symbol: '$',
      dollars: '0',
      cents: ''
    };
  };

  // Use displayValue for normal state
  const heroAmount = isOnboarding ? 0 : displayValue;
  const { symbol, dollars, cents } = formatCurrencyParts(heroAmount);

  // SVG circle properties - increased stroke weight for elegance
  const radius = 150;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // Calculate ring dimensions
  const ringSize = radius * 2 + strokeWidth * 2 + 40;

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  // Adaptive font sizing and letter spacing for 4-5 digit numbers
  const getHeroNumberStyles = () => {
    const digitCount = dollars.replace(/,/g, '').length;
    
    if (digitCount >= 5) {
      // 5+ digits (e.g., 10,000+): Smaller font, tighter spacing
      return {
        fontSize: '4.5rem',
        letterSpacing: '-0.05em'
      };
    } else if (digitCount === 4) {
      // 4 digits (e.g., 1,000-9,999): Medium reduction
      return {
        fontSize: '5.5rem',
        letterSpacing: '-0.03em'
      };
    } else {
      // 1-3 digits: Full size
      return {
        fontSize: '7rem',
        letterSpacing: 'normal'
      };
    }
  };

  const heroNumberStyles = getHeroNumberStyles();



  // Debug logging for onboarding state
  console.log('🔍 Onboarding state:', { isOnboarding, onboardingPhase, loading });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F7' }}>
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6">
        <button
          onClick={handleSettingsClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={isOnboarding}
        >
          <Settings className="w-6 h-6" style={{ color: '#1C1C1E' }} />
        </button>
        <Camera className="w-6 h-6" style={{ color: '#1C1C1E' }} />
      </div>

      {/* Central Area with Gesture Handler */}
      <div 
        className="flex-1 flex flex-col items-center justify-center px-8 cursor-pointer select-none"
        style={{ minHeight: 0 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {loading ? (
          <p className="text-lg" style={{ color: '#1C1C1E' }}>Loading...</p>
        ) : error ? (
          <p className="text-lg" style={{ color: '#C2410C' }}>{error}</p>
        ) : (
          <div className="flex flex-col items-center">
            {/* Budget Ring Container with Perfect Centering */}
            <div 
              className="relative flex items-center justify-center"
              style={{
                width: ringSize,
                height: ringSize
              }}
            >
              {/* Budget Ring SVG with Enhanced Gradient Glow */}
              <div 
                className="absolute inset-0"
                style={{
                  filter: `drop-shadow(0 0 ${colorScheme.glowSize} ${colorScheme.glowColor})`
                }}
              >
                <svg 
                  width={ringSize} 
                  height={ringSize}
                  className={`transition-all duration-500 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
                >
                  {/* Enhanced Gradient Definitions */}
                  <defs>
                    {/* Improved: Neutral State - Medium-Light Gray to Bright Off-White */}
                    <linearGradient id="neutralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#F9FAFB" stopOpacity="0.95" />
                    </linearGradient>
                    
                    {/* New: Warning State - Deep Muted Yellow to Soft Light Gold */}
                    <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A16207" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#FDE047" stopOpacity="0.9" />
                    </linearGradient>
                    
                    {/* New: Alert State - Deep Muted Red to Lighter Soft Salmon */}
                    <linearGradient id="alertGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#B91C1C" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#FCA5A5" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  
                  {/* Background track circle - very faint, semi-transparent gray */}
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(156, 163, 175, 0.15)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  />
                  
                  {/* Progress circle with gradient and rounded endcaps */}
                  {currentBudget && !isOnboarding && (
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      fill="none"
                      stroke={`url(#${colorScheme.gradientId})`}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                      className="transition-all duration-1000 ease-out"
                    />
                  )}
                </svg>
              </div>

              {/* FIXED: Hero Content Display - Completely rewritten for clarity */}
              <div 
                className={`absolute inset-0 flex flex-col items-center justify-center z-10 transition-all duration-500 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
              >
                {/* ONBOARDING: Show "NoCap" text */}
                {isOnboarding && onboardingPhase === 'showing' && (
                  <div className="text-center">
                    <h1 
                      className="text-8xl font-bold leading-none"
                      style={{ 
                        color: '#1C1C1E',
                        fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      NoCap
                    </h1>
                  </div>
                )}

                {/* TRANSITIONING: Cross-fade from NoCap to spending amount */}
                {onboardingPhase === 'transitioning' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Fade out NoCap */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-out"
                      style={{ opacity: 0 }}
                    >
                      <h1 
                        className="text-8xl font-bold leading-none"
                        style={{ 
                          color: '#1C1C1E',
                          fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif',
                          letterSpacing: '-0.02em'
                        }}
                      >
                        NoCap
                      </h1>
                    </div>

                    {/* Fade in spending amount */}
                    <div 
                      className="transition-opacity duration-1000 ease-out"
                      style={{ opacity: 1 }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline justify-center">
                          {/* Dollar sign */}
                          <span 
                            className="text-4xl font-light leading-none"
                            style={{ 
                              color: colorScheme.textColor,
                              alignSelf: 'baseline',
                              fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                            }}
                          >
                            {symbol}
                          </span>
                          
                          {/* Main digits with adaptive sizing */}
                          <span 
                            className="font-bold mx-1 leading-none"
                            style={{ 
                              color: colorScheme.textColor,
                              fontSize: heroNumberStyles.fontSize,
                              letterSpacing: heroNumberStyles.letterSpacing,
                              fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                            }}
                          >
                            {dollars}
                          </span>
                          
                          {/* Cents (if any) */}
                          {cents && (
                            <span 
                              className="text-4xl font-light leading-none"
                              style={{ 
                                color: colorScheme.textColor,
                                alignSelf: 'baseline',
                                fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                              }}
                            >
                              {cents}
                            </span>
                          )}
                        </div>

                        {/* Time Label */}
                        <div className="mt-6">
                          <p 
                            className="text-base font-light text-center"
                            style={{ 
                              color: 'rgba(107, 114, 128, 0.7)',
                              fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                            }}
                          >
                            {currentView}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NORMAL: Show spending amount */}
                {!isOnboarding && (
                  <div className="flex flex-col items-center">
                    <div className="flex items-baseline justify-center">
                      {/* Dollar sign */}
                      <span 
                        className="text-4xl font-light leading-none"
                        style={{ 
                          color: colorScheme.textColor,
                          alignSelf: 'baseline',
                          fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                        }}
                      >
                        {symbol}
                      </span>
                      
                      {/* Main digits with adaptive sizing */}
                      <span 
                        className="font-bold mx-1 leading-none"
                        style={{ 
                          color: colorScheme.textColor,
                          fontSize: heroNumberStyles.fontSize,
                          letterSpacing: heroNumberStyles.letterSpacing,
                          fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                        }}
                      >
                        {dollars}
                      </span>
                      
                      {/* Cents (if any) */}
                      {cents && (
                        <span 
                          className="text-4xl font-light leading-none"
                          style={{ 
                            color: colorScheme.textColor,
                            alignSelf: 'baseline',
                            fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                          }}
                        >
                          {cents}
                        </span>
                      )}
                    </div>

                    {/* Time Label */}
                    <div className="mt-6">
                      <p 
                        className="text-base font-light text-center"
                        style={{ 
                          color: 'rgba(107, 114, 128, 0.7)',
                          fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                        }}
                      >
                        {currentView}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FIXED: Caption Text - Completely rewritten for clarity */}
            <div className="mt-8">
              {/* ONBOARDING: Show onboarding caption */}
              {isOnboarding && onboardingPhase === 'showing' && (
                <p 
                  className="text-lg text-center font-medium max-w-sm mx-auto"
                  style={{ 
                    color: 'rgba(107, 114, 128, 0.8)',
                    fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                  }}
                >
                  No bs track & understand your spending, instantly
                </p>
              )}

              {/* TRANSITIONING: Cross-fade captions */}
              {onboardingPhase === 'transitioning' && (
                <div className="relative">
                  {/* Fade out onboarding caption */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-1000 ease-out"
                    style={{ opacity: 0 }}
                  >
                    <p 
                      className="text-lg text-center font-medium max-w-sm mx-auto"
                      style={{ 
                        color: 'rgba(107, 114, 128, 0.8)',
                        fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                      }}
                    >
                      No bs track & understand your spending, instantly
                    </p>
                  </div>

                  {/* Fade in hint text */}
                  {showHintText && (
                    <div 
                      className="transition-opacity duration-1000 ease-out"
                      style={{ opacity: 1 }}
                    >
                      <p 
                        className="text-xs text-center font-medium"
                        style={{ 
                          color: 'rgba(107, 114, 128, 0.5)',
                          fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                        }}
                      >
                        Tap to add expense • Double-tap for budget • Swipe to change views
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* NORMAL: Show hint text */}
              {!isOnboarding && showHintText && (
                <p 
                  className="text-xs text-center font-medium"
                  style={{ 
                    color: 'rgba(107, 114, 128, 0.5)',
                    fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                  }}
                >
                  Tap to add expense • Double-tap for budget • Swipe to change views
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar with Simple Transaction Handle - Hide during onboarding */}
      {!isOnboarding && (
        <div className="flex flex-col items-center p-6 pb-8">
          <button
            onClick={handleTransactionHandleTap}
            className="flex flex-col items-center space-y-1 cursor-pointer"
          >
            {/* Upward Chevron */}
            <ChevronUp 
              className="w-5 h-5"
              style={{ color: '#6B7280' }}
            />
            {/* Text Label */}
            <span 
              className="text-sm font-normal"
              style={{ 
                color: '#6B7280',
                fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
              }}
            >
              View Transactions
            </span>
          </button>
        </div>
      )}

      {/* Modals - Only show when not in onboarding */}
      {!isOnboarding && (
        <>
          {/* Expense Modal */}
          <ExpenseModal
            isOpen={isExpenseModalOpen}
            onClose={handleExpenseModalClose}
            onExpenseAdded={handleExpenseAdded}
            editingExpense={editingExpense}
          />

          {/* Budget Modal */}
          <BudgetModal
            isOpen={isBudgetModalOpen}
            onClose={() => setIsBudgetModalOpen(false)}
            onBudgetSaved={handleBudgetSaved}
          />

          {/* Transaction Panel */}
          <TransactionPanel
            isOpen={isTransactionPanelOpen}
            onClose={() => setIsTransactionPanelOpen(false)}
            onEditTransaction={handleEditTransaction}
          />

          {/* Settings Panel */}
          <SettingsScreen
            isOpen={isSettingsOpen}
            onBack={() => setIsSettingsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default HomeScreen;