const Groq = require('groq-sdk');

// Initialize Groq client
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// 3 LLaMA Models configured
const MODELS = {
  COMPLEX: 'llama-3.3-70b-versatile',
  BALANCED: 'llama-3.3-70b-versatile',
  FAST: 'llama-3.1-8b-instant',
};

// 5 AI Agents Personas
const AGENTS = {
  MENTOR: 'You are a Virtual Co-Founder and Y Combinator Startup Mentor. Your tone is professional, supportive, highly actionable, and strategic.',
  MARKET_ANALYST: 'You are an elite Market Research Analyst. You provide deep, data-driven insights into market sizes, competitors, and trends.',
  BUSINESS_CONSULTANT: 'You are a top-tier Business Consultant. You excel at structuring lean business models and identifying revenue streams.',
  PRODUCT_MANAGER: 'You are an expert Agile Product Manager. You translate vague ideas into actionable MVP specifications and kanban tasks.',
  RISK_VC_ADVISOR: 'You are a Chief Risk Officer and Venture Capital Advisor. You identify critical startup risks and structure compelling pitch decks and funding strategies.',
};

/**
 * Call Groq API to get response. Throws error if not configured or failed.
 */
async function callAI(prompt, systemInstruction = '', responseFormatJson = false, modelType = 'BALANCED') {
  if (!groq) {
    throw new Error('GROQ_API_KEY is not configured in the environment variables.');
  }

  const model = MODELS[modelType] || MODELS.BALANCED;

  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
        { role: 'user', content: prompt },
      ],
      response_format: responseFormatJson ? { type: 'json_object' } : undefined,
      temperature: 0.7,
    });
    
    return response.choices[0].message.content;
  } catch (err) {
    console.error(`Groq API Error with model ${model}:`, err);
    throw new Error('AI API call failed. Please ensure GROQ_API_KEY is valid and try again.');
  }
}

/**
 * AI IDEA VALIDATION (Agent: MENTOR)
 */
async function validateIdea(name, description, industry, targetAudience) {
  const systemInstruction = `${AGENTS.MENTOR} Analyze the user's startup idea. Return a strict JSON response with the following keys:
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

  const prompt = `Startup Name: ${name}\nDescription: ${description}\nIndustry: ${industry}\nTarget Audience: ${targetAudience}`;
  const raw = await callAI(prompt, systemInstruction, true, 'COMPLEX');
  return JSON.parse(raw);
}

/**
 * AI MARKET RESEARCH ENGINE (Agent: MARKET_ANALYST)
 */
async function generateMarketResearch(name, description, industry, targetAudience) {
  const systemInstruction = `${AGENTS.MARKET_ANALYST} Analyze the market for this startup. Estimate TAM, SAM, and SOM in USD numbers. Provide trends, customer pain points, and opportunities.
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

  const prompt = `Startup Name: ${name}\nDescription: ${description}\nIndustry: ${industry}\nTarget Audience: ${targetAudience}`;
  const raw = await callAI(prompt, systemInstruction, true, 'BALANCED');
  return JSON.parse(raw);
}

/**
 * COMPETITOR INTELLIGENCE (Agent: MARKET_ANALYST)
 */
async function generateCompetitors(name, description, industry, targetAudience) {
  const systemInstruction = `${AGENTS.MARKET_ANALYST} Identify 3 actual or highly realistic potential competitors for this startup. Provide strengths, weaknesses, pricing strategy, and market gaps we can exploit.
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

  const prompt = `Startup Name: ${name}\nDescription: ${description}\nIndustry: ${industry}\nTarget Audience: ${targetAudience}`;
  const raw = await callAI(prompt, systemInstruction, true, 'FAST');
  return JSON.parse(raw);
}

/**
 * BUSINESS MODEL CANVAS GENERATOR (Agent: BUSINESS_CONSULTANT)
 */
async function generateBusinessModel(name, description, industry, targetAudience) {
  const systemInstruction = `${AGENTS.BUSINESS_CONSULTANT} Generate a Lean/Business Model Canvas (9 areas) for this startup idea.
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

  const prompt = `Startup Name: ${name}\nDescription: ${description}\nIndustry: ${industry}\nTarget Audience: ${targetAudience}`;
  const raw = await callAI(prompt, systemInstruction, true, 'COMPLEX');
  return JSON.parse(raw);
}

/**
 * MVP PLANNER & KANBAN (Agent: PRODUCT_MANAGER)
 */
async function generateMVPPlan(name, description, industry, targetAudience) {
  const systemInstruction = `${AGENTS.PRODUCT_MANAGER} Draft an MVP specification. Include feature lists (must-have, nice-to-have, future), 3 milestones, and 6 sprint tasks for a Kanban board.
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

  const prompt = `Startup Name: ${name}\nDescription: ${description}\nIndustry: ${industry}\nTarget Audience: ${targetAudience}`;
  const raw = await callAI(prompt, systemInstruction, true, 'BALANCED');
  return JSON.parse(raw);
}

/**
 * PITCH DECK GENERATOR (Agent: RISK_VC_ADVISOR)
 */
async function generatePitchDeck(name, description, industry, targetAudience) {
  const systemInstruction = `${AGENTS.RISK_VC_ADVISOR} Generate content for a 10-slide startup pitch deck. The slides should be: Problem, Solution, Market, Product, Competitors, Business Model, Go To Market, Financials, Team, Ask.
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

  const prompt = `Startup Name: ${name}\nDescription: ${description}\nIndustry: ${industry}\nTarget Audience: ${targetAudience}`;
  const raw = await callAI(prompt, systemInstruction, true, 'COMPLEX');
  return JSON.parse(raw);
}

/**
 * FUNDING FINDER (Agent: RISK_VC_ADVISOR)
 */
async function generateFundingHub(name, description, industry, targetAudience) {
  const systemInstruction = `${AGENTS.RISK_VC_ADVISOR} Match this startup with realistic funding avenues. Suggest 2 grants, 2 accelerators, 2 angel groups, and 2 VCs.
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

  const prompt = `Startup Name: ${name}\nDescription: ${description}\nIndustry: ${industry}\nTarget Audience: ${targetAudience}`;
  const raw = await callAI(prompt, systemInstruction, true, 'BALANCED');
  return JSON.parse(raw);
}

/**
 * RISK ANALYZER (Agent: RISK_VC_ADVISOR)
 */
async function generateRiskAnalysis(name, description, industry, targetAudience) {
  const systemInstruction = `${AGENTS.RISK_VC_ADVISOR} Evaluate risks across 4 domains (Technical, Market, Financial, Legal). Provide a risk score (0-100) and 3 mitigation strategies for each.
  Return a strict JSON response with the following keys:
  {
    "technical": { "score": number, "factors": ["string"], "mitigations": ["string"] },
    "market": { "score": number, "factors": ["string"], "mitigations": ["string"] },
    "financial": { "score": number, "factors": ["string"], "mitigations": ["string"] },
    "legal": { "score": number, "factors": ["string"], "mitigations": ["string"] }
  }`;

  const prompt = `Startup Name: ${name}\nDescription: ${description}\nIndustry: ${industry}\nTarget Audience: ${targetAudience}`;
  const raw = await callAI(prompt, systemInstruction, true, 'COMPLEX');
  return JSON.parse(raw);
}

/**
 * AI STARTUP MENTOR CHAT (Agent: MENTOR)
 */
async function generateMentorResponse(chatHistory, newMessage, startupContext = null, persona = 'Virtual Co-Founder') {
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

    if (startupContext.modulesContext && Object.keys(startupContext.modulesContext).length > 0) {
      contextText += `\nCRITICAL KNOWLEDGE BASE (Generated Startup Modules - Use this deeply for context):\n`;
      contextText += JSON.stringify(startupContext.modulesContext, null, 2);
    }
  }

  const systemInstruction = `You are acting strictly as the ${persona} of the startup. Adopt the exact tone, mindset, and vocabulary of an elite Silicon Valley ${persona}. Provide highly actionable, strategic advice tailored exclusively to your specific role. Do not break character. Introduce yourself or your role if this is the beginning of the conversation.
${contextText}
Provide a response. Format your advice clearly with bold texts or brief bullet points where appropriate.`;

  const prompt = `Mentor Session History:\n${historyText}\n\nFounder: ${newMessage}\nMentor:`;
  return await callAI(prompt, systemInstruction, false, 'FAST');
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
