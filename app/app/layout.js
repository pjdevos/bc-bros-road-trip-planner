import './globals.css'

export const metadata = {
  title: 'BC Bros Road Trip Planner',
  description: '10 legends, 10 days, 1 epic camper van adventure through British Columbia',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
