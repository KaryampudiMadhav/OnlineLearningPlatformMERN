const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

// Define the strict schema for AI-generated course data
const skillStepSchema = {
  type: 'object',
  properties: {
    skill: { type: 'string', minLength: 1 },
    difficulty: { 
      type: 'string', 
      enum: ['beginner', 'intermediate', 'advanced'] 
    },
    steps: {
      type: 'array',
      minItems: 5, // Minimum 5 steps per skill
      items: {
        type: 'object',
        properties: {
          step: { type: 'string', minLength: 1 },
          estimatedTime: { type: 'string', minLength: 1 },
          tags: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          },
          resources: {
            type: 'array',
            items: { type: 'string', format: 'uri' },
            minItems: 3 // At least 3 resources
          },
          quiz: {
            type: 'array',
            minItems: 4, // At least 4 quiz questions
            maxItems: 5, // Maximum 5 quiz questions
            items: {
              type: 'object',
              properties: {
                question: { type: 'string', minLength: 1 },
                options: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 4,
                  maxItems: 4
                },
                answer: { type: 'string', minLength: 1 }
              },
              required: ['question', 'options', 'answer'],
              additionalProperties: false
            }
          }
        },
        required: ['step', 'estimatedTime', 'tags', 'resources', 'quiz'],
        additionalProperties: false
      }
    }
  },
  required: ['skill', 'difficulty', 'steps'],
  additionalProperties: false
};

// Compiled validator
const validateSkillStep = ajv.compile(skillStepSchema);

/**
 * Validate a single skill's course data
 * @param {Object} skillData - The skill data to validate
 * @returns {Object} - { valid: boolean, errors: array }
 */
function validateSingleSkill(skillData) {
  const valid = validateSkillStep(skillData);
  
  if (!valid) {
    return {
      valid: false,
      errors: validateSkillStep.errors.map(err => ({
        path: err.instancePath,
        message: err.message,
        params: err.params
      }))
    };
  }
  
  // Additional custom validation
  const customErrors = [];
  
  // Validate that answer is in options for each quiz question
  skillData.steps.forEach((step, stepIdx) => {
    step.quiz.forEach((q, qIdx) => {
      if (!q.options.includes(q.answer)) {
        customErrors.push({
          path: `/steps/${stepIdx}/quiz/${qIdx}/answer`,
          message: `Answer "${q.answer}" is not in options`,
          params: { options: q.options, answer: q.answer }
        });
      }
    });
  });
  
  if (customErrors.length > 0) {
    return {
      valid: false,
      errors: customErrors
    };
  }
  
  return { valid: true, errors: [] };
}

/**
 * Validate an array of skills
 * @param {Array} skillsData - Array of skill data objects
 * @returns {Object} - { valid: boolean, errors: object }
 */
function validateCourseSkills(skillsData) {
  if (!Array.isArray(skillsData)) {
    return {
      valid: false,
      errors: { general: ['skillsData must be an array'] }
    };
  }
  
  if (skillsData.length === 0) {
    return {
      valid: false,
      errors: { general: ['skillsData array cannot be empty'] }
    };
  }
  
  const allErrors = {};
  let allValid = true;
  
  skillsData.forEach((skillData, index) => {
    const result = validateSingleSkill(skillData);
    
    if (!result.valid) {
      allValid = false;
      allErrors[`skill_${index}_${skillData.skill || 'unknown'}`] = result.errors;
    }
  });
  
  return {
    valid: allValid,
    errors: allValid ? {} : allErrors
  };
}

/**
 * Format validation errors for user-friendly display
 * @param {Object} errors - Errors object from validation
 * @returns {String} - Formatted error message
 */
function formatValidationErrors(errors) {
  if (!errors || Object.keys(errors).length === 0) {
    return 'No validation errors';
  }
  
  let message = 'Course validation failed:\n\n';
  
  Object.entries(errors).forEach(([skillKey, skillErrors]) => {
    message += `${skillKey}:\n`;
    skillErrors.forEach(err => {
      message += `  - ${err.path}: ${err.message}\n`;
    });
    message += '\n';
  });
  
  return message;
}

/**
 * Sanitize and fix common issues in AI-generated data
 * @param {Array} skillsData - The skills data to sanitize
 * @returns {Array} - Sanitized skills data
 */
function sanitizeSkillsData(skillsData) {
  if (!Array.isArray(skillsData)) {
    return [];
  }
  
  return skillsData.map(skill => {
    // Ensure difficulty is lowercase
    if (skill.difficulty) {
      skill.difficulty = skill.difficulty.toLowerCase();
    }
    
    // Ensure steps exist
    if (!skill.steps || !Array.isArray(skill.steps)) {
      skill.steps = [];
    }
    
    // Sanitize each step
    skill.steps = skill.steps.map(step => {
      // Ensure arrays exist
      step.tags = Array.isArray(step.tags) ? step.tags : [];
      step.resources = Array.isArray(step.resources) ? step.resources : [];
      step.quiz = Array.isArray(step.quiz) ? step.quiz : [];
      
      // Sanitize quiz questions
      step.quiz = step.quiz.map(q => {
        // Ensure options is array
        q.options = Array.isArray(q.options) ? q.options : [];
        
        // Trim strings
        q.question = (q.question || '').trim();
        q.answer = (q.answer || '').trim();
        q.options = q.options.map(opt => (opt || '').trim());
        
        return q;
      });
      
      // Filter out invalid quiz questions
      step.quiz = step.quiz.filter(q => 
        q.question && 
        q.options.length === 4 && 
        q.answer &&
        q.options.includes(q.answer)
      );
      
      return step;
    });
    
    // Filter out steps with less than 4 quiz questions
    skill.steps = skill.steps.filter(step => step.quiz.length >= 4);
    
    return skill;
  });
}

module.exports = {
  validateSingleSkill,
  validateCourseSkills,
  formatValidationErrors,
  sanitizeSkillsData,
  skillStepSchema
};
