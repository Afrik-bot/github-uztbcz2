import OpenAI from 'openai';
import { rateLimit } from '../utils/rateLimit';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Rate limit to 10 requests per minute
const rateLimitedCompletion = rateLimit(openai.chat.completions.create, 10, 60000);

let usageStats = {
  totalTokens: 0,
  totalRequests: 0,
  lastReset: Date.now()
};

// Reset usage stats daily
setInterval(() => {
  usageStats = {
    totalTokens: 0,
    totalRequests: 0,
    lastReset: Date.now()
  };
}, 24 * 60 * 60 * 1000);

export async function generateLeaderRankings() {
  try {
    const prompt = `Generate a ranking of top 5 African leaders based on:
- Economic performance
- Social development initiatives
- Environmental policies
- International relations
- Democratic practices

For each leader include:
- Full name
- Country
- Key achievements
- Recent policy impacts
- Approval rating (estimated %)`;

    const completion = await rateLimitedCompletion({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 1000
    });

    // Update usage statistics
    usageStats.totalTokens += completion.usage?.total_tokens || 0;
    usageStats.totalRequests += 1;

    return parseLeaderRankings(completion.choices[0].message.content || '');
  } catch (error: any) {
    if (error.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate rankings');
  }
}

export function getUsageStats() {
  return {
    ...usageStats,
    lastResetFormatted: new Date(usageStats.lastReset).toLocaleString()
  };
}

function parseLeaderRankings(content: string) {
  try {
    // Implement more robust parsing logic here
    const rankings = content.split('\n\n').map((section, index) => {
      const lines = section.split('\n');
      return {
        name: lines[0].replace(/^\d+\.\s*/, '').trim(),
        country: lines.find(l => l.includes('Country:'))?.split(':')[1].trim() || 'Unknown',
        position: index + 1,
        previousPosition: Math.floor(Math.random() * 5) + 1, // This should be stored/tracked
        approvalRating: parseInt(lines.find(l => l.includes('Approval'))?.match(/\d+/)?.[0] || '0'),
        keyAchievements: lines
          .filter(l => l.includes('-'))
          .map(l => l.replace(/^-\s*/, '').trim()),
        recentPolicies: lines.find(l => l.includes('Recent'))?.split(':')[1].trim() || ''
      };
    });

    return {
      timestamp: new Date().toISOString(),
      rankings
    };
  } catch (error) {
    console.error('Error parsing rankings:', error);
    throw new Error('Failed to parse rankings data');
  }
}