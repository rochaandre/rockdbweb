
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line,
    RadialBarChart, RadialBar,
} from 'recharts'

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#475569'
]

interface ChartProps {
    data: any[]
}

export function PieChartView({ data }: ChartProps) {
    if (!data || data.length === 0) return null

    // Assume first column is label, second is value
    const keys = Object.keys(data[0])
    const labelKey = keys[0]
    const valueKey = keys[1]

    return (
        <div className="h-full w-full flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius="80%"
                        fill="#8884d8"
                        dataKey={valueKey}
                        nameKey={labelKey}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

export function BarChartView({ data }: ChartProps) {
    if (!data || data.length === 0) return null
    const keys = Object.keys(data[0])
    const labelKey = keys[0]
    const valueKey = keys[1]

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey={labelKey} fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={valueKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export function LineChartView({ data }: ChartProps) {
    if (!data || data.length === 0) return null
    const keys = Object.keys(data[0])
    const labelKey = keys[0]
    const valueKey = keys[1]

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey={labelKey} fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey={valueKey} stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export function GaugeChartView({ data }: ChartProps) {
    if (!data || data.length === 0) return null
    // Gauge usually takes a single value or percentage
    const keys = Object.keys(data[0])
    const value = parseFloat(data[0][keys[0]]) || 0

    const gaugeData = [
        { name: 'value', value: value, fill: '#3b82f6' }
    ]

    return (
        <div className="h-full w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
                <RadialBarChart
                    cx="50%"
                    cy="100%"
                    innerRadius="100%"
                    outerRadius="160%"
                    barSize={20}
                    data={gaugeData}
                    startAngle={180}
                    endAngle={0}
                >
                    <RadialBar
                        background
                        dataKey="value"
                    />
                    <text x="50%" y="90%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-4xl font-bold">
                        {value.toFixed(1)}%
                    </text>
                </RadialBarChart>
            </ResponsiveContainer>
        </div>
    )
}
