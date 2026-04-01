
import DOMPurify from 'dompurify';

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
  // Basic validation: allows digits, spaces, +, -, (, )
  const re = /^[\d\s+\-()]{7,20}$/;
  return re.test(String(phone));
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Use DOMPurify to strip any malicious HTML/scripts
  return DOMPurify.sanitize(input.trim());
};

export const checkSubmissionDelay = (lastSubmissionTime, minimumDelayMs = 1000) => {
  if (!lastSubmissionTime) return true;
  const now = Date.now();
  return (now - lastSubmissionTime) >= minimumDelayMs;
};

export const generateMathChallenge = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return {
    question: `What is ${num1} + ${num2}?`,
    answer: num1 + num2
  };
};

export const validateMathAnswer = (userAnswer, correctAnswer) => {
  return parseInt(userAnswer, 10) === correctAnswer;
};
