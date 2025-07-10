import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { prompt } = await request.json()
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Claude API Error:', response.status, errorData)
      throw new Error(`Claude API failed: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ response: data.content[0].text })
  } catch (error) {
    console.error('Error calling Claude API:', error)
    return NextResponse.json(
      { error: `Failed to get response: ${error.message}` },
      { status: 500 }
    )
  }
}
