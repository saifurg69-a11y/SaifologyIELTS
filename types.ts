export enum AppMode {
  MENU = 'MENU',
  LISTENING = 'LISTENING',
  READING = 'READING',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
  VOCAB_GRAMMAR = 'VOCAB_GRAMMAR',
  VEO_STUDIO = 'VEO_STUDIO',
  IMAGE_TOOLS = 'IMAGE_TOOLS',
  HISTORY = 'HISTORY',
}

export enum Difficulty {
  BEGINNER = 'Beginner (Band 4-5)',
  INTERMEDIATE = 'Intermediate (Band 5.5-6.5)',
  ADVANCED = 'Advanced (Band 7-9)',
}

export interface Question {
  id: number;
  text: string;
  options?: string[];
  type: 'MCQ' | 'FILL_BLANK' | 'TRUE_FALSE';
  correctAnswer: string;
}

export interface ReadingTest {
  passage: string;
  questions: Question[];
}

export interface WritingTask {
  type: 'Task 1' | 'Task 2';
  prompt: string;
  imageDescription?: string; // For Task 1
}
