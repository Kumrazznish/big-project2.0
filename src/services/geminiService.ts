const API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2
].filter(Boolean); // Remove any undefined keys

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Enhanced rate limiting with multiple API keys and better error handling
class MultiKeyRateLimiter {
  private keyUsage: Map<string, { requests: number[]; lastRequest: number; consecutiveErrors: number }> = new Map();
  private currentKeyIndex = 0;
  private readonly maxRequestsPerKey = 15; // Conservative limit for Gemini 2.0 Flash
  private readonly timeWindow = 60000; // 1 minute
  private readonly minInterval = 2000; // 2 seconds between requests
  private readonly maxConsecutiveErrors = 2; // Max errors before switching keys

  constructor() {
    // Initialize tracking for each API key
    API_KEYS.forEach(key => {
      if (key) {
        this.keyUsage.set(key, { 
          requests: [], 
          lastRequest: 0, 
          consecutiveErrors: 0 
        });
      }
    });
    console.log(`Initialized rate limiter with ${API_KEYS.length} API keys`);
  }

  getAvailableKey(): string | null {
    if (API_KEYS.length === 0) {
      console.error('No API keys available');
      return null;
    }

    const now = Date.now();
    
    // Try each key starting from current index
    for (let i = 0; i < API_KEYS.length; i++) {
      const keyIndex = (this.currentKeyIndex + i) % API_KEYS.length;
      const key = API_KEYS[keyIndex];
      const usage = this.keyUsage.get(key);
      
      if (!usage) continue;

      // Clean old requests
      usage.requests = usage.requests.filter(time => now - time < this.timeWindow);
      
      // Check if this key can make a request
      const canUseKey = usage.requests.length < this.maxRequestsPerKey && 
                       (now - usage.lastRequest) >= this.minInterval &&
                       usage.consecutiveErrors < this.maxConsecutiveErrors;
      
      if (canUseKey) {
        this.currentKeyIndex = keyIndex;
        console.log(`Using API key ${keyIndex + 1} (requests: ${usage.requests.length}/${this.maxRequestsPerKey}, errors: ${usage.consecutiveErrors})`);
        return key;
      }
    }
    
    console.warn('No available API keys found');
    return null;
  }

  recordRequest(apiKey: string): void {
    const usage = this.keyUsage.get(apiKey);
    if (usage) {
      const now = Date.now();
      usage.requests.push(now);
      usage.lastRequest = now;
    }
  }

  recordError(apiKey: string): void {
    const usage = this.keyUsage.get(apiKey);
    if (usage) {
      usage.consecutiveErrors++;
      console.warn(`Recorded error for key ending in ...${apiKey.slice(-8)} (errors: ${usage.consecutiveErrors})`);
    }
  }

  recordSuccess(apiKey: string): void {
    const usage = this.keyUsage.get(apiKey);
    if (usage) {
      usage.consecutiveErrors = 0; // Reset error count on success
    }
  }

  getWaitTime(): number {
    const now = Date.now();
    let minWaitTime = Infinity;

    API_KEYS.forEach(key => {
      const usage = this.keyUsage.get(key);
      if (!usage) return;

      // Skip keys with too many consecutive errors
      if (usage.consecutiveErrors >= this.maxConsecutiveErrors) {
        return;
      }

      // Check interval wait time
      const intervalWait = this.minInterval - (now - usage.lastRequest);
      if (intervalWait > 0) {
        minWaitTime = Math.min(minWaitTime, intervalWait);
        return;
      }

      // Check rate limit wait time
      if (usage.requests.length > 0) {
        const oldestRequest = Math.min(...usage.requests);
        const rateLimitWait = this.timeWindow - (now - oldestRequest);
        if (rateLimitWait > 0) {
          minWaitTime = Math.min(minWaitTime, rateLimitWait);
        }
      } else {
        minWaitTime = 0; // This key is available
      }
    });

    return minWaitTime === Infinity ? 30000 : minWaitTime; // Default 30s wait if all keys exhausted
  }

  getRemainingRequests(): number {
    const now = Date.now();
    let totalRemaining = 0;

    API_KEYS.forEach(key => {
      const usage = this.keyUsage.get(key);
      if (usage && usage.consecutiveErrors < this.maxConsecutiveErrors) {
        usage.requests = usage.requests.filter(time => now - time < this.timeWindow);
        totalRemaining += Math.max(0, this.maxRequestsPerKey - usage.requests.length);
      }
    });

    return totalRemaining;
  }

  canMakeRequest(): boolean {
    return this.getAvailableKey() !== null;
  }

  getStatus(): { 
    canMakeRequest: boolean; 
    waitTime: number; 
    requestsRemaining: number;
    activeKeys: number;
    keyStatuses: Array<{ key: string; requests: number; available: boolean; errors: number }>;
  } {
    const now = Date.now();
    const keyStatuses = API_KEYS.map(key => {
      const usage = this.keyUsage.get(key);
      if (!usage) return { key: key.slice(-8), requests: 0, available: false, errors: 0 };
      
      usage.requests = usage.requests.filter(time => now - time < this.timeWindow);
      const available = usage.requests.length < this.maxRequestsPerKey && 
                       (now - usage.lastRequest) >= this.minInterval &&
                       usage.consecutiveErrors < this.maxConsecutiveErrors;
      
      return {
        key: key.slice(-8), // Show last 8 characters for identification
        requests: usage.requests.length,
        available,
        errors: usage.consecutiveErrors
      };
    });

    return {
      canMakeRequest: this.canMakeRequest(),
      waitTime: this.getWaitTime(),
      requestsRemaining: this.getRemainingRequests(),
      activeKeys: API_KEYS.length,
      keyStatuses
    };
  }

  // Reset all error counts (useful for recovery)
  resetErrors(): void {
    this.keyUsage.forEach(usage => {
      usage.consecutiveErrors = 0;
    });
    console.log('Reset all error counts');
  }
}

const rateLimiter = new MultiKeyRateLimiter();

export class GeminiService {
  private async makeRequestWithKey(prompt: string, apiKey: string, attempt: number = 1): Promise<string> {
    const maxAttempts = 3;
    
    try {
      console.log(`Making Gemini API request (attempt ${attempt}/${maxAttempts}) with key ending in ...${apiKey.slice(-8)}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent JSON
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(requestBody)
      });

      clearTimeout(timeoutId);

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status} with key ...${apiKey.slice(-8)}:`, errorText);
        
        rateLimiter.recordError(apiKey);
        
        // Parse error details
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        } catch (parseError) {
          errorMessage = errorText || errorMessage;
        }
        
        if (response.status === 429) {
          throw new Error(`RATE_LIMIT: ${errorMessage}`);
        }
        
        if (response.status === 503 || response.status === 500) {
          throw new Error(`SERVICE_ERROR: ${errorMessage}`);
        }
        
        if (response.status === 400) {
          throw new Error(`INVALID_REQUEST: ${errorMessage}`);
        }
        
        if (response.status === 401 || response.status === 403) {
          throw new Error(`AUTH_ERROR: ${errorMessage}`);
        }
        
        throw new Error(`API_ERROR: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('Response data structure:', JSON.stringify(data, null, 2));
      
      if (!data.candidates || !data.candidates[0]) {
        console.error('Invalid response structure:', data);
        throw new Error('INVALID_RESPONSE: No candidates in response');
      }

      const candidate = data.candidates[0];
      
      // Check for content filtering
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('CONTENT_FILTERED: Response was filtered for safety reasons');
      }
      
      if (candidate.finishReason === 'RECITATION') {
        throw new Error('CONTENT_FILTERED: Response was filtered for recitation');
      }

      if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
        console.error('Invalid content structure:', candidate);
        throw new Error('NO_CONTENT: No content in response');
      }

      const content = candidate.content.parts[0].text;
      if (!content || content.trim().length === 0) {
        console.warn('Empty content received, retrying...');
        if (attempt < maxAttempts) {
          const delay = 2000 * attempt;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequestWithKey(prompt, apiKey, attempt + 1);
        }
        throw new Error('EMPTY_CONTENT: Empty response from AI service after retries');
      }

      rateLimiter.recordSuccess(apiKey);
      console.log(`Successfully received response from Gemini API using key ...${apiKey.slice(-8)}`);
      console.log('Response content preview:', content.substring(0, 200) + '...');
      
      return content;

    } catch (error) {
      console.error(`Request failed with key ...${apiKey.slice(-8)}:`, error);
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        // Handle specific error types with retry logic
        if (errorMessage.includes('RATE_LIMIT') || 
            errorMessage.includes('SERVICE_ERROR') || 
            errorMessage.includes('QUOTA_EXCEEDED')) {
          
          if (attempt < maxAttempts) {
            const delay = 3000 * attempt + Math.random() * 2000; // Longer delays
            console.log(`Retrying request in ${delay}ms due to: ${errorMessage.split(':')[0]}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.makeRequestWithKey(prompt, apiKey, attempt + 1);
          }
        }
        
        throw error;
      } else {
        throw new Error('UNKNOWN_ERROR: An unexpected error occurred');
      }
    }
  }

  async makeRequest(prompt: string): Promise<string> {
    if (API_KEYS.length === 0) {
      throw new Error('No Gemini API keys configured. Please add VITE_GEMINI_API_KEY and optionally VITE_GEMINI_API_KEY_2 to your .env file.');
    }

    console.log(`Starting request with ${API_KEYS.length} available API keys`);

    const maxKeyAttempts = API_KEYS.length * 3; // Try each key up to 3 times
    let keyAttempt = 0;
    let lastError: Error | null = null;

    while (keyAttempt < maxKeyAttempts) {
      const availableKey = rateLimiter.getAvailableKey();
      
      if (!availableKey) {
        const waitTime = rateLimiter.getWaitTime();
        
        // If wait time is reasonable, wait and retry
        if (waitTime < 120000) { // Less than 2 minutes
          console.log(`All keys busy, waiting ${Math.ceil(waitTime / 1000)}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } else {
          // Reset errors and try again if wait time is too long
          if (keyAttempt < API_KEYS.length) {
            console.log('Resetting error counts and retrying...');
            rateLimiter.resetErrors();
            keyAttempt++;
            continue;
          } else {
            throw new Error(`All API keys are exhausted. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`);
          }
        }
      }

      try {
        rateLimiter.recordRequest(availableKey);
        const result = await this.makeRequestWithKey(prompt, availableKey);
        console.log('Request completed successfully');
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`Request failed with key ...${availableKey.slice(-8)}:`, lastError.message);
        
        keyAttempt++;
        
        // If it's a non-recoverable error, don't retry with other keys
        if (lastError.message.includes('INVALID_REQUEST') || 
            lastError.message.includes('AUTH_ERROR') ||
            lastError.message.includes('CONTENT_FILTERED')) {
          throw lastError;
        }
        
        // Wait a bit before trying next key
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // If we've exhausted all attempts
    throw lastError || new Error('All API key attempts failed');
  }

  private cleanJsonResponse(response: string): string {
    console.log('Cleaning JSON response, original length:', response.length);
    
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    cleaned = cleaned.trim();
    
    // Find the first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    console.log('Cleaned JSON length:', cleaned.length);
    console.log('Cleaned JSON preview:', cleaned.substring(0, 200) + '...');
    
    return cleaned.trim();
  }

  private validateRoadmapData(data: any): boolean {
    const isValid = (
      data &&
      typeof data === 'object' &&
      data.subject &&
      data.difficulty &&
      data.description &&
      data.chapters &&
      Array.isArray(data.chapters) &&
      data.chapters.length > 0 &&
      data.chapters.every((chapter: any) => 
        chapter.id &&
        chapter.title &&
        chapter.description &&
        chapter.duration &&
        chapter.position &&
        Array.isArray(chapter.keyTopics) &&
        Array.isArray(chapter.skills) &&
        Array.isArray(chapter.practicalProjects)
      )
    );
    
    if (!isValid) {
      console.error('Roadmap validation failed:', {
        hasData: !!data,
        hasSubject: !!(data && data.subject),
        hasDifficulty: !!(data && data.difficulty),
        hasDescription: !!(data && data.description),
        hasChapters: !!(data && data.chapters),
        isChaptersArray: !!(data && Array.isArray(data.chapters)),
        chaptersLength: data && data.chapters ? data.chapters.length : 0,
        firstChapter: data && data.chapters && data.chapters[0] ? data.chapters[0] : null
      });
    }
    
    return isValid;
  }

  private validateCourseContent(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      data.title &&
      data.description &&
      data.content &&
      typeof data.content === 'object' &&
      data.content.introduction &&
      data.content.mainContent &&
      Array.isArray(data.content.keyPoints) &&
      data.content.summary
    );
  }

  private validateQuizData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      data.title &&
      data.questions &&
      Array.isArray(data.questions) &&
      data.questions.length > 0 &&
      data.questions.every((question: any) => 
        question.id &&
        question.question &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        typeof question.correctAnswer === 'number' &&
        question.correctAnswer >= 0 &&
        question.correctAnswer < 4 &&
        question.explanation &&
        question.difficulty &&
        typeof question.points === 'number'
      )
    );
  }

  async generateRoadmap(subject: string, difficulty: string): Promise<any> {
    console.log('Generating roadmap for:', { subject, difficulty });
    
    // Add retry logic for roadmap generation
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await this.generateRoadmapInternal(subject, difficulty);
      } catch (error) {
        attempt++;
        console.error(`Roadmap generation attempt ${attempt} failed:`, error);
        if (attempt >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
      }
    }
  }

  private async generateRoadmapInternal(subject: string, difficulty: string): Promise<any> {
    const preferences = JSON.parse(localStorage.getItem('learningPreferences') || '{}');
    
    const prompt = `You are an expert curriculum designer. Create a comprehensive learning roadmap for "${subject}" at "${difficulty}" level.

Learning preferences:
- Style: ${preferences.learningStyle || 'mixed'}
- Time: ${preferences.timeCommitment || 'regular'}
- Goals: ${preferences.goals?.join(', ') || 'general learning'}

IMPORTANT: Return ONLY a valid JSON object with NO additional text, explanations, or markdown formatting.

{
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "description": "Comprehensive ${subject} learning path designed for ${difficulty} level learners with ${preferences.learningStyle || 'mixed'} learning style",
  "totalDuration": "8-12 weeks",
  "estimatedHours": "40-60 hours",
  "prerequisites": ["Basic computer skills", "Internet access", "Text editor"],
  "learningOutcomes": [
    "Master ${subject} fundamentals and core concepts",
    "Build practical projects and real-world applications",
    "Understand industry best practices and standards",
    "Develop problem-solving and debugging skills",
    "Gain confidence to work independently"
  ],
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Introduction to ${subject}",
      "description": "Learn the fundamentals and get started with ${subject}",
      "duration": "1 week",
      "estimatedHours": "4-6 hours",
      "difficulty": "beginner",
      "position": "left",
      "completed": false,
      "keyTopics": ["Basic concepts", "Environment setup", "First steps", "Core principles"],
      "skills": ["Understanding fundamentals", "Environment setup", "Basic navigation"],
      "practicalProjects": ["Hello World project", "Basic setup exercise"],
      "resources": 5
    },
    {
      "id": "chapter-2",
      "title": "Core Concepts and Fundamentals",
      "description": "Deep dive into the essential concepts of ${subject}",
      "duration": "1-2 weeks",
      "estimatedHours": "6-8 hours",
      "difficulty": "beginner",
      "position": "right",
      "completed": false,
      "keyTopics": ["Data types", "Variables", "Functions", "Control structures"],
      "skills": ["Basic syntax", "Problem solving", "Code organization"],
      "practicalProjects": ["Simple calculator", "Basic data manipulation"],
      "resources": 7
    },
    {
      "id": "chapter-3",
      "title": "Working with Data and Structures",
      "description": "Learn how to handle and manipulate data effectively",
      "duration": "1-2 weeks",
      "estimatedHours": "6-8 hours",
      "difficulty": "beginner",
      "position": "left",
      "completed": false,
      "keyTopics": ["Arrays", "Objects", "Data manipulation", "Storage"],
      "skills": ["Data handling", "Structure design", "Efficient processing"],
      "practicalProjects": ["Data processor", "Simple database"],
      "resources": 6
    },
    {
      "id": "chapter-4",
      "title": "Advanced Techniques and Patterns",
      "description": "Explore advanced concepts and design patterns",
      "duration": "1-2 weeks",
      "estimatedHours": "8-10 hours",
      "difficulty": "intermediate",
      "position": "right",
      "completed": false,
      "keyTopics": ["Design patterns", "Advanced algorithms", "Optimization", "Architecture"],
      "skills": ["Pattern recognition", "Code optimization", "System design"],
      "practicalProjects": ["Pattern implementation", "Performance optimizer"],
      "resources": 8
    },
    {
      "id": "chapter-5",
      "title": "Building Real Applications",
      "description": "Create complete, functional applications",
      "duration": "2-3 weeks",
      "estimatedHours": "10-12 hours",
      "difficulty": "intermediate",
      "position": "left",
      "completed": false,
      "keyTopics": ["Application architecture", "User interface", "Data flow", "Integration"],
      "skills": ["Full-stack development", "UI/UX implementation", "System integration"],
      "practicalProjects": ["Complete web app", "Mobile application"],
      "resources": 10
    },
    {
      "id": "chapter-6",
      "title": "Testing and Quality Assurance",
      "description": "Learn testing methodologies and quality practices",
      "duration": "1-2 weeks",
      "estimatedHours": "6-8 hours",
      "difficulty": "intermediate",
      "position": "right",
      "completed": false,
      "keyTopics": ["Unit testing", "Integration testing", "Quality metrics", "Debugging"],
      "skills": ["Test writing", "Quality assurance", "Bug fixing"],
      "practicalProjects": ["Test suite creation", "Quality dashboard"],
      "resources": 7
    },
    {
      "id": "chapter-7",
      "title": "Performance and Optimization",
      "description": "Optimize applications for speed and efficiency",
      "duration": "1-2 weeks",
      "estimatedHours": "8-10 hours",
      "difficulty": "advanced",
      "position": "left",
      "completed": false,
      "keyTopics": ["Performance analysis", "Optimization techniques", "Caching", "Scaling"],
      "skills": ["Performance tuning", "Resource optimization", "Scalability planning"],
      "practicalProjects": ["Performance analyzer", "Optimization toolkit"],
      "resources": 9
    },
    {
      "id": "chapter-8",
      "title": "Security and Best Practices",
      "description": "Implement security measures and industry standards",
      "duration": "1-2 weeks",
      "estimatedHours": "6-8 hours",
      "difficulty": "advanced",
      "position": "right",
      "completed": false,
      "keyTopics": ["Security principles", "Authentication", "Data protection", "Compliance"],
      "skills": ["Security implementation", "Risk assessment", "Compliance management"],
      "practicalProjects": ["Security audit tool", "Authentication system"],
      "resources": 8
    },
    {
      "id": "chapter-9",
      "title": "Deployment and DevOps",
      "description": "Deploy applications and manage development workflows",
      "duration": "1-2 weeks",
      "estimatedHours": "8-10 hours",
      "difficulty": "advanced",
      "position": "left",
      "completed": false,
      "keyTopics": ["Deployment strategies", "CI/CD", "Monitoring", "Infrastructure"],
      "skills": ["Deployment automation", "System monitoring", "Infrastructure management"],
      "practicalProjects": ["Deployment pipeline", "Monitoring dashboard"],
      "resources": 10
    },
    {
      "id": "chapter-10",
      "title": "Advanced Topics and Specialization",
      "description": "Explore cutting-edge topics and specialization areas",
      "duration": "2-3 weeks",
      "estimatedHours": "10-15 hours",
      "difficulty": "advanced",
      "position": "right",
      "completed": false,
      "keyTopics": ["Emerging technologies", "Specialization areas", "Research topics", "Innovation"],
      "skills": ["Advanced problem solving", "Research abilities", "Innovation thinking"],
      "practicalProjects": ["Research project", "Innovation prototype"],
      "resources": 12
    },
    {
      "id": "chapter-11",
      "title": "Portfolio and Career Development",
      "description": "Build a professional portfolio and prepare for career advancement",
      "duration": "1-2 weeks",
      "estimatedHours": "6-8 hours",
      "difficulty": "intermediate",
      "position": "left",
      "completed": false,
      "keyTopics": ["Portfolio creation", "Career planning", "Networking", "Interview preparation"],
      "skills": ["Portfolio development", "Professional presentation", "Career strategy"],
      "practicalProjects": ["Professional portfolio", "Career roadmap"],
      "resources": 8
    },
    {
      "id": "chapter-12",
      "title": "Capstone Project and Mastery",
      "description": "Complete a comprehensive project demonstrating mastery",
      "duration": "2-4 weeks",
      "estimatedHours": "15-20 hours",
      "difficulty": "advanced",
      "position": "right",
      "completed": false,
      "keyTopics": ["Project planning", "Full implementation", "Documentation", "Presentation"],
      "skills": ["Project management", "Complete development cycle", "Professional delivery"],
      "practicalProjects": ["Capstone project", "Professional presentation"],
      "resources": 15
    }
  ]
}`;

    const response = await this.makeRequest(prompt);
    
    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsedData = JSON.parse(cleanedResponse);
      
      if (!this.validateRoadmapData(parsedData)) {
        console.error('Roadmap validation failed, received data:', parsedData);
        throw new Error('Invalid roadmap data structure received from AI service.');
      }
      
      console.log('Successfully generated and validated roadmap');
      return parsedData;
    } catch (error) {
      console.error('JSON Parse Error:', error);
      console.error('Raw response:', response);
      throw new Error('Failed to parse roadmap response. The AI service returned invalid JSON format.');
    }
  }

  async generateCourseContent(chapterTitle: string, subject: string, difficulty: string): Promise<any> {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await this.generateCourseContentInternal(chapterTitle, subject, difficulty);
      } catch (error) {
        attempt++;
        console.error(`Course content generation attempt ${attempt} failed:`, error);
        if (attempt >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }

  private async generateCourseContentInternal(chapterTitle: string, subject: string, difficulty: string): Promise<any> {
    const preferences = JSON.parse(localStorage.getItem('learningPreferences') || '{}');
    
    // Get a proper YouTube video ID for the subject and chapter
    const getYouTubeVideoId = (subject: string, chapter: string): string => {
      // Map common subjects to actual educational video IDs
      const videoMappings: { [key: string]: string } = {
        'programming': 'rfscVS0vtbw',
        'web-development': 'UB1O30fR-EE',
        'javascript': 'PkZNo7MFNFg',
        'python': 'kqtD5dpn9C8',
        'react': 'Ke90Tje7VS0',
        'data-science': 'ua-CiDNNj30',
        'machine-learning': 'ukzFI9rgwfU',
        'design': 'YiLUYf4HDh4',
        'mathematics': 'WUvTyaaNkzM',
        'business': 'SlteusaKev4'
      };
      
      const subjectKey = Object.keys(videoMappings).find(key => 
        subject.toLowerCase().includes(key) || chapter.toLowerCase().includes(key)
      );
      
      return videoMappings[subjectKey] || 'dQw4w9WgXcQ';
    };

    const videoId = getYouTubeVideoId(subject, chapterTitle);
    
    const prompt = `Create comprehensive course content for "${chapterTitle}" in ${subject} at ${difficulty} level.

IMPORTANT: Return ONLY a valid JSON object with NO additional text, explanations, or markdown formatting.

{
  "title": "${chapterTitle}",
  "description": "Comprehensive guide to ${chapterTitle} in ${subject}",
  "learningObjectives": [
    "Understand ${chapterTitle} fundamentals",
    "Apply concepts practically",
    "Master key techniques",
    "Build real projects"
  ],
  "estimatedTime": "4-6 hours",
  "content": {
    "introduction": "This chapter introduces ${chapterTitle} in ${subject}. You'll learn the core concepts, understand practical applications, and see how it fits into the broader ${subject} ecosystem.",
    "mainContent": "Detailed explanation of ${chapterTitle} concepts. This comprehensive guide covers the fundamental principles, practical applications, and real-world examples. We'll explore step-by-step implementations, common patterns, and best practices. You'll learn how to apply these concepts in real projects, understand the underlying theory, and master the practical skills needed for ${difficulty} level proficiency. The content includes detailed explanations, code examples, and practical exercises to reinforce your learning.",
    "keyPoints": [
      "Core concept 1 of ${chapterTitle}",
      "Practical application techniques",
      "Best practices and patterns",
      "Common pitfalls to avoid",
      "Real-world use cases"
    ],
    "summary": "In this chapter, you mastered ${chapterTitle} in ${subject}. You learned the fundamental concepts, explored practical applications, and understand how to implement these skills in real projects."
  },
  "videoId": "${videoId}",
  "codeExamples": [
    {
      "title": "Basic ${chapterTitle} Example",
      "code": "// ${chapterTitle} example for ${subject}\\n// This demonstrates core concepts\\nconsole.log('Learning ${chapterTitle}');\\n\\nfunction example() {\\n  return '${chapterTitle} implementation';\\n}\\n\\nexample();",
      "explanation": "This example demonstrates the basic concepts of ${chapterTitle}. It shows the fundamental syntax and structure you'll use in ${subject}."
    },
    {
      "title": "Advanced ${chapterTitle} Implementation",
      "code": "// Advanced ${chapterTitle} example\\n// Real-world implementation\\nclass ${chapterTitle.replace(/\\s+/g, '')} {\\n  constructor() {\\n    this.initialized = true;\\n  }\\n  \\n  process() {\\n    return 'Advanced ${chapterTitle} processing';\\n  }\\n}\\n\\nconst instance = new ${chapterTitle.replace(/\\s+/g, '')}();\\nconsole.log(instance.process());",
      "explanation": "This advanced example shows how ${chapterTitle} is implemented in production code. It demonstrates best practices and real-world patterns."
    }
  ],
  "practicalExercises": [
    {
      "title": "Basic ${chapterTitle} Exercise",
      "description": "Implement a basic ${chapterTitle} solution using the concepts learned",
      "difficulty": "easy"
    },
    {
      "title": "Advanced ${chapterTitle} Project",
      "description": "Build a complete project incorporating ${chapterTitle} techniques",
      "difficulty": "medium"
    }
  ],
  "additionalResources": [
    {
      "title": "Official ${subject} Documentation",
      "url": "https://developer.mozilla.org/en-US/docs/Web/${subject}",
      "type": "documentation",
      "description": "Official documentation for ${chapterTitle}"
    },
    {
      "title": "${chapterTitle} Tutorial",
      "url": "https://www.freecodecamp.org/news/search?query=${chapterTitle.replace(/\\s+/g, '-').toLowerCase()}",
      "type": "tutorial",
      "description": "Comprehensive tutorial on ${chapterTitle}"
    }
  ],
  "nextSteps": [
    "Practice the exercises",
    "Review the code examples",
    "Explore additional resources",
    "Apply concepts in your own projects"
  ]
}`;

    const response = await this.makeRequest(prompt);
    
    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsedData = JSON.parse(cleanedResponse);
      
      if (!this.validateCourseContent(parsedData)) {
        throw new Error('Invalid course content structure received.');
      }
      
      return parsedData;
    } catch (error) {
      console.error('JSON Parse Error:', error);
      throw new Error('Failed to parse course content. Please try again.');
    }
  }

  async generateQuiz(chapterTitle: string, subject: string, difficulty: string): Promise<any> {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await this.generateQuizInternal(chapterTitle, subject, difficulty);
      } catch (error) {
        attempt++;
        console.error(`Quiz generation attempt ${attempt} failed:`, error);
        if (attempt >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }

  private async generateQuizInternal(chapterTitle: string, subject: string, difficulty: string): Promise<any> {
    const prompt = `Create a comprehensive quiz for "${chapterTitle}" in ${subject} at ${difficulty} level.

IMPORTANT: Return ONLY a valid JSON object with NO additional text, explanations, or markdown formatting.

{
  "chapterId": "chapter-quiz",
  "title": "Quiz: ${chapterTitle}",
  "description": "Test your understanding of ${chapterTitle} in ${subject}",
  "timeLimit": 600,
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "What is the main purpose of ${chapterTitle} in ${subject}?",
      "options": [
        "Incorrect but plausible answer A",
        "Correct answer explaining the main purpose",
        "Incorrect but related concept C",
        "Clearly incorrect option D"
      ],
      "correctAnswer": 1,
      "explanation": "The correct answer is B because ${chapterTitle} serves this specific purpose in ${subject}. This is fundamental to understanding how it works.",
      "difficulty": "easy",
      "points": 10
    }
  ],
  "totalQuestions": 10,
  "totalPoints": 100
}

Requirements:
- Exactly 10 questions
- Mix of difficulties: 3 easy, 4 medium, 3 hard
- Each question: 10 points
- 4 options per question
- correctAnswer: index (0-3)
- Detailed explanations
- Content specific to ${chapterTitle} and ${subject}
- Appropriate for ${difficulty} level`;

    const response = await this.makeRequest(prompt);
    
    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsedData = JSON.parse(cleanedResponse);
      
      if (!this.validateQuizData(parsedData)) {
        throw new Error('Invalid quiz data structure received.');
      }
      
      if (parsedData.questions.length !== 10) {
        throw new Error('Quiz must contain exactly 10 questions.');
      }
      
      return parsedData;
    } catch (error) {
      console.error('JSON Parse Error:', error);
      throw new Error('Failed to parse quiz response. Please try again.');
    }
  }

  getRateLimitStatus(): { 
    canMakeRequest: boolean; 
    waitTime: number; 
    requestsRemaining: number;
    activeKeys: number;
    keyStatuses: Array<{ key: string; requests: number; available: boolean; errors: number }>;
  } {
    return rateLimiter.getStatus();
  }
}

export const geminiService = new GeminiService();