/**
 * Inngest Configuration for StudySphere AI
 * CommonJS compatible version with circuit breaker and token management
 */

const { Inngest } = require('inngest');

// Initialize Inngest client with schema validation options
const inngest = new Inngest({
  id: 'studysphere-ai',
  name: 'StudySphere AI Agent',
  schemas: {
    // Disable strict schema validation to avoid AJV format errors
    strictValidation: false,
  },
});

// AI Agent Configuration
const agentConfig = {
  agents: {
    'course-generator': {
      name: 'Course Generator Agent',
      description: 'Generates comprehensive courses using Gemini AI',
      model: {
        provider: 'google',
        model: 'gemini-1.5-flash-latest',
        apiKey: process.env.GEMINI_API_KEY,
        maxTokens: 8000,
        temperature: 0.7,
      },
      retryPolicy: {
        maxRetries: 3,
        backoffMs: 1000,
        exponentialBackoff: true,
      },
      rateLimiting: {
        maxRequestsPerMinute: 30,
        maxRequestsPerHour: 1000,
      },
    },
    'quiz-generator': {
      name: 'Quiz Generator Agent',
      description: 'Creates intelligent quizzes and assessments',
      model: {
        provider: 'google',
        model: 'gemini-1.5-flash-latest',
        apiKey: process.env.GEMINI_API_KEY,
        maxTokens: 4000,
        temperature: 0.5,
      },
      retryPolicy: {
        maxRetries: 2,
        backoffMs: 500,
      },
      rateLimiting: {
        maxRequestsPerMinute: 60,
        maxRequestsPerHour: 2000,
      },
    },
    'content-assistant': {
      name: 'Content Assistant Agent',
      description: 'Helps with content creation and optimization',
      model: {
        provider: 'google',
        model: 'gemini-1.5-flash-latest',
        apiKey: process.env.GEMINI_API_KEY,
        maxTokens: 2000,
        temperature: 0.6,
      },
      retryPolicy: {
        maxRetries: 2,
        backoffMs: 750,
      },
    },
    'support-chatbot': {
      name: 'Support Chatbot Agent',
      description: 'Provides intelligent support and answers to students',
      model: {
        provider: 'google', // Changed to google for consistency
        model: 'gemini-1.5-flash-latest',
        apiKey: process.env.GEMINI_API_KEY, // Use Gemini for now
        maxTokens: 1500,
        temperature: 0.7,
      },
      retryPolicy: {
        maxRetries: 2,
        backoffMs: 500,
      },
      rateLimiting: {
        maxRequestsPerMinute: 100,
        maxRequestsPerHour: 3000,
      },
    },
  },
  // Global settings
  defaultRetryPolicy: {
    maxRetries: 3,
    backoffMs: 1000,
    exponentialBackoff: true,
  },
  tokenManagement: {
    enableTokenTracking: true,
    tokenExpirationBuffer: 300, // 5 minutes buffer
    autoRefresh: true,
  },
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    enableRequestLogging: true,
    enableResponseLogging: true,
  },
};

// Circuit Breaker Pattern Implementation
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = 0;
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN - service temporarily unavailable');
      } else {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker entering HALF_OPEN state - testing service');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    if (this.state === 'HALF_OPEN') {
      console.log('✅ Circuit breaker service recovery confirmed - state: CLOSED');
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      console.log(`🚨 Circuit breaker OPEN - too many failures (${this.failureCount})`);
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      nextAttempt: this.nextAttempt,
      healthy: this.state === 'CLOSED'
    };
  }
}

// Create circuit breakers for each agent
const circuitBreakers = {};
Object.keys(agentConfig.agents).forEach(agentId => {
  circuitBreakers[agentId] = new CircuitBreaker();
});

// Token refresh handler
async function refreshAgentToken(agent) {
  try {
    if (agent.model.provider === 'google') {
      // For Google AI, verify API key is configured
      if (!agent.model.apiKey || agent.model.apiKey === 'your_gemini_api_key_here') {
        throw new Error('GEMINI_API_KEY not configured or still has placeholder value');
      }
      return true;
    }
    
    if (agent.model.provider === 'openai') {
      if (!agent.model.apiKey || agent.model.apiKey === 'your_openai_api_key_here') {
        throw new Error('OPENAI_API_KEY not configured or still has placeholder value');
      }
      return true;
    }
    
    throw new Error(`Unsupported provider: ${agent.model.provider}`);
  } catch (error) {
    console.error(`❌ Token validation failed for agent ${agent.name}:`, error.message);
    throw error;
  }
}

// Rate limit handler with exponential backoff
async function handleRateLimit(agentName, retryAfter = 1000, retryCount = 0) {
  const backoffTime = Math.min(retryAfter * Math.pow(2, retryCount), 30000);
  console.log(`⏳ Rate limit hit for agent ${agentName}, waiting ${backoffTime}ms (attempt ${retryCount + 1})`);
  await new Promise(resolve => setTimeout(resolve, backoffTime));
}

// Health check for agents
async function checkAgentHealth() {
  const healthStatus = {};
  
  for (const [agentId, agent] of Object.entries(agentConfig.agents)) {
    try {
      const startTime = Date.now();
      
      // Check if API key is configured
      await refreshAgentToken(agent);
      
      const responseTime = Date.now() - startTime;
      const circuitState = circuitBreakers[agentId].getState();
      
      healthStatus[agentId] = {
        status: circuitState.state === 'OPEN' ? 'degraded' : 'ready',
        responseTime,
        circuitBreaker: circuitState,
        lastChecked: new Date().toISOString(),
        provider: agent.model.provider,
        model: agent.model.model
      };
    } catch (error) {
      healthStatus[agentId] = {
        status: 'error',
        error: error.message,
        lastChecked: new Date().toISOString(),
        provider: agent.model?.provider || 'unknown'
      };
    }
  }
  
  return healthStatus;
}

// Agent execution with circuit breaker and retry logic
async function executeWithAgent(agentId, operation) {
  const agent = agentConfig.agents[agentId];
  const circuitBreaker = circuitBreakers[agentId];
  
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }

  return await circuitBreaker.execute(async () => {
    // Validate token before execution
    await refreshAgentToken(agent);
    
    let lastError;
    const maxRetries = agent.retryPolicy.maxRetries;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Execute the operation
        const result = await operation(agent);
        
        if (attempt > 0) {
          console.log(`✅ Agent ${agentId} succeeded on retry attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Check if it's a rate limit error
        if (error.message.includes('rate limit') || error.status === 429) {
          if (attempt < maxRetries) {
            await handleRateLimit(agent.name, agent.retryPolicy.backoffMs, attempt);
            continue;
          }
        }
        
        // For other errors, use exponential backoff if not the last attempt
        if (attempt < maxRetries) {
          const backoffTime = agent.retryPolicy.exponentialBackoff 
            ? agent.retryPolicy.backoffMs * Math.pow(2, attempt)
            : agent.retryPolicy.backoffMs;
            
          console.log(`⚠️ Agent ${agentId} attempt ${attempt + 1} failed, retrying in ${backoffTime}ms:`, error.message);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }
    
    // If we get here, all retries failed
    throw new Error(`Agent ${agentId} failed after ${maxRetries + 1} attempts. Last error: ${lastError.message}`);
  });
}

// Batch processing utility
async function processBatch(requests, batchSize = 3) {
  const results = [];
  const errors = [];
  
  console.log(`📦 Processing batch of ${requests.length} requests (batch size: ${batchSize})`);
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(requests.length / batchSize)}`);
    
    const batchPromises = batch.map(async (request, index) => {
      try {
        const result = await executeWithAgent(request.agentId, request.operation);
        return { success: true, data: result, request, index: i + index };
      } catch (error) {
        return { success: false, error: error.message, request, index: i + index };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          results.push(result.value);
        } else {
          errors.push(result.value);
        }
      } else {
        errors.push({
          success: false,
          error: result.reason.message,
          request: null,
          index: -1
        });
      }
    });
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < requests.length) {
      console.log('⏳ Waiting between batches...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`✅ Batch processing complete: ${results.length} succeeded, ${errors.length} failed`);
  return { results, errors };
}

// Export configured instances and utilities
module.exports = {
  inngest,
  agentConfig,
  circuitBreakers,
  checkAgentHealth,
  refreshAgentToken,
  handleRateLimit,
  executeWithAgent,
  processBatch,
  CircuitBreaker
};