
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // put your key in .env
  dangerouslyAllowBrowser: true
})

export async function summarizeNote(content: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: `Summarize this note:\n\n${content}` }],
    temperature: 0.7,
  })

  return response.choices[0].message.content || ''
}
