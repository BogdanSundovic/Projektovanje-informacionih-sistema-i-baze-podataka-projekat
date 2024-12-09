import { Form } from '../types/form';

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  forms: Form[];
}

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'user1@example.com',
    password: 'user1pass',
    role: 'user',
    forms: [
      {
        id: '1',
        title: 'Employee Satisfaction Survey',
        description: 'Annual employee satisfaction assessment',
        questions: [
          {
            id: '1-1',
            type: 'single_choice',
            title: 'How satisfied are you with your work environment?',
            required: true,
            options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
          },
          {
            id: '1-2',
            type: 'long_text',
            title: 'What improvements would you suggest for your workplace?',
            required: false
          },
          {
            id: '1-3',
            type: 'numeric',
            title: 'On a scale of 1-10, how likely are you to recommend our company?',
            required: true,
            numericRange: { min: 1, max: 10, step: 1 }
          },
          {
            id: '1-4',
            type: 'multiple_choice',
            title: 'Which benefits do you value most?',
            required: true,
            options: ['Health Insurance', 'Remote Work', 'Professional Development', 'Gym Membership', 'Stock Options']
          },
          {
            id: '1-5',
            type: 'date',
            title: 'When did you join the company?',
            required: true
          }
        ],
        allowAnonymous: false,
        createdAt: '2024-03-15T10:00:00Z',
        updatedAt: '2024-03-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Project Feedback Form',
        description: 'Collect feedback on recent project completion',
        questions: [
          {
            id: '2-1',
            type: 'single_choice',
            title: 'How would you rate the project management?',
            required: true,
            options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor']
          },
          {
            id: '2-2',
            type: 'long_text',
            title: 'What were the main challenges faced during the project?',
            required: true
          },
          {
            id: '2-3',
            type: 'multiple_choice',
            title: 'Which aspects of the project were most successful?',
            required: true,
            options: ['Timeline', 'Budget', 'Quality', 'Communication', 'Innovation']
          },
          {
            id: '2-4',
            type: 'numeric',
            title: 'Rate the overall project success (1-5)',
            required: true,
            numericRange: { min: 1, max: 5, step: 1 }
          },
          {
            id: '2-5',
            type: 'time',
            title: 'What was the typical daily meeting time?',
            required: false
          }
        ],
        allowAnonymous: false,
        createdAt: '2024-03-16T10:00:00Z',
        updatedAt: '2024-03-16T10:00:00Z'
      }
    ]
  },
  {
    id: '2',
    email: 'user2@example.com',
    password: 'user2pass',
    role: 'user',
    forms: [
      {
        id: '3',
        title: 'Community Event Feedback',
        description: 'Help us improve future community events',
        questions: Array.from({ length: 10 }, (_, i) => ({
          id: `3-${i + 1}`,
          type: i < 3 ? 'single_choice' :
                i < 5 ? 'multiple_choice' :
                i < 7 ? 'long_text' :
                i < 8 ? 'date' :
                i < 9 ? 'time' : 'numeric',
          title: [
            'How would you rate the event overall?',
            'Was the venue suitable for the event?',
            'How was the quality of presentations?',
            'Which activities did you participate in?',
            'What refreshments did you enjoy?',
            'What did you like most about the event?',
            'What could be improved for future events?',
            'When would you prefer future events to be held?',
            'What time of day works best for you?',
            'How likely are you to attend future events (1-10)?'
          ][i],
          required: i < 5,
          options: i < 3 ? ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'] :
                  i < 5 ? ['Workshops', 'Presentations', 'Networking', 'Games', 'Food & Drinks'] : undefined,
          numericRange: i === 9 ? { min: 1, max: 10, step: 1 } : undefined
        })),
        allowAnonymous: true,
        createdAt: '2024-03-17T10:00:00Z',
        updatedAt: '2024-03-17T10:00:00Z'
      },
      {
        id: '4',
        title: 'Internal Team Assessment',
        description: 'Confidential team performance evaluation',
        questions: Array.from({ length: 10 }, (_, i) => ({
          id: `4-${i + 1}`,
          type: i < 3 ? 'single_choice' :
                i < 5 ? 'multiple_choice' :
                i < 7 ? 'long_text' :
                i < 8 ? 'numeric' :
                i < 9 ? 'date' : 'time',
          title: [
            'How effective is the team leadership?',
            'Rate the team\'s communication',
            'How is the work-life balance?',
            'Which skills need improvement?',
            'What are the team\'s strengths?',
            'Describe the team\'s biggest achievement',
            'Suggest areas for improvement',
            'Rate overall team performance (1-10)',
            'Last successful project completion date',
            'Typical team meeting time'
          ][i],
          required: true,
          options: i < 3 ? ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'] :
                  i < 5 ? ['Technical', 'Communication', 'Leadership', 'Problem-solving', 'Collaboration'] : undefined,
          numericRange: i === 7 ? { min: 1, max: 10, step: 1 } : undefined
        })),
        allowAnonymous: false,
        createdAt: '2024-03-18T10:00:00Z',
        updatedAt: '2024-03-18T10:00:00Z'
      }
    ]
  },
  {
    id: '3',
    email: 'admin1@example.com',
    password: 'admin1pass',
    role: 'admin',
    forms: []
  }
];