"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Calendar, BarChart3, AlertTriangle, ShieldAlert } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Mock data for report generation
const MOCK_REPORT_DATA = Array.from({ length: 20 }, (_, i) => ({
    id: `LOG-${1000 + i}`,
    timestamp: new Date(Date.now() - i * 3600 * 1000).toLocaleString(),
    type: i % 5 === 0 ? "Critical" : i % 3 === 0 ? "Warning" : "Info",
    location: i % 2 === 0 ? "Main Entrance" : "Food Court",
    description: i % 5 === 0 ? "Overcrowding detected" : "Routine density check",
    peopleCount: 150 + Math.floor(Math.random() * 200),
    status: i % 4 === 0 ? "Pending" : "Resolved"
}))

import { DashboardLayout } from "@/components/dashboard-layout"

export default function ReportsPage() {
    const [reportType, setReportType] = useState("daily")
    const [isGenerating, setIsGenerating] = useState(false)

    const generatePDF = () => {
        setIsGenerating(true)
        const doc = new jsPDF() as any // Cast to any to avoid type issues with autotable plugin

        // Title
        doc.setFontSize(20)
        doc.text("CrowdVision AI - Security Report", 14, 22)

        // Metadata
        doc.setFontSize(10)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
        doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Summary`, 14, 35)

        // Summary Stats
        const totalAlerts = MOCK_REPORT_DATA.length
        const criticalAlerts = MOCK_REPORT_DATA.filter(d => d.type === "Critical").length
        const peakCount = Math.max(...MOCK_REPORT_DATA.map(d => d.peopleCount))

        doc.autoTable({
            startY: 45,
            head: [['Summary Statistic', 'Value']],
            body: [
                ['Total Incidents', totalAlerts],
                ['Critical Alerts', criticalAlerts],
                ['Peak Crowd Count', peakCount],
                ['Reporting Period', 'Last 24 Hours']
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 }
        })

        // Detailed Table
        doc.text("Detailed Activity Log", 14, doc.lastAutoTable.finalY + 10)

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Time', 'Type', 'Location', 'Count', 'Status']],
            body: MOCK_REPORT_DATA.map(row => [
                row.timestamp,
                row.type,
                row.location,
                row.peopleCount,
                row.status
            ]),
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 9 }
        })

        doc.save(`security-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`)
        setIsGenerating(false)
    }

    const generateCSV = () => {
        const headers = ["ID,Timestamp,Type,Location,Description,People Count,Status"]
        const rows = MOCK_REPORT_DATA.map(row =>
            `${row.id},"${row.timestamp}",${row.type},${row.location},"${row.description}",${row.peopleCount},${row.status}`
        )

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `security_data_${new Date().toISOString()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Security Reports</h1>
                        <p className="text-slate-400">Generate and export automated security summaries</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Configuration Card */}
                    <Card className="glass-strong border-slate-700 md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-400" />
                                Report Settings
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Configure the time range and format
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Time Range</label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                                        <SelectValue placeholder="Select range" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                        <SelectItem value="daily">Daily Summary (Last 24h)</SelectItem>
                                        <SelectItem value="weekly">Weekly Report (Last 7d)</SelectItem>
                                        <SelectItem value="monthly">Monthly Overview</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button
                                    onClick={generatePDF}
                                    disabled={isGenerating}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {isGenerating ? "Generating..." : "Download PDF Report"}
                                </Button>
                                <Button
                                    onClick={generateCSV}
                                    variant="outline"
                                    className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Export as CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview Area */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="glass p-4 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldAlert className="w-4 h-4 text-red-400" />
                                    <span className="text-slate-400 text-sm">Critical Incidents</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{MOCK_REPORT_DATA.filter(d => d.type === "Critical").length}</p>
                            </div>
                            <div className="glass p-4 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                    <span className="text-slate-400 text-sm">Warnings</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{MOCK_REPORT_DATA.filter(d => d.type === "Warning").length}</p>
                            </div>
                            <div className="glass p-4 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="w-4 h-4 text-blue-400" />
                                    <span className="text-slate-400 text-sm">Peak Crowd</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{Math.max(...MOCK_REPORT_DATA.map(d => d.peopleCount))}</p>
                            </div>
                        </div>

                        <div className="glass-strong rounded-xl border border-slate-700 overflow-hidden">
                            <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Report Preview
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                                        <tr>
                                            <th className="px-4 py-3">Time</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Location</th>
                                            <th className="px-4 py-3">Count</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {MOCK_REPORT_DATA.slice(0, 5).map((row) => (
                                            <tr key={row.id} className="text-slate-300 hover:bg-slate-800/50">
                                                <td className="px-4 py-3">{row.timestamp}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.type === "Critical" ? "bg-red-500/20 text-red-400" :
                                                        row.type === "Warning" ? "bg-yellow-500/20 text-yellow-400" :
                                                            "bg-blue-500/20 text-blue-400"
                                                        }`}>
                                                        {row.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{row.location}</td>
                                                <td className="px-4 py-3">{row.peopleCount}</td>
                                                <td className="px-4 py-3 text-slate-400">{row.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="p-3 text-center border-t border-slate-800">
                                    <span className="text-xs text-slate-500">Showing 5 of {MOCK_REPORT_DATA.length} records</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
