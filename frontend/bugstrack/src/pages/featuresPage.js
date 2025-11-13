"use client"

const FeaturesPage = () => {
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#1a1a1a",
      color: "#ffffff",
      padding: "80px 40px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    content: {
      maxWidth: "1200px",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "60px",
      alignItems: "center",
    },
    leftSection: {
      flex: 1,
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "10px 20px",
      border: "2px solid #e87722",
      borderRadius: "30px",
      fontSize: "14px",
      color: "#e87722",
      marginBottom: "30px",
      fontWeight: "600",
    },
    badgeIcon: {
      fontSize: "16px",
    },
    title: {
      fontSize: "48px",
      fontWeight: "700",
      marginBottom: "30px",
      lineHeight: "1.2",
      color: "#ffffff",
    },
    featureBox: {
      marginBottom: "40px",
      padding: "20px",
      backgroundColor: "#2a2a2a",
      borderRadius: "12px",
      borderLeft: "4px solid #e87722",
    },
    featureTitle: {
      fontSize: "20px",
      fontWeight: "700",
      marginBottom: "10px",
      color: "#ffffff",
    },
    featureDescription: {
      fontSize: "14px",
      color: "#b0b0b0",
      lineHeight: "1.6",
    },
    buttonsContainer: {
      display: "flex",
      gap: "15px",
      marginTop: "40px",
    },
    button: {
      padding: "12px 28px",
      fontSize: "14px",
      fontWeight: "600",
      border: "2px solid",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textDecoration: "none",
      display: "inline-block",
    },
    buttonPrimary: {
      backgroundColor: "#e87722",
      color: "#ffffff",
      borderColor: "#e87722",
    },
    buttonSecondary: {
      backgroundColor: "transparent",
      color: "#ffffff",
      borderColor: "#ffffff",
    },
    rightSection: {
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    mockupContainer: {
      position: "relative",
      width: "100%",
      maxWidth: "500px",
    },
    mockupBrowser: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    },
    browserHeader: {
      backgroundColor: "#f0f0f0",
      padding: "12px 15px",
      display: "flex",
      gap: "8px",
      alignItems: "center",
    },
    browserDot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
    },
    browserDotRed: {
      backgroundColor: "#ff5f56",
    },
    browserDotYellow: {
      backgroundColor: "#ffbd2e",
    },
    browserDotGreen: {
      backgroundColor: "#27c93f",
    },
    browserContent: {
      padding: "30px",
      backgroundColor: "#f9f9f9",
      color: "#1a1a1a",
    },
    mockupHeading: {
      fontSize: "28px",
      fontWeight: "700",
      marginBottom: "15px",
      color: "#1a1a1a",
      lineHeight: "1.3",
    },
    mockupText: {
      fontSize: "14px",
      color: "#666",
      lineHeight: "1.6",
      marginBottom: "20px",
    },
    mockupButtons: {
      display: "flex",
      gap: "10px",
    },
    mockupButtonDark: {
      padding: "10px 16px",
      fontSize: "12px",
      backgroundColor: "#333",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
    mockupButtonOrange: {
      padding: "10px 16px",
      fontSize: "12px",
      backgroundColor: "#e87722",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
    floatingBadge: {
      position: "absolute",
      bottom: "-15px",
      right: "-15px",
      backgroundColor: "#ffffff",
      padding: "15px",
      borderRadius: "50%",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
      width: "60px",
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "28px",
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Left Section */}
        <div style={styles.leftSection}>
          <div style={styles.badge}>
            <span style={styles.badgeIcon}>✦</span>
            Track Progress
            <span style={styles.badgeIcon}>✦</span>
          </div>

          <h1 style={styles.title}>Unlock Powerful Bug Tracking Capabilities</h1>

          <div style={styles.featureBox}>
            <h3 style={styles.featureTitle}>Instant Bug Reporting Widget</h3>
            <p style={styles.featureDescription}>
              Seamlessly capture, describe, and report bugs straight from your website. Perfect for teams working on
              under-development projects no extra tools or context-switching needed.
            </p>
          </div>

          <div style={styles.featureBox}>
            <h3 style={styles.featureTitle}>Track Progress Visually with Kanban</h3>
            <p style={styles.featureDescription}>Streamline your development process with our custom script...</p>
          </div>

          <div style={styles.featureBox}>
            <h3 style={styles.featureTitle}>Smart Team Management</h3>
            <p style={styles.featureDescription}>Streamline your development process with our custom script...</p>
          </div>

          <div style={styles.buttonsContainer}>
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#d16a1a")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#e87722")}
            >
              Get Started
            </button>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#ffffff"
                e.target.style.color = "#1a1a1a"
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "transparent"
                e.target.style.color = "#ffffff"
              }}
            >
              Learn more
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div style={styles.rightSection}>
          <div style={styles.mockupContainer}>
            <div style={styles.mockupBrowser}>
              <div style={styles.browserHeader}>
                <div style={{ ...styles.browserDot, ...styles.browserDotRed }}></div>
                <div style={{ ...styles.browserDot, ...styles.browserDotYellow }}></div>
                <div style={{ ...styles.browserDot, ...styles.browserDotGreen }}></div>
              </div>
              <div style={styles.browserContent}>
                <h2 style={styles.mockupHeading}>Improving your productivity is now on your hand.</h2>
                <p style={styles.mockupText}>
                  Say hello to a calendar that's more than just a scheduling tool—it's a beautiful designed.
                </p>
                <div style={styles.mockupButtons}>
                  <button style={styles.mockupButtonDark}>Get started for free</button>
                  <button style={styles.mockupButtonOrange}>Explore all features</button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturesPage
