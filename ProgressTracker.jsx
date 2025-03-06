import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Confetti from "react-confetti";
import { generateMotivation } from "../utils/generateMotivation";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);


const ProgressTracker = () => {
  const [problem, setProblem] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [problems, setProblems] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [journalEntry, setJournalEntry] = useState(""); // New state for journal
  const [totalSolved, setTotalSolved] = useState(0); // Track total problems solved
  const [milestoneMessage, setMilestoneMessage] = useState(""); // Store milestone message
  const [showMilestonePopup, setShowMilestonePopup] = useState(false); // Show milestone popup
  const [easyCount, setEasyCount] = useState(0);
  const [mediumCount, setMediumCount] = useState(0);
  const [hardCount, setHardCount] = useState(0);
  const [dailyStats, setDailyStats] = useState({}); // Track problems solved per day
  
  // Fetch solved problems from Firebase
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "problems"));
        const problemsList = querySnapshot.docs.map((doc) => doc.data());

        // Calculate streak
        calculateStreak(problemsList);

        setProblems(problemsList);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };
    fetchProblems();
  }, []);

  // Calculate daily streak
  const calculateStreak = (problemsList) => {
    const uniqueDays = new Set(
      problemsList.map((p) => new Date(p.dateSolved).toDateString())
    );
    setStreak(uniqueDays.size);
  };

  // Add a new problem to Firestore
  const handleAddProblem = async () => {
    if (!problem.trim()) return;
  
    const newProblem = {
      name: problem,
      difficulty: difficulty,
      dateSolved: new Date().toISOString(),
      journalEntry: journalEntry,
    };
  
    try {
      await addDoc(collection(db, "problems"), newProblem);
      const updatedProblems = [...problems, newProblem];
      setProblems(updatedProblems);
      setProblem(""); 
      setJournalEntry(""); 
  
      // ✅ Update difficulty stats
      if (difficulty === "Easy") setEasyCount(easyCount + 1);
      if (difficulty === "Medium") setMediumCount(mediumCount + 1);
      if (difficulty === "Hard") setHardCount(hardCount + 1);
  
      // ✅ Update daily stats
      const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
      setDailyStats((prev) => ({
        ...prev,
        [today]: (prev[today] || 0) + 1,
      }));
  
      // ✅ 🎉 Check milestone
      const newTotal = totalSolved + 1;
      setTotalSolved(newTotal);
      if (newTotal % 10 === 0) {
        setMilestoneMessage(`🎉 Wow! You’ve solved ${newTotal} problems today! Keep slaying! 💖`);
        setShowMilestonePopup(true);
        setTimeout(() => setShowMilestonePopup(false), 3000);
      }
  
      // 🎀 **Fetch AI Motivation using Azure AI**
      const aiMessage = await generateMotivation(problem, difficulty);
      setMotivation(aiMessage); // ✅ Store the AI-generated message
  
      // 🎊 **Show confetti for hard problems**
      if (difficulty === "Hard") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
  
    } catch (error) {
      console.error("❌ Error adding problem:", error);
    }
  };  
  
  const difficultyData = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        label: "Problems Solved",
        data: [easyCount, mediumCount, hardCount], // Uses state variables
        backgroundColor: ["#6EE7B7", "#FBBF24", "#EF4444"], // Green, Yellow, Red
        borderWidth: 1,
      },
    ],
  };

  const dailyProgressData = {
    labels: Object.keys(dailyStats), // Dates
    datasets: [
      {
        label: "Problems Solved",
        data: Object.values(dailyStats), // Number of problems solved per day
        borderColor: "#6366F1",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  

  return (
    <div style={styles.container}>
    {showConfetti && <Confetti />}

    {/* 💖 Elle Woods-Style LeetCode Tracker */}
    <h2 style={styles.title}>💖 LeetCode Tracker</h2>

    {/* 🔥 Add Problem & Journal Section */}
    <div style={styles.problemEntryContainer}>
      <input
        type="text"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        placeholder="Enter problem name..."
        style={styles.input}
      />

      {/* Difficulty Dropdown */}
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        style={styles.select}
      >
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      {/* 🎀 Add Journal Entry */}
      <textarea
        value={journalEntry}
        onChange={(e) => setJournalEntry(e.target.value)}
        placeholder="Write your thoughts on this problem..."
        style={styles.journalInput}
      />

      {/* Log Problem Button */}
      <button onClick={handleAddProblem} style={styles.button}>
        Log Problem 💕
      </button>

      {/* 🔥 Display Problems Completed Today & Milestone Popup */}
      <h4>🔥 Problems Solved Today: {dailyStats[new Date().toISOString().split("T")[0]] || 0}</h4>
      {showMilestonePopup && (
        <div style={styles.milestonePopup}>
          <p>{milestoneMessage}</p>
        </div>
      )}
    </div>

    {/* 🌟 Motivational Quote on the Side */}
    <div style={styles.sidebar}>
      {motivation && (
        <div style={styles.motivationBox}>
          <p>{motivation}</p>
        </div>
      )}
    </div>

    {/* 📝 Show Top 5 Recent Problems */}
    <div style={styles.recentProblemsContainer}>
      <h3>📌 Recently Solved Problems</h3>
      <ul style={styles.list}>
        {problems.slice(-5).reverse().map((p, index) => (
          <li key={index} style={styles.listItem}>
            {p.name} - {p.difficulty} ({new Date(p.dateSolved).toDateString()})
          </li>
        ))}
      </ul>
    </div>

    {/* 📊 Stats Dashboard (Total Solved at the Bottom) */}
    <div style={styles.statsContainer}>
      <h3>📊 Stats Dashboard</h3>
      <p><strong>Total Solved:</strong> {totalSolved}</p>

      {/* Charts */}
      <div style={styles.chartContainer}>
        <h3>📊 Difficulty Breakdown</h3>
        <Bar data={difficultyData} />
        
        <h3>📈 Daily Progress</h3>
        <Line data={dailyProgressData} />
      </div>
    </div>
  </div>
  );
};

// 🔥 Inline CSS Styles (No TailwindCSS!)
const styles = {
  container: {
    maxWidth: "500px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    textAlign: "center",
  },
  title: {
    color: "hotpink",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "hotpink",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "16px",
  },
  list: {
    listStyleType: "none",
    padding: "0",
  },
  listItem: {
    backgroundColor: "#f9f9f9",
    padding: "10px",
    marginBottom: "5px",
    borderRadius: "5px",
  },
  motivationBox: {
    backgroundColor: "#ffccff",
    padding: "10px",
    borderRadius: "10px",
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#d63384",
    marginTop: "15px",
  },  

  journalInput: {
    width: "100%",
    height: "80px",
    marginTop: "10px",
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    fontFamily: "Arial",
  },
  
  journalText: {
    fontStyle: "italic",
    color: "#555",
    marginTop: "5px",
  },
  
  problemItem: {
    listStyleType: "none",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    margin: "10px 0",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)"
  },

  milestonePopup: {
    position: "fixed",
    top: "20%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#ff69b4",
    color: "white",
    padding: "20px",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: "bold",
    textAlign: "center",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    animation: "fadeIn 0.5s",
  },
  statsContainer: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "10px",
    backgroundColor: "#f4f4f4",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    textAlign: "left",
  },
  
  statsTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
  },

  chartContainer: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    textAlign: "center",
  }  
  
};

export default ProgressTracker;
