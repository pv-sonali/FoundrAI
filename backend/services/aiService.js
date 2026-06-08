const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize API clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Call Gemini or OpenAI to get response. Fallbacks to mock responses if no key configured or error occurs.
 */
async function callAI(prompt, systemInstruction = '', responseFormatJson = false) {
  // If Gemini is configured, use it (recommended for quick and cost-effective text generation)
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: responseFormatJson ? { responseMimeType: 'application/json' } : undefined,
      });
      const result = await model.generateContent(
        systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt
      );
      const text = result.response.text();
      return text;
    } catch (err) {
      console.error('Gemini API Error, trying OpenAI if available:', err);
    }
  }

  // If OpenAI is configured, try OpenAI
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt },
        ],
        response_format: responseFormatJson ? { type: 'json_object' } : undefined,
      });
      return response.choices[0].message.content;
    } catch (err) {
      console.error('OpenAI API Error:', err);
    }
  }

  throw new Error('AI API keys not configured or calls failed.');
}

/**
 * AI IDEA VALIDATION
 */
async function validateIdea(name, description, industry, targetAudience) {
  const systemInstruction = `You are a Y Combinator Mentor and business validation expert. Analyze the user's startup idea. Return a strict JSON response with the following keys:
  {
    "score": number (0 to 100),
    "marketOpportunity": "string analysis of market opportunity",
    "swot": {
      "strengths": ["string"],
      "weaknesses": ["string"],
      "opportunities": ["string"],
      "threats": ["string"]
    },
    "risks": ["string"],
    "suggestions": ["string"]
  }`;

  const prompt = `Startup Name: ${name}
Description: ${description}
Industry: ${industry}
Target Audience: ${targetAudience}`;

  try {
    const raw = await callAI(prompt, systemInstruction, true);
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Using fallback data for Idea Validation:', err.message);
    // Dynamic mock response
    return {
      score: Math.floor(Math.random() * 20) + 72, // 72 to 92
      marketOpportunity: `The ${industry} industry is experiencing rapid growth, driven by changes in consumer expectations and digital transformation. Launching ${name} to target ${targetAudience} addresses a distinct market friction. Direct growth pathways exist if retention and customer acquisition costs are managed early.`,
      swot: {
        strengths: [
          `Clear value proposition centered on solving key pain points for ${targetAudience}`,
          `Strong industry alignment with modern trends`,
          `Scalable business model utilizing technology integration`,
        ],
        weaknesses: [
          `Potential high customer education requirement in the ${industry} sector`,
          `Dependency on initial user feedback loops and rapid product iterations`,
          `Initial brand trust challenges against legacy alternatives`,
        ],
        opportunities: [
          `Unserved niche within ${targetAudience} that competitors ignore`,
          `Strategic partnerships with complementary services in the ${industry} market`,
          `Potential to introduce modular premium features as scale increases`,
        ],
        threats: [
          `Aggressive marketing responses from established competitors`,
          `Rising digital acquisition costs across Google and social channels`,
          `Regulatory or security standards in the ${industry} space`,
        ],
      },
      risks: [
        `Operational Risk: Ensuring consistent quality during early user onboarding.`,
        `Acquisition Risk: High dependency on paid channels if organic word of mouth is slow.`,
        `Technical Risk: Building a robust enough MVP to retain users.`,
      ],
      suggestions: [
        `Conduct 10 structured interviews with members of your target audience (${targetAudience}) this week.`,
        `Develop a simple landing page and measure conversion rates on a mock 'Join Waitlist' button.`,
        `Keep the MVP strictly focused on solving one single primary pain point instead of adding multiple features.`,
      ],
    };
  }
}

/**
 * AI MARKET RESEARCH ENGINE
 */
async function generateMarketResearch(name, description, industry, targetAudience) {
  const systemInstruction = `You are a Market Research Analyst. Analyze the market for this startup. Estimate TAM, SAM, and SOM in USD numbers. Provide trends, customer pain points, and opportunities.
  Return a strict JSON response with the following keys:
  {
    "tam": number (Total Addressable Market in USD),
    "sam": number (Serviceable Addressable Market in USD),
    "som": number (Serviceable Obtainable Market in USD),
    "explanation": "string explaining how you arrived at these market sizes",
    "trends": ["string"],
    "painPoints": ["string"],
    "growthOpportunities": ["string"]
  }`;

  const prompt = `Startup Name: ${name}
Description: ${description}
Industry: ${industry}
Target Audience: ${targetAudience}`;

  try {
    const raw = await callAI(prompt, systemInstruction, true);
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Using fallback data for Market Research:', err.message);
    const baseVal = Math.floor(Math.random() * 5) + 5; // 5B - 9B
    return {
      tam: baseVal * 1000000000,
      sam: Math.floor(baseVal * 0.15) * 1000000000 || 800000000,
      som: Math.floor(baseVal * 0.015) * 1000000000 || 80000000,
      explanation: `TAM is calculated based on the global market size of the ${industry} industry (estimated at $${baseVal}B). SAM represents the portion of the market that matches our specific tech product and delivery channel ($${(baseVal * 0.15).toFixed(1)}B). SOM is our realistic target capture (10% of SAM or 1.5% of TAM) in the next 3 years using our targeted marketing campaigns towards ${targetAudience}.`,
      trends: [
        `Accelerating migration to specialized cloud platforms in the ${industry} space`,
        `Increasing demand for data-driven, personalized solutions among ${targetAudience}`,
        `Integration of predictive AI models to automate legacy workflows`,
      ],
      painPoints: [
        `High cost and long setup times of current legacy solutions`,
        `Lack of integration between disparate tools used by ${targetAudience}`,
        `Complex, unintuitive user interfaces that require specialized training`,
      ],
      growthOpportunities: [
        `Unlocking viral growth loop mechanics by facilitating peer sharing`,
        `Expanding services internationally by adapting to localized parameters`,
        `Offering custom enterprise configurations for high-volume users`,
      ],
    };
  }
}

/**
 * COMPETITOR INTELLIGENCE
 */
async function generateCompetitors(name, description, industry, targetAudience) {
  const systemInstruction = `You are a Competitor Intelligence Analyst. Identify 3 actual or realistic competitors for this startup. Provide strengths, weaknesses, pricing strategy, and market gaps we can exploit.
  Return a strict JSON response with the following keys:
  {
    "competitors": [
      {
        "name": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "pricing": "string",
        "marketGaps": ["string"]
      }
    ]
  }`;

  const prompt = `Startup Name: ${name}
Description: ${description}
Industry: ${industry}
Target Audience: ${targetAudience}`;

  try {
    const raw = await callAI(prompt, systemInstruction, true);
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Using fallback data for Competitor Intelligence:', err.message);
    return {
      competitors: [
        {
          name: 'LegacyCorp Solutions',
          strengths: ['Huge market share', 'Deep pockets', 'Established brand trust'],
          weaknesses: ['Extremely slow product updates', 'Outdated UI/UX', 'Complex contract onboarding'],
          pricing: '$2,500/yr (Minimum annual contract, no free tier)',
          marketGaps: ['No self-serve signup', 'Lacks AI-driven insights for smaller users'],
        },
        {
          name: 'NovaTech Soft',
          strengths: ['Modern API integrations', 'Strong developer documentation', 'Affordable pricing'],
          weaknesses: ['Poor customer support for non-enterprise clients', 'Lacks specialized features for ' + targetAudience, 'Limited security compliance certificates'],
          pricing: '$49/mo to $199/mo',
          marketGaps: ['Unoptimized dashboard design', 'Does not provide custom action lists'],
        },
        {
          name: 'QuickStart Inc',
          strengths: ['Very simple to use', 'Generous free tier', 'Great marketing presence'],
          weaknesses: ['Cannot scale to handle complex enterprise requirements', 'Data export limitations', 'No customized user roles'],
          pricing: 'Free to $29/mo',
          marketGaps: ['Lacks depth in features', 'Performance slowdowns with high data volumes'],
        },
      ],
    };
  }
}

/**
 * BUSINESS MODEL CANVAS GENERATOR
 */
async function generateBusinessModel(name, description, industry, targetAudience) {
  const systemInstruction = `You are a Business Consultant. Generate a Lean/Business Model Canvas (9 areas) for this startup idea.
  Return a strict JSON response with the following keys:
  {
    "keyPartners": ["string"],
    "keyActivities": ["string"],
    "keyResources": ["string"],
    "valuePropositions": ["string"],
    "customerRelationships": ["string"],
    "channels": ["string"],
    "customerSegments": ["string"],
    "costStructure": ["string"],
    "revenueStreams": ["string"]
  }`;

  const prompt = `Startup Name: ${name}
Description: ${description}
Industry: ${industry}
Target Audience: ${targetAudience}`;

  try {
    const raw = await callAI(prompt, systemInstruction, true);
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Using fallback data for Business Model Canvas:', err.message);
    return {
      keyPartners: [
        `Cloud infrastructure providers (AWS, GCP)`,
        `Industry influencers and specialized content creators`,
        `API data partners and tool integrations`,
      ],
      keyActivities: [
        `Continuous software deployment and UI optimization`,
        `AI prompt engineering and algorithm refining`,
        `Targeted customer acquisition and support`,
      ],
      keyResources: [
        `Centralized AI algorithms and data models`,
        `Core software engineering team`,
        `Proprietary databases and content libraries`,
      ],
      valuePropositions: [
        `Saves up to 10 hours a week by automating manual workflows`,
        `Provides crystal clear startup steps tailored for ${targetAudience}`,
        `Enterprise-grade analytics at a fraction of legacy consultant costs`,
      ],
      customerRelationships: [
        `Self-serve onboarding with automated tips`,
        `Dedicated support channel for premium users`,
        `Regular feature newsletters and founder community access`,
      ],
      channels: [
        `Direct inbound search engine optimization (SEO)`,
        `Paid social ads (LinkedIn, Twitter, Meta)`,
        `Product-led growth (PLG) viral loops via template sharing`,
      ],
      customerSegments: [
        `${targetAudience} looking for modern tools`,
        `Early-stage startup teams in the ${industry} space`,
        `Consultants advising small businesses`,
      ],
      costStructure: [
        `Server hosting & AI API tokens usage fees`,
        `Core development staff & administrative costs`,
        `Digital advertising and content marketing spend`,
      ],
      revenueStreams: [
        `Pro subscription plan ($29/month) for advanced analytics`,
        `Enterprise configuration ($149/month) for team permissions`,
        `Add-on AI token booster packs for heavy users`,
      ],
    };
  }
}

/**
 * MVP PLANNER & KANBAN
 */
async function generateMVPPlan(name, description, industry, targetAudience) {
  const systemInstruction = `You are an expert Agile Product Manager. Draft an MVP specification. Include feature lists (must-have, nice-to-have, future), 3 milestones, and 6 sprint tasks for a Kanban board.
  Return a strict JSON response with the following keys:
  {
    "features": {
      "mustHave": ["string"],
      "niceToHave": ["string"],
      "future": ["string"]
    },
    "milestones": [
      { "title": "string", "date": "string", "status": "upcoming" }
    ],
    "sprintPlan": [
      { "title": "string", "column": "todo"|"in_progress"|"done", "priority": "low"|"medium"|"high" }
    ]
  }`;

  const prompt = `Startup Name: ${name}
Description: ${description}
Industry: ${industry}
Target Audience: ${targetAudience}`;

  try {
    const raw = await callAI(prompt, systemInstruction, true);
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Using fallback data for MVP Plan:', err.message);
    return {
      features: {
        mustHave: [
          'Simple user registration & profile configuration',
          `Core AI dashboard supporting ${name} core values`,
          'Interactive workspace to input startup descriptions',
          'Data export to PDF format',
        ],
        niceToHave: [
          'Team collaborator invite links',
          'Integration with Slack for system notifications',
          'Custom workspace customization presets',
        ],
        future: [
          'Full-scale API token endpoints for external developers',
          'Automated execution integrations (e.g. automatically create social posts)',
          'White-label dashboard branding for consulting agencies',
        ],
      },
      milestones: [
        { title: 'Interactive User Interface Wireframes & Prototypes', date: 'End of Week 2', status: 'completed' },
        { title: 'Functional Backend API & AI central pipeline implementation', date: 'End of Week 5', status: 'upcoming' },
        { title: 'Private Beta Launch to early waitlisted founders', date: 'End of Week 8', status: 'upcoming' },
      ],
      sprintPlan: [
        { title: 'Set up database clusters and schemas', column: 'done', priority: 'high' },
        { title: 'Implement JWT login & social auth components', column: 'done', priority: 'high' },
        { title: 'Configure AI prompt template pipelines', column: 'in_progress', priority: 'medium' },
        { title: 'Design landing page hero and features sections', column: 'in_progress', priority: 'medium' },
        { title: 'Integrate Recharts component for market sizing', column: 'todo', priority: 'low' },
        { title: 'Build export PDF functionality for Pitch Decks', column: 'todo', priority: 'high' },
      ],
    };
  }
}

/**
 * PITCH DECK GENERATOR
 */
async function generatePitchDeck(name, description, industry, targetAudience) {
  const systemInstruction = `You are a Pitch Deck Expert and Venture Capital advisor. Generate content for a 10-slide startup pitch deck. The slides should be: Problem, Solution, Market, Product, Competitors, Business Model, Go To Market, Financials, Team, Ask.
  Return a strict JSON response with the following keys:
  {
    "slides": [
      {
        "slideNumber": number,
        "title": "string",
        "content": "string summary",
        "bulletPoints": ["string"]
      }
    ]
  }`;

  const prompt = `Startup Name: ${name}
Description: ${description}
Industry: ${industry}
Target Audience: ${targetAudience}`;

  try {
    const raw = await callAI(prompt, systemInstruction, true);
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Using fallback data for Pitch Deck:', err.message);
    const slides = [
      {
        slideNumber: 1,
        title: 'The Problem',
        content: `Target users (${targetAudience}) lack accessible, affordable tools to address key issues in ${industry}.`,
        bulletPoints: [
          'Existing consultant fees are too expensive ($5k+ per week)',
          'Manual procedures are slow and prone to errors',
          'Losing valuable time and money on unvalidated directions',
        ],
      },
      {
        slideNumber: 2,
        title: 'The Solution',
        content: `Introducing ${name}: a self-serve platform designed to automate and optimize workflows for ${targetAudience}.`,
        bulletPoints: [
          'Empowered with advanced customized models',
          'Saves up to 10 hours a week of manual efforts',
          'Delivers high-quality analytical results instantly',
        ],
      },
      {
        slideNumber: 3,
        title: 'Market Opportunity',
        content: `Operating in the expanding ${industry} market, which represents a massive global addressable segment.`,
        bulletPoints: [
          `Total Addressable Market (TAM) is estimated at over $5B globally`,
          `Serviceable Obtainable Market (SOM) represents a clear $80M initial target`,
          `Double digit year-over-year industry growth metrics`,
        ],
      },
      {
        slideNumber: 4,
        title: 'The Product',
        content: `A simple, intuitive web interface designed for rapid user actions.`,
        bulletPoints: [
          'One-click validations and dashboard updates',
          'Personalized, step-by-step checklists',
          'Direct exports of deck and project specs',
        ],
      },
      {
        slideNumber: 5,
        title: 'Competitive Advantage',
        content: `Why ${name} will capture substantial market share.`,
        bulletPoints: [
          '10x cheaper than traditional business consultants',
          'Proprietary fine-tuned AI prompts ensure high-quality advice',
          'A product-led viral growth loop build-in',
        ],
      },
      {
        slideNumber: 6,
        title: 'Business Model',
        content: `A highly predictable software-as-a-service subscription structure.`,
        bulletPoints: [
          'Free starter workspace with basic modules',
          'Pro membership at $29/mo for full features',
          'Enterprise seats at $149/mo for team scaling',
        ],
      },
      {
        slideNumber: 7,
        title: 'Go-To-Market Strategy',
        content: `How we plan to cost-effectively acquire and retain users.`,
        bulletPoints: [
          'Inbound marketing with high-value templates & guides',
          'Direct developer and product community marketing',
          'Affiliate and partner programs with incubators',
        ],
      },
      {
        slideNumber: 8,
        title: 'Financial Projections',
        content: `Clear pathway to rapid scaling and profitability.`,
        bulletPoints: [
          'Year 1: Reaching $250k ARR on 700 active subscribers',
          'Year 2: Scaling to $1.2M ARR through enterprise client additions',
          'Gross margins projected to hold at 85%+',
        ],
      },
      {
        slideNumber: 9,
        title: 'The Team',
        content: `A dedicated group of product builders and engineers.`,
        bulletPoints: [
          'Founders with experience at leading tech platforms',
          'Specialist AI research and machine learning engineers',
          'Advisory board including top startup accelerators',
        ],
      },
      {
        slideNumber: 10,
        title: 'The Ask',
        content: `We are raising a pre-seed round to accelerate product launch.`,
        bulletPoints: [
          'Raising $500,000 via SAFE notes',
          'Funds will be allocated: 60% engineering, 30% marketing, 10% legal',
          'Targeting launch to public in next 6 months',
        ],
      },
    ];
    return { slides };
  }
}

/**
 * FUNDING FINDER
 */
async function generateFundingHub(name, description, industry, targetAudience) {
  const systemInstruction = `You are a Startup Funding Advisor. Match this startup with realistic funding avenues. Suggest 2 grants, 2 accelerators, 2 angel groups, and 2 VCs.
  Return a strict JSON response with the following keys:
  {
    "grants": [
      { "name": "string", "amount": "string", "description": "string", "link": "string" }
    ],
    "incubators": [
      { "name": "string", "location": "string", "description": "string", "link": "string" }
    ],
    "angelInvestors": [
      { "name": "string", "sector": "string", "ticketSize": "string", "location": "string" }
    ],
    "vcs": [
      { "name": "string", "focus": "string", "averageTicket": "string", "link": "string" }
    ]
  }`;

  const prompt = `Startup Name: ${name}
Description: ${description}
Industry: ${industry}
Target Audience: ${targetAudience}`;

  try {
    const raw = await callAI(prompt, systemInstruction, true);
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Using fallback data for Funding Hub:', err.message);
    return {
      grants: [
        {
          name: 'Tech Innovation Seed Grant',
          amount: '$50,000',
          description: `Non-dilutive grant backing early-stage technology startups solving core efficiencies in ${industry}.`,
          link: 'https://grants.gov',
        },
        {
          name: 'Digital Transformation Fund',
          amount: '$25,000',
          description: `Government funding designed to assist companies building cloud platforms to support localized business ecosystems.`,
          link: 'https://grants.gov',
        },
      ],
      incubators: [
        {
          name: 'Y Combinator',
          location: 'San Francisco, CA',
          description: 'The world\'s top startup accelerator. Invests $500k twice a year in promising tech startups.',
          link: 'https://ycombinator.com',
        },
        {
          name: 'Techstars Accelerator',
          location: 'Global (Various Cities)',
          description: 'Three-month mentorship-driven program offering $120k funding and access to a massive corporate partner network.',
          link: 'https://techstars.com',
        },
      ],
      angelInvestors: [
        {
          name: 'SaaS Angel Network',
          sector: 'B2B SaaS / Software',
          ticketSize: '$25k - $100k',
          location: 'New York, NY',
        },
        {
          name: 'Founder Led Syndicate',
          sector: `${industry} & Cloud Tech`,
          ticketSize: '$50k - $150k',
          location: 'Remote / Silicon Valley',
        },
      ],
      vcs: [
        {
          name: 'First Round Capital',
          focus: 'Super early pre-seed and seed software startups.',
          averageTicket: '$1.5M - $3M',
          link: 'https://firstround.com',
        },
        {
          name: 'Sequoia Capital Seed',
          focus: 'Pioneering technology platforms with massive addressable markets.',
          averageTicket: '$1M - $4M',
          link: 'https://sequoiacap.com',
        },
      ],
    };
  }
}

/**
 * RISK ANALYZER
 */
async function generateRiskAnalysis(name, description, industry, targetAudience) {
  const systemInstruction = `You are a Chief Risk Officer and startup consultant. Evaluate risks across 4 domains (Technical, Market, Financial, Legal). Provide a risk score (0-100) and 3 mitigation strategies for each.
  Return a strict JSON response with the following keys:
  {
    "technical": { "score": number, "factors": ["string"], "mitigations": ["string"] },
    "market": { "score": number, "factors": ["string"], "mitigations": ["string"] },
    "financial": { "score": number, "factors": ["string"], "mitigations": ["string"] },
    "legal": { "score": number, "factors": ["string"], "mitigations": ["string"] }
  }`;

  const prompt = `Startup Name: ${name}
Description: ${description}
Industry: ${industry}
Target Audience: ${targetAudience}`;

  try {
    const raw = await callAI(prompt, systemInstruction, true);
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Using fallback data for Risk Analysis:', err.message);
    return {
      technical: {
        score: 45,
        factors: [
          'High API token latency during traffic spikes',
          'Data security risks with proprietary startup ideas',
          'Maintaining server scalability on small starting budget',
        ],
        mitigations: [
          'Implement server-side caching and API connection pooling',
          'Encrypt all stored startup details in the database',
          'Configure auto-scaling server thresholds on AWS',
        ],
      },
      market: {
        score: 60,
        factors: [
          `Established competitors quickly replicating ${name}'s core workflow`,
          `Difficulty getting attention from busy members of ${targetAudience}`,
          `Changes in digital search trends affecting inbound marketing`,
        ],
        mitigations: [
          'Build strong proprietary features like the interactive MVP sprint board',
          'Leverage community marketing and launch on Product Hunt',
          'Keep pricing highly competitive compared to traditional software products',
        ],
      },
      financial: {
        score: 55,
        factors: [
          'Running out of cash before achieving positive unit economics',
          'Fluctuating API billing costs that erode operating margins',
          'Low user conversion rates from free to paid tiers',
        ],
        mitigations: [
          'Implement rigid credit limits per user to prevent API cost overruns',
          'Focus on organic acquisition to keep customer acquisition costs low',
          'Establish a clear monetization trigger on advanced modules early',
        ],
      },
      legal: {
        score: 30,
        factors: [
          `GDPR and privacy requirements for international users in ${industry}`,
          'Intellectual property issues regarding generated pitch text outputs',
          'Terms of service compliance regarding AI liability limitations',
        ],
        mitigations: [
          'Ensure easy, one-click options for users to delete their account data',
          'State clearly in user agreements that output text ownership belongs to users',
          'Include standard liability waivers in terms of service',
        ],
      },
    };
  }
}

/**
 * AI STARTUP MENTOR CHAT
 */
async function generateMentorResponse(chatHistory, newMessage, startupContext = null) {
  // Format history
  const historyText = chatHistory
    .map((msg) => `${msg.role === 'user' ? 'Founder' : 'Mentor'}: ${msg.content}`)
    .join('\n');

  let contextText = '';
  if (startupContext && startupContext.name) {
    contextText = `Active Startup Context:
Name: ${startupContext.name}
Description: ${startupContext.description}
Industry: ${startupContext.industry}
Target Audience: ${startupContext.targetAudience}
`;
  }

  const systemInstruction = `You are a Virtual Co-Founder and Y Combinator Startup Mentor.
Your tone is professional, supportive, highly actionable, and strategic.
Give specific advice instead of vague generalities. Suggest next steps.
${contextText}
Provide a response. Format your advice clearly with bold texts or brief bullet points where appropriate.`;

  const prompt = `Mentor Session History:
${historyText}

Founder: ${newMessage}
Mentor:`;

  try {
    const raw = await callAI(prompt, systemInstruction, false);
    return raw;
  } catch (err) {
    console.warn('Using fallback response for AI Mentor Chat:', err.message);
    // Dynamic mock response based on keyword matching
    const query = newMessage.toLowerCase();
    let advice = '';

    if (query.includes('marketing') || query.includes('customer') || query.includes('launch') || query.includes('user')) {
      advice = `To acquire your initial users, I recommend focusing on non-scalable channels first.
      
1. **Cold Outreach**: Reach out to 20 potential users matching your target group. Do not pitch immediately; ask about their pain points.
2. **Community Integration**: Share helpful, high-value advice on forums like Reddit or Indie Hackers where your target audience hangs out.
3. **Waitlist Landing Page**: Launch a simple landing page with a waitlist form to capture early interest.

What specific channel are you planning to leverage first? Let's refine your outreach template.`;
    } else if (query.includes('fund') || query.includes('raise') || query.includes('pitch') || query.includes('money') || query.includes('vc')) {
      advice = `Raising early-stage capital requires demonstrating momentum. Here is what VCs and angel investors look for at the pre-seed stage:

* **Founder-Market Fit**: Why are you the unique team to build this?
* **Problem Urgency**: Is this a hair-on-fire problem for your target audience?
* **Early Traction**: Show waitlist signups, user feedback interviews, or mock wireframe interactions.

Let's refine your **Ask** slide. How much money are you looking to raise, and what are the main milestones you want to hit with that capital?`;
    } else if (query.includes('hiring') || query.includes('team') || query.includes('co-founder') || query.includes('hire')) {
      advice = `Finding early team members or a co-founder is about alignment on values and equity.

1. **Clear Roles**: Define what skills you lack (e.g., if you are technical, find a commercial co-founder; if commercial, find a CTO).
2. **Equity Split**: Discuss equity openly. Use standard vesting schedules (4-year vesting with a 1-year cliff) to protect the company.
3. **Build Together First**: Start with a small, 2-week pilot project together to test your communication and chemistry before signing paperwork.

What qualities are you looking for in your next team member? Let's draft a role profile.`;
    } else {
      advice = `That is an interesting question. Let's break down the next actions:

* **De-risk Fast**: What is the cheapest way to validate this assumption before coding?
* **User Feedback**: Talk to users immediately. Their pain points should dictate your roadmap.
* **Keep it Simple**: Focus only on the core loop of your product.

Tell me a bit more about the specific challenge you are facing, and let's map out a step-by-step mitigation plan.`;
    }

    return advice;
  }
}

module.exports = {
  validateIdea,
  generateMarketResearch,
  generateCompetitors,
  generateBusinessModel,
  generateMVPPlan,
  generatePitchDeck,
  generateFundingHub,
  generateRiskAnalysis,
  generateMentorResponse,
};
