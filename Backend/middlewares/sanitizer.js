// sanitizer.js
import sanitizeHtml from "sanitize-html";

/**
 * Simple sanitizer that removes all HTML tags and scripts
 * @param {string} input - The potentially unsafe string
 * @returns {string} - The sanitized string
 */
export const sanitize = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove all HTML tags, keep only text content
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  });
};

/**
 * Sanitize with basic formatting allowed (bold, italic, line breaks)
 * @param {string} input - The potentially unsafe string
 * @returns {string} - The sanitized string with basic formatting
 */
export const sanitizeWithFormatting = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return sanitizeHtml(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'br'],
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  });
};