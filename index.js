const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const chatRoutes = require("./routes/chatRoutes");
const contextRoutes = require("./routes/contextRoutes");
const connectDB = require('./db');

dotenv.config();
const app = express();

connectDB();

const corsOptions = {
  origin: [
    "https://troikatech.in",
    "https://troikatech.ai",
    "http://localhost:5173",
    "https://aiwebdesigncompany.com",
    "https://blog.aiwebdesigncompany.com",
    "https://chatbot-dashboard-alpha.vercel.app",
    "https://troikatech.net",
    "https://troikatech.ai/proactive",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/context", contextRoutes);

const chatbotRoutes = require("./routes/chatbotRoutes");
app.use("/api/chatbot", chatbotRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const companyRoutes = require("./routes/companyRoutes");
app.use("/api/company", companyRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/api/report", reportRoutes);

const otpRoutes = require("./routes/otpRoutes");
app.use("/api", otpRoutes);

const planRoutes = require("./routes/planRoutes");
app.use("/api/plans", planRoutes);

const testWeeklyRoutes = require("./routes/test-weekly-report");
app.use("/api/test", testWeeklyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
