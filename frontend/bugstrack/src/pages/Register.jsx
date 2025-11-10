"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material"
import { UserPlus, Mail, Lock, User } from "lucide-react"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("Dev")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        role,
      })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.message || "Registration Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            borderRadius: 2,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "linear-gradient()",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserPlus size={32} color="white" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Join Bug Tracker today
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={submit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                variant="outlined"
                placeholder="John Doe"
                InputProps={{
                  startAdornment: <User size={20} style={{ marginRight: 10, color: "#667eea" }} />,
                }}
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="outlined"
                placeholder="you@example.com"
                InputProps={{
                  startAdornment: <Mail size={20} style={{ marginRight: 10, color: "#667eea" }} />,
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="outlined"
                placeholder="••••••••"
                InputProps={{
                  startAdornment: <Lock size={20} style={{ marginRight: 10, color: "#667eea" }} />,
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                  <MenuItem value="Dev">Developer</MenuItem>
                  <MenuItem value="Tester">Tester</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={submit}
                disabled={loading}
                sx={{
                  background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 600,
                  padding: "12px 24px",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#c94d5aff",
                  textDecoration: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
