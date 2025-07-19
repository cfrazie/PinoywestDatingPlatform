// SQL validation utilities to prevent syntax errors

export interface SQLValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Basic SQL syntax validation for common patterns
export const validateSQLSyntax = (sql: string): SQLValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for common IN clause syntax errors
  const inClausePattern = /IN\s*\(\s*'[^']*'\s*'[^']*'/gi;
  if (inClausePattern.test(sql)) {
    errors.push('Missing comma in IN clause between string literals');
  }

  // Check for unmatched parentheses
  const openParens = (sql.match(/\(/g) || []).length;
  const closeParens = (sql.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push('Unmatched parentheses in SQL query');
  }

  // Check for unmatched quotes
  const singleQuotes = (sql.match(/'/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    errors.push('Unmatched single quotes in SQL query');
  }

  // Check for common typos in keywords
  const commonTypos = [
    { pattern: /\bSELCET\b/gi, correct: 'SELECT' },
    { pattern: /\bFROM\s+WEHRE\b/gi, correct: 'FROM ... WHERE' },
    { pattern: /\bINSERT\s+ITNO\b/gi, correct: 'INSERT INTO' },
    { pattern: /\bUPDATE\s+SET\s+WEHRE\b/gi, correct: 'UPDATE ... SET ... WHERE' }
  ];

  commonTypos.forEach(({ pattern, correct }) => {
    if (pattern.test(sql)) {
      errors.push(`Possible typo detected. Did you mean '${correct}'?`);
    }
  });

  // Check for potentially dangerous operations
  if (/DROP\s+TABLE/gi.test(sql)) {
    warnings.push('DROP TABLE detected - ensure this is intentional');
  }

  if (/DELETE\s+FROM\s+\w+\s*;?\s*$/gi.test(sql)) {
    warnings.push('DELETE without WHERE clause detected - this will delete all rows');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Validate email list syntax for IN clauses
export const validateEmailList = (emails: string[]): string => {
  if (emails.length === 0) {
    throw new Error('Email list cannot be empty');
  }

  // Validate each email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = emails.filter(email => !emailRegex.test(email));
  
  if (invalidEmails.length > 0) {
    throw new Error(`Invalid email format: ${invalidEmails.join(', ')}`);
  }

  // Generate properly formatted SQL IN clause
  const quotedEmails = emails.map(email => `'${email.replace(/'/g, "''")}'`);
  return `(${quotedEmails.join(', ')})`;
};

// Safe SQL string escaping
export const escapeSQLString = (value: string): string => {
  return value.replace(/'/g, "''");
};

// Build safe IN clause for emails
export const buildEmailInClause = (emails: string[]): string => {
  try {
    return validateEmailList(emails);
  } catch (error) {
    console.error('Error building email IN clause:', error);
    throw error;
  }
};

// Example usage for admin emails
export const getAdminEmailClause = (): string => {
  const adminEmails = [
    'admin@pinoywest.com',
    'support@pinoywest.com',
    'christopher@pinoywest.com'
  ];
  
  return buildEmailInClause(adminEmails);
};

// Validate and format SQL query with admin emails
export const buildAdminCheckQuery = (tableName: string = 'auth.users'): string => {
  const emailClause = getAdminEmailClause();
  
  const query = `
    SELECT 1 FROM ${tableName}
    WHERE ${tableName}.id = auth.uid()
    AND ${tableName}.email IN ${emailClause}
  `;

  const validation = validateSQLSyntax(query);
  if (!validation.isValid) {
    throw new Error(`SQL validation failed: ${validation.errors.join(', ')}`);
  }

  return query;
};