export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background">
        <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
