import type { Metadata } from 'next'
import './globals.css'
import ReduxProvider from '../src/components/providers/ReduxProvider'

export const metadata: Metadata = {
  title: 'María & Carlos - Nuestra Boda',
  description: 'Te invitamos a celebrar nuestro día especial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
