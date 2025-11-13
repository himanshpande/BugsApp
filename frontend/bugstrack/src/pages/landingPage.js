"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import FeaturesPage from "./featuresPage"
import PricingPage from "./pricingPage"
import Footer from "./footer"

const BugMarkerLanding = () => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState({ type: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setStatus({ type: "", message: "" })
    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:5000/api/email/landing-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || "Unable to submit right now. Please try again later.")
      }

      setStatus({ type: "success", message: data?.message || "Thanks! We will be in touch soon." })
      setEmail("")
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to submit right now. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const styles = {
    container: {
      fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: "#1a1a1a",
      backgroundColor: "#fafafa",
      margin: 0,
      padding: 0,
    },
    header: {
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #e5e5e5",
      padding: "16px 0",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    },
    headerContainer: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "0 40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "64px",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "18px",
      fontWeight: "700",
      cursor: "pointer",
    },
    logoIcon: {
      fontSize: "24px",
    },
    navMenu: {
      display: "flex",
      alignItems: "center",
      gap: "32px",
      flex: 1,
      marginLeft: "60px",
    },
    navLink: {
      color: "#1a1a1a",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "color 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    navLinkHover: {
      color: "#e87722",
    },
    dropdownArrow: {
      fontSize: "10px",
      marginLeft: "4px",
    },
    btnStarted: {
      backgroundColor: "#e87722",
      color: "#ffffff",
      border: "none",
      padding: "10px 24px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    btnStartedHover: {
      backgroundColor: "#d46a1a",
    },
    hero: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "80px 40px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "60px",
      alignItems: "center",
      minHeight: "calc(100vh - 200px)",
    },
    heroLeft: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#f0f0f0",
      padding: "10px 16px",
      borderRadius: "24px",
      width: "fit-content",
      fontSize: "13px",
      fontWeight: "600",
      color: "#e87722",
    },
    badgeDiamond: {
      color: "#e87722",
      fontSize: "16px",
    },
    heroTitle: {
      fontSize: "48px",
      fontWeight: "700",
      lineHeight: "1.2",
      margin: 0,
      color: "#1a1a1a",
    },
    heroDescription: {
      fontSize: "15px",
      lineHeight: "1.6",
      color: "#666666",
      margin: 0,
      maxWidth: "500px",
    },
    formSection: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    formLabel: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#1a1a1a",
      margin: 0,
    },
    emailForm: {
      display: "flex",
      gap: "8px",
    },
    emailInput: {
      flex: 1,
      padding: "12px 16px",
      border: "1px solid #e5e5e5",
      borderRadius: "6px",
      fontSize: "14px",
      backgroundColor: "#ffffff",
      color: "#1a1a1a",
      transition: "border-color 0.3s ease",
    },
    emailInputFocus: {
      borderColor: "#e87722",
      outline: "none",
    },
    btnGetStarted: {
      backgroundColor: "#1a1a1a",
      color: "#ffffff",
      border: "none",
      padding: "12px 24px",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      whiteSpace: "nowrap",
    },
    btnGetStartedHover: {
      backgroundColor: "#333333",
    },
    formDisclaimer: {
      fontSize: "12px",
      color: "#999999",
      margin: 0,
    },
    statusMessage: {
      fontSize: "12px",
      margin: 0,
    },
    statusSuccess: {
      color: "#2e7d32",
    },
    statusError: {
      color: "#c62828",
    },
    heroRight: {
      position: "relative",
      height: "500px",
    },
    mockupContainer: {
      position: "relative",
      width: "100%",
      height: "100%",
    },
    floatingElement: {
      position: "absolute",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "600",
    },
    topRight: {
      top: "20px",
      right: "40px",
      width: "80px",
      height: "50px",
      backgroundColor: "#e3f2fd",
      color: "#0066cc",
    },
    happyCustomers: {
      bottom: "100px",
      right: "-30px",
      padding: "12px 16px",
      backgroundColor: "#fff9f0",
      border: "1px solid #ffe8d6",
      flexDirection: "column",
      gap: "4px",
    },
    customersText: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#e87722",
    },
    customersLabel: {
      fontSize: "11px",
      color: "#999999",
    },
    dashboardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "12px",
      width: "100%",
      height: "340px",
    },
    dashboardCard: {
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      border: "1px solid #e5e5e5",
      animation: "float 3s ease-in-out infinite",
    },
    uiElements: {
      position: "absolute",
      bottom: "20px",
      left: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    bugReporterBadge: {
      backgroundColor: "#ffffff",
      padding: "12px 14px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      fontWeight: "600",
      color: "#1a1a1a",
    },
    badgeIcon: {
      fontSize: "16px",
    },
    badgeTextSmall: {
      fontSize: "11px",
      color: "#999999",
      display: "block",
      fontWeight: "400",
    },
    tracingElement: {
      backgroundColor: "#ffffff",
      padding: "12px 14px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      fontSize: "13px",
      fontWeight: "600",
    },
    progressBar: {
      fontSize: "12px",
      color: "#e87722",
      fontWeight: "700",
      marginTop: "4px",
    },
    avatars: {
      position: "absolute",
      bottom: "80px",
      left: "40px",
      display: "flex",
      gap: "-8px",
    },
    avatar: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: "#e0e0e0",
      border: "2px solid #ffffff",
      marginLeft: "-8px",
    },
    bottomRight: {
      bottom: "20px",
      right: "20px",
      width: "50px",
      height: "50px",
      backgroundColor: "#e8f5e9",
      color: "#00796b",
      fontSize: "20px",
    },
    iconBadge: {
      fontSize: "24px",
    },
    gradientBg: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "100%",
      height: "100%",
      background:
        "linear-gradient(135deg, rgba(232, 119, 34, 0.05) 0%, rgba(255, 200, 100, 0.08) 50%, transparent 100%)",
      borderRadius: "20px",
      zIndex: -1,
    },
  }

  const globalStyle = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
  `

  return (
    <>
      <style>{globalStyle}</style>
      <div style={styles.container}>
        {/* Header/Navigation */}
        <header style={styles.header}>
          <div style={styles.headerContainer}>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>🐞</span>
              <span>BugMarker</span>
            </div>
            <nav style={styles.navMenu}>
              <a
                href="#home"
                style={styles.navLink}
                onMouseOver={(e) => (e.target.style.color = "#e87722")}
                onMouseOut={(e) => (e.target.style.color = "#1a1a1a")}
              >
                Home
              </a>
              <a
                href="#features"
                style={styles.navLink}
                onMouseOver={(e) => (e.target.style.color = "#e87722")}
                onMouseOut={(e) => (e.target.style.color = "#1a1a1a")}
                onClick={()=>navigate("/features")}
              >
                Features
              </a>
              <a
                href="#pricing"
                style={styles.navLink}
                onMouseOver={(e) => (e.target.style.color = "#e87722")}
                onMouseOut={(e) => (e.target.style.color = "#1a1a1a")}
              >
                Pricing
              </a>
              <a
                href="#integrations"
                style={styles.navLink}
                onMouseOver={(e) => (e.target.style.color = "#e87722")}
                onMouseOut={(e) => (e.target.style.color = "#1a1a1a")}
              >
                Integrations
              </a>
              <div style={{ ...styles.navLink, cursor: "default" }}>
                <span>Support</span>
                <span style={styles.dropdownArrow}>▼</span>
              </div>
            </nav>
            <button
              style={styles.btnStarted}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#d46a1a")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#e87722")}
              onClick={() => navigate("/register")}
            >
              Register Now
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section style={styles.hero}>
          {/* Left Side - Text Content */}
          <div style={styles.heroLeft}>
            <div style={styles.badge}>
              <span style={styles.badgeDiamond}>◆</span>
              <span>Powerful Solution</span>
              <span style={styles.badgeDiamond}>◆</span>
            </div>

            <h1 style={styles.heroTitle}>
              Our Cutting-Edge
              <br />
              Software Solutions
            </h1>

            <p style={styles.heroDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus non enim lacus.
            </p>

            {/* Email Form */}
            <div style={styles.formSection}>
              <p style={styles.formLabel}>30 Day Free Trial No Credit Cart Required:</p>
              <form onSubmit={handleSubmit} style={styles.emailForm}>
                <input
                  type="email"
                  placeholder="Enter your mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.emailInput}
                  onFocus={(e) => (e.target.style.borderColor = "#e87722")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
                  required
                />
                <button
                  type="submit"
                  style={{
                    ...styles.btnGetStarted,
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = "#333333"
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#1a1a1a"
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Get Started - it's free"}
                </button>
              </form>
              <p style={styles.formDisclaimer}>Add some additional disclaimer text here.</p>
              {status.message && (
                <p
                  style={{
                    ...styles.statusMessage,
                    ...(status.type === "success" ? styles.statusSuccess : styles.statusError),
                  }}
                >
                  {status.message}
                </p>
              )}
            </div>
          </div>

       
        </section>
      </div>
      <FeaturesPage/>
      <PricingPage/>
      <div className="align-footer"><Footer/></div>
      
    </>
  )
}

export default BugMarkerLanding
