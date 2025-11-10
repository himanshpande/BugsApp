"use client"

import { useState } from "react"
import "./Overview.css"

export default function Dashboard({ totalEmployees = 0, TotalWorkItems = 0, totalPunchedInUsers = 0, isAdmin = false, isDarkMode = false }) {
  const [salesPeriod, setSalesPeriod] = useState("month")


  const stats = {
    totalEmployees: { value: totalEmployees.toString(), change: "0%", color: "yellow" },
    totalWorkItems: { value: TotalWorkItems.toString(), change: "0%", color: "blue" },
    ...(isAdmin && { totalPunchedInUsers: { value: totalPunchedInUsers.toString(), change: "0%", color: "purple" } }),
    processedOrders: { value: "2,456", change: "10.2%", color: "green" },
  }

  const quickStats = [
    { icon: "👥", label: `${totalEmployees} total employees in the team`, color: "purple" },
    { icon: "🐞", label: `${TotalWorkItems} work items in progress`, color: "green" },
    ...(isAdmin ? [{ icon: "🟢", label: `${totalPunchedInUsers} users currently punched in`, color: "green" }] : []),
    { icon: "⏱", label: "194 orders on hold", color: "orange" },
    { icon: "📦", label: "12 products low in stock", color: "yellow" },
    { icon: "❌", label: "8 products out of stock", color: "red" },
  ]

  const [salesData] = useState([
    { month: "Jan", value: 120 },
    { month: "Feb", value: 90 },
    { month: "Mar", value: 150 },
    { month: "Apr", value: 130 },
    { month: "May", value: 160 },
    { month: "Jun", value: 180 },
  ])

  const [distributionData] = useState([
    { name: "Lagos", sales: 1760, color: "#06b6d4", percent: 55 },
    { name: "Ibadan", sales: 880, color: "#a78bfa", percent: 27 },
    { name: "P)Hacourt", sales: 341, color: "#fcd34d", percent: 11 },
    { name: "Abuja", sales: 199, color: "#ef4444", percent: 7 },
  ])

  const [ordersData] = useState([
    { month: "Jan", total: 140, processed: 90, cancelled: 50 },
    { month: "Feb", total: 160, processed: 100, cancelled: 60 },
    { month: "Mar", total: 180, processed: 130, cancelled: 50 },
    { month: "Apr", total: 150, processed: 110, cancelled: 40 },
    { month: "May", total: 170, processed: 120, cancelled: 50 },
  ])

  const containerClass = isDarkMode ? "dashboard-container dark" : "dashboard-container"

  return (
    <div className={containerClass}>
      {/* Header */}
      <header className="dashboard-header">
        
        <div className="header-actions">
        </div>
      </header>

      <main className="dashboard-main">
        {/* Stats Grid */}
        <div className="stats-grid">
          {Object.entries(stats).map(([key, stat]) => (
            <div key={key} className="stat-card">
              <div className="stat-content">
                <p className="stat-title">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                <p className="stat-value">{stat.value}</p>
                <span className="stat-change positive">↑ {stat.change}</span>
              </div>
              <div className={`stat-chart chart-${stat.color}`}></div>
            </div>
          ))}
        </div>

        {/* Quick Stats and Sales Analytics */}
        <div className="dashboard-grid">
          {/* Quick Stats Card */}
          <div className="quick-stats-card">
            <h3 className="card-title">Quick Stats</h3>
            <div className="stats-list">
              {quickStats.map((stat, idx) => (
                <div key={idx} className="stat-item">
                  <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
                  <p className="stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Analytics Card */}
          <div className="sales-analytics-card">
            <div className="card-header">
              <h3 className="card-title">Sales Analytics</h3>
              <div className="period-toggle">
                <button
                  className={`period-btn ${salesPeriod === "week" ? "active" : ""}`}
                  onClick={() => setSalesPeriod("week")}
                >
                  Week
                </button>
                <button
                  className={`period-btn ${salesPeriod === "month" ? "active" : ""}`}
                  onClick={() => setSalesPeriod("month")}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="chart-container">
              <svg className="line-chart" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#6366f1", stopOpacity: 0.2 }} />
                    <stop offset="100%" style={{ stopColor: "#6366f1", stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                <polyline
                  points="20,150 80,100 140,120 200,80 260,90 340,40"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                />
                <polygon points="20,150 80,100 140,120 200,80 260,90 340,40 340,200 20,200" fill="url(#areaGradient)" />
                {[20, 80, 140, 200, 260, 340].map((x, idx) => (
                  <circle key={idx} cx={x} cy={[150, 100, 120, 80, 90, 40][idx]} r="3" fill="#6366f1" />
                ))}
              </svg>
            </div>
            <div className="chart-labels">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month) => (
                <span key={month} className="chart-label">
                  {month}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Distribution and Orders Analytics */}
        <div className="dashboard-grid">
          {/* Sales Distribution Card */}
          <div className="distribution-card">
            <div className="card-header">
              <h3 className="card-title">Sales Distribution</h3>
              <select className="location-select">
                <option>Nigeria ▼</option>
              </select>
            </div>
            <div className="distribution-content">
              <div className="donut-chart">
                <svg className="donut-svg" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="20"
                    strokeDasharray="86 314"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="20"
                    strokeDasharray="85 314"
                    strokeDashoffset="-86"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#fcd34d"
                    strokeWidth="20"
                    strokeDasharray="34 314"
                    strokeDashoffset="-171"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="20"
                    strokeDasharray="22 314"
                    strokeDashoffset="-205"
                  />
                </svg>
                <div className="donut-center">
                  <p className="donut-value">3,190</p>
                  <p className="donut-label">Sales</p>
                </div>
              </div>
              <div className="distribution-legend">
                {distributionData.map((item, idx) => (
                  <div key={idx} className="legend-item">
                    <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
                    <div className="legend-info">
                      <span className="legend-location">{item.name}</span>
                      <span className="legend-sales">{item.sales.toLocaleString()} Sales</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Analytics Card */}
          <div className="orders-analytics-card">
            <div className="card-header">
              <h3 className="card-title">Orders Analytics</h3>
              <div className="orders-legend">
                <div className="legend-item">
                  <div className="dot" style={{ backgroundColor: "#6366f1" }}></div>
                  <span>Total Orders</span>
                </div>
                <div className="legend-item cyan">
                  <div className="dot"></div>
                  <span>Processed Orders</span>
                </div>
                <div className="legend-item red">
                  <div className="dot"></div>
                  <span>Cancelled Orders</span>
                </div>
              </div>
            </div>
            <div className="bar-chart-container">
              <svg className="bar-chart" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                {ordersData.map((data, idx) => {
                  const xPos = 40 + idx * 70
                  const maxValue = 180
                  const totalHeight = data.total * (140 / maxValue)
                  const processedHeight = data.processed * (140 / maxValue)
                  const cancelledHeight = data.cancelled * (140 / maxValue)

                  return (
                    <g key={idx}>
                      <rect
                        x={xPos}
                        y={160 - totalHeight}
                        width="12"
                        height={totalHeight}
                        fill="#6366f1"
                        opacity="0.3"
                      />
                      <rect
                        x={xPos + 13}
                        y={160 - processedHeight}
                        width="12"
                        height={processedHeight}
                        fill="#06b6d4"
                      />
                      <rect
                        x={xPos + 26}
                        y={160 - cancelledHeight}
                        width="12"
                        height={cancelledHeight}
                        fill="#ef4444"
                      />
                    </g>
                  )
                })}
              </svg>
            </div>
            <div className="chart-x-labels">
              {ordersData.map((data) => (
                <span key={data.month}>{data.month}</span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
