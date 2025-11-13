"use client"

const PricingPage = () => {
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      padding: "80px 40px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    content: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center",
      marginBottom: "60px",
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
      marginBottom: "20px",
      fontWeight: "600",
    },
    badgeIcon: {
      fontSize: "16px",
    },
    title: {
      fontSize: "42px",
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: "15px",
      margin: "0 0 15px 0",
    },
    subtitle: {
      fontSize: "16px",
      color: "#666",
      marginBottom: "50px",
    },
    plansContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "30px",
      justifyContent: "center",
    },
    planCard: {
      padding: "40px",
      borderRadius: "20px",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e5e5",
      textAlign: "center",
      transition: "all 0.3s ease",
    },
    planCardHighlighted: {
      backgroundColor: "#e87722",
      color: "#ffffff",
      border: "none",
      transform: "scale(1.05)",
      boxShadow: "0 20px 50px rgba(232, 119, 34, 0.2)",
    },
    planName: {
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "15px",
      color: "inherit",
    },
    planPrice: {
      fontSize: "48px",
      fontWeight: "700",
      marginBottom: "30px",
      color: "inherit",
    },
    priceSubtext: {
      fontSize: "14px",
      color: "inherit",
      opacity: "0.8",
    },
    featuresList: {
      listStyle: "none",
      padding: "0",
      margin: "30px 0",
      textAlign: "left",
    },
    featureItem: {
      padding: "12px 0",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: "inherit",
    },
    checkmark: {
      color: "#e87722",
      fontSize: "18px",
      fontWeight: "bold",
    },
    checkmarkWhite: {
      color: "#ffffff",
    },
    button: {
      width: "100%",
      padding: "14px 20px",
      fontSize: "16px",
      fontWeight: "600",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "20px",
    },
    buttonPrimary: {
      backgroundColor: "#e87722",
      color: "#ffffff",
    },
    buttonPrimaryHover: {
      backgroundColor: "#d16a1a",
    },
    buttonSecondary: {
      backgroundColor: "#ffffff",
      color: "#e87722",
    },
    buttonSecondaryHover: {
      backgroundColor: "#f5f5f5",
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.badge}>
            <span style={styles.badgeIcon}>✦</span>
            Pricing
            <span style={styles.badgeIcon}>✦</span>
          </div>
          <h1 style={styles.title}>Pricing plan</h1>
          <p style={styles.subtitle}>Choose a plan that fits your workflow. All plans include unlimited bug reports.</p>
        </div>

        <div style={styles.plansContainer}>
          {/* Basic Plan */}
          <div style={styles.planCard}>
            <h3 style={styles.planName}>Basic plan</h3>
            <div style={styles.planPrice}>
              $5<span style={{ fontSize: "20px" }}>/mo</span>
            </div>
            <ul style={styles.featuresList}>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>1 workspace, 2 environments
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                Basic analytics
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                Email support
              </li>
            </ul>
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#d16a1a")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#e87722")}
            >
              Get started
            </button>
          </div>

          {/* Business Plan - Highlighted */}
          <div style={{ ...styles.planCard, ...styles.planCardHighlighted }}>
            <h3 style={styles.planName}>Business plan</h3>
            <div style={styles.planPrice}>
              $29<span style={{ fontSize: "20px" }}>/mo</span>
            </div>
            <ul style={styles.featuresList}>
              <li style={styles.featureItem}>
                <span style={{ ...styles.checkmark, ...styles.checkmarkWhite }}>✓</span>3 workspaces, 5 environments
              </li>
              <li style={styles.featureItem}>
                <span style={{ ...styles.checkmark, ...styles.checkmarkWhite }}>✓</span>
                Slack/jira integration
              </li>
              <li style={styles.featureItem}>
                <span style={{ ...styles.checkmark, ...styles.checkmarkWhite }}>✓</span>
                Priority support
              </li>
              <li style={styles.featureItem}>
                <span style={{ ...styles.checkmark, ...styles.checkmarkWhite }}>✓</span>
                Role Access Control
              </li>
            </ul>
            <button
              style={{
                ...styles.button,
                backgroundColor: "#ffffff",
                color: "#e87722",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#ffffff")}
            >
              Get started
            </button>
          </div>

          {/* Enterprise Plan */}
          <div style={styles.planCard}>
            <h3 style={styles.planName}>Enterprise plan</h3>
            <div style={styles.planPrice}>
              $49<span style={{ fontSize: "20px" }}>/mo</span>
            </div>
            <ul style={styles.featuresList}>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                Unlimited everything
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                Advanced permissions
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                Slack/jira and more integrations
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                Full Role Access Control
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                High Priority Supports
              </li>
            </ul>
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#d16a1a")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#e87722")}
            >
              Get started
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage
