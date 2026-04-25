# CLAUDE CODE PROMPT: MULTI-AGENT EXPANSION SYSTEM WITH INTERACTIVE OPTIONS

## PROJECT OVERVIEW

Build a **Multi-Agent Expansion Strategy System** where specialized AI agents analyze retail location expansion opportunities and present multiple options that users can visualize, compare, and tap to proceed with.

**Core Philosophy:** 
- Agents generate OPTIONS (not just recommendations)
- User VISUALIZES options with pros/cons
- User TAPS option they want to proceed with
- Selected option flows to next agent
- All agents share state through API

---

## ARCHITECTURE: API + GUI PROTOCOL WITH SHARED STATE

### Data Flow Architecture

```
FRONTEND (GUI)
├─ Displays agent options visually
├─ Shows pros/cons for each option
├─ User taps to select option
└─ Sends selection via API

        ↓ (API Request with user selection)

BACKEND (Shared State Manager)
├─ Stores all agent analyses
├─ Tracks user selections
├─ Manages conversation state
├─ Prepares data for next agent
└─ Returns formatted data to GUI

        ↓ (API Response with formatted options)

FRONTEND (GUI)
├─ Displays new agent's options
├─ Shows how previous selection influenced this
└─ Ready for next user interaction
```

### Key Principle: SHARED STATE

All agents have access to:
```
STATE = {
  locationAddress: "123 Main St, Austin TX",
  locationData: { population, income, rent, ... },
  
  siteSelectionAnalysis: {
    selectedOption: "Option 2: Downtown Location",
    allOptions: [...],
    reasoning: "..."
  },
  
  financialAnalysis: {
    selectedOption: "Scenario B: Conservative Growth",
    allOptions: [...],
    reasoning: "..."
  },
  
  marketResearchAnalysis: {
    selectedOption: "Market Type: High Growth",
    allOptions: [...],
    reasoning: "..."
  },
  
  riskAssessment: {
    selectedOption: "Risk Profile: Medium",
    allOptions: [...],
    reasoning: "..."
  },
  
  expansionPlan: {
    selectedOption: "Phase 1: Pilot + Phase 2: Regional",
    allOptions: [...],
    reasoning: "..."
  }
}
```

---

## AGENT 1: SITE SELECTION EXPERT

### Job: Analyze locations and present multiple options

### User Experience Flow

1. **User Provides Input**
   - Address: "Austin, TX"
   - Population data
   - Market info
   - Budget constraints

2. **Agent Analyzes & Generates OPTIONS**
   - NOT: "This location is good" (single recommendation)
   - YES: "Here are 3 location options, each with different characteristics"

3. **Frontend Visualizes Options**
   - Shows 3 location cards side-by-side
   - Each card shows:
     - Location name/address
     - Visual summary (map pin, score, etc.)
     - Key metrics (pop, income, traffic, rent)
     - Pros (3-4 benefits)
     - Cons (2-3 drawbacks)
     - Score (1-100)

4. **User Interaction**
   - User reviews all 3 options
   - User taps card to see more details
   - User selects preferred option (button "Select This Location")
   - Selection saved to SHARED STATE

### Agent Instructions (For Claude)

```
You are a Site Selection Expert Agent.

TASK: User provides location address and basic info.
Your job is NOT to recommend ONE location.
Your job is to GENERATE 3 LOCATION OPTIONS.

Each option must be:
1. A different location in the same market
2. Geographically distinct (downtown vs. suburban vs. strip mall)
3. Different trade-offs (high traffic/high rent vs. lower cost/less traffic)

For each location, provide:
- Address/Name
- Location Type (Downtown/Suburban/Strip Mall/etc)
- Key Metrics:
  * Population (3-mile radius)
  * Household Income
  * Foot Traffic (estimated daily)
  * Rent/Month
  * Drive Time to Market Center
  
- Scoring (1-10 for each pillar):
  * Demographics Score (population, income match)
  * Visibility Score (can customers find you?)
  * Competition Score (how many competitors nearby)
  * Financial Score (rent vs. revenue potential)
  * Regulatory Score (zoning, permits easy?)
  * OVERALL SCORE (average of 5)

- Pros (3-4 benefits):
  * Pro 1: [Specific benefit]
  * Pro 2: [Specific benefit]
  * Pro 3: [Specific benefit]
  * Pro 4: [Specific benefit]

- Cons (2-3 drawbacks):
  * Con 1: [Specific challenge]
  * Con 2: [Specific challenge]
  * Con 3: [Specific challenge]

IMPORTANT: 
- Make each option DISTINCTLY DIFFERENT
- Don't make one option obviously better (user should choose, not you)
- Pros and cons should be SPECIFIC and QUANTIFIABLE
- Consider trade-offs (you can't have high traffic AND low rent)

FORMAT OUTPUT AS JSON:
{
  "agentName": "Site Selection Expert",
  "actionType": "SELECT_LOCATION_OPTION",
  "userPrompt": "Select the location that best fits your expansion strategy",
  "options": [
    {
      "optionId": "option-1",
      "name": "Downtown Austin - Main & 6th",
      "type": "Downtown High-Traffic",
      "summary": "Premium location in downtown core with excellent visibility",
      "metrics": {
        "population3Mile": 25000,
        "householdIncome": 75000,
        "footTrafficDaily": 4500,
        "rentMonthly": 4500,
        "driveTimeToCenter": "2 min"
      },
      "scores": {
        "demographicsScore": 8,
        "visibilityScore": 9,
        "competitionScore": 6,
        "financialScore": 5,
        "regulatoryScore": 8,
        "overallScore": 72
      },
      "pros": [
        "Exceptional foot traffic: 4,500+ daily visitors",
        "Premium demographics: $75k median household income",
        "High visibility: Located on major arterial road",
        "Strong growth area: 6% annual population growth"
      ],
      "cons": [
        "High rent: $4,500/month (premium for location)",
        "Heavy competition: 5 direct competitors within 1 mile",
        "Parking challenges: Street parking only, limited spaces"
      ]
    },
    {
      "optionId": "option-2",
      "name": "Suburban Austin - Mueller Development",
      "type": "Suburban Growing",
      "summary": "Newer development area with growing demographic",
      "metrics": {
        "population3Mile": 35000,
        "householdIncome": 62000,
        "footTrafficDaily": 2800,
        "rentMonthly": 2800,
        "driveTimeToCenter": "12 min"
      },
      "scores": {
        "demographicsScore": 8,
        "visibilityScore": 7,
        "competitionScore": 8,
        "financialScore": 8,
        "regulatoryScore": 9,
        "overallScore": 80
      },
      "pros": [
        "Excellent affordability: Rent $2,800/month (37% cheaper than option 1)",
        "Strong growth: Fastest growing Austin neighborhood (8% annual growth)",
        "Larger population: 35k people in 3-mile radius (40% more than option 1)",
        "Light competition: Only 2 direct competitors nearby"
      ],
      "cons": [
        "Lower foot traffic: 2,800 daily (38% less than downtown)",
        "Longer drive time: 12 minutes to market center",
        "Younger demographic: More young families, less affluent"
      ]
    },
    {
      "optionId": "option-3",
      "name": "Strip Mall - Anderson Lane Corridor",
      "type": "Mixed-Use Strip Mall",
      "summary": "Established shopping center with anchor tenants",
      "metrics": {
        "population3Mile": 30000,
        "householdIncome": 68000,
        "footTrafficDaily": 3200,
        "rentMonthly": 3200,
        "driveTimeToCenter": "8 min"
      },
      "scores": {
        "demographicsScore": 7,
        "visibilityScore": 8,
        "competitionScore": 7,
        "financialScore": 7,
        "regulatoryScore": 9,
        "overallScore": 76
      },
      "pros": [
        "Balanced affordability: $3,200/month (middle ground pricing)",
        "Co-tenancy benefits: Anchor tenants drive traffic (Whole Foods, REI)",
        "Easy parking: 500+ spaces, well-maintained center",
        "Established location: Center has strong track record"
      ],
      "cons": [
        "Moderate competition: 3 direct competitors in center",
        "Mixed visibility: Some visibility constraints from other storefronts",
        "Landlord-dependent: Must follow center rules and policies"
      ]
    }
  ],
  "nextStep": "User selects one location option. Selection saved to shared state for financial agent."
}
```

---

## AGENT 2: FINANCIAL ANALYST

### Job: Generate financial scenarios based on selected location

### User Experience Flow

1. **Agent Receives Selected Location**
   - From SHARED STATE: "User selected Option 2: Suburban Mueller"
   - Agent knows: rent $2,800, population 35k, foot traffic 2,800

2. **Agent Generates FINANCIAL OPTIONS**
   - NOT: "Your ROI will be 140%"
   - YES: "Here are 3 financial scenarios, each with different assumptions"

3. **Frontend Visualizes Scenarios**
   - Shows 3 scenario cards side-by-side
   - Each card shows:
     - Scenario name (Conservative/Base Case/Aggressive)
     - Key metrics (investment, break-even, ROI)
     - Monthly cost breakdown
     - Revenue projection
     - Pros (why choose this scenario)
     - Cons (what could go wrong)
     - Visual comparison (chart or gauge)

4. **User Interaction**
   - User reviews 3 financial scenarios
   - User taps to see detailed breakdown
   - User selects preferred scenario
   - Selection saved to SHARED STATE

### Agent Instructions (For Claude)

```
You are a Financial Analyst Agent.

CONTEXT: User selected a location. You have:
- Location: Mueller Suburban Austin
- Rent: $2,800/month
- Population: 35k (3-mile radius)
- Foot Traffic: 2,800 daily
- Site Selection Score: 80/100

TASK: Generate 3 FINANCIAL SCENARIOS for this location.

Each scenario represents a different business strategy:
1. CONSERVATIVE (Low investment, slow growth, safe)
2. BASE CASE (Balanced investment, moderate growth)
3. AGGRESSIVE (High investment, fast growth, risky)

For each scenario, provide:

SCENARIO DETAILS:
- Name: [Scenario Name]
- Strategy: [What's the approach?]
- Description: [2-3 sentence explanation]
- Assumption: [Key assumption driving this scenario]

INVESTMENT BREAKDOWN:
- Lease Deposit & First Month: $X
- Buildout/Renovations: $X
- Equipment & POS Systems: $X
- Pre-opening Marketing: $X
- Working Capital Buffer: $X
- TOTAL INITIAL INVESTMENT: $X

MONTHLY OPERATING COSTS:
- Rent: $2,800 (given)
- Payroll (Team of X): $X/month
- Cost of Goods Sold (COGS): $X/month
- Utilities & Maintenance: $X/month
- Marketing & Advertising: $X/month
- Insurance & Licensing: $X/month
- Miscellaneous (2-3%): $X/month
- TOTAL MONTHLY: $X

REVENUE PROJECTIONS (Annual):
- Year 1: $X (projected based on traffic & conversion)
- Year 2: $X (with optimizations)
- Year 3: $X (mature store performance)
- Year 1 Monthly Average: $X

FINANCIAL METRICS:
- Break-Even Month: Month X
- Monthly at Break-Even: $X
- 3-Year Total Revenue: $X
- 3-Year Total Profit: $X
- ROI (Return on Investment): X%
- Payback Period: X months
- Required Funding: $X (from loans/investors)
- Owner Equity Needed: $X

FUNDING RECOMMENDATION:
- SBA Loan: $X @ 6.5%
- Equipment Finance: $X @ 7%
- Line of Credit: $X @ 8%
- Owner Equity: $X
- Total: $X

PROS (Why choose this scenario):
- Pro 1: [Specific benefit]
- Pro 2: [Specific benefit]
- Pro 3: [Specific benefit]

CONS (Risks of this scenario):
- Con 1: [Specific risk]
- Con 2: [Specific risk]

SCENARIO COMPARISON METRICS:
- Higher/Lower Risk: [LEVEL]
- Faster/Slower Break-Even: [TIME]
- More/Less Capital Needed: [AMOUNT]
- Best If: [Type of business owner - e.g., "Conservative investor wanting steady growth"]

FORMAT OUTPUT AS JSON:
{
  "agentName": "Financial Analyst",
  "actionType": "SELECT_FINANCIAL_SCENARIO",
  "selectedLocation": "Mueller Suburban Austin (Option 2)",
  "userPrompt": "Select the financial scenario that matches your investment appetite and risk tolerance",
  "scenarios": [
    {
      "scenarioId": "scenario-1",
      "name": "Conservative Growth",
      "strategy": "Low investment, organic growth, minimal risk",
      "description": "Focus on sustainable growth with minimal debt. Build gradually, reinvest profits. Best for risk-averse investors.",
      "assumption": "Moderate 2,000/month sales Year 1, growing to 4,000/month by Year 3",
      
      "investmentBreakdown": {
        "leaseDeposit": 8400,
        "buildout": 40000,
        "equipment": 35000,
        "preOpening": 10000,
        "workingCapital": 20000,
        "total": 113400
      },
      
      "monthlyOperatingCosts": {
        "rent": 2800,
        "payroll": 5000,
        "cogs": 8000,
        "utilities": 600,
        "marketing": 500,
        "insurance": 400,
        "misc": 500,
        "total": 17800
      },
      
      "revenueProjections": {
        "year1": 240000,
        "year2": 400000,
        "year3": 480000,
        "year1MonthlyAvg": 20000
      },
      
      "financialMetrics": {
        "breakEvenMonth": 14,
        "breakEvenMonthlyRevenue": 17800,
        "total3YearRevenue": 1120000,
        "total3YearProfit": 190000,
        "roi": 1.67,
        "paybackPeriod": "14 months",
        "requiredFunding": 80000,
        "ownerEquityNeeded": 33400
      },
      
      "fundingRecommendation": {
        "sbaLoan": 60000,
        "equipmentFinance": 30000,
        "lineOfCredit": 0,
        "ownerEquity": 23400,
        "total": 113400
      },
      
      "pros": [
        "Lowest initial investment: Only $113k needed",
        "Lowest debt burden: $90k total borrowing (80% of investment)",
        "Manageable payback: 14 months to break-even",
        "Sustainable growth: Built on reinvested profits"
      ],
      
      "cons": [
        "Slower growth: Takes 3 years to reach full profitability",
        "Lower 3-year profits: $190k vs. $450k in aggressive scenario",
        "Limited expansion capital: Profits must go to operations, not growth"
      ],
      
      "comparisonMetrics": {
        "riskLevel": "LOW",
        "breakEvenSpeed": "SLOWEST (14 months)",
        "capitalNeeded": "LOWEST ($113k)",
        "bestFor": "Conservative investor, first-time entrepreneur, risk-averse"
      }
    },
    
    {
      "scenarioId": "scenario-2",
      "name": "Base Case (Balanced)",
      "strategy": "Moderate investment, balanced growth, standard risk",
      "description": "Standard expansion approach. Invest moderately for good positioning. Break-even in 9-10 months. Best for most businesses.",
      "assumption": "Healthy 3,000/month sales Year 1, growing to 5,500/month by Year 3",
      
      "investmentBreakdown": {
        "leaseDeposit": 8400,
        "buildout": 80000,
        "equipment": 55000,
        "preOpening": 15000,
        "workingCapital": 40000,
        "total": 198400
      },
      
      "monthlyOperatingCosts": {
        "rent": 2800,
        "payroll": 8000,
        "cogs": 12000,
        "utilities": 700,
        "marketing": 1000,
        "insurance": 450,
        "misc": 700,
        "total": 25650
      },
      
      "revenueProjections": {
        "year1": 360000,
        "year2": 550000,
        "year3": 660000,
        "year1MonthlyAvg": 30000
      },
      
      "financialMetrics": {
        "breakEvenMonth": 10,
        "breakEvenMonthlyRevenue": 25650,
        "total3YearRevenue": 1570000,
        "total3YearProfit": 450000,
        "roi": 2.27,
        "paybackPeriod": "10 months",
        "requiredFunding": 145000,
        "ownerEquityNeeded": 53400
      },
      
      "fundingRecommendation": {
        "sbaLoan": 100000,
        "equipmentFinance": 50000,
        "lineOfCredit": 20000,
        "ownerEquity": 28400,
        "total": 198400
      },
      
      "pros": [
        "Balanced approach: Moderate investment for good return",
        "Quick break-even: Month 10 is industry standard",
        "Strong 3-year profit: $450k cumulative profit",
        "Growth capacity: Enough capital to support Phase 2 expansion"
      ],
      
      "cons": [
        "Higher debt: $170k total borrowing (86% of investment)",
        "Moderate cash flow: Tight first 12 months",
        "Execution risk: Requires good operations to hit projections"
      ],
      
      "comparisonMetrics": {
        "riskLevel": "MEDIUM",
        "breakEvenSpeed": "STANDARD (10 months)",
        "capitalNeeded": "MODERATE ($198k)",
        "bestFor": "Growth-minded entrepreneur, some experience, moderate risk tolerance"
      }
    },
    
    {
      "scenarioId": "scenario-3",
      "name": "Aggressive Growth",
      "strategy": "High investment, fast growth, higher risk/reward",
      "description": "Heavy upfront investment for market dominance. Premium positioning, rapid growth. Best for well-capitalized businesses.",
      "assumption": "Strong 4,500/month sales Year 1, growing to 7,500/month by Year 3",
      
      "investmentBreakdown": {
        "leaseDeposit": 8400,
        "buildout": 150000,
        "equipment": 85000,
        "preOpening": 25000,
        "workingCapital": 80000,
        "total": 348400
      },
      
      "monthlyOperatingCosts": {
        "rent": 2800,
        "payroll": 12000,
        "cogs": 18000,
        "utilities": 800,
        "marketing": 2000,
        "insurance": 500,
        "misc": 1000,
        "total": 37100
      },
      
      "revenueProjections": {
        "year1": 540000,
        "year2": 750000,
        "year3": 900000,
        "year1MonthlyAvg": 45000
      },
      
      "financialMetrics": {
        "breakEvenMonth": 8,
        "breakEvenMonthlyRevenue": 37100,
        "total3YearRevenue": 2190000,
        "total3YearProfit": 880000,
        "roi": 2.53,
        "paybackPeriod": "8 months",
        "requiredFunding": 250000,
        "ownerEquityNeeded": 98400
      },
      
      "fundingRecommendation": {
        "sbaLoan": 150000,
        "equipmentFinance": 80000,
        "lineOfCredit": 50000,
        "ownerEquity": 68400,
        "total": 348400
      },
      
      "pros": [
        "Fastest break-even: Month 8 (2 months faster than base case)",
        "Highest profit: $880k in 3 years (2x base case)",
        "Market dominance: Premium store positioning, strong brand",
        "Scalability: Capital for Phase 2 & Phase 3 expansion"
      ],
      
      "cons": [
        "Highest investment: $348k required (2.5x conservative scenario)",
        "Heavy debt burden: $280k borrowing, tight cash flow Year 1",
        "Execution critical: Must hit aggressive sales targets",
        "Market risk: Revenue shortfall could be painful"
      ],
      
      "comparisonMetrics": {
        "riskLevel": "HIGH",
        "breakEvenSpeed": "FASTEST (8 months)",
        "capitalNeeded": "HIGHEST ($348k)",
        "bestFor": "Well-capitalized investor, experienced operator, high risk tolerance"
      }
    }
  ],
  "nextStep": "User selects one financial scenario. Selection saved to shared state for market research agent."
}
```

---

## AGENT 3: MARKET RESEARCHER

### Job: Identify market strategies based on selected location + financial scenario

### User Experience Flow

1. **Agent Receives Selections**
   - From SHARED STATE: 
     - Location: Mueller Suburban (Option 2)
     - Financial Scenario: Base Case
   - Agent knows: $2,800 rent, $30k monthly revenue target, $198k investment

2. **Agent Generates MARKET STRATEGY OPTIONS**
   - NOT: "This market looks good"
   - YES: "Here are 3 market strategies, each with different positioning"

3. **Frontend Visualizes Strategies**
   - Shows 3 strategy cards side-by-side
   - Each card shows:
     - Strategy name (Premium/Value/Niche)
     - Target customer profile
     - Competitive positioning
     - Marketing approach
     - Key metrics (TAM, market share, growth)
     - Pros (3-4 benefits)
     - Cons (2-3 drawbacks)

4. **User Interaction**
   - User reviews 3 market strategies
   - User selects preferred strategy
   - Selection saved to SHARED STATE

### Agent Instructions (For Claude)

```
You are a Market Researcher Agent.

CONTEXT: User selected:
- Location: Mueller Suburban Austin (Option 2)
- Financial Scenario: Base Case
- You know: $30k/month revenue target

TASK: Generate 3 MARKET STRATEGY OPTIONS.

Each strategy represents a different way to compete in this market:
1. PREMIUM POSITIONING (High price, high quality, exclusive)
2. VALUE POSITIONING (Lower price, good quality, volume-based)
3. NICHE POSITIONING (Specialized offering, loyal customer base)

For each strategy, provide:

STRATEGY OVERVIEW:
- Name: [Strategy Name]
- Positioning: [How you position against competitors]
- Target Customer: [Who you're targeting]
- Key Message: [What your brand stands for]

MARKET ANALYSIS:
- Total Addressable Market (TAM): $X/year in Mueller area
- Target Market Size (SAM): $X/year (your niche)
- Market Growth Rate: X%/year
- Current Competition: X direct competitors
- Your Projected Market Share: X% (Year 3)
- Equivalent Revenue: $X/year

CUSTOMER PROFILE:
- Primary: [Demographics and psychographics]
- Secondary: [Alternative customer segments]
- Buying Behavior: [How they shop, what drives decisions]
- Price Sensitivity: [Low/Medium/High]

COMPETITIVE POSITIONING:
- Vs. Competitor A: [How you differentiate]
- Vs. Competitor B: [How you differentiate]
- Vs. Competitor C: [How you differentiate]
- Key Differentiator: [Your competitive advantage]

PRICING STRATEGY:
- Price Point: $ per transaction
- Average Order Value: $X
- Price vs. Competitors: [Premium/Parity/Discount]
- Profit Margin: X%

MARKETING APPROACH:
- Primary Channel: [Social media / Local / Events / etc.]
- Secondary Channels: [Additional channels]
- Marketing Budget: $X/month (from your operating budget)
- Key Message: [What you communicate]
- Customer Acquisition Cost (CAC): $X
- Lifetime Value (LTV): $X
- LTV:CAC Ratio: X:1 (healthy is >3:1)

GROWTH TACTICS:
- Tactic 1: [Specific growth lever]
- Tactic 2: [Specific growth lever]
- Tactic 3: [Specific growth lever]

PROS (Why choose this strategy):
- Pro 1: [Specific benefit]
- Pro 2: [Specific benefit]
- Pro 3: [Specific benefit]

CONS (Challenges of this strategy):
- Con 1: [Specific challenge]
- Con 2: [Specific challenge]

MARKET OPPORTUNITY:
- Opportunity Score: X/10
- Growth Potential: [Low/Medium/High]
- Timeline to Dominance: [Fast/Medium/Slow]
- Best Case Scenario: [Optimistic outcome]
- Worst Case Scenario: [Pessimistic outcome]

FORMAT OUTPUT AS JSON:
{
  "agentName": "Market Researcher",
  "actionType": "SELECT_MARKET_STRATEGY",
  "selectedLocation": "Mueller Suburban Austin",
  "selectedFinancialScenario": "Base Case",
  "userPrompt": "Select the market strategy that aligns with your brand and customer base",
  "strategies": [
    {
      "strategyId": "strategy-1",
      "name": "Premium Positioning",
      "positioning": "High quality, exclusive experience, premium pricing",
      "targetCustomer": "Affluent professionals, quality-focused, willing to pay for excellence",
      "keyMessage": "We offer the finest quality and experience in the market",
      
      "marketAnalysis": {
        "tam": 45000000,
        "sam": 12000000,
        "growthRate": 6,
        "directCompetitors": 2,
        "projectedMarketShare": 8,
        "equivalentRevenue": 960000
      },
      
      "customerProfile": {
        "primary": "35-55 years old, household income $90k+, quality-focused, willing to pay premium",
        "secondary": "Young professionals wanting premium experience, gift purchasers",
        "buyingBehavior": "Research before purchase, read reviews, value exclusivity",
        "priceSensitivity": "LOW - will pay more for quality"
      },
      
      "competitivePositioning": {
        "vsCompetitorA": "More premium, better customer service, exclusive items",
        "vsCompetitorB": "Higher quality products, enhanced experience, membership benefits",
        "vsCompetitorC": "We don't compete directly - different target market",
        "keyDifferentiator": "Premium quality + exceptional customer service + exclusive membership"
      },
      
      "pricingStrategy": {
        "pricePoint": 45,
        "averageOrderValue": 135,
        "priceVsCompetitors": "PREMIUM (30% higher than competitors)",
        "profitMargin": 55
      },
      
      "marketingApproach": {
        "primaryChannel": "Social media (Instagram) + Email marketing to affluent segment",
        "secondaryChannels": ["Local partnerships with premium brands", "Referral program", "In-store events"],
        "marketingBudget": 1500,
        "keyMessage": "Experience excellence - Premium quality, exclusive membership, VIP service",
        "cac": 45,
        "ltv": 2700,
        "ltv_cac_ratio": "60:1 (exceptional)"
      },
      
      "growthTactics": [
        "VIP membership program with exclusive benefits",
        "Partnerships with luxury brands for co-marketing",
        "Premium in-store experience (lighting, music, design)"
      ],
      
      "pros": [
        "High profit margins: 55% (vs. 30% value strategy)",
        "Strong customer loyalty: Premium customers are loyal",
        "Excellent CAC efficiency: 60:1 LTV:CAC ratio",
        "Less price competition: Premium market has fewer competitors"
      ],
      
      "cons": [
        "Smaller addressable market: Only affluent customers",
        "Higher brand building costs: Need premium positioning",
        "Slower volume growth: Fewer customers but higher value"
      ],
      
      "marketOpportunity": {
        "opportunityScore": 8,
        "growthPotential": "HIGH",
        "timelineToDominance": "MEDIUM (18-24 months)",
        "bestCaseScenario": "Dominate premium segment, 8% market share, $960k annual revenue",
        "worstCaseScenario": "Market size smaller than expected, 4% market share, $480k revenue"
      }
    },
    
    {
      "strategyId": "strategy-2",
      "name": "Value Positioning",
      "positioning": "Good quality at competitive prices, accessible to mass market",
      "targetCustomer": "Budget-conscious families, students, price-sensitive shoppers",
      "keyMessage": "Great quality at prices you can afford",
      
      "marketAnalysis": {
        "tam": 45000000,
        "sam": 18000000,
        "growthRate": 5,
        "directCompetitors": 4,
        "projectedMarketShare": 12,
        "equivalentRevenue": 2160000
      },
      
      "customerProfile": {
        "primary": "25-45 years old, household income $40-70k, value-conscious, family-oriented",
        "secondary": "Students, young professionals starting out, bulk buyers",
        "buyingBehavior": "Price-comparison shopping, look for deals, attracted to discounts",
        "priceSensitivity": "HIGH - price is primary decision factor"
      },
      
      "competitivePositioning": {
        "vsCompetitorA": "Similar quality, lower prices, larger selection",
        "vsCompetitorB": "Better prices, more frequent promotions",
        "vsCompetitorC": "More locations, easier access",
        "keyDifferentiator": "Best value in market + frequent promotions + loyalty rewards"
      },
      
      "pricingStrategy": {
        "pricePoint": 28,
        "averageOrderValue": 85,
        "priceVsCompetitors": "DISCOUNT (20% lower than competitors)",
        "profitMargin": 30
      },
      
      "marketingApproach": {
        "primaryChannel": "Local deals platforms (Groupon, etc) + Loyalty app + Email",
        "secondaryChannels": ["Word-of-mouth / community groups", "Limited-time promotions", "Volume-based incentives"],
        "marketingBudget": 1000,
        "keyMessage": "Best value in Mueller - Quality products, unbeatable prices, loyalty rewards",
        "cac": 20,
        "ltv": 1275,
        "ltv_cac_ratio": "64:1 (exceptional)"
      },
      
      "growthTactics": [
        "Loyalty program with point accumulation and discounts",
        "Seasonal promotions and flash sales",
        "Volume discounts for bulk purchases"
      ],
      
      "pros": [
        "Larger market size: Budget-conscious is bigger segment",
        "Higher volume potential: More customers = more transactions",
        "Strong loyalty: Repeat customers due to value proposition",
        "Lower marketing complexity: Price speaks for itself"
      ],
      
      "cons": [
        "Lower profit margins: 30% vs. 55% premium",
        "Price competition intense: Must continuously optimize costs",
        "Less differentiation: Competing primarily on price"
      ],
      
      "marketOpportunity": {
        "opportunityScore": 7,
        "growthPotential": "HIGH (higher volume)",
        "timelineToDominance": "MEDIUM-FAST (12-18 months)",
        "bestCaseScenario": "Dominate mass market, 12% market share, $2.16M annual revenue",
        "worstCaseScenario": "Margin compression from competition, 8% market share, $1.44M revenue"
      }
    },
    
    {
      "strategyId": "strategy-3",
      "name": "Niche Positioning",
      "positioning": "Specialized offering for specific customer segment, deeply focused",
      "targetCustomer": "Environmentally conscious, ethical shoppers, sustainability-focused community",
      "keyMessage": "Eco-friendly, ethical products for conscious consumers",
      
      "marketAnalysis": {
        "tam": 45000000,
        "sam": 5000000,
        "growthRate": 12,
        "directCompetitors": 1,
        "projectedMarketShare": 25,
        "equivalentRevenue": 1250000
      },
      
      "customerProfile": {
        "primary": "28-50 years old, college-educated, household income $70k+, eco-conscious, willing to pay for values alignment",
        "secondary": "Corporate buyers wanting to source ethical products",
        "buyingBehavior": "Values-driven, willing to pay premium for alignment with beliefs",
        "priceSensitivity": "LOW - values alignment matters more than price"
      },
      
      "competitivePositioning": {
        "vsCompetitorA": "We're specialized in eco-friendly; they offer mixed products",
        "vsCompetitorB": "Better selection of sustainable options",
        "vsCompetitorC": "We focus on ethics; they focus on price",
        "keyDifferentiator": "Curated eco-friendly selection + transparent sourcing + community advocacy"
      },
      
      "pricingStrategy": {
        "pricePoint": 40,
        "averageOrderValue": 110,
        "priceVsCompetitors": "PREMIUM (25% higher, justified by eco-credentials)",
        "profitMargin": 48
      },
      
      "marketingApproach": {
        "primaryChannel": "Social media (environmental communities) + Partnership with environmental orgs",
        "secondaryChannels": ["Community events", "Local environmental partnerships", "Press/PR about sustainability"],
        "marketingBudget": 1200,
        "keyMessage": "Shop with values - Eco-friendly products, transparent sourcing, community impact",
        "cac": 30,
        "ltv": 2200,
        "ltv_cac_ratio": "73:1 (exceptional)"
      },
      
      "growthTactics": [
        "Partner with environmental nonprofits for credibility",
        "Sustainability report and transparency initiatives",
        "Community events and environmental advocacy"
      ],
      
      "pros": [
        "Passionate customer base: High loyalty and advocacy",
        "Fastest growing segment: 12% annual growth (highest)",
        "Less competition: Only 1 direct niche competitor",
        "Strong margins: Can charge premium for values alignment",
        "Brand differentiation: Clear positioning in market"
      ],
      
      "cons": [
        "Smaller market: Niche limits total addressable market",
        "Startup brand required: Must establish credibility in eco-space",
        "Dependency on sourcing: Quality/ethics of suppliers critical"
      ],
      
      "marketOpportunity": {
        "opportunityScore": 9,
        "growthPotential": "HIGHEST (fastest-growing segment)",
        "timelineToDominance": "FAST (10-14 months)",
        "bestCaseScenario": "Dominate niche, 25% market share, $1.25M annual revenue, brand recognition",
        "worstCaseScenario": "Credibility challenge, 12% market share, $600k revenue"
      }
    }
  ],
  "nextStep": "User selects one market strategy. Selection saved to shared state for risk manager agent."
}
```

---

## AGENT 4: RISK MANAGER

### Job: Identify risks and generate risk management strategies

### User Experience Flow

1. **Agent Receives Selections**
   - From SHARED STATE:
     - Location: Mueller Suburban
     - Financial: Base Case
     - Market Strategy: Niche Eco-Friendly
   - Agent synthesizes all data

2. **Agent Generates RISK MANAGEMENT PROFILES**
   - NOT: "You have medium risk"
   - YES: "Here are 3 risk management approaches, each with different strategies"

3. **Frontend Visualizes Risk Profiles**
   - Shows 3 risk cards side-by-side
   - Each card shows:
     - Risk profile name (Conservative/Balanced/Aggressive)
     - Risk score (1-10)
     - Top risks (3-4 biggest threats)
     - Mitigation strategy for each
     - Contingency plans
     - Pros (why choose this approach)
     - Cons (trade-offs)

4. **User Interaction**
   - User reviews 3 risk management approaches
   - User selects preferred approach
   - Selection saved to SHARED STATE

### Agent Instructions (For Claude)

```
You are a Risk Manager Agent.

CONTEXT: User selected:
- Location: Mueller Suburban Austin
- Financial: Base Case ($198k investment)
- Market Strategy: Niche Eco-Friendly

TASK: Generate 3 RISK MANAGEMENT PROFILES.

Each profile represents a different risk tolerance:
1. CONSERVATIVE (Minimize risks, many safeguards)
2. BALANCED (Reasonable risks with protections)
3. AGGRESSIVE (Accept risks for faster growth)

For each profile, provide:

RISK PROFILE OVERVIEW:
- Name: [Profile Name]
- Philosophy: [Risk management approach]
- Risk Tolerance: [Conservative/Balanced/Aggressive]
- Contingency Budget: $X (set aside for problems)

RISK ASSESSMENT:
Identify top risks specific to this combination:
- Location Risk: Mueller suburban area dynamics
- Financial Risk: Base case break-even dynamics
- Market Risk: Niche eco-friendly positioning
- Operational Risk: First-time expansion
- Competition Risk: Market response to entry

For each risk, rate:
- Severity: HIGH / MEDIUM / LOW
- Likelihood: HIGH / MEDIUM / LOW
- Impact: $ amount if risk materializes

TOP RISKS (3-5):
- Risk 1: [Specific risk description]
  * Severity: HIGH
  * Likelihood: MEDIUM
  * Impact if occurs: $X
  * Mitigation: [Specific action]
  * Contingency: [If mitigation fails, do this]

MITIGATION STRATEGIES:
- Strategy 1: [What to do proactively]
- Strategy 2: [What to do proactively]
- Strategy 3: [What to do proactively]

CONTINGENCY PLANS (If/Then):
- If [trigger condition], then [specific action]
- If [trigger condition], then [specific action]
- If [trigger condition], then [specific action]

MONITORING APPROACH:
- Key Metrics to Track: [Specific KPIs]
- Check Frequency: [Daily/Weekly/Monthly]
- Decision Points: [When to pivot/continue]

FINANCIAL BUFFERS:
- Operating Reserve: $X (emergency fund)
- Marketing Buffer: $X (if need extra promotion)
- Contingency Fund: $X (unforeseen issues)
- Total Contingency: $X

PROS (Why choose this risk approach):
- Pro 1: [Specific benefit]
- Pro 2: [Specific benefit]

CONS (Trade-offs of this approach):
- Con 1: [Specific trade-off]
- Con 2: [Specific trade-off]

FORMAT OUTPUT AS JSON:
{
  "agentName": "Risk Manager",
  "actionType": "SELECT_RISK_MANAGEMENT_PROFILE",
  "selectedLocation": "Mueller Suburban Austin",
  "selectedFinancial": "Base Case",
  "selectedStrategy": "Niche Eco-Friendly",
  "userPrompt": "Select the risk management approach that matches your risk tolerance and experience level",
  "riskProfiles": [
    {
      "profileId": "profile-1",
      "name": "Conservative Risk Management",
      "philosophy": "Minimize risks through heavy safeguards and contingencies",
      "riskTolerance": "CONSERVATIVE - First-time entrepreneur or risk-averse",
      "contingencyBudget": 50000,
      
      "riskAssessment": {
        "risks": [
          {
            "risk": "Sourcing Risk - Eco-friendly suppliers fail or increase prices",
            "severity": "HIGH",
            "likelihood": "MEDIUM",
            "impact": 25000,
            "mitigation": "Identify and lock in 2 backup suppliers 3 months before opening",
            "contingency": "If both suppliers fail, source from established eco-distributors (higher cost but guaranteed supply)"
          },
          {
            "risk": "Market Adoption Risk - Customers don't value eco-positioning as much as expected",
            "severity": "HIGH",
            "likelihood": "MEDIUM",
            "impact": 35000,
            "mitigation": "Pre-launch customer surveys in Mueller area (50+ eco-conscious respondents)",
            "contingency": "If adoption slow by month 3, shift to secondary market segment (young professionals)"
          },
          {
            "risk": "Revenue Risk - Sales fall 20% below projections ($30k → $24k/month)",
            "severity": "MEDIUM",
            "likelihood": "MEDIUM",
            "impact": 50000,
            "mitigation": "Conservative sales forecast (assume 80% of base case), build 6-month cash buffer",
            "contingency": "If revenue <$25k by month 4, reduce hours/staff, increase marketing spend by 50%"
          },
          {
            "risk": "Staffing Risk - Can't find eco-aligned employees, high turnover",
            "severity": "MEDIUM",
            "likelihood": "MEDIUM",
            "impact": 20000,
            "mitigation": "Recruit 6 months early, offer benefits attracting values-aligned candidates",
            "contingency": "If turnover >30%, invest in retention bonuses and flexible scheduling"
          },
          {
            "risk": "Competition Risk - Established competitor opens similar eco-store",
            "severity": "MEDIUM",
            "likelihood": "LOW",
            "impact": 40000,
            "mitigation": "Build brand loyalty early (first-mover advantage), create community partnerships",
            "contingency": "If competitor opens, double-down on customer experience and loyalty program"
          }
        ]
      },
      
      "mitigationStrategies": [
        "Lock in 2 backup suppliers 3 months pre-launch",
        "Conduct 50+ customer surveys before opening",
        "Build 6-month operating cash buffer",
        "Pre-hire staff 6 months early",
        "Establish partnerships with environmental nonprofits"
      ],
      
      "contingencyPlans": [
        {
          "trigger": "If supplier fails within first 3 months",
          "action": "Activate backup supplier (pre-identified), absorb 10% cost increase"
        },
        {
          "trigger": "If revenue <$25k/month by month 4",
          "action": "Increase marketing spend $1,500 → $3,000/month, cut hours to reduce costs"
        },
        {
          "trigger": "If staff turnover >30% by month 6",
          "action": "Offer $500/month retention bonus to key staff"
        },
        {
          "trigger": "If customer adoption is slow (niche doesn't respond)",
          "action": "Pivot marketing to secondary segment (young professionals), test new messaging"
        }
      ],
      
      "monitoringApproach": {
        "keyMetrics": [
          "Daily revenue tracking vs. projection",
          "Weekly supplier order fulfillment %",
          "Weekly staff hours and satisfaction score",
          "Monthly customer acquisition cost vs. budget",
          "Monthly inventory movement"
        ],
        "checkFrequency": "WEEKLY team reviews of all metrics",
        "decisionPoints": [
          "Month 1: Any supply issues? Activate backup?",
          "Month 3: Revenue tracking >80% of plan? If not, increase marketing",
          "Month 6: Customer base growing as expected? Adjust strategy if not"
        ]
      },
      
      "financialBuffers": {
        "operatingReserve": 20000,
        "marketingBuffer": 10000,
        "staffingBuffer": 10000,
        "contingencyFund": 10000,
        "totalContingency": 50000
      },
      
      "pros": [
        "Maximum safety: 50k contingency fund = 19% of investment",
        "Early warning system: Weekly monitoring catches problems fast",
        "Prepared for worst case: Multiple backup plans for each risk",
        "Sleep well: Heavy safeguards reduce stress"
      ],
      
      "cons": [
        "Slower growth: Conservative approach limits upside",
        "Higher costs: Backup suppliers, extra staff cost more",
        "Delayed action: Must wait for triggers before pivoting",
        "Overengineered: May create unnecessary complexity"
      ]
    },
    
    {
      "profileId": "profile-2",
      "name": "Balanced Risk Management",
      "philosophy": "Accept reasonable risks with smart protections",
      "riskTolerance": "BALANCED - Some experience or moderate confidence",
      "contingencyBudget": 30000,
      
      "riskAssessment": {
        "risks": [
          {
            "risk": "Sourcing Risk - Eco-friendly suppliers fail or increase prices",
            "severity": "HIGH",
            "likelihood": "MEDIUM",
            "impact": 25000,
            "mitigation": "Identify 1-2 backup suppliers before opening, negotiate flexible ordering",
            "contingency": "If primary supplier fails, switch to backup within 2 weeks"
          },
          {
            "risk": "Market Adoption Risk - Customers don't fully embrace eco-positioning",
            "severity": "HIGH",
            "likelihood": "MEDIUM",
            "impact": 35000,
            "mitigation": "Pre-launch customer validation (conversations with 20+ eco-conscious customers)",
            "contingency": "If adoption slow by month 2, test secondary messaging/positioning"
          },
          {
            "risk": "Revenue Risk - Sales fall 15% below projections ($30k → $25.5k/month)",
            "severity": "MEDIUM",
            "likelihood": "MEDIUM",
            "impact": 40000,
            "mitigation": "Base projections on moderate assumptions (85% of market potential)",
            "contingency": "If revenue <$26k by month 5, increase marketing and analyze customer feedback"
          },
          {
            "risk": "Staffing Risk - Initial team needs training, potential turnover",
            "severity": "MEDIUM",
            "likelihood": "MEDIUM",
            "impact": 15000,
            "mitigation": "Hire 3 months early, provide training, competitive compensation",
            "contingency": "If turnover >25%, review compensation and culture"
          }
        ]
      },
      
      "mitigationStrategies": [
        "Validate market with 20+ customer conversations before opening",
        "Identify 1-2 backup suppliers, negotiate terms",
        "Build 3-4 month operating cash buffer",
        "Hire team 3 months early with training period"
      ],
      
      "contingencyPlans": [
        {
          "trigger": "If supplier issues within 2 months",
          "action": "Activate backup supplier, monitor quality/cost"
        },
        {
          "trigger": "If revenue <$26k/month by month 5",
          "action": "Increase marketing 30%, gather customer feedback, test new messaging"
        },
        {
          "trigger": "If staff turnover >25% by month 6",
          "action": "Review compensation and working environment, adjust if needed"
        }
      ],
      
      "monitoringApproach": {
        "keyMetrics": [
          "Weekly revenue vs. projection",
          "Monthly supplier reliability %",
          "Monthly staff turnover rate",
          "Bi-weekly customer feedback and Net Promoter Score"
        ],
        "checkFrequency": "BI-WEEKLY team reviews",
        "decisionPoints": [
          "Month 2: Revenue tracking? Supplier performing?",
          "Month 5: Hit revenue targets? If not, adjust",
          "Month 8: Ready to evaluate Phase 2 expansion?"
        ]
      },
      
      "financialBuffers": {
        "operatingReserve": 15000,
        "marketingBuffer": 8000,
        "staffingBuffer": 5000,
        "contingencyFund": 2000,
        "totalContingency": 30000
      },
      
      "pros": [
        "Good balance: Prepared for issues without being over-cautious",
        "Flexible: Can pivot quickly if needed",
        "Growth-focused: Less contingency = more capital for growth",
        "Practical: Focus on real risks, not hypothetical scenarios"
      ],
      
      "cons": [
        "Less buffer: 30k contingency = 15% of investment (medium safety net)",
        "Faster decision-making required: Less time to decide before acting",
        "Some risks unmitigated: Not every scenario has a backup plan"
      ]
    },
    
    {
      "profileId": "profile-3",
      "name": "Aggressive Risk Management",
      "philosophy": "Accept higher risks for maximum growth potential",
      "riskTolerance": "AGGRESSIVE - Experienced, confident, high risk tolerance",
      "contingencyBudget": 15000,
      
      "riskAssessment": {
        "risks": [
          {
            "risk": "Market Adoption Risk - Niche positioning doesn't resonate",
            "severity": "HIGH",
            "likelihood": "MEDIUM",
            "impact": 30000,
            "mitigation": "Launch with confidence, adjust positioning if needed within first 90 days",
            "contingency": "If adoption slow, pivot to adjacent market (young professionals) with new messaging"
          },
          {
            "risk": "Revenue Risk - Sales 20% below plan (require faster ramp)",
            "severity": "MEDIUM",
            "likelihood": "MEDIUM",
            "impact": 45000,
            "mitigation": "Aggressive marketing from day 1, expect fast customer acquisition",
            "contingency": "If slow, cut costs and reassess model quickly"
          }
        ]
      },
      
      "mitigationStrategies": [
        "Launch with full confidence in model",
        "Fast-track customer acquisition (aggressive marketing)",
        "Nimble execution - pivot quickly based on early feedback",
        "Assume some risks will materialize and plan to react"
      ],
      
      "contingencyPlans": [
        {
          "trigger": "If adoption slow by month 3",
          "action": "Quickly pivot messaging/positioning based on customer feedback"
        },
        {
          "trigger": "If revenue <$28k/month by month 6",
          "action": "Evaluate model fundamentals, consider format change or close"
        }
      ],
      
      "monitoringApproach": {
        "keyMetrics": [
          "Daily revenue tracking",
          "Weekly customer feedback",
          "Monthly P&L vs. plan"
        ],
        "checkFrequency": "DAILY tracking, MONTHLY decision meetings",
        "decisionPoints": [
          "Month 3: Adoption tracking? Decision point on pivot",
          "Month 6: Revenue target? Go/no-go for Phase 2"
        ]
      },
      
      "financialBuffers": {
        "operatingReserve": 10000,
        "marketingBuffer": 3000,
        "staffingBuffer": 1000,
        "contingencyFund": 1000,
        "totalContingency": 15000
      },
      
      "pros": [
        "Maximum capital for growth: 92% of investment deployed",
        "Fast learning: Early feedback drives quick pivots",
        "Market-first approach: Launch fast, learn from customers",
        "Potential for high returns: Accept risks for higher upside"
      ],
      
      "cons": [
        "Thin safety net: 15k contingency = 7.6% of investment (limited buffer)",
        "Fast decision-making required: No time to deliberate",
        "Risk of failure: If fundamentals wrong, harder to recover",
        "Stress: Always operating near edge of financial capacity"
      ]
    }
  ],
  "nextStep": "User selects risk management profile. Selection saved to shared state for strategic planner agent."
}
```

---

## AGENT 5: STRATEGIC PLANNER

### Job: Synthesize all selections and create comprehensive expansion plan

### User Experience Flow

1. **Agent Receives All Selections**
   - From SHARED STATE:
     - Location: Mueller Suburban (Option 2)
     - Financial: Base Case
     - Market Strategy: Niche Eco-Friendly
     - Risk Profile: Balanced
   - Agent synthesizes everything

2. **Agent Generates EXPANSION ROADMAPS**
   - NOT: "Here's your plan"
   - YES: "Here are 3 expansion roadmaps, each with different pacing and approach"

3. **Frontend Visualizes Roadmaps**
   - Shows 3 roadmap cards side-by-side
   - Each shows:
     - Roadmap name (Conservative/Standard/Aggressive)
     - Timeline visualization (3-4 phases)
     - Investment schedule ($X per phase)
     - Key milestones
     - Success metrics
     - Pros (why choose this roadmap)
     - Cons (trade-offs)

4. **User Interaction**
   - User reviews 3 expansion roadmaps
   - User selects preferred roadmap
   - Final recommendation generated

### Agent Instructions (For Claude)

```
You are a Strategic Planner Agent.

CONTEXT: User has made all selections:
- Location: Mueller Suburban Austin (Option 2)
- Financial: Base Case ($198k investment, $30k/month revenue target, month 10 break-even)
- Market Strategy: Niche Eco-Friendly (premium positioning, sustainability focus)
- Risk Profile: Balanced (30k contingency, weekly monitoring)

TASK: Generate 3 EXPANSION ROADMAPS.

Each roadmap represents a different growth trajectory:
1. CONSERVATIVE EXPANSION (Slow, safe, prove model first)
2. STANDARD EXPANSION (Balanced, proven approach)
3. AGGRESSIVE EXPANSION (Fast growth, quick rollout)

For each roadmap, provide:

ROADMAP OVERVIEW:
- Name: [Roadmap Name]
- Philosophy: [Growth approach]
- Total Timeline: X months (from pilot to mature network)
- Total Investment Needed: $X
- Expected Year 3 Network Revenue: $X
- Expected 3-Year Cumulative Profit: $X

PHASE BREAKDOWN:

PHASE 1: PILOT STORE
- Location: Mueller Suburban Austin
- Months: 0-6 (pilot validation period)
- Investment: $198k
- Revenue Target Year 1: $30k/month by month 6
- Success Criteria: Hit $30k/month, >80% satisfaction, <30% staff turnover
- Decision Point: Month 6 - Go/No-Go for Phase 2

PHASE 2: REGIONAL EXPANSION
- Number of Locations: [Conservative: 2 | Standard: 4 | Aggressive: 6]
- Timeline: [Conservative: months 9-18 | Standard: months 7-15 | Aggressive: months 5-11]
- Investment Per Location: $198k (same as pilot)
- Total Phase 2 Investment: $X (per number of stores)
- Expansion Pace: [Months between openings]
- Revenue Per Store (Year 2): $X/month mature
- Total Network Revenue (Year 2): $X
- Success Criteria: 80%+ of pilot store performance replicated
- Decision Point: Month 12/18 - Go/No-Go for Phase 3

PHASE 3: NETWORK GROWTH
- Number of Locations: [Based on phase 2 success]
- Timeline: [Months 18-30+]
- Investment: $X
- Target Network Size: [X locations by end of Year 3]
- Expected Year 3 Revenue: $X
- Expected Profitability: $X

TIMELINE VISUALIZATION:
[Month 0-6]: Phase 1 - Pilot store launch
[Month 6-9]: Phase 1 - Evaluation + decision
[Month 9-18]: Phase 2 - Regional expansion
[Month 18-30]: Phase 3 - Network growth

INVESTMENT SCHEDULE:
- Phase 1: $198k (upfront)
- Phase 2: $[amount] (staged monthly)
- Phase 3: $[amount] (ongoing)
- Contingency (built-in): $[amount]
- Total: $[amount]

FUNDING STRATEGY:
- Phase 1: SBA loan $100k + Equipment finance $50k + Owner equity $48k
- Phase 2: Cash flow $[X] + SBA expansion loan $[X] + Investor $[X]
- Phase 3: Retained earnings + Growth financing

MILESTONE TIMELINE:
Month 1: Lease signed, buildout starts
Month 3: Grand opening
Month 6: Full evaluation
Month 9: Phase 2 first store opens
Month 12: 2-3 stores operating
Month 18: Phase 2 complete, evaluation
Month 24: Phase 3 underway
Month 30: Network established

SUCCESS METRICS & DECISION POINTS:
- Month 1: Buildout on schedule ✓
- Month 3: Opening successful, initial customer response ✓
- Month 6: Revenue $30k/month ✓
- Month 6: Satisfaction >80%, turnover <30% ✓
- Month 9: Phase 2 store 1 opens ✓
- Month 12: Phase 2 stores hitting targets ✓
- Month 18: All Phase 2 stores mature, ready for Phase 3 ✓
- Month 24: Network profitability ✓
- Month 30: Market dominance in niche, ready to scale ✓

PROS (Why choose this roadmap):
- Pro 1: [Specific benefit]
- Pro 2: [Specific benefit]
- Pro 3: [Specific benefit]

CONS (Challenges of this roadmap):
- Con 1: [Specific challenge]
- Con 2: [Specific challenge]

COMPARISON:
- Growth Speed: [Fast / Medium / Slow]
- Capital Required: [High / Medium / Low]
- Risk Level: [High / Medium / Low]
- Management Complexity: [High / Medium / Low]
- Best For: [Type of entrepreneur]

FORMAT OUTPUT AS JSON:
{
  "agentName": "Strategic Planner",
  "actionType": "FINAL_RECOMMENDATION",
  "selectedLocation": "Mueller Suburban Austin",
  "selectedFinancial": "Base Case",
  "selectedStrategy": "Niche Eco-Friendly",
  "selectedRiskProfile": "Balanced",
  "userPrompt": "Select your expansion roadmap - Choose the growth pace that matches your ambitions and resources",
  "roadmaps": [
    {
      "roadmapId": "roadmap-1",
      "name": "Conservative Expansion",
      "philosophy": "Prove model first, expand slowly with certainty",
      "totalTimeline": "30+ months",
      "totalInvestment": 495000,
      "expectedYear3Revenue": 1440000,
      "expectedYear3Profit": 380000,
      
      "phases": {
        "phase1": {
          "name": "Pilot Store",
          "location": "Mueller Suburban Austin",
          "months": "0-6",
          "investment": 198000,
          "revenueTarget": "30k/month by month 6",
          "successCriteria": ["Hit 30k/month revenue", "Satisfaction >80%", "Staff turnover <20%"],
          "decisionPoint": "Month 6: If all metrics hit, proceed to Phase 2. If not, optimize for 3 more months."
        },
        "phase2": {
          "name": "Regional Expansion - Cautious",
          "numLocations": 2,
          "timeline": "Months 12-18 (first location), 18-24 (second location)",
          "investmentPerLocation": 198000,
          "totalPhase2Investment": 396000,
          "expansionPace": "One location every 6 months",
          "revenuePerStore": "25k/month mature (conservative vs. pilot)",
          "totalNetworkRevenue": 600000,
          "successCriteria": ["New stores hit 80% of pilot performance", "Network cash flow positive"],
          "decisionPoint": "Month 24: If Phase 2 stores mature and profitable, evaluate Phase 3"
        },
        "phase3": {
          "name": "Selective Growth",
          "numLocations": 1,
          "timeline": "Months 24-30",
          "investment": 198000,
          "targetNetworkSize": 4,
          "expectedYear3Revenue": 1440000,
          "expectedYear3Profit": 380000
        }
      },
      
      "timelineVisualization": "Phase 1 (months 0-6) → Evaluation (months 6-12) → Phase 2 (months 12-24) → Evaluation (months 24-30) → Phase 3 (months 24-30+)",
      
      "investmentSchedule": {
        "phase1": 198000,
        "phase2": 396000,
        "phase3": 198000,
        "contingency": 40000,
        "total": 832000,
        "fundingStrategy": "Phase 1: SBA $100k + Equipment $50k + Owner $48k | Phase 2: Cash flow $150k + SBA $246k | Phase 3: Retained earnings"
      },
      
      "milestones": [
        "Month 1: Lease and buildout start",
        "Month 3: Grand opening",
        "Month 6: Full evaluation and metrics review",
        "Month 12: Phase 2 first store opens",
        "Month 18: Phase 2 second store opens",
        "Month 24: All Phase 2 stores mature",
        "Month 30: Phase 3 store opens"
      ],
      
      "successMetrics": {
        "month1": "Buildout on schedule",
        "month3": "Opening successful, customer interest strong",
        "month6": "Revenue 30k/month, satisfaction >80%",
        "month12": "Phase 2 store 1 hits 24k/month (80% of pilot)",
        "month18": "Phase 2 store 2 ramping up",
        "month24": "All stores mature and profitable",
        "month30": "Network revenue 1.44M, ready to scale"
      },
      
      "pros": [
        "Lowest risk: Prove model thoroughly before scaling",
        "Sustainable growth: Each phase funds next phase",
        "Deep market knowledge: Time to understand customer intimately",
        "Strong brand building: Slow, intentional growth builds credibility"
      ],
      
      "cons": [
        "Slowest growth: Only 4 stores by Year 3",
        "Lower total revenue: 1.44M network revenue is conservative",
        "Market window: Competitors may enter niche while expanding slowly",
        "Longer path to dominance: Takes 30+ months vs. 20 months aggressive"
      ],
      
      "comparison": {
        "growthSpeed": "SLOW",
        "capitalRequired": "LOWEST ($832k total)",
        "riskLevel": "LOW",
        "managementComplexity": "LOW",
        "bestFor": "First-time entrepreneur, limited capital, patient investor"
      }
    },
    
    {
      "roadmapId": "roadmap-2",
      "name": "Standard Expansion",
      "philosophy": "Proven approach: Pilot → Fast regional → Selective growth",
      "totalTimeline": "24 months",
      "totalInvestment": 1188000,
      "expectedYear3Revenue": 2640000,
      "expectedYear3Profit": 720000,
      
      "phases": {
        "phase1": {
          "name": "Pilot Store",
          "location": "Mueller Suburban Austin",
          "months": "0-6",
          "investment": 198000,
          "revenueTarget": "30k/month by month 6",
          "successCriteria": ["Hit 30k/month revenue", "Satisfaction >80%", "Replicable model confirmed"],
          "decisionPoint": "Month 6: If metrics hit, proceed immediately to Phase 2"
        },
        "phase2": {
          "name": "Regional Expansion - Standard",
          "numLocations": 4,
          "timeline": "Months 7-15 (new store every 2 months)",
          "investmentPerLocation": 198000,
          "totalPhase2Investment": 792000,
          "expansionPace": "One location every 2 months (faster rollout)",
          "revenuePerStore": "27k/month mature (slightly below pilot due to rapid expansion)",
          "totalNetworkRevenue": 1944000,
          "successCriteria": ["New stores hit 90% of pilot performance", "Network profitability by month 15"],
          "decisionPoint": "Month 15: Phase 2 complete. If successful, proceed to Phase 3"
        },
        "phase3": {
          "name": "Network Consolidation",
          "numLocations": 2,
          "timeline": "Months 16-24",
          "investment": 198000,
          "targetNetworkSize": 7,
          "expectedYear3Revenue": 2640000,
          "expectedYear3Profit": 720000
        }
      },
      
      "timelineVisualization": "Phase 1 (0-6) → Phase 2 (7-15) → Phase 3 (16-24) → Full maturity (months 24+)",
      
      "investmentSchedule": {
        "phase1": 198000,
        "phase2": 792000,
        "phase3": 198000,
        "contingency": 60000,
        "total": 1248000,
        "fundingStrategy": "Phase 1: SBA $100k + Equipment $50k + Owner $48k | Phase 2: Cash flow $200k + SBA $400k + Investor $192k | Phase 3: Retained earnings $198k"
      },
      
      "milestones": [
        "Month 1: Lease and buildout",
        "Month 3: Grand opening",
        "Month 6: Pilot evaluation (GO for Phase 2)",
        "Month 7: Phase 2 store 1 opens",
        "Month 9: Phase 2 store 2 opens",
        "Month 11: Phase 2 store 3 opens",
        "Month 13: Phase 2 store 4 opens",
        "Month 15: All Phase 2 stores operating",
        "Month 16: Phase 3 store 1 opens",
        "Month 24: Network mature and optimized"
      ],
      
      "successMetrics": {
        "month6": "Pilot hits 30k/month, green light for Phase 2",
        "month9": "First 2 Phase 2 stores at 24k+ /month each",
        "month12": "3-4 Phase 2 stores operating, network cash flow positive",
        "month15": "All Phase 2 stores mature, network revenue 1.95M",
        "month20": "Network consolidated, ready for next phase",
        "month24": "7 stores operating, network revenue 2.64M, clear path to profitability"
      },
      
      "pros": [
        "Balanced growth: Fast enough to capture market, slow enough to manage",
        "Strong profitability: 720k profit by year 3",
        "Proven approach: Used by most successful retail chains",
        "Market leadership: 7 stores positions as market leader in niche",
        "Investor appealing: Shows clear growth trajectory"
      ],
      
      "cons": [
        "Moderate capital requirement: 1.25M total investment needed",
        "Execution risk: Must manage rapid opening schedule",
        "Tighter cash flow: First 12 months are stressful financially",
        "Team demands: Rapid expansion requires strong operations team"
      ],
      
      "comparison": {
        "growthSpeed": "STANDARD",
        "capitalRequired": "MODERATE ($1.25M total)",
        "riskLevel": "MEDIUM",
        "managementComplexity": "MEDIUM",
        "bestFor": "Experienced entrepreneur, adequate capital, growth-focused"
      }
    },
    
    {
      "roadmapId": "roadmap-3",
      "name": "Aggressive Expansion",
      "philosophy": "Move fast: Quick pilot → Rapid rollout → Market dominance",
      "totalTimeline": "18 months",
      "totalInvestment": 1584000,
      "expectedYear3Revenue": 3600000,
      "expectedYear3Profit": 1080000,
      
      "phases": {
        "phase1": {
          "name": "Pilot Store",
          "location": "Mueller Suburban Austin",
          "months": "0-4 (accelerated pilot)",
          "investment": 198000,
          "revenueTarget": "28k/month by month 4 (faster ramp)",
          "successCriteria": ["Hit 28k/month quickly", "Model validated", "Ready for rapid scaling"],
          "decisionPoint": "Month 4: If viable, immediately proceed to Phase 2 (no waiting)"
        },
        "phase2": {
          "name": "Rapid Regional Expansion",
          "numLocations": 6,
          "timeline": "Months 5-11 (new store every month)",
          "investmentPerLocation": 198000,
          "totalPhase2Investment": 1188000,
          "expansionPace": "One location every month (aggressive rollout)",
          "revenuePerStore": "24k/month mature (lower due to speed, but high volume offsets)",
          "totalNetworkRevenue": 2016000,
          "successCriteria": ["Achieve 80%+ of pilot performance in new stores", "Network cash flow positive by month 11"],
          "decisionPoint": "Month 11: Phase 2 complete. Assess and prepare Phase 3"
        },
        "phase3": {
          "name": "Market Consolidation & Optimization",
          "numLocations": 1,
          "timeline": "Months 12-18",
          "investment": 198000,
          "targetNetworkSize": 8,
          "expectedYear3Revenue": 3600000,
          "expectedYear3Profit": 1080000
        }
      },
      
      "timelineVisualization": "Phase 1 (0-4) → Phase 2 (5-11) → Phase 3 (12-18) → Scale ready (month 18+)",
      
      "investmentSchedule": {
        "phase1": 198000,
        "phase2": 1188000,
        "phase3": 198000,
        "contingency": 50000,
        "total": 1634000,
        "fundingStrategy": "Phase 1: SBA $100k + Equipment $50k + Owner $48k | Phase 2: Investor $600k + SBA expansion $588k | Phase 3: Cash flow + Growth capital"
      },
      
      "milestones": [
        "Month 1: Lease signed, accelerated buildout",
        "Month 3: Grand opening (fast track)",
        "Month 4: Pilot validation (GO for rapid Phase 2)",
        "Month 5-11: 6 new stores open (1/month pace)",
        "Month 11: Full regional network operating",
        "Month 12-18: Optimization and market consolidation",
        "Month 18: 8-store network, ready for next market entry"
      ],
      
      "successMetrics": {
        "month4": "Pilot at 28k/month, model proven, Phase 2 approval",
        "month6": "2 Phase 2 stores operating, 18k+/month each",
        "month8": "4 Phase 2 stores up, network revenue ramping",
        "month11": "All 6 Phase 2 stores operating, network cash flow positive",
        "month14": "Network revenue 2M+, clear market dominance",
        "month18": "8-store network, 3.6M annual revenue, 1.08M profit"
      },
      
      "pros": [
        "Fastest growth: 8 stores by year 3 (2x conservative approach)",
        "Highest profitability: 1.08M profit vs. 380k conservative",
        "Market dominance: First-mover advantage solidified quickly",
        "Investor magnet: Aggressive growth attracts institutional capital",
        "Economies of scale: 8 stores enables better supplier terms, brand strength"
      ],
      
      "cons": [
        "Highest capital requirement: 1.63M upfront investment",
        "Execution risk: Very tight timeline, no room for mistakes",
        "Team pressure: Rapid expansion requires exceptional operations",
        "Cash flow stress: First 11 months are extremely tight",
        "Market risk: If pilot fails, scale amplifies the problem"
      ],
      
      "comparison": {
        "growthSpeed": "FAST",
        "capitalRequired": "HIGHEST ($1.63M total)",
        "riskLevel": "HIGH",
        "managementComplexity": "HIGH",
        "bestFor": "Experienced entrepreneur, strong team, ample capital, aggressive growth mindset"
      }
    }
  ],
  "finalRecommendation": {
    "recommendedRoadmap": "Standard Expansion",
    "reasoning": "Based on your selected financial scenario (Base Case), market strategy (Niche Eco-Friendly), and risk profile (Balanced), the Standard Expansion roadmap offers the best risk/reward balance. It proves your model thoroughly (Phase 1), scales efficiently (Phase 2), and consolidates before next growth (Phase 3).",
    "projectedOutcome": "By end of Year 3: 7 stores across Mueller metro area, $2.64M annual network revenue, $720k profit. Market leadership in eco-friendly niche established."
  },
  "nextStep": "USER MAKES FINAL DECISION: Tap 'Proceed with Standard Expansion' to finalize and receive detailed implementation guide."
}
```

---

## API/GUI PROTOCOL SUMMARY

### Frontend Sends (API Request)
```json
{
  "agentAction": "SELECT_OPTION",
  "selectedOption": {
    "agentName": "Site Selection Expert",
    "selectedOptionId": "option-2",
    "selectedOptionName": "Mueller Suburban Austin"
  }
}
```

### Backend Returns (API Response)
```json
{
  "status": "success",
  "sharedState": { /* updated state */ },
  "nextAgent": {
    "agentName": "Financial Analyst",
    "actionType": "SELECT_FINANCIAL_SCENARIO",
    "options": [ /* 3 financial scenarios */ ]
  }
}
```

---

## SHARED STATE STRUCTURE

```json
{
  "sessionId": "expansion-001",
  "timestamp": "2026-04-25T10:30:00Z",
  "user": {
    "id": "user-123",
    "businessName": "Eco Retail Co",
    "experience": "3 years"
  },
  
  "expansionAnalysis": {
    "siteSelection": {
      "agentName": "Site Selection Expert",
      "selectedOption": "option-2",
      "selectedName": "Mueller Suburban Austin",
      "metadata": { /* location details */ }
    },
    
    "financial": {
      "agentName": "Financial Analyst",
      "selectedScenario": "scenario-2",
      "selectedName": "Base Case",
      "metadata": { /* financial details */ }
    },
    
    "marketResearch": {
      "agentName": "Market Researcher",
      "selectedStrategy": "strategy-3",
      "selectedName": "Niche Eco-Friendly",
      "metadata": { /* market details */ }
    },
    
    "riskManagement": {
      "agentName": "Risk Manager",
      "selectedProfile": "profile-2",
      "selectedName": "Balanced Risk Management",
      "metadata": { /* risk details */ }
    },
    
    "strategicPlanning": {
      "agentName": "Strategic Planner",
      "selectedRoadmap": "roadmap-2",
      "selectedName": "Standard Expansion",
      "metadata": { /* roadmap details */ }
    }
  }
}
```

---

## KEY PRINCIPLES FOR IMPLEMENTATION

1. **NO CODE YET** - This prompt is specification only. You'll implement with SDK and GUI protocol.

2. **OPTIONS, NOT RECOMMENDATIONS** - Each agent generates 2-3 options with pros/cons. User chooses.

3. **SHARED STATE** - All agents access and update one central state. Each selection influences next agent.

4. **VISUAL COMPARISON** - Frontend displays options side-by-side with clear visualization (cards, metrics, pros/cons).

5. **TAP-TO-PROCEED** - User taps option card to select. Selection saved. Next agent's options appear.

6. **API/GUI PROTOCOL** - Frontend and backend communicate via RESTful API. Frontend is stateless (all state on backend).

7. **TRANSPARENCY** - User sees how each previous selection influences current agent's analysis.

---

## NEXT STEPS FOR DEVELOPMENT

1. **Design API endpoints** for each agent
2. **Define GUI components** for option visualization
3. **Build shared state manager** backend
4. **Implement agent orchestrator** to route between agents
5. **Create frontend cards** showing pros/cons/metrics
6. **Add tap interaction** and selection flow
7. **Test end-to-end** workflow

---

**This is your complete specification. Ready for implementation with SDK + GUI protocol!** 🚀

