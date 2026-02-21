import { Card, CardContent } from '@/components/ui/card'

export function StatCard({
  title,
  value,
  description,
}: {
  title: string
  value: string | number
  description: string
}) {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-blue-100">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            {value}
          </p>
          <p className="text-xs text-slate-500 font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
