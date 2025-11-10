# Two-Level Navigation Implementation Guide

## Overview
The dashboard now features a two-level horizontal navigation system:
- **Level 1 (Global Nav)**: Always visible, shows main sections
- **Level 2 (Sub Nav)**: Conditionally visible based on active section

## Structure

### Level 1: Global Navigation
Located at the top of the dashboard, rendered by `GlobalHorizontalNav` component.

**Current Items:**
- Dashboard
- Chat
- *(Add more global items here in the future)*

**Features:**
- Always visible
- Primary section navigation
- Styled with gradient background and prominent border

### Level 2: Chat Sub-Navigation
Located directly below the Global Nav, only visible when Chat is active.
Rendered by `HorizontalNav` component.

**Current Items:**
- Chats (Direct conversations)
- Groups (Group conversations)

**Features:**
- Conditional rendering (only when `globalNavItem === "chat"`)
- Lighter background to differentiate from Level 1
- Smaller padding for visual hierarchy

## Code Structure

### Dashboard.jsx

#### State Management
```javascript
const [globalNavItem, setGlobalNavItem] = useState("dashboard"); // Level 1
const [chatSubNav, setChatSubNav] = useState("chats"); // Level 2
```

#### Navigation Items
```javascript
// Level 1: Global items
const globalHorizontalNavItems = [
  { id: "dashboard", label: "Dashboard", icon: faChartBar },
  { id: "chat", label: "Chat", icon: faCommentDots },
  // Add more here...
];

// Level 2: Chat sub-navigation items
const chatSubNavItems = [
  { id: "chats", label: "Chats", icon: faComments },
  { id: "groups", label: "Groups", icon: faUsers },
];
```

#### Event Handlers
```javascript
// Level 1 handler
const handleGlobalNavClick = (itemId) => {
  if (itemId === "dashboard") {
    setGlobalNavItem("dashboard");
    setActiveSection("overview");
  } else if (itemId === "chat") {
    setGlobalNavItem("chat");
    setActiveSection("chat");
  }
  // Add more handlers here...
};

// Level 2 handler
const handleChatSubNavClick = (itemId) => {
  if (itemId === "chats") {
    setChatSubNav("chats");
  } else if (itemId === "groups") {
    setChatSubNav("groups");
  }
};
```

#### Rendering
```javascript
{/* Level 1: Global Horizontal Navigation Bar */}
<GlobalHorizontalNav
  items={globalHorizontalNavItems}
  activeItem={globalNavItem}
  onItemClick={handleGlobalNavClick}
  isDarkMode={isDarkMode}
/>

{/* Level 2: Chat Sub-Navigation (conditional) */}
{globalNavItem === "chat" && (
  <HorizontalNav
    items={chatSubNavItems}
    activeItem={chatSubNav}
    onItemClick={handleChatSubNavClick}
    isDarkMode={isDarkMode}
  />
)}
```

### Chat.jsx
The Chat component receives props to handle tab changes:
```javascript
<Chat 
  isDarkMode={isDarkMode} 
  showNotification={showNotification}
  currentUser={user}
  activeTab={chatSubNav}
  onTabChange={handleChatSubNavClick}
/>
```

## Styling Differences

### GlobalHorizontalNav (Level 1)
- Gradient background (white to light gray)
- 2px bottom border
- z-index: 90
- Larger padding: `1rem 1.5rem`
- Font size: `0.95rem`

### HorizontalNav (Level 2)
- Solid lighter background (#f9fafb)
- 1px bottom border (more subtle)
- z-index: 89 (below Level 1)
- Smaller padding: `0.875rem 1.25rem`
- Font size: `0.9rem`

## Adding More Global Items

To add new global navigation items (e.g., "Reports", "Settings"):

1. **Add to `globalHorizontalNavItems` array:**
```javascript
const globalHorizontalNavItems = [
  { id: "dashboard", label: "Dashboard", icon: faChartBar },
  { id: "chat", label: "Chat", icon: faCommentDots },
  { id: "reports", label: "Reports", icon: faFileAlt }, // NEW
  { id: "settings", label: "Settings", icon: faCog }, // NEW
];
```

2. **Add handler in `handleGlobalNavClick`:**
```javascript
const handleGlobalNavClick = (itemId) => {
  if (itemId === "dashboard") {
    setGlobalNavItem("dashboard");
    setActiveSection("overview");
  } else if (itemId === "chat") {
    setGlobalNavItem("chat");
    setActiveSection("chat");
  } else if (itemId === "reports") { // NEW
    setGlobalNavItem("reports");
    setActiveSection("reports");
  } else if (itemId === "settings") { // NEW
    setGlobalNavItem("settings");
    setActiveSection("settings");
  }
};
```

3. **Add conditional sub-navigation if needed:**
```javascript
{globalNavItem === "reports" && (
  <HorizontalNav
    items={reportsSubNavItems}
    activeItem={reportSubNav}
    onItemClick={handleReportSubNavClick}
    isDarkMode={isDarkMode}
  />
)}
```

## Benefits

1. **Clear Hierarchy**: Users understand they're navigating within a specific section
2. **Scalability**: Easy to add more global items or sub-sections
3. **Visual Distinction**: Different styling helps users understand navigation levels
4. **Flexibility**: Sub-navigation is optional and contextual
5. **Clean UI**: Only shows relevant navigation based on current context

## Dark Mode Support

Both navigation levels fully support dark mode with appropriate color schemes that maintain visual hierarchy and readability.



