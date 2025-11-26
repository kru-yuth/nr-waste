import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { wasteService } from '../services/wasteService';
import { Loader2, TrendingUp, Scale, Recycle } from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await wasteService.getRecordsByYear(year);
                setRecords(data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year]);

    // Process data for charts
    const categoryData = React.useMemo(() => {
        const stats = {};
        records.forEach(record => {
            stats[record.category] = (stats[record.category] || 0) + Number(record.weight);
        });
        return Object.keys(stats).map(key => ({
            name: key,
            value: stats[key]
        }));
    }, [records]);

    const monthlyData = React.useMemo(() => {
        const months = Array(12).fill(0).map((_, i) => ({
            name: new Date(0, i).toLocaleString('th-TH', { month: 'short' }),
            total: 0,
            Organic: 0,
            Recycle: 0,
            General: 0
        }));

        records.forEach(record => {
            const monthIndex = record.month - 1;
            if (months[monthIndex]) {
                months[monthIndex].total += Number(record.weight);
                if (months[monthIndex][record.category] !== undefined) {
                    months[monthIndex][record.category] += Number(record.weight);
                }
            }
        });
        return months;
    }, [records]);

    const totalWeight = records.reduce((sum, r) => sum + Number(r.weight), 0);
    const totalRecycled = records
        .filter(r => r.category === 'Recycle')
        .reduce((sum, r) => sum + Number(r.weight), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header & Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Waste ({year})</p>
                            <h3 className="text-3xl font-bold text-gray-900">{totalWeight.toLocaleString()} kg</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Scale size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Recycled</p>
                            <h3 className="text-3xl font-bold text-green-600">{totalRecycled.toLocaleString()} kg</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <Recycle size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Recycle Rate</p>
                            <h3 className="text-3xl font-bold text-purple-600">
                                {totalWeight > 0 ? ((totalRecycled / totalWeight) * 100).toFixed(1) : 0}%
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Monthly Statistics</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="Organic" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="Recycle" stackId="a" fill="#3b82f6" />
                                <Bar dataKey="General" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Waste Composition</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
