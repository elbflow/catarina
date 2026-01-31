import React from 'react'
import './styles.css'

export const metadata = {
  description: 'IPM Scout-to-Action - Helping growers catch the narrow intervention window',
  title: 'IPM Scout Dashboard',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
